from unittest2 import TestCase
from nose.tools import *

from mock import Mock

from giveaminute.filters import display_name
from helpers.custom_filters import json_filter

class Test_display_name_filter (TestCase):

    @istest
    def returns_full_first_and_last_name_when_user_has_nonzero_group_bitmask(self):
        user = Mock()
        user.first_name = 'Mjumbe'
        user.last_name = 'Poe'
        user.affiliation = None
        user.group_membership_bitmask = 7

        dname = display_name(user)

        assert_equal(dname, 'Mjumbe Poe')

    @istest
    def returns_full_first_and_last_name_when_user_has_zero_group_bitmask(self):
        user = Mock()
        user.first_name = 'Mjumbe'
        user.last_name = 'Poe'
        user.affiliation = None
        user.group_membership_bitmask = 0

        dname = display_name(user)

        assert_equal(dname, 'Mjumbe P.')


class Test_json_filter (TestCase):

    @istest
    def returns_json_for_a_dict(self):
        data = {
            "a": "foo",
            "b": 20
        }

        json_str = json_filter(data)
        assert_is_instance(json_str, basestring)
        assert_equals('{"a": "foo", "b": 20}', json_str)

    @istest
    def returns_json_for_a_list(self):
        data = ["a", "b", 3]

        json_str = json_filter(data)
        assert_is_instance(json_str, basestring)
        assert_equals('["a", "b", 3]', json_str)

    @istest
    def returns_json_for_a_none(self):
        data = None

        json_str = json_filter(data)
        assert_is_instance(json_str, basestring)
        assert_equals('null', json_str)
