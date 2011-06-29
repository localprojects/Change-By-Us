import unittest, sys, os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import framework.util as util

class UtilTests (unittest.TestCase):
    def test_try_f(self):
        self.assertEqual(util.try_f(int, "10", -1), 10, "Did not convert string to int.")
        self.assertEqual(util.try_f(int, "foo", -1), -1, "Did not get given default value as expected.")
        self.assertEqual(util.try_f(int, "foo"), None, "Did not get None as expected.")
        self.assertEqual(util.try_f(str, 10, "ten"), "10", "Did not convert int to string.")
        
if __name__ == "__main__":
    unittest.main()