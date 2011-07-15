from unittest import TestCase
from lib import web

import main
import framework.file_server as file_server

class BaseFileServerTests (TestCase):

    def test_AddShoulfReturnNoneIfDbInsertionFails(self):
        fs = file_server.FileServer()
        
        db = main.sessionDB()
        db.insert = lambda *_: None
        id = fs.add(db, "This is file data", "myapp")
        
        self.assertIsNone(id)
