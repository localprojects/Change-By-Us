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

    meta = MetaData(migrate_engine)

    # Load the project and user tables (for the foreign keys)
    project = Table('project', meta, autoload=True)
    user = Table('user', meta, autoload=True)

    # Create the project place table
    needs = Table('project_needs', meta,
        Column('id', Integer, primary_key=True),
        Column('type', String(10)),
        Column('item_needed', String(64)),
        Column('num_needed', Integer),
        Column('description', Text),
        Column('project_id', Integer, ForeignKey('project.project_id'), nullable=False),
    )
    needs.create()

    volunteers = Table('project_need_volunteers', meta,
        Column('need_id', Integer, ForeignKey('project_needs.id'), primary_key=True),
        Column('member_id', Integer, ForeignKey('user.user_id'), primary_key=True),
    )
    volunteers.create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.

    # Get rid of the created tables.
    volunteers = Table('project_need_volunteers', meta, autoload=True)
    volunteers.drop()

    needs = Table('project_needs', meta, autoload=True)
    needs.drop()

    # The SQL schema isn't as important.  It'll get overwritten anyway.
