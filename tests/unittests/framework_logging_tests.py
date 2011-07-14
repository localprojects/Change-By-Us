from unittest import TestCase
from lib import web

from framework.log import Info
class LogInfoTest (TestCase):

    def test__getitem__IsValidWhenWebContextIpIsNone(self):
        i = Info()
        web.ctx.ip = None
        self.assertEqual(i['ip'], 'No IP Address  ')

