import re

from collections import defaultdict
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
from sqlalchemy import Float
from sqlalchemy.orm import relationship
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.orm.exc import FlushError
from sqlalchemy.orm.exc import NoResultFound

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.declarative import declarative_base

from framework import util


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
    location_id = Column(ForeignKey('location.location_id'), default=None)
    description = Column(String(255), default=None)
    affiliation = Column(String(100), default=None)
    group_membership_bitmask = Column(SmallInteger, nullable=False, default=1)
    is_oncall = Column(Boolean, nullable=False, default=False)
    email_notification = Column(Enum('none','digest'), nullable=False, default='digest')
    last_account_page_access_datetime = Column(DateTime, default=None)
    is_active = Column(Boolean, nullable=False, default=True)
    created_datetime = Column(DateTime, nullable=False, default=datetime(1, 1, 1, 0, 0, 0))
    updated_datetime = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    commitments = relationship('Volunteer', cascade='all, delete, delete-orphan')
    memberships = relationship('ProjectMember', primaryjoin='ProjectMember.user_id==User.id', cascade='all, delete, delete-orphan')
    location = relationship('Location')

    projects = association_proxy('memberships', 'project')

    @property
    def is_site_admin(self):
        return util.getBit(self.group_membership_bitmask, 1)

    @property
    def avatar_path(self):
        if self.image_id:
            return 'images/%s/%s.png' % (str(self.image_id)[-1], self.image_id)

    @property
    def display_name(self):
        from giveaminute import project

        return project.userNameDisplay(
            self.first_name, self.last_name, self.affiliation,
            project.isFullLastName(self.group_membership_bitmask))

    def join(self, project, is_admin=False):
        if project not in self.projects:
            membership = ProjectMember()
            membership.member = self
            membership.project = project
            membership.is_project_admin = is_admin
            self.memberships.append(membership)
            return True
        return False

    def leave(self, project):
        for membership in self.memberships:
            if membership.project == project:
                self.unvolunteer_from_all_for(project)
                self.memberships.remove(membership)
                return True
        return False

    def unvolunteer_from(self, need):
        for commitment in self.commitments:
            if commitment.need == need:
                self.commitments.remove(commitment)
                return True
        return False

    def unvolunteer_from_all_for(self, project):
        for need in project.needs:
            if self in need.volunteers:
                self.unvolunteer_from(need)


