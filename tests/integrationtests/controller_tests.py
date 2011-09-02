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

from framework.controller import Controller

class Test_Controller_setUserObject (AppSetupMixin, TestCase):
    fixtures = ['aarons_db_20110826.sql']

    @istest
    def should_not_choke_when_the_user_id_is_None(self):
        self.login(None)
        response = self.app.get('/', status=200)
        assert_not_in('internal server error', response.body)

