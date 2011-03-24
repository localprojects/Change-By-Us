import giveaminute.user as mUser
from framework.controller import *

class UserAccount(Controller):
    def GET(self, action=None):
        return self.showPage()
        
    def showPage(self):
        userActivity = self.user.getActivityDictionary()
        
        self.template_data['user_activity'] = dict(data = userActivity, json = self.json(userActivity))
    
        return self.render('useraccount')