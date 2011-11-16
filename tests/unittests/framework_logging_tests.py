"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from unittest import TestCase
from lib import web

from framework.log import Info
class LogInfoTest (TestCase):

    def test__getitem__IsValidWhenWebContextIpIsNone(self):
        i = Info()
        web.ctx.ip = None
        self.assertEqual(i['ip'], 'No IP Address  ')

