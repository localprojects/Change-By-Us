#!/usr/bin/env python

import os, sys
from os import environ
from framework.log import log
from framework.session_holder import *
from framework.task_manager import *
from framework.image_server import *

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
            r'/?([^/.]*)/?([^/.]*)', 'controllers.home.Home' )
            
def sessionDB():
    config = Config.get('database')
    return web.database(dbn=config['dbn'], user=config['user'], pw=config['password'], db=config['db'], host=config['host'])

def enable_smtp():
    try:
        smtp_config = Config.get('email').get('smtp')
        web.webapi.config.email_engine = 'smtp'
        web.webapi.config.smtp_server = smtp_config.get('host')
        web.webapi.config.smtp_port = smtp_config.get('port')
        web.webapi.config.smtp_starttls = smtp_config.get('starttls')
        web.webapi.config.smtp_username = smtp_config.get('username')
        web.webapi.config.smtp_password = smtp_config.get('password')
    except Exception, e:
        log.info("ERROR: Exception when loading SMTP: %s" % e)
        
def enable_aws_ses():
    # AWS SES config
    try:
        ses_config = Config.get('email').get('aws_ses')
        web.webapi.config.email_engine = 'aws'
        web.webapi.config.aws_access_key_id = ses_config.get('access_key_id')
        web.webapi.config.aws_secret_access_key = ses_config.get('secret_access_key')
    except Exception, e:
        log.info("ERROR: Exception when loading SES: %s" % e)

#def cmd_show_quota():
#    ses = boto.connect_ses()
#    args.verbose= True
#    
#    sendQuota = ses.get_send_quota()["GetSendQuotaResponse"]["GetSendQuotaResult"]
#    return sendQuota

def main():
    web.config.logfile = Config.get('logfile')
    log.info("|||||||||||||||||||||||||||||||||||| SERVER START |||||||||||||||||||||||||||||||||||||||||||")
    if Config.get('dev'):
        web.config.debug = True        
    log.info("Debug: %s" % web.config.debug)
    web.config.session_parameters['cookie_name'] = 'gam'

    # TODO:
    # Start with SES and fall-back to SMTP if both are enabled
    if Config.get('email').get('smtp') and Config.get('email').get('aws_ses'):
        import boto

        try:
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
                
        except Exception, e:
            log.info(e)
            log.info("ERROR: Email falling back to SMTP")
            enable_smtp()
        
    # Set the email configurations:
    elif Config.get('email').get('smtp'):
        enable_smtp()

    elif Config.get('email').get('aws_ses'):
        enable_aws_ses()

    if web.webapi.config.email_engine not in ['aws', 'smtp']:
        try:
            raise Exception("ERROR: No valid email engine has been configured. Please check your configurations")
        except Exception, e:
            log.info(e)
    
    app = web.application(ROUTES, globals())
    db = sessionDB()
    SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))
    app.run()


if __name__ == "__main__":
    try:
        main()
    except Exception, e:
        log.info("ERROR: %s" % e)
            
