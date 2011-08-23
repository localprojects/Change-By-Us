from unittest2 import TestCase
from datetime import datetime, timedelta
from paste.fixture import TestApp
from lib import web

import mock
import main
from framework.config import Config

class FileUploadTest (TestCase):

    def setUp(self):
        # HACK: We kept getting db.printing inexplicably set to True, so patch
        # it to be False here.
        _real_db_execute = web.db.DB._db_execute
        def _db_execute(self, cur, sql_query):
            self.printing = False
            return _real_db_execute(self, cur, sql_query)
        web.db.DB._db_execute = _db_execute
            
        # Set the dev flag in Config to False.
        Config.load()
        Config.data['dev'] = False
        
        # Set the debug flag to true, despite what is in the config file
        web.config.debug = False
        web.config.session_parameters['cookie_name'] = 'gam'
        
        # TODO: Clean up this initialization
        web.ctx.method = ''
        web.ctx.path = ''
        import StringIO
        web.ctx.env = {'wsgi.input': StringIO.StringIO(),
                       'REQUEST_METHOD': ''}
        
        # Set up the routes
        app = web.application(main.ROUTES, globals())
        
        # Grab a database connection
        self.db = main.sessionDB()
        
        # Initialize the session holder (I don't know what that is yet)
        #main.SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))
        
        # Finally, create a test app
        self.app = TestApp(app.wsgifunc())
    
    
    def test_FileUploadServiceEndpointHas200Status(self):
        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
        # more about testing with Paste.
        
        response = self.app.post('/create/attachment', params={'qqfile':'This is a qqfile'})
        self.assertEqual(response.status, 200)
        response.mustcontain('"media_id": ')
        response.mustcontain('"media_type": "file"')
        response.mustcontain('"success": true')

    def test_ImageUploadServiceEndpointHas200Status(self):
        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
        # more about testing with Paste.
        
        # This is a very small (1x1) PNG image.
        png_data = "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x01sRGB\x00\xae\xce\x1c\xe9\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x07tIME\x07\xdb\x08\n\x01'9o\xe2\xbd\xb3\x00\x00\x00\x19tEXtComment\x00Created with GIMPW\x81\x0e\x17\x00\x00\x00\x0cIDAT\x08\xd7c\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82"
        
        response = self.app.post('/create/attachment', upload_files=[('qqfile', 'very_small_image.png', png_data)])
        self.assertEqual(response.status, 200)
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


from giveaminute.project import message
class Test_MessageObjectFactory (TestCase):
    def test_converts_datetime_without_timezone_to_utc(self):
        localnow = datetime.now()
        utcnow = datetime.utcnow()
        tz_offset = int((localnow - utcnow).total_seconds() / 60 / 60)
        
        m = message(id=None, type='my type', message='my message', createdDatetime=datetime(2011, 8, 22, 18, 16, 45) + timedelta(hours=tz_offset), userId=None, name=None, imageId=None)
        
        self.assertEqual(m['created'], '2011-08-22 18:16:45')

