#!/usr/bin/env python

"""
Main module for the Change by Us application.  This is 
where the magic begins.  Routes are set here, database
connection initialized, web.py application started.

"""

import os
import sys
from os import environ

from framework.log import log
from framework.orm_holder import OrmHolder
from framework.session_holder import *
from framework.task_manager import *
from framework.image_server import *

#from giveaminute import models

# Due to the fact that we are utilizing some custom
# libraries, we add the lib path for import.
sys.path.append("lib/")
from lib import web

# Define all the routes for the applications
ROUTES = (  r'/admin/?([^/.]*)/?([^/.]*)/?([^/.]*)', 'controllers.admin.Admin',
            r'/cms/?([^/.]*)', 'controllers.admin.Admin',
            r'/create/?([^/.]*)', 'controllers.createProject.CreateProject',
            r'/idea/?([^/.]*)', 'controllers.idea.Idea',
            r'/join/?([^/.]*)/?([^/.]*)', 'controllers.join.Join',
            r'/project/?([^/.]*)/?([^/.]*)', 'controllers.project.Project',
            r'/resource/?([^/.]*)/?([^/.]*)', 'controllers.resource.Resource',
            r'/search/?([^/.]*)', 'controllers.search.Search',
            r'/twilio/?([^/.]*)', 'controllers.sms.twilio.Twilio',
            r'/useraccount/?([^/.]*)', 'controllers.user.UserAccount',

            # RESTufl Resources
            r'/rest/v1/needs/', 'controllers.rest.NeedsList',
            r'/rest/v1/needs/(?P<id>\d+)/', 'controllers.rest.NeedInstance',
            r'/rest/v1/needs/(?P<need_id>\d+)/volunteers/', 'controllers.rest.NeedVolunteerList',
            r'/?([^/.]*)/?([^/.]*)', 'controllers.home.Home' )
            

def sessionDB():
    """
    Gets the session database object.  Database object is based from
    web.py's database handling.  This utilizes values found in the
    config.yaml file.
    """
    config = Config.get('database')
    return web.database(dbn=config['dbn'], user=config['user'], pw=config['password'], db=config['db'], host=config['host'])
    

def enable_smtp():
    """
    Enable SMTP support for the web.py email handling.  This
    uses config values found in config.yaml.
    """
    smtp_config = Config.get('email').get('smtp')
    web.webapi.config.smtp_server = smtp_config.get('host')
    web.webapi.config.smtp_port = smtp_config.get('port')
    web.webapi.config.smtp_starttls = smtp_config.get('starttls')
    web.webapi.config.smtp_username = smtp_config.get('username')
    web.webapi.config.smtp_password = smtp_config.get('password')


def enable_aws_ses():
    """
    Enable AWS SES support for the web.py email handling.  This
    uses config values found in config.yaml.
    """
    ses_config = Config.get('email').get('aws_ses')
    web.webapi.config.email_engine = 'aws'
    web.webapi.config.aws_access_key_id = ses_config.get('access_key_id')
    web.webapi.config.aws_secret_access_key = ses_config.get('secret_access_key')

def load_sqla(handler):
    """
    Create a load hook and use sqlalchemy's ``scoped session``. This construct
    places the ``sessionmaker()`` into a registry that maintains a single
    ``Session`` per application thread.

    For more information see: http://webpy.org/cookbook/sqlalchemy

    """
    ##
    # TODO: This should be `engine = models.get_db_engine()`.  See the note in
    #       giveaminute.models for more information.
    #
    class OrmContextManager (object):
        def __enter__(self):
            log.debug("*** Loading the ORM")
            self.orm = OrmHolder().orm
            return self.orm

        def __exit__(self, e_type=None, e_val=None, e_tb=None):
            if e_type == web.HTTPError:
                log.debug("*** web.HTTPError with the ORM")
                orm.commit()
            elif e_type:
                log.debug("*** Other exception with the ORM")
                self.orm.rollback()
            else:
                log.debug("*** Finishing up with the ORM")
                self.orm.commit()

    with OrmContextManager() as orm:
        result = handler()

    return result


# Main logic for the CBU application.  Does some basic configuration,
# then starts the web.py application.
if __name__ == "__main__":
    log.info("|||||||||||||||||||||||||||||||||||| SERVER START |||||||||||||||||||||||||||||||||||||||||||")
    
    # Handle debug logging, dependent on dev mode.
    if Config.get('dev'):
        web.config.debug = True
    log.info("Debug: %s" % web.config.debug)
    
    # Define cookie name for application.  GAM is for Give a Minute
    # which is the old name for this application.
    web.config.session_parameters['cookie_name'] = 'gam'

    # Email handling.  Determine which email method is appropriate.
    # Start with SES and fall-back to SMTP if both are enabled.
    # If both SES and SMTP config options are not available, web.py
    # uses sendmail by default.
    if Config.get('email').get('smtp') and Config.get('email').get('aws_ses'):
        import boto

        c = boto.connect_ses(
          aws_access_key_id     = Config.get('email').get('aws_ses').get('access_key_id'),
          aws_secret_access_key = Config.get('email').get('aws_ses').get('secret_access_key'))

        # TODO: Need to add proper exception handling or at least error reporting!
        # Use raw_email since this allows for attachments
        sendQuota = c.get_send_quota()["GetSendQuotaResponse"]["GetSendQuotaResult"]
        # Check if we're close to the smtp quota. 10 seems like a good number
        sentLast24Hours = sendQuota.get('SentLast24Hours')
        if sentLast24Hours is None:
            sentLast24Hours = 0
            
        sentLast24Hours = int(float(sentLast24Hours))
        max24HourSend = sendQuota.get('Max24HourSend')
        if max24HourSend is None:
            max24HourSend = 0
            
        max24HourSend = int(float(max24HourSend))
        if sentLast24Hours >= max24HourSend- 10:
            enable_smtp()
        else:
            enable_aws_ses()

    # Enable the appropriate method if configured.
    elif Config.get('email').get('smtp'):
        enable_smtp()

    elif Config.get('email').get('aws_ses'):
        enable_aws_ses()

    # Add blitz.io route.  We put into new var because of an odd behaviors
    # where a changed ROUTES is not handled correctly.
    try:
        if Config.get('blitz_io').get('route') and Config.get('app_env') != 'live':
            blitz_route = r'/%s/?([^/.]*)' % Config.get('blitz_io').get('route')
            NEW_ROUTES = (blitz_route, 'controllers.blitz.Blitz') + ROUTES
        else:
            NEW_ROUTES = ROUTES
    except KeyError:
        NEW_ROUTES = ROUTES

    # Create web.py app with defined routes.
    app = web.application(NEW_ROUTES, globals())
    
    # Create database session object.
    db = sessionDB()
    # Handle sessions in the database.
    SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))

    # Load SQL?
    app.add_processor(load_sqla)
    
    # Finally, run the web.py app!
    app.run()
