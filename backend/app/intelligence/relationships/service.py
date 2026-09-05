import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.report import Report, ReportRelationship
from app.intelligence.relationships.candidate_search import find_spatial_candidates
from app.intelligence.relationships.scoring import calculate_combined_relationship_score
from app.intelligence.relationships.classifier import classify_relationship
from app.intelligence.relationships.explanations import generate_relationship_explanation
from app.core.config import settings


class ReportRelationshipService:
    def __init__(self, db: Session):
        self.db = db

    def evaluate_report_relationships(
        self,
        report_id: uuid.UUID,
        radius_meters: float = settings.INTELLIGENCE_CANDIDATE_RADIUS_METERS,
        limit: int = settings.MAX_SIMILARITY_CANDIDATES
    ) -> List[ReportRelationship]:
        """Runs the 4-stage relationship pipeline for a report:

        PostGIS spatial candidates -> pgvector / 4-signal scoring -> classification -> idempotent DB persistence.
        """
        report = self.db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return []

        # 1. Candidate Generation
        candidates = find_spatial_candidates(self.db, report, radius_meters=radius_meters, limit=limit)
        saved_relationships: List[ReportRelationship] = []

        for candidate in candidates:
            # Self-relation prevention
            if str(report.id) == str(candidate.id):
                continue

            # Canonical pair ordering (min_id, max_id) for uniqueness
            id_a = report.id
            id_b = candidate.id
            primary_id, secondary_id = (id_a, id_b) if str(id_a) < str(id_b) else (id_b, id_a)

            # 2. Similarity & 4-signal Scoring
            score, distance, components = calculate_combined_relationship_score(report, candidate, radius_meters)

            # 3. Classification
            relation_type = classify_relationship(score)

            # Only persist DUPLICATE and RELATED relationships to avoid DB bloat
            if relation_type in ("DUPLICATE", "RELATED"):
                explanation = generate_relationship_explanation(
                    report, candidate, relation_type, distance, components
                )

                # Check existing canonical relationship (Idempotency)
                existing = (
                    self.db.query(ReportRelationship)
                    .filter(
                        ReportRelationship.report_id == primary_id,
                        ReportRelationship.related_report_id == secondary_id
                    )
                    .first()
                )

                if existing:
                    existing.relation_type = relation_type
                    existing.score = score
                    existing.confidence = max(0.5, score)
                    existing.explanation = explanation
                    existing.algorithm_version = settings.INTELLIGENCE_ALGORITHM_VERSION
                    existing.updated_at = datetime.utcnow()
                    saved_relationships.append(existing)
                else:
                    rel = ReportRelationship(
                        report_id=primary_id,
                        related_report_id=secondary_id,
                        relation_type=relation_type,
                        score=score,
                        confidence=max(0.5, score),
                        explanation=explanation,
                        algorithm_version=settings.INTELLIGENCE_ALGORITHM_VERSION
                    )
                    self.db.add(rel)
                    saved_relationships.append(rel)

        self.db.commit()
        return saved_relationships

    def get_related_reports(self, report_id: uuid.UUID, limit: int = settings.MAX_RELATED_REPORTS) -> List[ReportRelationship]:
        """Retrieves RELATED relationships for a report ordered by score desc."""
        return (
            self.db.query(ReportRelationship)
            .filter(
                or_(
                    ReportRelationship.report_id == report_id,
                    ReportRelationship.related_report_id == report_id
                ),
                ReportRelationship.relation_type == "RELATED"
            )
            .order_by(ReportRelationship.score.desc())
            .limit(limit)
            .all()
        )

    def get_duplicate_reports(self, report_id: uuid.UUID, limit: int = settings.MAX_RELATED_REPORTS) -> List[ReportRelationship]:
        """Retrieves DUPLICATE relationships for a report ordered by score desc."""
        return (
            self.db.query(ReportRelationship)
            .filter(
                or_(
                    ReportRelationship.report_id == report_id,
                    ReportRelationship.related_report_id == report_id
                ),
                ReportRelationship.relation_type == "DUPLICATE"
            )
            .order_by(ReportRelationship.score.desc())
            .limit(limit)
            .all()
        )
