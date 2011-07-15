from unittest2 import TestCase
from paste.fixture import TestApp
from lib import web

import main

class FileUploadTest (TestCase):

    def setUp(self):
        
        # Set the debug flag to true, despite what is in the config file
        web.config.debug = False
        web.config.session_parameters['cookie_name'] = 'gam'
        
        # Set up the routes
        app = web.application(main.ROUTES, globals())
        
        # Grab a database connection
        db = main.sessionDB()
        
        # Initialize the session holder (I don't know what that is yet)
        #main.SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))
        
        # Finally, create a test app
        self.app = TestApp(app.wsgifunc())
    
    
    def test_FileUploadServiceEndpointHas200Status(self):
        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
        # more about testing with Paste.
        
        response = self.app.post('/create/file', params={'qqfile':'This is a qqfile'})
        self.assertEqual(response.status, 200)
        response.mustcontain('file_id')
        response.mustcontain('"success": false')
