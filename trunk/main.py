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
            r'/join/?([^/.]*)', 'controllers.join.Join',
            r'/project/?([^/.]*)/?([^/.]*)', 'controllers.project.Project',
            r'/search/?([^/.]*)', 'controllers.search.Search',
            r'/twilio/?([^/.]*)', 'controllers.sms.twilio.Twilio',
            r'/useraccount/?([^/.]*)', 'controllers.user.UserAccount',
            r'/?([^/.]*)/?([^/.]*)', 'controllers.home.Home' )

if __name__ == "__main__":
    log.info("|||||||||||||||||||||||||||||||||||| SERVER START |||||||||||||||||||||||||||||||||||||||||||")
    if Config.get('dev'):
        web.config.debug = True        
    log.info("Debug: %s" % web.config.debug)
    web.config.session_parameters['cookie_name'] = 'gam'
    app = web.application(ROUTES, globals())
    SessionHolder.set(web.session.Session(app, web.session.DiskStore("sessions")))
    app.run()
    