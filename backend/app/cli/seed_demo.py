import os
import sys
import uuid
import asyncio
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

os.environ["ENVIRONMENT"] = "testing"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.base import Base
from app.models.user import User, UserRole
from app.models.report import (
    Report,
    ReportCategory,
    ReportSeverity,
    ReportStatus,
    VerificationStatus
)
from app.ai.service import ReportAnalysisService
from app.intelligence.relationships.service import ReportRelationshipService
from app.intelligence.hotspots.service import HotspotDetectionService
from app.intelligence.priority import calculate_report_priority


def get_demo_db_session():
    """Connects explicitly to the configured PostgreSQL database to seed demo data."""
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"  [DB] Connected to configured PostgreSQL database at {settings.DATABASE_URL}.")
    except Exception as e:
        print(f"\n[ERROR] Could not connect to PostgreSQL database ({settings.DATABASE_URL}).")
        print(f"        Reason: {e}")
        print("        PostgreSQL + PostGIS + pgvector must be running on port 5432 to seed and operate Invisible City.\n")
        sys.exit(1)

    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return Session()



def seed_demo_data():
    """Idempotent seed script generating realistic civic report dataset and running

    the genuine backend intelligence engine pipeline (AI analysis, PostGIS similarity, DBSCAN hotspots, priority).
    """
    print("[SEED] Seeding Invisible City Hackathon Demo Dataset...")
    db = get_demo_db_session()

    try:
        # 1. Create Demo Admin User
        admin = db.query(User).filter(User.email == "admin@invisiblecity.civic").first()
        if not admin:
            admin = User(
                email="admin@invisiblecity.civic",
                name="Municipal Admin Officer",
                role=UserRole.ADMIN,
                password_hash=get_password_hash("Admin123!")
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("  + Admin User created: admin@invisiblecity.civic / Admin123!")
        else:
            print("  + Admin User already exists")

        # 2. Create Citizen Users
        citizens = []
        citizen_creds = [
            ("citizen1@example.com", "Aarav Sharma"),
            ("citizen2@example.com", "Priya Patel"),
            ("citizen3@example.com", "Rohan Verma"),
            ("citizen4@example.com", "Ananya Reddy"),
        ]

        for email, name in citizen_creds:
            usr = db.query(User).filter(User.email == email).first()
            if not usr:
                usr = User(
                    email=email,
                    name=name,
                    role=UserRole.CITIZEN,
                    password_hash=get_password_hash("Password123!")
                )
                db.add(usr)
                db.commit()
                db.refresh(usr)
                print(f"  + Citizen User created: {email} / Password123!")
            citizens.append(usr)

        # 3. Seed Concentrated Reports near Main Gate (12.9716, 77.5946)
        base_lat, base_lng = 12.9716, 77.5946

        sample_reports_data = [
            (
                "Large pothole near Main Gate",
                "There is a deep dangerous pothole right outside Gate 1 disrupting traffic and damaging vehicles.",
                ReportCategory.POTHOLE,
                ReportSeverity.HIGH,
                0.0001, 0.0001,
                citizens[0],
                datetime.utcnow() - timedelta(hours=2)
            ),
            (
                "Huge pothole outside Main Gate",
                "Very deep crater on the main road outside Gate 1 entrance posing severe hazard to two-wheelers.",
                ReportCategory.POTHOLE,
                ReportSeverity.HIGH,
                0.0002, 0.00015,
                citizens[1],
                datetime.utcnow() - timedelta(hours=4)
            ),
            (
                "Road damage near Main Gate",
                "Asphalt is cracking and caving in near Main Gate road causing severe slowdowns.",
                ReportCategory.DAMAGED_INFRASTRUCTURE,
                ReportSeverity.HIGH,
                0.00025, 0.0002,
                citizens[2],
                datetime.utcnow() - timedelta(hours=6)
            ),
            (
                "Water collects in damaged road near Main Gate",
                "Rainwater collecting in large crater on damaged road near Main Gate causing stagnant pool.",
                ReportCategory.WATER_LEAK,
                ReportSeverity.MEDIUM,
                0.0003, 0.00025,
                citizens[3],
                datetime.utcnow() - timedelta(hours=8)
            ),
            (
                "Broken streetlight near Main Gate",
                "Streetlamp post near Gate 1 is unlit and dark at night causing safety concern.",
                ReportCategory.STREETLIGHT,
                ReportSeverity.MEDIUM,
                0.00015, 0.0003,
                citizens[0],
                datetime.utcnow() - timedelta(days=1)
            ),
            (
                "Garbage dumped near Main Gate",
                "Overflowing waste bins and illegal garbage dumping near Gate 1 corner.",
                ReportCategory.GARBAGE,
                ReportSeverity.LOW,
                0.00035, 0.00035,
                citizens[1],
                datetime.utcnow() - timedelta(days=2)
            ),
        ]

        seeded_reports = []
        for title, desc, cat, sev, dlat, dlng, owner, created_time in sample_reports_data:
            existing_r = db.query(Report).filter(Report.title == title).first()
            if not existing_r:
                lat = base_lat + dlat
                lng = base_lng + dlng
                r = Report(
                    user_id=owner.id,
                    title=title,
                    description=desc,
                    category=cat,
                    severity=sev,
                    status=ReportStatus.OPEN,
                    verification_status=VerificationStatus.UNVERIFIED,
                    latitude=lat,
                    longitude=lng,
                    geometry=f"SRID=4326;POINT({lng} {lat})",
                    address="Main Gate Road, Ward 12, Bengaluru",
                    created_at=created_time
                )
                db.add(r)
                db.commit()
                db.refresh(r)
                print(f"  + Report created: '{title}' ({cat.value})")
                seeded_reports.append(r)
            else:
                seeded_reports.append(existing_r)

        # 4. Trigger Genuine AI Analysis Pipeline
        print("\n[AI] Running AI Analysis & Embedding Generation...")
        ai_service = ReportAnalysisService(db)
        for r in seeded_reports:
            ai_analysis = asyncio.run(ai_service.process_analysis(r.id))
            status_val = ai_analysis.processing_status.value if hasattr(ai_analysis.processing_status, "value") else str(ai_analysis.processing_status)
            print(f"  + AI Analysis complete for report '{r.title[:25]}...': Status={status_val}")

        # 5. Trigger Genuine Spatial Relationship & Candidate Search Engine
        print("\n[SIMILARITY] Running 4-Signal Relationship & Similarity Engine...")
        rel_service = ReportRelationshipService(db)
        total_rels = 0
        for r in seeded_reports:
            rels = rel_service.evaluate_report_relationships(r.id)
            total_rels += len(rels)
        print(f"  + Evaluated relationships across dataset: {total_rels} meaningful connections recorded.")

        # 6. Trigger Genuine DBSCAN Hotspot Detection Engine
        print("\n[HOTSPOTS] Running Spatial Density DBSCAN Hotspot Detection...")
        hotspot_service = HotspotDetectionService(db)
        hotspots = hotspot_service.detect_hotspots(lookback_days=30, epsilon_meters=400, min_reports=3)
        print(f"  + Hotspot Detection complete: {len(hotspots)} spatial problem hotspots detected!")
        for h in hotspots:
            print(f"    - Hotspot '{h.title}' (Score: {h.score:.2f}, Confidence: {h.confidence:.2f}, Reports: {h.report_count})")

        # 7. Calculate Priority Scores
        print("\n[PRIORITY] Calculating Priority Scores...")
        for r in seeded_reports:
            score, level, reasons, _ = calculate_report_priority(db, r)
            print(f"  + Report '{r.title[:25]}...': Priority Score={score}/100 ({level})")

        print("\n[SUCCESS] Invisible City Hackathon Demo Dataset successfully seeded & analyzed!")
        print("\nCredentials summary:")
        print("  Admin User:   admin@invisiblecity.civic / Admin123!")
        print("  Citizen User: citizen1@example.com      / Password123!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
