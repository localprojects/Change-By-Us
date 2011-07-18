from unittest import TestCase
from lib import web
from mock import Mock

import main
import framework.file_server as file_server

class S3FileServerTests (TestCase):
    
    def test_S3Upload(self):
        fs = file_server.S3FileServer()
        
        # This should test S3 uploading, not the DB.
        fs.addDbRecord = Mock(return_value=3)
        fs.removeDbRecord = Mock()
        
        db = main.sessionDB()
        id = fs.add(db, "This is file data", "myapp")
        
        self.assertEqual(fs.addDbRecord.call_count, 1)
        self.assertEqual(fs.removeDbRecord.call_count, 0)
        self.assertEqual(id, 3)

