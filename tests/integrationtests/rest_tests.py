from unittest2 import TestCase
from paste.fixture import TestApp
from lib import web
from mock import Mock

import mixins
from   mixins import AppSetupMixin

from framework.config import Config
from framework.session_holder import SessionHolder
import main

class NeedsResourcesTests (AppSetupMixin, TestCase):
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
    

