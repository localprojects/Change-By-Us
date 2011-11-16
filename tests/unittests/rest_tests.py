"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from unittest2 import TestCase
from nose.tools import *
from mock import Mock

#from framework.config import Config
#from framework.session_holder import SessionHolder
#import main

from controllers.rest import Serializer
from controllers.rest import NeedInstance
from giveaminute import models

class Test_Serializer_get_fields (TestCase):

    @istest
    def should_return_the_set_of_field_names_and_keys_to_use_for_a_dict(self):
        from datetime import date
        obj = {
            'f1': 'value',
            'f2': 12345,
            'f3': date(2011, 8, 2)
        }

        serializer = Serializer()
        fields = serializer.get_fields(obj)

        assert_equal(fields, set(['f1', 'f2', 'f3']))

#    @istest
#    def should_return_the_set_of_field_names_and_keys_to_use_for_a_model_instance(self):
