from sqlalchemy import *
from migrate import *

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata

    meta = MetaData(migrate_engine)
    volunteers = Table('project_need_volunteer', meta, autoload=True)

    # Add column
    create_column(Column('quantity', Integer, default=1), volunteers)


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.

    meta = MetaData(migrate_engine)
    volunteers = Table('project_need_volunteer', meta, autoload=True)

    # Remove the column
    drop_column('quantity', volunteers)
