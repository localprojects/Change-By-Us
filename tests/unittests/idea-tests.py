import unittest, sys, os, yaml
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../.."))
import framework.util as util
from framework.controller import Controller

class IdeaTests (unittest.TestCase):
    def test_get_db(self):
        self.assertIsNotNone(Controller.get_db())

if __name__ == "__main__":
    unittest.main()