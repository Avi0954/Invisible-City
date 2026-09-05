import pytest
import uuid
import asyncio
from unittest.mock import AsyncMock, patch
from fastapi import status
from app.models.user import User, UserRole
from app.models.report import Report, ReportCategory, ReportSeverity, ProcessingStatus
from app.ai.base import AIProvider
from app.ai.schemas import AIAnalysisResult
from app.ai.exceptions import AIProviderError, AITimeoutError, AIValidationError
from app.ai.service import ReportAnalysisService
from app.core.config import settings


@pytest.fixture
def test_user(db_session):
    """Fixture providing a saved User instance in database."""
    user = User(
        id=uuid.uuid4(),
        name="AI Test User",
        email="aitest@example.com",
        password_hash="hashed_pw_test",
        role=UserRole.CITIZEN
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def created_report(db_session, test_user):
    """Fixture providing a saved Report instance in database."""
    report = Report(
        id=uuid.uuid4(),
        user_id=test_user.id,
        title="Large Pothole Near Main Gate",
        description="Hazardous pothole on 5th main road causing water accumulation.",
        category=ReportCategory.POTHOLE,
        severity=ReportSeverity.HIGH,
        latitude=12.9716,
        longitude=77.5946,
        address="Indiranagar, Bengaluru"
    )
    db_session.add(report)
    db_session.commit()
    db_session.refresh(report)
    return report


def test_1_successful_ai_analysis(db_session, created_report):
    """Test 1: Successful AI analysis results in COMPLETED status with valid schemas."""
    service = ReportAnalysisService(db_session)
    analysis = asyncio.run(service.process_analysis(created_report.id))

    assert analysis is not None
    assert analysis.processing_status == ProcessingStatus.COMPLETED
    assert analysis.category == ReportCategory.POTHOLE
    assert analysis.severity in [ReportSeverity.HIGH, ReportSeverity.MEDIUM]
    assert analysis.confidence >= settings.AI_CONFIDENCE_THRESHOLD
    assert len(analysis.summary) > 0
    assert isinstance(analysis.keywords, list)
    assert len(analysis.keywords) > 0


def test_2_malformed_ai_response(db_session, created_report):
    """Test 2: Malformed AI response sets status to FAILED and stores safe error."""
    mock_provider = AsyncMock(spec=AIProvider)
    mock_provider.provider_name = "mock"
    mock_provider.model_name = "mock-v1"
    mock_provider.analyze_report.side_effect = AIValidationError("Invalid JSON schema returned")

    service = ReportAnalysisService(db_session, provider=mock_provider)
    analysis = asyncio.run(service.process_analysis(created_report.id))

    assert analysis.processing_status == ProcessingStatus.FAILED
    assert "Invalid JSON schema" in analysis.error_message


def test_3_provider_timeout(db_session, created_report):
    """Test 3: Provider timeout retries bounded times and sets status to FAILED."""
    mock_provider = AsyncMock(spec=AIProvider)
    mock_provider.provider_name = "mock"
    mock_provider.model_name = "mock-v1"
    mock_provider.analyze_report.side_effect = AITimeoutError("Request timed out after 30s")

    service = ReportAnalysisService(db_session, provider=mock_provider)
    analysis = asyncio.run(service.process_analysis(created_report.id))

    assert analysis.processing_status == ProcessingStatus.FAILED
    assert "timed out" in analysis.error_message
    assert mock_provider.analyze_report.call_count == settings.AI_MAX_RETRIES + 1
    # Verify report itself remains intact
    assert created_report.title == "Large Pothole Near Main Gate"


def test_4_provider_failure(db_session, created_report):
    """Test 4: Unrecoverable provider failure results in FAILED status."""
    mock_provider = AsyncMock(spec=AIProvider)
    mock_provider.provider_name = "mock"
    mock_provider.model_name = "mock-v1"
    mock_provider.analyze_report.side_effect = AIProviderError("API connection rejected", is_retryable=False)

    service = ReportAnalysisService(db_session, provider=mock_provider)
    analysis = asyncio.run(service.process_analysis(created_report.id))

    assert analysis.processing_status == ProcessingStatus.FAILED
    assert "connection rejected" in analysis.error_message
    assert mock_provider.analyze_report.call_count == 1  # Non-retryable error called once


def test_5_low_confidence_review_required(db_session, created_report):
    """Test 5: Low confidence score (< threshold) transitions to REVIEW_REQUIRED."""
    mock_provider = AsyncMock(spec=AIProvider)
    mock_provider.provider_name = "mock"
    mock_provider.model_name = "mock-v1"
    mock_provider.analyze_report.return_value = AIAnalysisResult(
        category=ReportCategory.OTHER,
        severity=ReportSeverity.LOW,
        summary="Uncertain issue reported near gate.",
        confidence=0.45,  # Below 0.70 threshold
        keywords=["gate", "issue"],
        observations=["Ambiguous description."]
    )
    mock_provider.generate_embedding.return_value = [0.1] * 1536

    service = ReportAnalysisService(db_session, provider=mock_provider)
    analysis = asyncio.run(service.process_analysis(created_report.id))

    assert analysis.processing_status == ProcessingStatus.REVIEW_REQUIRED
    assert analysis.confidence == 0.45


def test_6_retry_mechanism(db_session, created_report):
    """Test 6: Transient failure on call 1 followed by success on retry results in COMPLETED."""
    mock_provider = AsyncMock(spec=AIProvider)
    mock_provider.provider_name = "mock"
    mock_provider.model_name = "mock-v1"

    valid_result = AIAnalysisResult(
        category=ReportCategory.POTHOLE,
        severity=ReportSeverity.HIGH,
        summary="Pothole recovered after retry.",
        confidence=0.90,
        keywords=["pothole"],
        observations=["Road damage verified."]
    )
    mock_provider.analyze_report.side_effect = [
        AIProviderError("Temporary 503 Service Unavailable", is_retryable=True),
        valid_result
    ]
    mock_provider.generate_embedding.return_value = [0.05] * 1536

    service = ReportAnalysisService(db_session, provider=mock_provider)
    analysis = asyncio.run(service.process_analysis(created_report.id))

    assert analysis.processing_status == ProcessingStatus.COMPLETED
    assert mock_provider.analyze_report.call_count == 2
    assert analysis.summary == "Pothole recovered after retry."


def test_7_duplicate_analysis_prevention(db_session, created_report):
    """Test 7: Simultaneous duplicate analysis requests are prevented atomically."""
    service = ReportAnalysisService(db_session)

    # First call prepares record -> returns should_start=True
    analysis1, start1 = service.prepare_analysis_record(created_report.id)
    assert start1 is True
    assert analysis1.processing_status == ProcessingStatus.PROCESSING

    # Concurrent call while PROCESSING -> returns should_start=False
    analysis2, start2 = service.prepare_analysis_record(created_report.id)
    assert start2 is False
    assert analysis2.id == analysis1.id
    assert analysis2.processing_status == ProcessingStatus.PROCESSING


def test_8_embedding_generation_and_validation(db_session, created_report):
    """Test 8: Vector embedding is generated, validated to 1536 dims, and stored."""
    service = ReportAnalysisService(db_session)
    analysis = asyncio.run(service.process_analysis(created_report.id))

    assert analysis.embedding is not None
    assert len(analysis.embedding) == 1536
    assert created_report.embedding is not None
    assert len(created_report.embedding) == 1536


def test_9_text_only_report(db_session, created_report):
    """Test 9: Report without attached images completes AI analysis using text."""
    assert len(created_report.media) == 0
    service = ReportAnalysisService(db_session)
    analysis = asyncio.run(service.process_analysis(created_report.id))

    assert analysis.processing_status == ProcessingStatus.COMPLETED
    assert analysis.category == ReportCategory.POTHOLE


def test_10_missing_image_graceful_fallback(db_session, created_report):
    """Test 10: Missing/unavailable image does not crash execution, text analysis continues."""
    service = ReportAnalysisService(db_session)
    analysis = asyncio.run(service.process_analysis(created_report.id))

    assert analysis.processing_status == ProcessingStatus.COMPLETED
    assert "Analyzed based on text" in " ".join(analysis.observations)


def test_11_invalid_confidence_validation():
    """Test 11: Invalid confidence score (> 1.0) fails Pydantic validation."""
    with pytest.raises(ValueError) as exc_info:
        AIAnalysisResult(
            category=ReportCategory.POTHOLE,
            severity=ReportSeverity.HIGH,
            summary="Invalid confidence sample.",
            confidence=1.5,  # Out of range!
            keywords=["test"],
            observations=["Invalid."]
        )
    assert "Confidence score" in str(exc_info.value) or "less than or equal to 1" in str(exc_info.value)


def test_12_production_provider_failure_no_silent_fallback(db_session, created_report):
    """Test 12: Production provider failure when AI_PROVIDER=openai sets FAILED status and DOES NOT silently use local AI."""
    with patch("app.ai.providers.openai_provider.httpx.AsyncClient.post") as mock_post:
        mock_post.side_effect = Exception("OpenAI API cluster outage")

        from app.ai.providers.openai_provider import OpenAIProvider
        prod_provider = OpenAIProvider(api_key="sk-fake-test-key")

        service = ReportAnalysisService(db_session, provider=prod_provider)
        analysis = asyncio.run(service.process_analysis(created_report.id))

        assert analysis.processing_status == ProcessingStatus.FAILED
        assert analysis.provider == "openai"
        assert "OpenAI API cluster outage" in analysis.error_message
        assert analysis.category is None


def test_api_trigger_and_get_analysis(client):
    """API Test: POST /reports/{id}/analyze and GET /reports/{id}/analysis."""
    reg_payload = {
        "name": "AI API User",
        "email": "aiapi@example.com",
        "password": "Password123!",
        "role": "CITIZEN"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload).json()
    token = reg_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    report_payload = {
        "title": "Broken Streetlight on 4th Ave",
        "description": "Streetlight bulb broken for 3 days near park entrance.",
        "category": "STREETLIGHT",
        "severity": "MEDIUM",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    rep_res = client.post("/api/v1/reports", json=report_payload, headers=headers).json()
    report_id = rep_res["id"]

    # Trigger analysis
    res_trigger = client.post(f"/api/v1/reports/{report_id}/analyze", headers=headers)
    assert res_trigger.status_code == status.HTTP_202_ACCEPTED
    data_trigger = res_trigger.json()
    assert data_trigger["report_id"] == report_id
    assert "processing_status" in data_trigger

    # Fetch analysis result
    res_get = client.get(f"/api/v1/reports/{report_id}/analysis", headers=headers)
    assert res_get.status_code == status.HTTP_200_OK
    data_get = res_get.json()
    assert data_get["report_id"] == report_id
    assert data_get["processing_status"] in ["PENDING", "PROCESSING", "COMPLETED"]
