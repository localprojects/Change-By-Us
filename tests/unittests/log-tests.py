"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.

Test module for testing the framework log module.
"""
import unittest
import sys
import os
import re
import logging
import logging.handlers

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../.."))
import framework.log as log

class LogTests (unittest.TestCase):
    """
    Basic log testing
    """
    
    def test_getitem_ip(self):
        # TODO: test the IP thing
        pass


if __name__ == "__main__":
    unittest.main()