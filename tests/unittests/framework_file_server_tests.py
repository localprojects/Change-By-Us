"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from unittest import TestCase
from lib import web
from mock import Mock

import main
import framework.file_server as file_server

class BaseFileServerTests (TestCase):

    def test_DefaultFileServerAddRaisesNotImplentedError(self):
        fs = file_server.FileServer()
        
        db = main.sessionDB()
        db.insert = Mock(return_value=1)
        
        self.assertRaises(NotImplementedError, fs.add, "This is file data", "myapp")
    
class S3FileServerTests (TestCase):
    """
    Tests that actually interact with the S3 server should go in 
    integrationtests/framework_file_server_tests.py
    
    """
    def test_S3UploaderIsCalledWithCorrectParameters(self):
        file_server.S3Uploader.upload = Mock()
        
        fs = file_server.S3FileServer(None)
        fs.getLocalPath = Mock(return_value="local/path/to/file7")
        fs.getS3Path = Mock(return_value="path/to/file7/on/s3")
        fs.saveTemporaryLocalFile = Mock(return_value=True)
        
        success = fs.saveFile(7, "This is file data")
        
        self.assertTrue(success, "File save was not successful")
        self.assertEqual(file_server.S3Uploader.upload.call_count, 1)
        self.assertEqual(file_server.S3Uploader.upload.call_args[0], 
            ("local/path/to/file7", "path/to/file7/on/s3"))
        
    def test_LocalPathDeterminedBasedOnId(self):
        fs = file_server.S3FileServer(None)
        
        path = fs.getLocalPath(7)
        self.assertEqual(path, "data/files/7")
    
    def test_S3PathDeterminedBasedOnId(self):
        fs = file_server.S3FileServer(None)
        
        path = fs.getS3Path(7)
        self.assertEqual(path, "data/files/7")

