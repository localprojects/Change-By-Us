"""
Test config managment.

"""
from unittest2 import TestCase
from framework.config import Config


class ConfigTest (TestCase):
    """
    Container for config tests.
    
    """
    
    def test_load(self):
        """
        Test that a config has been loaded.
        """
        Config.load()
        self.assertIsNotNone(Config.data)
        self.assertIsInstance(Config.data, dict)
