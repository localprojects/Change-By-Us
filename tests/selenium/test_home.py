"""
Module to hold basic home Selenium tests.
"""
from selenium import selenium
import unittest, time, re

class test_home(unittest.TestCase):
    """
    Tests that the home page can be reached and home link can be used.
    """
    
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4443, "*chrome", "http://localhost:8080/")
        self.selenium.start()
    
    def test_test_home(self):
        """
        Actual test that checks the home page can be reached and home link can be used.
        """
        
        sel = self.selenium
        sel.open("/")
        sel.click("link=Change by Us NYC")
        sel.wait_for_page_to_load("30000")
    
    def tearDown(self):
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