class ProjectMember (Base):
    __tablename__ = 'project__user'

    user_id = Column(ForeignKey('user.user_id'), primary_key=True)
    project_id = Column(ForeignKey('project.project_id'), primary_key=True)

    is_project_admin = Column(Boolean, nullable=False, default=False)
    created_datetime = Column(DateTime, nullable=False, default=datetime.now)

    member = relationship('User',
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

    needs = relationship('Need', order_by="desc(Need.id)", backref='project')
    events = relationship('Event')
    project_members = relationship('ProjectMember', backref='project',
        primaryjoin='Project.id==ProjectMember.project_id')

    members = association_proxy('project_members', 'member')

    @property
    def admins(self):
        admins = []
        for pm in self.project_members:
            if pm.is_project_admin:
                admins.append(pm.member)
        return admins

    @property
    def needs_by_type(self):
        nbt = defaultdict(list)
        for need in self.needs:
            nbt[need.type].append(need)
        return nbt


class Need (Base):
    __tablename__ = 'project_need'

    id = Column(Integer, primary_key=True)
    type = Column(String(10))
    subtype = Column(String(10))
    request = Column(String(64))
    quantity = Column(Integer)
    description = Column(Text)
    address = Column(String(256))
    date = Column(Date())
    time = Column(String(32))
    duration = Column(String(64))
    project_id = Column(ForeignKey('project.project_id'), nullable=False)
    event_id = Column(ForeignKey('project_event.id'), default=None, nullable=True)

    need_volunteers = relationship('Volunteer', cascade="all, delete-orphan")
    volunteers = association_proxy('need_volunteers', 'member')
    event = relationship('Event')

    @property
    def quantity_committed(self):
        """Returns the number of things volunteers/donations that have been committed"""
        return sum(vol.quantity for vol in self.need_volunteers)

    @property
    def display_date(self):
        """Returns dates that end in '1st' or '22nd' and the like."""
        if self.event:
            return util.make_pretty_date(self.event.start_datetime)
        elif self.date:
            return util.make_pretty_date(self.date)
        else:
            return None

    @property
    def reason(self):
        """'We need {{ quantity }} volunteer {{ request }} for {{ reason }}.'
            This is the reason."""
        # TODO: We need a way of constructing the reason.
        return ''

    @property
    def display_address(self):
        if self.event:
            return self.event.address
        else:
            return self.address


class Volunteer (Base):
    __tablename__ = 'project_need_volunteer'

    need_id = Column(ForeignKey('project_need.id'), primary_key=True)
    member_id = Column(ForeignKey('user.user_id'), primary_key=True)
    quantity = Column(Integer, default=1, nullable=False)
    """The quantity of the reqested need that the member is able to provide"""

    need = relationship('Need')
    member = relationship('User')

    @property
    def project(self):
        return self.need.project


class CommunityLeader (Base):
    __tablename__ = 'community_leader'

    id = Column(Integer, primary_key=True)
    display_name = Column(String(256))
    title = Column(String(256))
    image_path = Column(String(256))
    order = Column(Integer)


class Event (Base):
    __tablename__ = 'project_event'

    id = Column(Integer, primary_key=True)
    project_id = Column(ForeignKey('project.project_id'))
    name = Column(String(256))
    details = Column(Text)
    rsvp_url = Column(String(2048))
    start_datetime = Column(DateTime)
    end_datetime = Column(DateTime)
    address = Column(String(256))

    project = relationship('Project')
    needs = relationship('Need')

    @property
    def rsvp_service_name(self):
        """The name of the service providing RSVP for the event"""
        url = self.rsvp_url

        if url is None:
            return None

        url = url.lower()

        # For now the list of supported sites/URLs is hardcoded.  In the future
        # we might want to try to be more clever.
        if re.match(r'^(https?://)?(www.)?facebook.com', url):
            return 'Facebook'
        if re.match(r'^(https?://)?(www.)?meetup.com', url):
            return 'Meetup'
        if re.match(r'^(https?://)?(www.)?eventbrite.com', url):
            return 'Eventbrite'
        if re.match(r'^(http://)?(www.|\w+\.)?(ticketleap.com|tkt.ly)', url):
            return 'TicketLeap'

    @property
    def start_displaydate(self):
        if self.start_datetime:
            return self.start_datetime.strftime('%B %d at %I:%M %p')
        else:
            return ''

    @property
    def start_year(self):
        return self.start_datetime.year

    @property
    def start_month(self):
        return self.start_datetime.month

    @property
    def start_day(self):
        return self.start_datetime.day

    @property
    def start_hour(self):
        return self.start_datetime.hour

    @property
    def start_minute(self):
        return self.start_datetime.minute


class SiteFeedback (Base):
    """
    Site Feedback ORM class.
    """
    __tablename__ = 'site_feedback'

    site_feedback_id = Column(Integer, primary_key=True)
    submitter_name = Column(String(100))
    submitter_email = Column(String(255))
    text = Column(Text)
    is_responded = Column(SmallInteger, nullable=False, default=0)
    responded_user_id = Column(Integer)  # Should be foreign key
    is_active = Column(SmallInteger, nullable=False, default=1)
    created_datetime = Column(DateTime, nullable=False, default=datetime(1, 1, 1, 0, 0, 0))
    updated_datetime = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)


class Location (Base):
    __tablename__ = 'location'

    id = Column('location_id', Integer, primary_key=True)
    name =  Column(String(50), nullable=False)
    lat =  Column(Float)
    lon =  Column(Float)
    borough =  Column(String(50))
    address =  Column(String(100))
    city =  Column(String(50))
    state =  Column(String(2))


if __name__ == '__main__':
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

    from framework.orm_holder import OrmHolder

    oh = OrmHolder()
    config = oh.get_db_config()
    engine = oh.get_db_engine(config)
    Base.metadata.create_all(engine)
