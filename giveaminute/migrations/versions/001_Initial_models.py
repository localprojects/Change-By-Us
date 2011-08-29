from sqlalchemy import *
from migrate import *

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata

    import os
    # Uncomment the following lines if you do not yet have a database to set up.
    # If you run this migration, it will blow away the data currently contained
    # in your database and start new.
    #
#    with open(os.path.join(os.path.dirname(__file__), '000_Initial_models.sql')) as initial_file:
#        sql = initial_file.read()
#        migrate_engine.execute(sql)


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.

    pass
