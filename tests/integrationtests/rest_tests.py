from unittest2 import TestCase
from paste.fixture import TestApp
from nose.tools import *
from lib import web
from mock import Mock

import mixins
from   mixins import AppSetupMixin

from framework.config import Config
from framework.session_holder import SessionHolder
import main

from controllers.rest import Serializer
from controllers.rest import NeedInstance
from controllers.rest import NotFoundError

class Test_Needs_REST_endpoint (AppSetupMixin, TestCase):
    fixtures = ['test_data.sql']
    
    def test_AnonymousUserNotAllowedToCreateNeeds(self):
        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
        # more about testing with Paste.
        
        class FakeDict (dict):
            def __getattr__(self, key):
                if key in self:
                    return self[key]
                else:
                    raise AttributeError(key)
            
            def __setattr__(self, key, value):
                self[key] = value
                return value
        
        session = FakeDict()
        SessionHolder.get_session = Mock(return_value=session)
        
        response = self.app.post('/rest/v1/needs/', 
            params={
                'type': 'volunteer',
                'request': 'basketball players',
                'quantity': '5',
                'description': 'Play on my basketball team',
                'project_id': 0,
            },
            status=403)
    
#    def test_AdminUserAllowedToCreateNeeds(self):
#        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
#        # more about testing with Paste.
#        
#        class FakeDict (dict):
#            def __getattr__(self, key):
#                if key in self:
#                    return self[key]
#                else:
#                    raise AttributeError(key)
#            
#            def __setattr__(self, key, value):
#                self[key] = value
#                return value
#        
#        session = FakeDict(user_id=3)
#        SessionHolder.get_session = Mock(return_value=session)
#        
#        response = self.app.post('/rest/v1/needs/', 
#            params={
#                'type': 'volunteer',
#                'request': 'basketball players',
#                'quantity': '5',
#                'description': 'Play on my basketball team',
#                'address[name]': 'Code for America',
#                'address[street]': '85 2nd St.',
#                'address[city]': 'San Francisco, CA 94105',
#                'date': 'August 10, 2011',
#                'time': 'early afternoon',
#                'duration': 'a couple hours',
#                'project_id': 0,
#            },
#            status=200)
    
class Test_NeedsRestEndpoint_GET (AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']
    
    @istest
    def should_return_a_reasonable_representation_of_a_need(self):
        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
        # more about testing with Paste.
        
        response = self.app.get('/rest/v1/needs/1/', status=200)
        assert_in('"date": "2011-08-31"', response)


class Test_NeedInstance_REST_READ (AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']
    
    @istest
    def should_return_a_need(self):
        controller = NeedInstance()
        response = controller.REST_READ(1)
        
        assert_equal(response.__class__.__name__, 'Need')
    
    @istest
    def should_not_raise_NotFoundError(self):
        controller = NeedInstance()
        
        try:
            response = controller.REST_READ(1)
        except NotFoundError:
            ok_(False)
    

class Test_Serializer_serialize (AppSetupMixin, TestCase):
    
    @istest
    def dates_are_converted_to_iso_strings(self):
        import datetime
        
        serializer = Serializer()
        serialized = serializer.serialize(datetime.date(2011,8,2))
        
        assert_equal(serialized, '2011-08-02')
