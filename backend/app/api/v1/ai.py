import uuid
import asyncio
from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.report import AIAnalysis, ProcessingStatus
from app.repositories.report_repository import ReportRepository
from app.ai.schemas import AIAnalysisResponse, TriggerAnalysisResponse
from app.ai.service import ReportAnalysisService
from app.core.exceptions import InvisibleCityException
from app.db.session import SessionLocal

router = APIRouter(prefix="/reports", tags=["AI Analysis"])


def run_background_analysis(report_id: uuid.UUID, db: Session = None):
    """Background worker function for executing AI analysis asynchronously."""
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        service = ReportAnalysisService(db)
        asyncio.run(service.process_analysis(report_id))
    except Exception as err:
        print(f"[AI Background Worker Error] {err}")
    finally:
        if close_db:
            db.close()


@router.post(
    "/{report_id}/analyze",
    response_model=TriggerAnalysisResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger Report AI Analysis",
    description="Enqueues AI analysis for an existing civic report with atomic duplicate prevention."
)
async def trigger_report_analysis(
    report_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    report = repo.get_by_id(report_id)
    if not report:
        raise InvisibleCityException(
            message=f"Report with ID '{report_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

    # Authorization Check
    if current_user.role != UserRole.ADMIN and report.user_id != current_user.id:
        raise InvisibleCityException(
            message="You do not have permission to trigger analysis for this report.",
            status_code=status.HTTP_403_FORBIDDEN
        )

    service = ReportAnalysisService(db)
    analysis, should_start = service.prepare_analysis_record(report_id)

    if not should_start:
        return TriggerAnalysisResponse(
            report_id=report.id,
            analysis_id=analysis.id,
            processing_status=analysis.processing_status,
            message="AI analysis is currently processing."
        )

    background_tasks.add_task(run_background_analysis, report.id, db)


    return TriggerAnalysisResponse(
        report_id=report.id,
        analysis_id=analysis.id,
        processing_status=ProcessingStatus.PENDING,
        message="AI analysis job queued successfully."
    )


@router.get(
    "/{report_id}/analysis",
    response_model=AIAnalysisResponse,
    summary="Get Report AI Analysis Result",
    description="Fetches the structured AI analysis result for a given report."
)
async def get_report_analysis(
    report_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    report = repo.get_by_id(report_id)
    if not report:
        raise InvisibleCityException(
            message=f"Report with ID '{report_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

    analysis = db.query(AIAnalysis).filter(AIAnalysis.report_id == report_id).first()
    if not analysis:
        raise InvisibleCityException(
            message=f"No AI analysis found for report '{report_id}'.",
            status_code=status.HTTP_404_NOT_FOUND
        )

    return AIAnalysisResponse.model_validate(analysis)
