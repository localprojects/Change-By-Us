#!/usr/bin/env python

import os, sys
from os import environ

from sqlalchemy.orm import scoped_session, sessionmaker

from framework.log import log
from framework.session_holder import *
from framework.task_manager import *
from framework.image_server import *

from giveaminute import models

sys.path.append("lib/")
from lib import web

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
            r'/rest/v1/needs/(?P<need_id>\d+)/', 'controllers.rest.NeedInstance',
            
            r'/?([^/.]*)/?([^/.]*)', 'controllers.home.Home' )
            
def sessionDB():
    config = Config.get('database')
    return web.database(dbn=config['dbn'], user=config['user'], pw=config['password'], db=config['db'], host=config['host'])

def enable_smtp():
    smtp_config = Config.get('email').get('smtp')
    web.webapi.config.smtp_server = smtp_config.get('host')
    web.webapi.config.smtp_port = smtp_config.get('port')
    web.webapi.config.smtp_starttls = smtp_config.get('starttls')
    web.webapi.config.smtp_username = smtp_config.get('username')
    web.webapi.config.smtp_password = smtp_config.get('password')

def enable_aws_ses():
    # AWS SES config
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
    engine = models.engine
    
    log.debug("*** Loading the ORM")
    web.ctx.orm = scoped_session(sessionmaker(bind=engine))
    try:
        return handler()
    except web.HTTPError:
       web.ctx.orm.commit()
       raise
    except:
        web.ctx.orm.rollback()
        raise
    finally:
        web.ctx.orm.commit()
        # If the above alone doesn't work, uncomment 
        # the following line:
        #web.ctx.orm.expunge_all() 

#def cmd_show_quota():
#    ses = boto.connect_ses()
#    args.verbose= True
#    
#    sendQuota = ses.get_send_quota()["GetSendQuotaResponse"]["GetSendQuotaResult"]
#    return sendQuota

if __name__ == "__main__":
    log.info("|||||||||||||||||||||||||||||||||||| SERVER START |||||||||||||||||||||||||||||||||||||||||||")
    if Config.get('dev'):
        web.config.debug = True        
    log.info("Debug: %s" % web.config.debug)
    web.config.session_parameters['cookie_name'] = 'gam'


    # TODO:
    # Start with SES and fall-back to SMTP if both are enabled
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
        
    # Set the email configurations:
    elif Config.get('email').get('smtp'):
        enable_smtp()

    elif Config.get('email').get('aws_ses'):
        enable_aws_ses()
    
    try:
        # Add blitz.io route.  We put into new var because of an odd behaviors
        # where a changed ROUTES is not handled correctly.
        if Config.get('blitz_io').get('route') and Config.get('app_env') != 'live':
            blitz_route = r'/%s/?([^/.]*)' % Config.get('blitz_io').get('route')
            NEW_ROUTES = (blitz_route, 'controllers.blitz.Blitz') + ROUTES
        else:
            NEW_ROUTES = ROUTES
    except KeyError:
        NEW_ROUTES = ROUTES

    # Create web.py app with defined routes.
    app = web.application(NEW_ROUTES, globals())
    db = sessionDB()
    SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))
    
#    app.add_processor(load_sqla)
    app.run()
    
