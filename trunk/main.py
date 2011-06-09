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
    app = web.application(ROUTES, globals())
    db = sessionDB()
    SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))
    app.run()
    
