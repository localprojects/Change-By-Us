#!/usr/bin/env python

import os, sys
from os import environ
from lib import web
from framework.log import log
from framework.session_holder import *
from framework.task_manager import *
from framework.image_server import *

sys.path.append("lib/")

#
# ROUTES = (  r"/home/?([^/.]*)", Home,
#             r"/ideasubmission/?([^/.]*)", IdeaSubmission,
#             r"/join/?([^/.]*)", Join,
#             r"/login/?([^/.]*)", Login,
#             r"/feedback/?([^/.]*)", Feeback,
#             r"/create/?([^/.]*)", Create,
#             r"/project/?([^/.]*)", Project,
#             r"/useraccount/?([^/.]*)", UserAccount,
#             r"/search/?([^/.]*)", Search,
#             r"/resource/?([^/.]*)", Resource,
#             r"/about/?([^/.]*)", About,
#             r"/news/?([^/.]*)", News,
#             r"/tou/?([^/.]*)", TOU,
#             r"/mobile/?([^/.]*)", Mobile,
#             r"/?([^/.]*)", Main			
#             )

ROUTES = ( r'/?([^/.]*)', 'controllers.home.Home' )

if __name__ == "__main__":
    log.info("|||||||||||||||||||||||||||||||||||| SERVER START |||||||||||||||||||||||||||||||||||||||||||")
    if Config.get('dev'):
        web.config.debug = True        
    log.info("Debug: %s" % web.config.debug)
    log.info("CONFIG: %s" % Config.get_all())
    web.config.session_parameters['cookie_name'] = 'gam'
    app = web.application(ROUTES, globals())
    SessionHolder.set(web.session.Session(app, web.session.DiskStore("sessions")))
    app.run()
    