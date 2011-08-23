from unittest2 import TestCase
from mock import Mock

import mixins

from datetime import datetime
from datetime import timedelta
from giveaminute.project import addMessage

class Test_StoredMessage_CreatedDateTime (mixins.AppSetupMixin, TestCase):
    def test_is_returned_from_the_db_in_local_time(self):
        before = datetime.now() - timedelta(seconds=1)
        addMessage(self.db, projectId=5, message='hello', message_type='my message type')
        after = datetime.now()
        
        messages = self.db.query('select created_datetime from project_message where project_id=5')
        created_datetime = messages[0]['created_datetime']
        
        self.assertIsNone(created_datetime.tzinfo)
        self.assert_(before <= created_datetime <= after, "%s <= %s <= %s" % (before, created_datetime, after))

