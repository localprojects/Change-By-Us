from sqlalchemy import *
from migrate import *

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata
    
    import os
    with open(os.path.join(os.path.dirname(__file__), '000_Initial_models.sql')) as initial_file:
        sql = initial_file.read()
        migrate_engine.execute(sql)


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    
    pass
