from unittest2 import TestCase
from paste.fixture import TestApp
from lib import web
from mock import Mock

from framework.config import Config
from framework.session_holder import SessionHolder
import main

class NeedsResourcesTests (TestCase):
    def runSql(self, db, sql):
        db.query(sql)
    
    def installDb(self, db):
        models_sql = open('/home/mjumbewu/Programming/cfa/cbu/sql/models.sql').read()
        for sql_statement in models_sql.split(';'):
            db.query(sql_statement)
        
    def loadDbFixtures(self, db, *fixtures):
        for fixture in fixtures:
            fixture_sql = open('/home/mjumbewu/Programming/cfa/cbu/tests/integrationtests/sql/' + fixture).read()
            for sql_statement in fixture_sql.split(';'):
                db.query(sql_statement)
    
    def setUp(self):
        db = main.sessionDB()
        self.installDb(db)
        self.loadDbFixtures(db, 'test_data.sql')
        
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
        SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))
        
        # Grab a database connection
        self.db = db
        
        # Initialize the session holder (I don't know what that is yet)
        #main.SessionHolder.set(web.session.Session(app, web.session.DBStore(db, 'web_session')))
        
        # Finally, create a test app
        self.app = TestApp(app.wsgifunc())
    
    def tearDown(self):
        # Dont leave the web context dirty for the next test.
        from lib.web import utils
        utils.ThreadedDict.clear_all()
    
    
    def test_AnonymousUserNotAllowedToCreateNeeds(self):
        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
        # more about testing with Paste.
        
        class FakeDict (dict):
            def __getattr__(self, key):
                if key in self:
                    return self[key]
                else:
                    raise AttributeError(key)
            
            def __setattr__(self, key, value):
                self[key] = value
                return value
        
        session = FakeDict()
        SessionHolder.get_session = Mock(return_value=session)
        
        response = self.app.post('/rest/v1/needs/', 
            params={
                'type': 'volunteer',
                'item_needed': 'basketball players',
                'num_needed': '5',
                'description': 'Play on my basketball team',
                'project_id': 0,
            },
            status=403)
    
    def test_AdminUserAllowedToCreateNeeds(self):
        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
        # more about testing with Paste.
        
        class FakeDict (dict):
            def __getattr__(self, key):
                if key in self:
                    return self[key]
                else:
                    raise AttributeError(key)
            
            def __setattr__(self, key, value):
                self[key] = value
                return value
        
        session = FakeDict(user_id=3)
        SessionHolder.get_session = Mock(return_value=session)
        
        response = self.app.post('/rest/v1/needs/', 
            params={
                'type': 'volunteer',
                'item_needed': 'basketball players',
                'num_needed': '5',
                'description': 'Play on my basketball team',
                'project_id': 0,
            },
            status=200)
    

