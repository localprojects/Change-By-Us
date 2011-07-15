from unittest import TestCase
from lib import web
from mock import Mock

import main
import framework.file_server as file_server

class S3FileServerTests (TestCase):
    
    def test_S3Upload(self):
        fs = file_server.S3FileServer()
        fs.addDbRecord = Mock(return_value=3)
        
        db = main.sessionDB()
        id = fs.add(db, "This is file data", "myapp")
        
        self.assertEqual(fs.addDbRecord.call_count, 1)
        self.assertEqual(id, 3)

