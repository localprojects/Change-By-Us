import unittest, sys, os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../.."))
import framework.util as util

class UtilTests (unittest.TestCase):
    def test_try_f(self):
        self.assertEqual(util.try_f(int, "10", -1), 10, "Did not convert string to int.")
        self.assertEqual(util.try_f(int, "foo", -1), -1, "Did not get given default value as expected.")
        self.assertEqual(util.try_f(int, "foo"), None, "Did not get None as expected.")
        self.assertEqual(util.try_f(str, 10, "ten"), "10", "Did not convert int to string.")

    def test_dictsort(self):
        dl = [{"id":"c"}, {"id":"a"}, {"id":"b"}]
        #sdl = util.dictsort(dl, "id")
        #self.assertEqual(sdl[0].id, "a", "First dict in list did not have id 'a'")
    
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

    def test_safestr(self):
        class HasUnicode(object):
            def __unicode__(self):
                return u"unicode here"
        
        uni = u"unicode"
        base = "basestring"
        hasUni = HasUnicode()
        noUni = 5
        uniList = [u"z", u"y"]
        strList = ["a", "b", "c"]
        numList = [1, 2, 3]
        
        self.assertEqual(type(util.safestr(uni)), str)
        self.assertEqual(type(util.safestr(base)), str)
        self.assertEqual(type(util.safestr(hasUni)), str)
        self.assertEqual(type(util.safestr(noUni)), str)
        self.assertEqual(type(util.safestr(iter(strList)).next()), str)
        self.assertNotEqual(type(uniList[0]), str)
        self.assertEqual(type(util.safestr(iter(uniList)).next()), str)
        self.assertNotEqual(type(numList[0]), str)
        self.assertEqual(type(util.safestr(iter(numList)).next()), str)
        self.assertEqual(list(util.safestr(iter(numList))), ["1", "2", "3"])
        self.assertEqual(util.safestr(numList), "[1, 2, 3]")


    def test_validate_email(self):
        self.assertTrue(util.validate_email("i@u.nu"))
        self.assertTrue(util.validate_email("jake@lp.com"))
        self.assertTrue(util.validate_email("jake@lplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplplp.com"))
        self.assertFalse(util.validate_email("i@o.u"))
        self.assertFalse(util.validate_email("jake@lp."))
        self.assertFalse(util.validate_email("i@.in"))
        self.assertFalse(util.validate_email("@lp.com"))
        self.assertFalse(util.validate_email("@."))
        self.assertFalse(util.validate_email("."))
        self.assertFalse(util.validate_email("@"))

    def test_validateUSPhone(self):
        self.assertTrue(util.validateUSPhone("2134567890"))
        self.assertFalse(util.validateUSPhone("hello"))
        self.assertFalse(util.validateUSPhone("1234567890"))
        self.assertFalse(util.validateUSPhone("0213456789"))
        self.assertFalse(util.validateUSPhone("21345678900000000"))
        self.assertFalse(util.validateUSPhone("(213) 456-7890"))
        self.assertFalse(util.validateUSPhone("213-456-7890"))

    def test_cleanUSPhone(self):
        self.assertEqual(util.cleanUSPhone("2134567890"), "2134567890")
        self.assertEqual(util.cleanUSPhone("hel2134567890lo"), "2134567890")
        self.assertEqual(util.cleanUSPhone("(213) 456-7890"), "2134567890")
        self.assertEqual(util.cleanUSPhone("213-456-7890"), "2134567890")
        self.assertEqual(util.cleanUSPhone("123-456-7890"), None)

    def test_parse_tags(self):
        tag_str = '"foo, bar","abc",123'
        self.assertEqual(util.parse_tags(tag_str), ['"foo, bar"', '"abc"', '123'])

    def test_list_to_str(self):
        self.assertEqual(util.list_to_str(["a", "b", "c"]), "a b c")
        self.assertEqual(util.list_to_str([1, 2, 3]), "1 2 3")
        
    def test_wordcount(self):
        self.assertEqual(util.wordcount("one 2 3 four"), 4)
        
if __name__ == "__main__":
    unittest.main()