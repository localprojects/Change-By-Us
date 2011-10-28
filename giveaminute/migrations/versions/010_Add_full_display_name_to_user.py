from sqlalchemy import *
from migrate import *

def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata
    meta = MetaData(migrate_engine)
    user = Table('user', meta, autoload=True)

    # Add column if not there
    if ('full_display_name' not in user.c):
        create_column(Column('full_display_name', String(255), nullable=True), user)

def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    meta = MetaData(migrate_engine)
    user = Table('user', meta, autoload=True)

    # Remove the column if there
    if ('full_display_name' in user.c):
        drop_column('full_display_name', user)

