import os
import sys
from paste.fixture import TestApp
from lib import web
from mock import Mock

from framework.config import Config
from framework.session_holder import SessionHolder
import main

class DbFixturesMixin (object):
    fixtures = []

    def setUp(self):
        Config.load()

        # Use the test_db, so that you don't blow stuff away.
        db_config = Config.get('database')
        if 'test_db' in db_config and db_config['test_db']:
            db_config['db'] = db_config['test_db']

        # Grab a database connection
        self.db = main.sessionDB()
        self.install_db_structure(self.db)
        self.load_db_fixtures(self.db, *self.fixtures)

        # HACK: We kept getting db.printing inexplicably set to True, so patch
        # it to be False here.
        _real_db_execute = web.db.DB._db_execute
        def _db_execute(self, cur, sql_query):
            self.printing = False
            return _real_db_execute(self, cur, sql_query)
        web.db.DB._db_execute = _db_execute

        super(DbFixturesMixin, self).setUp()

    def run_sql(self, db, sql):
        db.query(sql)

    def install_db_structure(self, db):
        curdir = os.path.dirname(__file__)
        models_sql = open(os.path.join(curdir, '../../sql/models.sql')).read()
        for sql_statement in models_sql.split(';'):
            db.query(sql_statement)

    def load_db_fixtures(self, db, *fixtures):
        curdir = os.path.dirname(__file__)
        for fixture in fixtures:
            fixture_sql = open(os.path.join(curdir, 'sql', fixture)).read()
            for sql_statement in fixture_sql.split(';'):
                db.query(sql_statement)


class WebPySetupMixin (object):
    def setUp(self):
        # Set the debug flag to true, despite what is in the config file
        web.config.debug = False
        web.config.session_parameters['cookie_name'] = 'gam'

        # TODO: Clean up this initialization
        web.ctx.method = ''
        web.ctx.path = ''
        web.ctx.home = 'http://localhost:8080/test'
        import StringIO
        web.ctx.env = {'wsgi.input': '',
                       'REQUEST_METHOD': ''}
        web.ctx.headers = []

        # If we don't clear out the args, they're going to creep into the web
        # context as input parameters.
        self.__args = sys.argv
        sys.argv = []

        super(WebPySetupMixin, self).setUp()

    def tearDown(self):
        # Dont leave the web context dirty for the next test.
        from lib.web import utils
        print '***clearnign?'
        utils.ThreadedDict.clear_all()

        sys.argv = self.__args

        super(WebPySetupMixin, self).tearDown()


class AppSetupMixin (DbFixturesMixin, WebPySetupMixin):
    def setUp(self):
        DbFixturesMixin.setUp(self)
        WebPySetupMixin.setUp(self)
#        super(AppSetupMixin, self).setUp()

        # Set the dev flag in Config to False.
        Config.data['dev'] = False

        # Set up the routes
        app = web.application(main.ROUTES, globals())
        SessionHolder.set(web.session.Session(app, web.session.DBStore(self.db, 'web_session')))

        # Finally, create a test app
        self.app = TestApp(app.wsgifunc())

        class ObjectDict (dict):
            def __getattr__(self, key):
                if key in self:
                    return self[key]
                else:
                    raise AttributeError(key)

            def __setattr__(self, key, value):
                self[key] = value
                return value

        self.session = ObjectDict()
        SessionHolder.get_session = Mock(return_value=self.session)


    def tearDown(self):
        self.logout()
        super(AppSetupMixin, self).tearDown()

    def logout(self):
        self.session.user_id = None
        self.session.user = None

    def login(self, user_id):
        self.session.user_id = user_id
