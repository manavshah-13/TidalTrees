"""enable postgis extension and add geom column to reports

Revision ID: b4f8c12a3d5e
Revises: ae9dabec7392
Create Date: 2026-10-10 18:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = 'b4f8c12a3d5e'
down_revision: Union[str, Sequence[str], None] = 'ae9dabec7392'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable PostGIS extension
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 2. Add geom column to reports
    op.add_column(
        'reports',
        sa.Column(
            'geom',
            geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'),
            nullable=True
        )
    )

    # 3. Populate geom column from existing latitude & longitude where present
    op.execute("""
        UPDATE reports
        SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
    """)

    # 4. Create spatial index
    op.execute("CREATE INDEX IF NOT EXISTS idx_reports_geom ON reports USING GIST (geom);")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_reports_geom;")
    op.drop_column('reports', 'geom')
