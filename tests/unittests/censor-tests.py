import unittest, sys, os
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
        self.assertEqual(censor.badwords(self.db, "asshole"), 2)
        self.assertEqual(censor.badwords(self.db, "jerk"), 1)
        self.assertEqual(censor.badwords(self.db, "unicorn"), 0)
    
if __name__ == "__main__":
    unittest.main()