from sqlalchemy import *
from migrate import *

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata

    meta = MetaData(migrate_engine)

    # Create the events table
    projects = Table('project', meta, autoload=True)
    events = Table('project_event', meta, autoload=True)
    create_column(Column('project_id', Integer, ForeignKey('project.project_id'), nullable=True), events)

def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.

    meta = MetaData(migrate_engine)

    # Create the events table
    events = Table('project_event', meta, autoload=True)
    drop_column('project_id', events)
