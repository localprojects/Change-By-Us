from unittest import TestCase
from lib import web
from mock import Mock

import main
import framework.file_server as file_server

class BaseFileServerTests (TestCase):

    def test_AddShouldReturnNoneIfDbInsertionFails(self):
        fs = file_server.FileServer()
        fs._addDbRecord = Mock(return_value=None)
        fs._saveFile = Mock()
        
        db = main.sessionDB()
#        db.insert = Mock(side
        id = fs.add(db, "This is file data", "myapp")
        
        self.assertEqual(fs._addDbRecord.call_count, 1)
        self.assertFalse(fs._saveFile.called)
        self.assertIsNone(id)
    
    def test_AddShouldCallInsertOnDatabase(self):
        fs = file_server.FileServer()
        
        db = main.sessionDB()
        db.insert = Mock(return_value=None)
        
        fs.add(db, "This is file data", "myapp")
        
        self.assertEqual(db.insert.call_count, 1)
        
