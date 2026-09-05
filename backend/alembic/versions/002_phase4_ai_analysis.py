"""Phase 4 AI Analysis Schema Migration

Revision ID: 002_phase4_ai_analysis
Revises: 001_phase2_schema
Create Date: 2026-09-05 23:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    Vector = None

# revision identifiers, used by Alembic.
revision: str = '002_phase4_ai_analysis'
down_revision: Union[str, None] = '001_phase2_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create ProcessingStatus enum
    processingstatus = postgresql.ENUM(
        'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVIEW_REQUIRED',
        name='processingstatus'
    )
    processingstatus.create(op.get_bind(), checkfirst=True)

    # 2. Add columns to ai_analyses table
    op.add_column('ai_analyses', sa.Column('provider', sa.String(length=50), nullable=True))
    op.add_column('ai_analyses', sa.Column('model', sa.String(length=100), nullable=True))
    op.add_column('ai_analyses', sa.Column('model_version', sa.String(length=50), nullable=True))
    op.add_column('ai_analyses', sa.Column('prompt_version', sa.String(length=50), nullable=True))

    op.add_column(
        'ai_analyses',
        sa.Column(
            'category',
            sa.Enum('POTHOLE', 'GARBAGE', 'STREETLIGHT', 'WATER_LEAK', 'DAMAGED_INFRASTRUCTURE', 'OTHER', name='reportcategory'),
            nullable=True
        )
    )
    op.add_column(
        'ai_analyses',
        sa.Column(
            'severity',
            sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='reportseverity'),
            nullable=True
        )
    )
    op.add_column('ai_analyses', sa.Column('confidence', sa.Float(), nullable=True))
    op.add_column('ai_analyses', sa.Column('keywords', postgresql.JSON(), nullable=True))
    op.add_column('ai_analyses', sa.Column('observations', postgresql.JSON(), nullable=True))
    op.add_column('ai_analyses', sa.Column('embedding', Vector(1536) if Vector else postgresql.JSON(), nullable=True))

    op.add_column(
        'ai_analyses',
        sa.Column(
            'processing_status',
            sa.Enum('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVIEW_REQUIRED', name='processingstatus'),
            nullable=False,
            server_default='PENDING'
        )
    )
    op.add_column('ai_analyses', sa.Column('error_message', sa.Text(), nullable=True))
    op.add_column('ai_analyses', sa.Column('completed_at', sa.DateTime(), nullable=True))

    # 3. Create indexes
    op.create_index(op.f('ix_ai_analyses_processing_status'), 'ai_analyses', ['processing_status'], unique=False)
    op.create_index(op.f('ix_ai_analyses_created_at'), 'ai_analyses', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_analyses_created_at'), table_name='ai_analyses')
    op.drop_index(op.f('ix_ai_analyses_processing_status'), table_name='ai_analyses')

    op.drop_column('ai_analyses', 'completed_at')
    op.drop_column('ai_analyses', 'error_message')
    op.drop_column('ai_analyses', 'processing_status')
    op.drop_column('ai_analyses', 'embedding')
    op.drop_column('ai_analyses', 'observations')
    op.drop_column('ai_analyses', 'keywords')
    op.drop_column('ai_analyses', 'confidence')
    op.drop_column('ai_analyses', 'severity')
    op.drop_column('ai_analyses', 'category')
    op.drop_column('ai_analyses', 'prompt_version')
    op.drop_column('ai_analyses', 'model_version')
    op.drop_column('ai_analyses', 'model')
    op.drop_column('ai_analyses', 'provider')

    op.execute("DROP TYPE IF EXISTS processingstatus;")
