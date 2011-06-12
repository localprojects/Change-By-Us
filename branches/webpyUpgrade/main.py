#!/usr/bin/env python

import os, sys
from os import environ
from lib import web
from framework.log import log
from framework.session_holder import *
from framework.task_manager import *
from framework.image_server import *

sys.path.append("lib/")

ROUTES = (  r'/admin/?([^/.]*)/?([^/.]*)/?([^/.]*)', 'controllers.admin.Admin',
            r'/cms/?([^/.]*)', 'controllers.admin.Admin',
            r'/create/?([^/.]*)', 'controllers.createProject.CreateProject',
            r'/idea/?([^/.]*)', 'controllers.idea.Idea',
            r'/join/?([^/.]*)/?([^/.]*)', 'controllers.join.Join',
            r'/project/?([^/.]*)/?([^/.]*)', 'controllers.project.Project',
            r'/resource/?([^/.]*)', 'controllers.resource.Resource',
            r'/search/?([^/.]*)', 'controllers.search.Search',
            r'/twilio/?([^/.]*)', 'controllers.sms.twilio.Twilio',
            r'/useraccount/?([^/.]*)', 'controllers.user.UserAccount',
            r'/?([^/.]*)/?([^/.]*)', 'controllers.home.Home' )
            
def sessionDB():
    config = Config.get('database')
    return web.database(dbn=config['dbn'], user=config['user'], pw=config['password'], db=config['db'], host=config['host'])

if __name__ == "__main__":
    log.info("|||||||||||||||||||||||||||||||||||| SERVER START |||||||||||||||||||||||||||||||||||||||||||")
    if Config.get('dev'):
        web.config.debug = True        
    log.info("Debug: %s" % web.config.debug)
    web.config.session_parameters['cookie_name'] = 'gam'

    # Set the email configurations:
    if Config.get('email').get('smtp'):
        smtp_config = Config.get('email').get('smtp')
        web.webapi.config.smtp_server = smtp_config.get('host')
        web.webapi.config.smtp_port = smtp_config.get('port')
        web.webapi.config.smtp_username = smtp_config.get('username')
        web.webapi.config.smtp_password = smtp_config.get('password')

    elif Config.get('email').get('aws_ses'):
        # AWS SES config
        ses_config = Config.get('email').get('aws_ses')
        web.webapi.config.email_engine = 'aws'
        web.webapi.config.aws_access_key_id = ses_config.get('access_key_id')
        web.webapi.config.aws_secret_access_key = ses_config.get('secret_access_key')

    app = web.application(ROUTES, globals())
    db = sessionDB()
    SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))
    app.run()
    