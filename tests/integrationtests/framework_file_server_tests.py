from unittest import TestCase
from lib import web
from mock import Mock

import main
import framework.file_server as file_server

class S3FileServerTests (TestCase):
    
    def test_S3Upload(self):
        class MyDB:
            pass
        db = MyDB()
        
        fs = file_server.S3FileServer(db)
        
        # This should test S3 uploading, not the DB.
        fs.addDbRecord = Mock(return_value=3)
        fs.removeDbRecord = Mock()
        
        db = main.sessionDB()
        id = fs.add(db, "This is file data", "myapp")
        
        self.assertEqual(id, 'This is file data')
    
    

