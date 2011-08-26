from sqlalchemy import create_engine
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.orm.exc import NoResultFound

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
    

def get_orm():
    """
    Gets the SQLAlchemy ORM session, which is stored on the thread-global 
    ``web.ctx`` object.  The object is wrapped so that we can more easily stub
    it when necessary.
    """
    OrmSession = scoped_session(sessionmaker(bind=engine, expire_on_commit=False))
    return OrmSession()
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


class Base (object):
    @classmethod
    def get_or_create(cls, orm, **kwargs):
        """will reraise sqlalchemy.orm.exc.MultipleResultsFound"""
        try:
            return orm.query(cls).filter_by(**kwargs).one()
        except NoResultFound:
            obj = cls(**kwargs)
            orm.add(obj)
            return obj
        
Base = declarative_base(engine, cls=Base)


class User (Base):
    __tablename__ = 'user'
    __table_args__ = {'autoload': True}

    def join(self, project):
        return project.project_members.append(ProjectMember(member=self))


class ProjectMember (Base):
    __tablename__ = 'project__user'
    __table_args__ = {'autoload': True}

    user_id = Column(ForeignKey('user.user_id'), primary_key=True)
    project_id = Column(ForeignKey('project.project_id'), primary_key=True)
    
    member = relationship('User', backref='memberships',
        primaryjoin='ProjectMember.user_id==User.user_id')


class Project (Base):
    __tablename__ = 'project'
    __table_args__ = {'autoload': True}

    needs = relationship('Need', backref='project')
    project_members = relationship('ProjectMember', 
        primaryjoin='Project.project_id==ProjectMember.project_id')
    
    members = association_proxy('project_members', 'member')


class Place (Base):
    __tablename__ = 'project_place'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(256))
    street = Column(String(256))
    city = Column(String(256))


class Need (Base):
    __tablename__ = 'project_needs'

    id = Column(Integer, primary_key=True)
    type = Column(String(10))
    request = Column(String(64))
    quantity = Column(Integer)
    description = Column(Text)
    address_id = Column(ForeignKey('project_place.id'))
    date = Column(Date())
    time = Column(String(32))
    duration = Column(String(64))
    project_id = Column(ForeignKey('project.project_id'), nullable=False)
    
    address = relationship('Place')
    
    volunteers = association_proxy('need_volunteers', 'member')
    
    def reason(self):
        """
        'We need {{ quantity }} volunteer {{ request }} for {{ reason }}.'
        
        This is the reason.
        
        """
        return ''


class Volunteer (Base):
    __tablename__ = 'project_need_volunteers'
    
    need_id = Column(ForeignKey('project_needs.id'), primary_key=True)
    member_id = Column(ForeignKey('user.user_id'), primary_key=True)
    
    need = relationship('Need', backref='need_volunteers')
    member = relationship('User', backref='commitments')


if __name__ == '__main__':
    Base.metadata.create_all(engine)
