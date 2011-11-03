import unittest, sys, os, yaml
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../.."))
import framework.util as util
from framework.controller import Controller
import giveaminute.idea as mIdea

class IdeaTests (unittest.TestCase):    
    def setUp(self):
        self.db = Controller.get_db()
        self.nyc_loc_id = 501
        self.submission_type = "web"
        self.user_id = 1
        self.email = "foo@codeforamerica.org"
        self.phone = "2155551234"

#        self.idea_id = mIdea.createIdea(self.db, "my great idea!", self.nyc_loc_id, self.submission_type, self.user_id, self.email, self.phone)

    def test_get_db(self):
        self.assertTrue(hasattr(Controller, 'get_db'))

#    def test_idea_id(self):
#        self.assertIsNotNone(self.idea_id)

#    def test_findIdeasByPhone(self):
#        idea_list = mIdea.findIdeasByPhone(self.db, "2155551234")
#        self.assertEquals(len(idea_list), 1)

#    def tearDown(self):
#        mIdea.deleteIdea(self.db, self.idea_id)

if __name__ == "__main__":
    unittest.main()