import json
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

class Test_anonymous_user_admin (AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    @istest
    def should_not_allow_anonymous_user_to_create_user(self):
        # Check out http://webpy.org/cookbook/testing_with_paste_and_nose for
        # more about testing with Paste.
        response = self.app.post('/admin/user/add',
            params={
                'f_name': 'John',
                'l_name': 'Smith',
                'email': 'jsmith@example.com',
                'password': 'password',
                'role': '1',
                'affiliation': '',
            },
            status=303)
        db = main.sessionDB()
        
        # Check to see if the user was created even though the response
        # returned a redirect (303).
        results = db.query("select user_id from user where email = 'jsmith@example.com'")
        assert_equal(len(results), 0)

    @istest
    def should_not_allow_anonymous_user_access_to_admin(self):
        response = self.app.get('/cms/admin', status=303)
        response = self.app.get('/admin/admin', status=303)

        # Loose check to make sure we do not have a full
        # HTML page.
        assert len(response.body) < 50
        
        
class Test_admin_user_admin (AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    @istest
    def should_allow_admin_user_to_create_user(self):
        self.login(user_id=3)
        
        response = self.app.post('/admin/user/add',
            params={
                'f_name': 'Jane',
                'l_name': 'Doe',
                'email': 'jdoe@example.com',
                'password': 'password',
                'role': '1',
                'affiliation': '',
            },
            status=200)
        
        # Check to see if the user was created
        db = main.sessionDB()
        results = db.query("select user_id from user where email = 'jdoe@example.com'")
        assert_equal(len(results), 1)