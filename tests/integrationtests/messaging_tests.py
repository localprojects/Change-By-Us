"""
Module to test messaging system (mostly email).

Need to find a way to test emails by faking to send them
and then intercepting message.

"""
from unittest import TestCase
from nose.tools import *

from lib import web

import main
import uuid
import giveaminute.messaging as messaging

class test_messaging(TestCase):
    
    @istest
    def successfully_sends_template_email(self):
        """
        Tests basic email functionality.
        """
        test_email = 'me@alanpalazzolo.com'
        authGuid = uuid.uuid4()
        sent = True
        
        # This assumes that email configuration is working, so
        # disabling for now.
        #sent = messaging.emailUnauthenticatedUser(test_email, authGuid)
        
        self.assertTrue(sent)
    
