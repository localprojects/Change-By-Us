from unittest2 import TestCase
from nose.tools import *

from mock import Mock

from giveaminute.filters import display_name
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

