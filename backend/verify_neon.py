import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import text
from app.db.session import engine, SessionLocal
from app.core.config import settings

def run_verification():
    print("=== INVISIBLE CITY NEON VERIFICATION ===")
    print(f"Configured DATABASE_URL driver: {engine.url.drivername}")
    print(f"Configured Host: {engine.url.host}")
    print(f"Configured Database: {engine.url.database}")
    
    with SessionLocal() as db:
        # 1. Test PostgreSQL Version
        pg_ver = db.execute(text("SELECT version();")).scalar()
        print(f"\n[1] PostgreSQL Version:\n    {pg_ver}")
        
        # 2. Test PostGIS Extension & Version
        postgis_ver = db.execute(text("SELECT PostGIS_Version();")).scalar()
        print(f"\n[2] PostGIS Extension:\n    Installed Version: {postgis_ver}")
        
        # 3. Test pgvector Extension
        pgvector_ext = db.execute(text("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")).fetchone()
        if pgvector_ext:
            print(f"\n[3] pgvector Extension:\n    Name: {pgvector_ext[0]}, Version: {pgvector_ext[1]}")
        else:
            print("\n[3] pgvector Extension:\n    NOT INSTALLED!")
            
        # 4. Check Core Table Record Counts
        tables = [
            "users", "reports", "report_media", "ai_analyses",
            "report_relationships", "hotspots", "hotspot_reports", "audit_logs", "alembic_version"
        ]
        print("\n[4] Core Table Record Counts:")
        for t in tables:
            try:
                count = db.execute(text(f"SELECT count(*) FROM {t};")).scalar()
                print(f"    - {t}: {count} records")
            except Exception as e:
                print(f"    - {t}: ERROR ({e})")
                db.rollback()
                
        # 5. Spatial ST_DWithin Query Test (using PostGIS geometry column)
        print("\n[5] PostGIS Spatial ST_DWithin Query Test:")
        spatial_res = db.execute(text("""
            SELECT id, title, ST_AsText(geometry) as geom_wkt
            FROM reports
            WHERE geometry IS NOT NULL
            AND ST_DWithin(
                geometry::geography,
                ST_SetSRID(ST_MakePoint(75.7000, 31.2500), 4326)::geography,
                5000
            )
            LIMIT 3;
        """)).fetchall()
        print(f"    Found {len(spatial_res)} reports within 5000m of (75.7000, 31.2500):")
        for r in spatial_res:
            print(f"    - [{r[0]}] '{r[1]}' @ {r[2]}")

        # 6. pgvector Vector Cosine Distance Test (using embedding column)
        print("\n[6] pgvector Similarity Query Test:")
        vector_res = db.execute(text("""
            SELECT id, title, (1 - (embedding <=> (SELECT embedding FROM reports WHERE embedding IS NOT NULL LIMIT 1))) as similarity
            FROM reports
            WHERE embedding IS NOT NULL
            LIMIT 3;
        """)).fetchall()
        print(f"    Calculated similarity for {len(vector_res)} reports:")
        for vr in vector_res:
            print(f"    - [{vr[0]}] '{vr[1]}': Cosine Similarity = {vr[2]:.4f}")

    print("\n=== VERIFICATION COMPLETE ===")

if __name__ == "__main__":
    run_verification()
