from unittest2 import TestCase
from nose.tools import *
from mock import Mock
from itertools import *

import mixins

from datetime import datetime
from datetime import timedelta
from framework.orm_holder import OrmHolder
from giveaminute.project import addMessage
from giveaminute.models import *

class Test_StoredMessage_CreatedDateTime (mixins.AppSetupMixin, TestCase):
    def test_is_returned_from_the_db_in_local_time(self):
        before = datetime.now() - timedelta(seconds=1)
        addMessage(self.db, projectId=5, message='hello', message_type='my message type')
        after = datetime.now()

        messages = self.db.query('select created_datetime from project_message where project_id=5')
        created_datetime = messages[0]['created_datetime']

        self.assertIsNone(created_datetime.tzinfo)
        self.assert_(before <= created_datetime <= after, "%s <= %s <= %s" % (before, created_datetime, after))


class Test_Volunteer (mixins.AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    def test_makes_associated_need_accessible_when_it_is_created(self):
        orm = OrmHolder().orm
        vol = Volunteer()
        vol.need_id=2 #orm.query(Need).get(2)
        vol.member_id=1
        orm.add(vol)
        orm.commit()

        assert_equal(vol.need_id, 2)
        assert vol.need is not None


class Test_User_avatarPath (mixins.AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    def test_returns_the_supposed_path_to_the_users_avatar_image_on_the_media_root(self):
        orm = OrmHolder().orm
        user = orm.query(User).get(3)

        path = user.avatar_path

        assert_equal(path, 'images/1/1.png')

    def test_returns_None_if_user_has_no_avatar_set(self):
        orm = OrmHolder().orm
        user = orm.query(User).get(2)

        path = user.avatar_path

        assert_is_none(path)


class Test_User_join_and_leave (mixins.AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    def test_join_creates_a_member_in_the_project_and_returns_true(self):
        orm = OrmHolder().orm
        user = orm.query(User).get(3)
        project = orm.query(Project).get(1)

        assert user not in project.members

        joined = user.join(project)
        orm.commit()

        assert user in project.members
        assert joined

    def test_join_returns_false_when_user_is_already_a_member(self):
        orm = OrmHolder().orm
        user = orm.query(User).get(2)
        project = orm.query(Project).get(1)

        assert user in project.members

        joined = user.join(project)
        orm.commit()

        assert not joined

    def test_leave_removes_a_member_from_the_project_and_returns_true(self):
        orm = OrmHolder().orm
        user = orm.query(User).get(2)
        project = orm.query(Project).get(1)

        assert user in project.members

        left = user.leave(project)
        orm.commit()

        assert user not in project.members
        assert left


class Test_User_unvolunteerFromAllFor (mixins.AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    def test_removes_user_from_all_needs_on_a_project(self):
        orm = OrmHolder().orm
        user = orm.query(User).get(2)
        project = orm.query(Project).get(1)

        # Note: the following chain method is simply flattening the lists of
        #       volunteers
        assert user in set(chain(*[need.volunteers for need in project.needs]))

        joined = user.unvolunteer_from_all_for(project)
        orm.commit()

        assert user not in set(chain(*[need.volunteers for need in project.needs]))


class Test_Project_admins (mixins.AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    def test_contains_the_project_admin_users(self):
        orm = OrmHolder().orm
        project = orm.query(Project).get(1)
        user = orm.query(User).get(1)

        admins = project.admins

        assert_in(user, admins)

    def test_does_not_contain_non_admin_users(self):
        orm = OrmHolder().orm
        project = orm.query(Project).get(1)
        user = orm.query(User).get(3)

        admins = project.admins

        assert_not_in(user, admins)


class Test_GamProject_removeUserFromProject (mixins.AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    def test_will_remove_user_from_volunteering_on_needs_as_well(self):
        import giveaminute.project

        orm = OrmHolder().orm
        user = orm.query(User).get(2)
        need = orm.query(Need).get(1)

        assert user in need.volunteers

        giveaminute.project.removeUserFromProject(self.db, 1, 2)
        orm.commit()

        assert_not_in(user, need.volunteers)


class Test_Need_delete (mixins.AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    @istest
    def should_be_able_to_delete_need_with_volunteers (self):
        orm = OrmHolder().orm
        need = orm.query(Need).get(1)
        assert len(need.volunteers) > 0

        try:
            orm.delete(need)

        except AssertionError, e:
            # If the orm has a problem deleting the need, it will raise an
            # AssertionError
            ok_(False, 'AssertionError raised: %r' % (e,))

        ok_(True)
