import unittest, sys, os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import framework.util as util

class UtilTests (unittest.TestCase):
    def test_try_f(self):
        self.assertEqual(util.try_f(int, "10", -1), 10, "Did not convert string to int.")
        self.assertEqual(util.try_f(int, "foo", -1), -1, "Did not get given default value as expected.")
        self.assertEqual(util.try_f(int, "foo"), None, "Did not get None as expected.")
        self.assertEqual(util.try_f(str, 10, "ten"), "10", "Did not convert int to string.")

    def test_safeuni(self):
        class HasUnicode(object):
            def __unicode__(self):
                return u"unicode here"
        
        uni = u"unicode"
        base = "basestring"
        hasUni = HasUnicode()
        noUni = 5
        
        self.assertEqual(type(util.safeuni(uni)), unicode, "Did not return a unicode string from uni.")
        self.assertEqual(type(util.safeuni(base)), unicode, "Did not return a unicode string from base.")
        self.assertEqual(type(util.safeuni(hasUni)), unicode, "Did not return a unicode string from hasUni.")
        self.assertEqual(util.safeuni(hasUni), "unicode here", "Did not return the expected string from hasUni.")
        self.assertEqual(type(util.safeuni(noUni)), unicode, "Did not return a unicode string from noUni.")

if __name__ == "__main__":
    unittest.main()