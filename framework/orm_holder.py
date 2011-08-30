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
        from lib import web
        if not hasattr(web.ctx, 'orm') or web.ctx.orm is None:
            config = self.get_db_config()
            engine = self.get_db_engine(config)
            web.ctx.orm = self.get_orm(engine)
        return web.ctx.orm


    def get_db_config(self):
        """Pulls the database config information from the config.yaml file."""
        return Config.get('database')


    def get_db_engine(self, db_config):
        """Gets the SQLAlchemy database engine."""
        db_conn_string = '%(dbn)s://%(user)s:%(password)s@%(host)s/%(db)s' % db_config
        engine = create_engine(db_conn_string, echo=True)
        return engine


    def get_orm(self, engine):
        """Returns a thread-specific SQLAlchemy ORM session."""
        OrmSession = scoped_session(sessionmaker(bind=engine))
        return OrmSession()
