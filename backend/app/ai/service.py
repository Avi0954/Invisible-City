import uuid
import math
import asyncio
from datetime import datetime
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.report import Report, AIAnalysis, ProcessingStatus
from app.repositories.report_repository import ReportRepository
from app.ai.base import AIProvider
from app.ai.schemas import AIReportInput, AIAnalysisResult
from app.ai.providers import get_ai_provider
from app.ai.exceptions import AIProviderError, AITimeoutError, AIValidationError
from app.core.config import settings
from app.core.logging import logger


class ReportAnalysisService:
    """Service layer executing report AI analysis, validation, embedding, and state transitions."""

    def __init__(self, db: Session, provider: Optional[AIProvider] = None):
        self.db = db
        self.provider = provider or get_ai_provider()
        self.report_repo = ReportRepository(db)

    def prepare_analysis_record(self, report_id: uuid.UUID) -> Tuple[AIAnalysis, bool]:
        """Atomically prepares or retrieves an AIAnalysis record.

        Returns (analysis_record, should_start_processing).
        Guarantees that duplicate simultaneous processing is prevented.
        """
        report = self.report_repo.get_by_id(report_id)
        if not report:
            raise ValueError(f"Report with ID '{report_id}' was not found.")

        # Find existing analysis
        analysis = self.db.query(AIAnalysis).filter(AIAnalysis.report_id == report_id).first()

        if not analysis:
            analysis = AIAnalysis(
                id=uuid.uuid4(),
                report_id=report_id,
                provider=self.provider.provider_name,
                model=self.provider.model_name,
                prompt_version=settings.AI_PROMPT_VERSION,
                processing_status=ProcessingStatus.PROCESSING,
                created_at=datetime.utcnow()
            )
            self.db.add(analysis)
            self.db.commit()
            self.db.refresh(analysis)
            return analysis, True

        # If already processing, do not trigger duplicate processing job
        if analysis.processing_status == ProcessingStatus.PROCESSING:
            return analysis, False

        # Atomic state transition from PENDING / FAILED / COMPLETED (re-analysis) -> PROCESSING
        analysis.processing_status = ProcessingStatus.PROCESSING
        analysis.provider = self.provider.provider_name
        analysis.model = self.provider.model_name
        analysis.prompt_version = settings.AI_PROMPT_VERSION
        analysis.error_message = None
        self.db.commit()
        self.db.refresh(analysis)

        return analysis, True

    async def process_analysis(self, report_id: uuid.UUID) -> AIAnalysis:
        """Executes AI analysis workflow for the given report."""
        report = self.report_repo.get_by_id(report_id)
        if not report:
            logger.error(f"[AI Layer] Report '{report_id}' not found.")
            return None

        analysis = self.db.query(AIAnalysis).filter(AIAnalysis.report_id == report_id).first()
        if not analysis:
            analysis, _ = self.prepare_analysis_record(report_id)

        # 1. Build Input Payload
        image_url = None
        if report.media and len(report.media) > 0:
            image_url = report.media[0].media_url

        input_data = AIReportInput(
            title=report.title,
            description=report.description,
            category=report.category,
            severity=report.severity,
            address=report.address,
            latitude=report.latitude,
            longitude=report.longitude,
            image_url=image_url
        )

        # 2. Invoke Provider with Retry Policy
        analysis_result: Optional[AIAnalysisResult] = None
        attempt = 0
        max_retries = settings.AI_MAX_RETRIES
        last_exception = None

        while attempt <= max_retries:
            try:
                logger.info(
                    f"[AI Layer] Running analysis for report {report_id} using {self.provider.provider_name} "
                    f"(Attempt {attempt + 1}/{max_retries + 1})"
                )
                analysis_result = await self.provider.analyze_report(input_data)
                break
            except Exception as err:
                last_exception = err
                is_retryable = getattr(err, "is_retryable", True)
                logger.warning(
                    f"[AI Layer] Analysis attempt {attempt + 1} failed for report {report_id}: {err}. "
                    f"Retryable: {is_retryable}"
                )

                if not is_retryable or attempt >= max_retries:
                    break

                attempt += 1
                await asyncio.sleep(0.5 * (2 ** attempt))  # Exponential backoff

        # 3. Handle Failure if retries exhausted or non-retryable error
        if not analysis_result:
            err_msg = str(last_exception) if last_exception else "AI analysis failed."
            analysis.processing_status = ProcessingStatus.FAILED
            analysis.error_message = err_msg
            analysis.completed_at = datetime.utcnow()
            self.db.commit()
            logger.error(f"[AI Layer] Processing failed for report {report_id}: {err_msg}")
            return analysis

        # 4. Determine Status based on Confidence Threshold
        confidence = analysis_result.confidence
        if confidence >= settings.AI_CONFIDENCE_THRESHOLD:
            final_status = ProcessingStatus.COMPLETED
        else:
            final_status = ProcessingStatus.REVIEW_REQUIRED

        # 5. Generate & Validate Vector Embedding
        embedding_vector = None
        try:
            embed_text = f"{analysis_result.summary} {' '.join(analysis_result.keywords)}"
            vector = await self.provider.generate_embedding(embed_text)

            # Validate numeric vector and dimensionality
            if isinstance(vector, list) and len(vector) > 0:
                if any(math.isnan(v) or math.isinf(v) for v in vector):
                    logger.warning(f"[AI Layer] Embedding for report {report_id} contained NaN/Inf values.")
                else:
                    embedding_vector = vector
        except Exception as embed_err:
            logger.warning(f"[AI Layer] Embedding generation non-fatal failure for report {report_id}: {embed_err}")

        # 6. Update AIAnalysis Record
        analysis.category = analysis_result.category
        analysis.severity = analysis_result.severity
        analysis.summary = analysis_result.summary
        analysis.confidence = confidence
        analysis.keywords = analysis_result.keywords
        analysis.observations = analysis_result.observations
        analysis.embedding = embedding_vector
        analysis.processing_status = final_status
        analysis.error_message = None
        analysis.completed_at = datetime.utcnow()

        # Update Report entity fields
        report.ai_confidence = confidence
        if embedding_vector:
            report.embedding = embedding_vector

        self.db.commit()
        self.db.refresh(analysis)

        logger.info(f"[AI Layer] Report {report_id} analysis completed. Status: {final_status}, Confidence: {confidence}")
        return analysis
