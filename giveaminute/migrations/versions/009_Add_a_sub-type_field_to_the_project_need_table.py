"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from sqlalchemy import *
from migrate import *

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata

    meta = MetaData(migrate_engine)
    needs = Table('project_need', meta, autoload=True)

    # Add column
    create_column(Column('subtype', String(10), default=None, nullable=True), needs)


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.

    meta = MetaData(migrate_engine)
    needs = Table('project_need', meta, autoload=True)

    # Remove the column
    drop_column('subtype', needs)
