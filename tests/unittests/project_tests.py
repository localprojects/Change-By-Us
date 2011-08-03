from unittest2 import TestCase
from paste.fixture import TestApp
from lib import web

import mock
import main

class FileUploadTest (TestCase):

    def setUp(self):
        
        # Set the debug flag to true, despite what is in the config file
        web.config.debug = False
        web.config.session_parameters['cookie_name'] = 'gam'
        
        # TODO: Clean up this initialization
        web.ctx.method = ''
        web.ctx.path = ''
        import StringIO
        web.ctx.env = {'wsgi.input':StringIO.StringIO()}
        
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

    def test_FileUploadServiceUsesS3Uploader(self):
        import controllers.createProject as createProject
        
        class UselessStub (object):
            def add(self, *args, **kwargs):
                pass
        
        createProject.S3FileServer = mock.Mock(return_value=UselessStub())
        
        controller = createProject.CreateProject()
        controller.request = lambda _ : []
        
        controller.uploadFile()
        self.assertEqual(createProject.S3FileServer.call_count, 1)
        
