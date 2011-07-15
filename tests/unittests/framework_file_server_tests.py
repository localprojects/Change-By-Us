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
    
    def test_S3UploaderIsCalledWithCorrectParameters(self):
        file_server.S3Uploader.upload = Mock()
        
        fs = file_server.S3FileServer()
        fs.getLocalPath = Mock(return_value="local/path/to/file7")
        fs.getS3Path = Mock(return_value="path/to/file7/on/s3")
        
        success = fs.saveFile(7, "This is file data")
        
        self.assertTrue(success)
        self.assertEqual(file_server.S3Uploader.upload.call_count, 1)
        self.assertEqual(file_server.S3Uploader.upload.call_args[0], 
            ("local/path/to/file7", "path/to/file7/on/s3"))
        
    def test_LocalPathDeterminedBasedOnId(self):
        fs = file_server.S3FileServer()
        
        path = fs.getLocalPath(7)
        self.assertEqual(path, "data/files/7")
    
    def test_S3PathDeterminedBasedOnId(self):
        fs = file_server.S3FileServer()
        
        path = fs.getS3Path(7)
        self.assertEqual(path, "data/files/7")
