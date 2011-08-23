import os
import sys
import unittest

from mock import Mock

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../.."))
import helpers.censor as censor
from framework.controller import Controller

class CensorTests (unittest.TestCase):
    def setUp(self):
        self.db = Controller.get_db()

    def test_has_words(self):
        text = "the quick brown fox jumped over the lazy dog."
        self.assertTrue(censor.has_words(text, ["cat","fox"]))
        self.assertFalse(censor.has_words(text, ["cat","cow"]))
        self.assertFalse(censor.has_words("", ["cat","cow"]))
        self.assertFalse(censor.has_words(text, []))
        self.assertFalse(censor.has_words(text, None))

    def test_badwords(self):
        db = Mock()
        db.query = Mock(return_value=[{
            'kill_words' : 'asshole other dirty words',
            'warn_words' : 'jerk kinda bad stuff',
        }])
        
        self.assertEqual(censor.badwords(db, "asshole"), 2)
        self.assertEqual(censor.badwords(db, "jerk"), 1)
        self.assertEqual(censor.badwords(db, "unicorn"), 0)
    
if __name__ == "__main__":
    unittest.main()
