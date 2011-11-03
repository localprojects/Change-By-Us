"""
SQLAlchemy migration to add Feeback Type column to
Feedback table.
"""
from sqlalchemy import *
from migrate import *


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind migrate_engine
    # to your metadata

    meta = MetaData(migrate_engine)
    site_feedback = Table('site_feedback', meta, autoload=True)

    # Add column
    try:
        create_column(Column('feedback_type', String(100), nullable=True), site_feedback)
    except Exception, e:
        # The column may already exist, since it's set as an enum in some cases
        print "Error when adding column site_feedback.feedback_type: %s. Ignoring" % e


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.

    meta = MetaData(migrate_engine)
    site_feedback = Table('site_feedback', meta, autoload=True)

    # Remove the column
    try:
        drop_column('feedback_type', site_feedback)
    except Exception, e:
        # The column may already exist, since it's set as an enum in some cases
        print "Error when removing column site_feedback.feedback_type: %s. Ignoring" % e
