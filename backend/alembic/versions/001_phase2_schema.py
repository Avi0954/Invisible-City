"""Phase 2 Initial Schema Migration (PostGIS + pgvector + Auth Models)

Revision ID: 001_phase2_schema
Revises: 
Create Date: 2026-09-03 23:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

try:
    from geoalchemy2 import Geometry
except ImportError:
    Geometry = None

try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    Vector = None

# revision identifiers, used by Alembic.
revision: str = '001_phase2_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable PostGIS & pgvector extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 2. Create Enums
    userrole = postgresql.ENUM('CITIZEN', 'ADMIN', name='userrole')
    userrole.create(op.get_bind(), checkfirst=True)

    reportcategory = postgresql.ENUM(
        'POTHOLE', 'GARBAGE', 'STREETLIGHT', 'WATER_LEAK', 'DAMAGED_INFRASTRUCTURE', 'OTHER',
        name='reportcategory'
    )
    reportcategory.create(op.get_bind(), checkfirst=True)

    reportseverity = postgresql.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='reportseverity')
    reportseverity.create(op.get_bind(), checkfirst=True)

    reportstatus = postgresql.ENUM('OPEN', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', name='reportstatus')
    reportstatus.create(op.get_bind(), checkfirst=True)

    verificationstatus = postgresql.ENUM('UNVERIFIED', 'UNDER_REVIEW', 'ADMIN_VERIFIED', 'REJECTED', name='verificationstatus')
    verificationstatus.create(op.get_bind(), checkfirst=True)

    # 3. Create Users Table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('CITIZEN', 'ADMIN', name='userrole'), nullable=False, server_default='CITIZEN'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # 4. Create Reports Table
    op.create_table(
        'reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.Enum('POTHOLE', 'GARBAGE', 'STREETLIGHT', 'WATER_LEAK', 'DAMAGED_INFRASTRUCTURE', 'OTHER', name='reportcategory'), nullable=False),
        sa.Column('severity', sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='reportseverity'), nullable=False, server_default='MEDIUM'),
        sa.Column('status', sa.Enum('OPEN', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', name='reportstatus'), nullable=False, server_default='OPEN'),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('geometry', Geometry('POINT', srid=4326) if Geometry else sa.Text(), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('ai_confidence', sa.Float(), nullable=True),
        sa.Column('verification_status', sa.Enum('UNVERIFIED', 'UNDER_REVIEW', 'ADMIN_VERIFIED', 'REJECTED', name='verificationstatus'), nullable=False, server_default='UNVERIFIED'),
        sa.Column('embedding', Vector(1536) if Vector else postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )
    op.create_index(op.f('ix_reports_category'), 'reports', ['category'], unique=False)
    op.create_index(op.f('ix_reports_created_at'), 'reports', ['created_at'], unique=False)
    op.create_index(op.f('ix_reports_id'), 'reports', ['id'], unique=False)
    op.create_index(op.f('ix_reports_status'), 'reports', ['status'], unique=False)
    op.create_index(op.f('ix_reports_user_id'), 'reports', ['user_id'], unique=False)

    # Spatial GIST Index on geometry column
    op.execute("CREATE INDEX IF NOT EXISTS idx_reports_geometry ON reports USING GIST (geometry);")

    # 5. Create ReportMedia Table
    op.create_table(
        'report_media',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('media_url', sa.Text(), nullable=False),
        sa.Column('media_type', sa.String(length=50), nullable=False, server_default='image'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )
    op.create_index(op.f('ix_report_media_report_id'), 'report_media', ['report_id'], unique=False)

    # 6. Create AIAnalysis Table
    op.create_table(
        'ai_analyses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('detected_category', sa.String(length=100), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('raw_response', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )
    op.create_index(op.f('ix_ai_analyses_report_id'), 'ai_analyses', ['report_id'], unique=False)

    # 7. Create ReportRelation Table
    op.create_table(
        'report_relations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('source_report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('target_report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('relation_type', sa.String(length=50), nullable=False, server_default='SIMILAR'),
        sa.Column('similarity_score', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )

    # 8. Create Hotspots Table
    op.create_table(
        'hotspots',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('center_latitude', sa.Float(), nullable=False),
        sa.Column('center_longitude', sa.Float(), nullable=False),
        sa.Column('geometry', Geometry('POINT', srid=4326) if Geometry else sa.Text(), nullable=True),
        sa.Column('report_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )

    # 9. Create HotspotReports Table
    op.create_table(
        'hotspot_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('hotspot_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('hotspots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('added_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )

    # 10. Create AuditLogs Table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.String(length=255), nullable=True),
        sa.Column('details', postgresql.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('hotspot_reports')
    op.drop_table('hotspots')
    op.drop_table('report_relations')
    op.drop_table('ai_analyses')
    op.drop_table('report_media')
    op.drop_table('reports')
    op.drop_table('users')

    op.execute("DROP TYPE IF EXISTS verificationstatus;")
    op.execute("DROP TYPE IF EXISTS reportstatus;")
    op.execute("DROP TYPE IF EXISTS reportseverity;")
    op.execute("DROP TYPE IF EXISTS reportcategory;")
    op.execute("DROP TYPE IF EXISTS userrole;")
