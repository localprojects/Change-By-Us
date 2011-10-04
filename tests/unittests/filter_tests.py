from unittest2 import TestCase
from nose.tools import *

from mock import Mock

from helpers.custom_filters import json_filter

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
