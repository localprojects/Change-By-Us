"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from unittest2 import TestCase
from paste.fixture import TestApp
from lib import web

import main

from framework.controller import Controller

class I18nTests (TestCase):

    def setUp(self):
        web.ctx.method = 'GET'
        web.ctx.path = '/'
#        
#        # Set the debug flag to true, despite what is in the config file
#        web.config.debug = False
#        web.config.session_parameters['cookie_name'] = 'gam'
#        
#        # Set up the routes
#        app = web.application(main.ROUTES, globals())
#        
#        # Grab a database connection
#        db = main.sessionDB()
#        
#        # Initialize the session holder (I don't know what that is yet)
#        #main.SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))
#        
#        # Finally, create a test app
#        self.app = TestApp(app.wsgifunc())
#    
#    
    def test_SupportedLanguagesIsAsExpected(self):
        # Yeah, I'm hitting the file system.  Deal with it.
        controller = Controller()
        langs = controller.get_supported_languages()
        self.assertEqual(langs, {'en_TEST':'L33t'})

