from sqlalchemy import *
from migrate import *

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata

    meta = MetaData(migrate_engine)

    # Create the events table
    events = Table('project_event', meta,
        Column('id', Integer, primary_key=True),
        Column('name', String(256)),
        Column('details', Text),
        Column('rsvp_url', String(2048)),
        Column('start_datetime', DateTime),
        Column('end_datetime', DateTime),
        Column('address', String(256)),
    )
    events.create()

    # Add a reference to the events table to the needs table
    needs = Table('project_need', meta, autoload=True)
    create_column(Column('event_id', Integer, ForeignKey('project_event.id'), nullable=True), needs)

def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.

    meta = MetaData(migrate_engine)

    # Remove the reference to the events table from the needs table
    needs = Table('project_need', meta, autoload=True)
    drop_column('event_id', needs)

    # Drop the events table
    events = Table('project_event', meta, autoload=True)
    events.drop()
