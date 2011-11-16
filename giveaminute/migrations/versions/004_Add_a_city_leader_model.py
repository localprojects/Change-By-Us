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

    communityleader = Table('community_leader', meta,
        Column('id', Integer, primary_key=True),
        Column('display_name', String(256)),
        Column('title', String(256)),
        Column('image_path', String(256)),
        Column('order', Integer),
    )
    communityleader.create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.

    meta = MetaData(migrate_engine)

    communityleader = Table('community_leader', meta, autoload=True)
    communityleader.drop()
