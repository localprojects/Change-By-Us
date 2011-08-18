from sqlalchemy import create_engine
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.orm import scoped_session, sessionmaker

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.declarative import declarative_base


if __name__ == '__main__':
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

    
def get_db_config():
    from framework.config import Config
    return Config.get('database')


def get_db_engine():
    """Gets the SQLAlchemy database engine."""
    config = get_db_config()
    db_conn_string = '%(dbn)s://%(user)s:%(password)s@%(host)s/%(db)s' % config
    engine = create_engine(db_conn_string, echo=True)
    return engine
    

def get_session():
    """
    Gets the SQLAlchemy ORM session, which is stored on the thread-global 
    ``web.ctx`` object.  The object is wrapped so that we can more easily stub
    it when necessary.
    """
    Session = scoped_session(sessionmaker(bind=engine))
    return Session()
#    import web
#    return web.ctx.orm


##
# HACK: I cannot express how much I dislike calling get_db_engine() here.  It 
#       effectively prevents you from importing this module without loading the
#       database, and that just ain't cool.  However, in order to autoload the 
#       existing tables from the database, it appears that I need to link the
#       Base model declarative class with an engine at create time.  In order
#       to do that, I need to get the database engine.
#
# TODO: Replace the existing autoloaded tables with full declarative table 
#       definitions.  This will (1) relax the need to have Base linked with an
#       engine at create time, (2) be more explicit, and (3) allow the tables
#       to be managed by whatever migration system we use with SQLAlchemy, as
#       opposed to having to keep the table definitions in SQL.
#
#       Remember to update main.load_sqla(...) when that change is made.
#
engine = get_db_engine()

Base = declarative_base(engine)


class Project (Base):
    __tablename__ = 'project'
    __table_args__ = {'autoload': True}

class User (Base):
    __tablename__ = 'user'
    __table_args__ = {'autoload': True}


class Need (Base):
    __tablename__ = 'project_needs'

    id = Column(Integer, primary_key=True)
    type = Column(String(10))
    item_needed = Column(String(64))
    num_needed = Column(Integer)
    description = Column(Text)
    
    project_id = Column(ForeignKey('project.project_id'), nullable=False)
    projects = relationship('Project')
    
    volunteers = association_proxy('need_volunteers', 'member')


class Volunteer (Base):
    __tablename__ = 'project_need_volunteers'
    
    need_id = Column(ForeignKey('project_needs.id'), primary_key=True)
    member_id = Column(ForeignKey('user.user_id'), primary_key=True)
    
    need = relationship('Need', backref='need_volunteers')
    member = relationship('User', backref='commitments')


if __name__ == '__main__':
    Base.metadata.create_all(engine)
