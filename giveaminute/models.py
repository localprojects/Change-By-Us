from datetime import date
from datetime import datetime
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Date
from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import SmallInteger
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy.orm import relationship
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.orm.exc import NoResultFound

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.declarative import declarative_base


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

Base = declarative_base(cls=Base)


class User (Base):
    __tablename__ = 'user'

    id = Column('user_id', Integer, primary_key=True)

    email = Column(String(100), nullable=False, unique=True)
    phone = Column(String(10), default=None, unique=True)
    user_key = Column(String(10), nullable=False)
    password = Column(String(255), nullable=False)
    salt = Column(String(255), nullable=False)
    first_name = Column(String(50), default=None)
    last_name = Column(String(50), default=None)
    full_display_name = Column(String(255), default=None)
    image_id = Column(Integer, default=None)
    location_id = Column(Integer, default=None)  # Should be a foreign key
    description = Column(String(255), default=None)
    affiliation = Column(String(100), default=None)
    group_membership_bitmask = Column(SmallInteger, nullable=False, default=1)
    is_oncall = Column(Boolean, nullable=False, default=False)
    email_notification = Column(Enum('none','digest'), nullable=False, default='digest')
    last_account_page_access_datetime = Column(DateTime, default=None)
    is_active = Column(Boolean, nullable=False, default=True)
    created_datetime = Column(DateTime, nullable=False, default=datetime(1, 1, 1, 0, 0, 0))
    updated_datetime = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    @property
    def avatar_path(self):
        return 'images/%s/%s.png' % (str(self.id)[-1], self.id)

    def join(self, project):
        orm = OrmHandler().orm
        membership = orm.query(ProjectMember).filter_by(member=self, project=project)
        if membership:
            return membership[0]
        else:
            return project.project_members.append(ProjectMember(member=self))


class ProjectMember (Base):
    __tablename__ = 'project__user'

    user_id = Column(ForeignKey('user.user_id'), primary_key=True)
    project_id = Column(ForeignKey('project.project_id'), primary_key=True)

    is_project_admin = Column(Boolean, nullable=False, default=False)
    created_datetime = Column(DateTime, nullable=False, default=datetime.now)

    member = relationship('User', backref='memberships',
        primaryjoin='ProjectMember.user_id==User.id')

class Project (Base):
    __tablename__ = 'project'

    id = Column('project_id', Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255))

    image_id = Column(Integer)  # Should be foreign key
    location_id = Column(Integer)  # Should be foreign key
    keywords = Column(Text)
    num_flags = Column(SmallInteger, nullable=False, default=0)
    is_official = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_datetime = Column(DateTime, nullable=False, default=datetime(1, 1, 1, 0, 0, 0))
    updated_datetime = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    organization = Column(String(255), default=None)

    # Not sure whether declarative can take care of MySQL FULLTEXT keys.  Might
    # need to do an alter table:
    #
    # FULLTEXT KEY `title` (`title`,`description`)

    needs = relationship('Need', backref='project')
    project_members = relationship('ProjectMember', backref='project',
        primaryjoin='Project.id==ProjectMember.project_id')

    members = association_proxy('project_members', 'member')


class Place (Base):
    __tablename__ = 'project_place'

    id = Column(Integer, primary_key=True)
    name = Column(String(256))
    street = Column(String(256))
    city = Column(String(256))


class Need (Base):
    __tablename__ = 'project_need'

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
    __tablename__ = 'project_need_volunteer'

    need_id = Column(ForeignKey('project_need.id'), primary_key=True)
    member_id = Column(ForeignKey('user.user_id'), primary_key=True)

    need = relationship('Need', backref='need_volunteers')
    member = relationship('User', backref='commitments')


if __name__ == '__main__':
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

    from framework.orm_holder import OrmHolder

    oh = OrmHolder()
    config = oh.get_db_config()
    engine = oh.get_db_engine(config)
    Base.metadata.create_all(engine)
