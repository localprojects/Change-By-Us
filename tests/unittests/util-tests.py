import unittest, sys, os, re
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../.."))
import framework.util as util

class UtilTests (unittest.TestCase):
    def test_try_f(self):
        self.assertEqual(util.try_f(int, "10", -1), 10, "Did not convert string to int.")
        self.assertEqual(util.try_f(int, "foo", -1), -1, "Did not get given default value as expected.")
        self.assertEqual(util.try_f(int, "foo"), None, "Did not get None as expected.")
        self.assertEqual(util.try_f(str, 10, "ten"), "10", "Did not convert int to string.")

    def test_dictsort(self):
        #NOTE: dictsort needs to be fixed.
        pass
        dl = [{"id":"c"}, {"id":"a"}, {"id":"b"}]
        #sdl = util.dictsort(dl, "id")

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

    def test_filesizeformat(self):
        self.assertEqual(util.filesizeformat(0), "0 bytes")
        self.assertEqual(util.filesizeformat(1), "1 byte")
        self.assertEqual(util.filesizeformat(1024), "1.0 KB")
        self.assertEqual(util.filesizeformat(1048576), "1.0 MB")

    def test_strip_html(self):
        html = "I'm not <script src='steal_ssn.js' /> not injecting scripts."
        self.assertEqual(util.strip_html(html), "I'm not  not injecting scripts.")

    def test_singlespace(self):
        self.assertEqual(util.singlespace("  a very   spacey sentence    "), " a very spacey sentence ")

    def test_remove_linebreaks(self):
        s = """ a  spacey   
        sentence   on many lines  """
        self.assertEqual(util.singlespace(s), " a spacey sentence on many lines ")

    def test_depunctuate(self):
        s = "no, ...punctua.tion allowed?!"
        self.assertEqual(util.depunctuate(s), "no punctuation allowed")
        self.assertEqual(util.depunctuate(s, "!"), "no punctuation allowed!")
        self.assertEqual(util.depunctuate(s, "?", " "), "no     punctua tion allowed? ")

    def test_nl2br(self):
        s = "many \nlines"
        self.assertEqual(util.nl2br(s), "many <br />\nlines")

    def test_br2nl(self):
        self.assertEqual(util.br2nl("many <br />lines"), "many \nlines")
        self.assertEqual(util.br2nl("many <br/>lines"), "many \nlines")
        self.assertEqual(util.br2nl("many <br>lines"), "many \nlines")

    def test_prefix(self):
        self.assertEqual(util.prefix(".", "foo.bar"), "foo")
        self.assertEqual(util.prefix(".", "foobar"), "foobar")

    def test_suffix(self):
        self.assertEqual(util.suffix(".", "foo.bar"), "bar")
        self.assertEqual(util.suffix(".", "foobar"), "foobar")

    def test_urlencode(self):
        self.assertEqual(util.urlencode("/~test/"), "/%7Etest/")

    def test_add_leading_slash(self):
        self.assertEqual(util.add_leading_slash("foo"), "/foo")
        self.assertEqual(util.add_leading_slash("/foo"), "/foo")

    def test_titlecase(self):
        #NOTE: Expected output for titlecase is unclear and the
        #method appears not to be used.
        pass

    def test_location_cap(self):
        self.assertEqual(util.location_cap("forT collins, co, usa"), "Fort Collins, CO, USA")

    def test_pluralize(self):
        self.assertEqual(util.pluralize("1"), "")
        self.assertEqual(util.pluralize(2), "s")
        self.assertEqual(util.pluralize("2","y,ies"), "ies")
        self.assertEqual(util.pluralize(1,"y,ies"), "y")

    def test_slugify(self):
        self.assertEqual(util.slugify("SLUG me! "), "slug-me")

    def test_short_decimal(self):
        self.assertEqual(util.short_decimal(1.123), 1.12)
        self.assertEqual(util.short_decimal(1.129), 1.12)
        self.assertEqual(util.short_decimal(1), 1.00)
        self.assertEqual(util.short_decimal(10.0), 10.00)
        self.assertEqual(util.short_decimal(100), 100.00)

    def test_zeropad(self):
        self.assertEqual(util.zeropad(5), "05")
        self.assertEqual(util.zeropad(10), "10")
        self.assertEqual(util.zeropad(100), "100")

    def test_random_string(self):
        self.assertEqual(len(util.random_string(12)), 12)
        self.assertEqual(len(re.findall("^[A-Za-z0-9]{12}$", util.random_string(12))), 1)

    def test_obfuscate(self):
        self.assertEqual(util.obfuscate(100), "MTAwd3h5ekFCQ0RF")

    def test_deobfuscate(self):
        self.assertEqual(util.deobfuscate("MTAwd3h5ekFCQ0RF"), "100")

    def test_format_time(self):
        self.assertEqual(util.format_time(5), "05")
        self.assertEqual(util.format_time(30), "30")
        self.assertEqual(util.format_time(90), "01:30")
        self.assertEqual(util.format_time(3690), "01:01:30")
        self.assertEqual(util.format_time(90090), "1:01:01:30")

    def test_good_decimal(self):
        self.assertEqual(util.good_decimal(1.123), "1.12")
        self.assertEqual(util.good_decimal(1.129), "1.13")
        self.assertEqual(util.good_decimal(1), "1.00")
        self.assertEqual(util.good_decimal(10.0), "10.00")
        self.assertEqual(util.good_decimal(100), "100.00")

    def test_normalize(self):
        self.assertEqual(util.normalize(10, 5, 15), 0.5)

    def test_confirm_pid(self):
        #NOTE: Not sure how this function works or how to test
        pass

    #NOTE: Skipping web.py specific tests for now

    def test_check_bad_words(self):
        self.assertTrue(util.check_bad_words("get some soccer balls"))
        self.assertTrue(util.check_bad_words("balls get some soccer"))
        self.assertTrue(util.check_bad_words("get some balls soccer"))
        self.assertFalse(util.check_bad_words("get some soccer balls!")) #questionable
        self.assertFalse(util.check_bad_words("!balls get some soccer")) #questionable
        self.assertFalse(util.check_bad_words("get some soccerballs"))
        self.assertFalse(util.check_bad_words("hello world"))

    def test_strNullOrEmpty(self):
        self.assertFalse(util.strNullOrEmpty("hello world"))
        self.assertTrue(util.strNullOrEmpty(""))
        self.assertTrue(util.strNullOrEmpty(None))
        self.assertTrue(util.strNullOrEmpty("    "))

    def test_uniqify(self):
        a = util.uniqify(["a", "b", "c", "b"])
        n = util.uniqify([1, 2, 2, 3])
        a.sort()
        n.sort()

        self.assertEqual(a, ["a", "b", "c"])
        self.assertEqual(n, [1, 2, 3])

if __name__ == "__main__":
    unittest.main()