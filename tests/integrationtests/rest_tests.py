from unittest2 import TestCase
from paste.fixture import TestApp
from lib import web
from mock import Mock

from framework.config import Config
import main

class NeedsResourcesTests (TestCase):
    
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
    
    
    def test_AnonymousUserNotAllowedToCreateNeeds(self):
        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
        # more about testing with Paste.
        
        response = self.app.post('/rest/v1/needs/', 
            params={
                'type': 'volunteer',
                'item_needed': 'basketball players',
                'num_needed': '5',
                'description': 'Play on my basketball team',
            },
            status=403)
        
