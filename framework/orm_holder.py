"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from lib import web
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from framework.config import Config

class OrmHolder (object):

    @property
    def orm(self):
        """
        Gets the SQLAlchemy ORM session, which is stored on the thread-global
        ``web.ctx`` object.  The object is wrapped so that we can more easily stub
        it when necessary.
        """
        if self.is_invalid:
            config = self.get_db_config()
            engine = self.get_db_engine(config)
            web.ctx.orm = self.get_orm(engine)
        return web.ctx.orm

    @property
    def is_invalid(self):
        """A flag denoting that the ORM session needs to be [re]loaded"""
        return not hasattr(web.ctx, 'orm') or web.ctx.orm is None

    @classmethod
    def invalidate(cls):
        web.ctx.orm = None

    def get_db_config(self):
        """Pulls the database config information from the config.yaml file."""
        return Config.get('database')


    def get_db_engine(self, db_config):
        """
        Gets the SQLAlchemy database engine.

        The database engine should be a global object in the process.  As such,
        we stick it on ``web.config``.  This way, all the threads share the
        engine and the db connection pool that it maintains.
        
        See http://docs.sqlalchemy.org/en/latest/core/engines.html for create_engine() params
        """
        if not hasattr(web.config, 'db_engine'):
            db_conn_string = '%(dbn)s://%(user)s:%(password)s@%(host)s/%(db)s' % db_config
            # TODO: 
            #    * encoding "Defaults to utf-8"
            #    * echo should be configurable based on DEBUG setting, otherwise all
            #      sql statements will be logged indiscriminately
            web.config.db_engine = create_engine(db_conn_string, 
                                                 encoding='utf-8', 
                                                 convert_unicode=False, 
                                                 echo=True, echo_pool=True,
                                                 # Secs between recycling pool connections
                                                 pool_recycle=600)
        return web.config.db_engine


    def get_orm(self, engine):
        """
        Returns a thread-specific SQLAlchemy ORM session.

        The session is a scoped session, which means that it is global within
        a given thread.  New threads, however, will create new sessions.

        """
        OrmSession = scoped_session(sessionmaker(bind=engine))
        return OrmSession
