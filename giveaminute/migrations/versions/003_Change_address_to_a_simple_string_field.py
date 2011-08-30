from sqlalchemy import *
from migrate import *

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata

    meta = MetaData(migrate_engine)
    need = Table('project_need', meta, autoload=True)

    # Replace the column referencing a place object with one that just has a
    # string representing a place.
    create_column(Column('address', String(256)), need)
    drop_column('address_id', need)

    place = Table('project_place', meta, autoload=True)
    place.drop()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.

    meta = MetaData(migrate_engine)
    need = Table('project_need', meta, autoload=True)

    # Recreate the project place table
    place = Table('project_place', meta,
        Column('id', Integer, primary_key=True),
        Column('name', String(256)),
        Column('street', String(256)),
        Column('city', String(256)),
    )
    place.create()

    # Bring back the address_id column
    create_column(Column('address_id', Integer, ForeignKey('project_place.id')), need)
    drop_column('address', need)
