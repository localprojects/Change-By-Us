from unittest import TestCase
from nose.tools import *

from lib import web
from mock import Mock

import main
import mixins
from   mixins import DbFixturesMixin
import framework.file_server as file_server

class Test_S3FileServer_add (DbFixturesMixin, TestCase):
    
    @istest
    def successfully_uploads_a_file_with_the_given_data(self):
        db = self.db
        fs = file_server.S3FileServer(db)
        
        id = fs.add(db, "This is file data", "myapp")
        
        assert id.endswith('This is file data')
    
    

