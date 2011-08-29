from paste.fixture import TestApp
from lib import web

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
        models_sql = open('/home/mjumbewu/Programming/cfa/cbu/sql/models.sql').read()
        for sql_statement in models_sql.split(';'):
            db.query(sql_statement)

    def load_db_fixtures(self, db, *fixtures):
        for fixture in fixtures:
            fixture_sql = open('/home/mjumbewu/Programming/cfa/cbu/tests/integrationtests/sql/' + fixture).read()
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

        super(WebPySetupMixin, self).setUp()

    def tearDown(self):
        # Dont leave the web context dirty for the next test.
        from lib.web import utils
        utils.ThreadedDict.clear_all()

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
