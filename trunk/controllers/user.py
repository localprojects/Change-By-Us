import framework.util as util
import giveaminute.user as mUser
from framework.controller import *

class UserAccount(Controller):
    def GET(self, action=None):
        return self.showPage()
        
    def POST(self, action=None):
        if (action == 'messages'):
            return self.getUserMessages()
        elif (action == 'messageprefs'):
            return self.setUserMessagePreferences()
        elif (action == 'edit'):
            return self.editUser()
        else:
            return self.not_found()
        
    def showPage(self):
        userActivity = self.user.getActivityDictionary()
        
        self.template_data['user_activity'] = dict(data = userActivity, json = self.json(userActivity))
    
        return self.render('useraccount')
        
    def getUserMessages(self):
        limit = self.request('n_messages')
        offset = self.request('offset')
        
        messages = []
        
        if (limit and offset):
            try:
                limit = int(limit)
                offset = int(offset)
                messages = self.user.getMessages(limit, offset)
            except Exception, e:
                log.info("*** couldn't get messages")
                log.error(e)
        
        return self.json(messages)
        
    def setUserMessagePreferences(self):
        pref = self.request('pref')
        
        if (pref):
            return self.user.setMessagePreferences(pref)
        else:
            return False
    
    # currently accepts password but we need a separate mechanism for that.        
    def editUser(self):
        firstName = self.request('f_name')
        lastName = self.request('l_name')
        email = self.request('email')
        password = self.request('password')
        imageId = self.request('image_id')
        
        log.info("*** attempt update: %s, %s, %s" % (firstName, lastName, email))
        
        if (not util.strNullOrEmpty(firstName) and
            not util.strNullOrEmpty(lastName) and
            not util.strNullOrEmpty(email)):
            return self.user.updateInfo(firstName, lastName, email, imageId)
        else:
            log.info("*** not enough info to update user")
            return False
        
        
        