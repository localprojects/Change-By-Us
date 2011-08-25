from nose.tools import *
from unittest2 import TestCase
from mock import Mock

import helpers.sms as sms

class Test_sms_reply (TestCase):
    
    @istest
    def does_not_raise_an_unboundlocalerror_exception(self):
        message = 'hello'
        user = Mock()
        user.id = 3
        sms.framework.controller.Controller.get_db = Mock()
        sms.web = Mock()
        
        try: sms.reply(user, message)
        except UnboundLocalError: ok_(False)
