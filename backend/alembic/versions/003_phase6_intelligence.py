"""Phase 6 Core Intelligence Engine Migration

Revision ID: 003_phase6_intelligence
Revises: 002_phase4_ai_analysis
Create Date: 2026-09-05 23:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

try:
    from geoalchemy2 import Geometry
except ImportError:
    Geometry = None

# revision identifiers, used by Alembic.
revision: str = '003_phase6_intelligence'
down_revision: Union[str, None] = '002_phase4_ai_analysis'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create report_relationships table
    op.create_table(
        'report_relationships',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('related_report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('relation_type', sa.String(length=50), nullable=False, server_default='RELATED'),
        sa.Column('score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('algorithm_version', sa.String(length=50), nullable=False, server_default='v1'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('report_id', 'related_report_id', name='uq_report_relationship_pair')
    )
    op.create_index(op.f('ix_report_relationships_report_id'), 'report_relationships', ['report_id'], unique=False)
    op.create_index(op.f('ix_report_relationships_related_report_id'), 'report_relationships', ['related_report_id'], unique=False)
    op.create_index(op.f('ix_report_relationships_relation_type'), 'report_relationships', ['relation_type'], unique=False)

    # 2. Add columns to hotspots table if needed
    op.add_column('hotspots', sa.Column('categories', postgresql.JSON(), nullable=True))
    op.add_column('hotspots', sa.Column('severity', sa.String(length=50), server_default='MEDIUM', nullable=False))
    op.add_column('hotspots', sa.Column('radius', sa.Float(), server_default='300.0', nullable=False))
    op.add_column('hotspots', sa.Column('score', sa.Float(), server_default='0.0', nullable=False))
    op.add_column('hotspots', sa.Column('confidence', sa.Float(), server_default='0.0', nullable=False))
    op.add_column('hotspots', sa.Column('explanation', sa.Text(), nullable=True))
    op.add_column('hotspots', sa.Column('algorithm_version', sa.String(length=50), server_default='v1', nullable=False))
    op.add_column('hotspots', sa.Column('first_detected', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('hotspots', sa.Column('last_updated', sa.DateTime(), server_default=sa.text('now()'), nullable=False))

    # 3. Add columns to hotspot_reports table
    op.add_column('hotspot_reports', sa.Column('contribution_score', sa.Float(), server_default='1.0', nullable=False))
    op.add_column('hotspot_reports', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.create_unique_constraint('uq_hotspot_report_pair', 'hotspot_reports', ['hotspot_id', 'report_id'])


def downgrade() -> None:
    op.drop_constraint('uq_hotspot_report_pair', 'hotspot_reports', type_='unique')
    op.drop_column('hotspot_reports', 'created_at')
    op.drop_column('hotspot_reports', 'contribution_score')

    op.drop_column('hotspots', 'last_updated')
    op.drop_column('hotspots', 'first_detected')
    op.drop_column('hotspots', 'algorithm_version')
    op.drop_column('hotspots', 'explanation')
    op.drop_column('hotspots', 'confidence')
    op.drop_column('hotspots', 'score')
    op.drop_column('hotspots', 'radius')
    op.drop_column('hotspots', 'severity')
    op.drop_column('hotspots', 'categories')

    op.drop_index(op.f('ix_report_relationships_relation_type'), table_name='report_relationships')
    op.drop_index(op.f('ix_report_relationships_related_report_id'), table_name='report_relationships')
    op.drop_index(op.f('ix_report_relationships_report_id'), table_name='report_relationships')
    op.drop_table('report_relationships')
