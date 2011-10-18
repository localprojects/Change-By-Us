from sqlalchemy import *
from migrate import *

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata

    migrate_engine.execute("""
        UPDATE project_need
           SET event_id=NULL
         WHERE event_id=0
    """)


def downgrade(migrate_engine):
    # I don't really care about the downgrade for this one.  Who wants invalid
    # data?
    pass
