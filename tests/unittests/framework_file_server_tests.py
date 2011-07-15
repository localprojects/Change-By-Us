from unittest import TestCase
from lib import web
from mock import Mock

import main
import framework.file_server as file_server

class BaseFileServerTests (TestCase):

    def test_AddShouldReturnNoneIfDbInsertionFails(self):
        fs = file_server.FileServer()
        fs.addDbRecord = Mock(return_value=None)
        fs.saveFile = Mock()
        
        db = main.sessionDB()
#        db.insert = Mock(side
        id = fs.add(db, "This is file data", "myapp")
        
        self.assertEqual(fs.addDbRecord.call_count, 1)
        self.assertFalse(fs.saveFile.called)
        self.assertIsNone(id)
    
    def test_AddShouldCallInsertOnDatabase(self):
        """db.insert should be called with fs.add is called.
        
        Assumes that this should be true every time.  If this assumption becomes
        false, the test will have to be changed.
        """
        fs = file_server.FileServer()
        
        db = main.sessionDB()
        db.insert = Mock(return_value=None)
        
        fs.add(db, "This is file data", "myapp")
        
        self.assertEqual(db.insert.call_count, 1)
    
    def test_DefaultFileServerAddRaisesNotImplentedError(self):
        fs = file_server.FileServer()
        
        db = main.sessionDB()
        db.insert = Mock(return_value=1)
        
        self.assertRaises(NotImplementedError, fs.add, db, "This is file data", "myapp")
    
    def test_DbRecordShouldBeRemovedIfFileSaveIsUnsuccessful(self):
        fs = file_server.FileServer()
        fs.addDbRecord = Mock(return_value=7)
        fs.saveFile = Mock(return_value=False)
        
        db = main.sessionDB()
        db.query = Mock()
        
        fs.add(db, "This is file data", "myapp")
        
        self.assertEqual(db.query.call_count, 1)
        self.assertIn("DELETE FROM files", db.query.call_args[0][0])
    
class S3FileServerTests (TestCase):
    pass
#    def test_
