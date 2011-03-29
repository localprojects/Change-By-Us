import framework.util as util
import giveaminute.user as mUser
from framework.controller import *

class UserAccount(Controller):
    def GET(self, action=None):
        userId = util.try_f(int, action)
    
        if (userId):
            return self.showProfilePage(userId)
        else:
            return self.showAccountPage()
        
    def POST(self, action=None):
        if (action == 'messages'):
            return self.getUserMessages()
        elif (action == 'messageprefs'):
            return self.setUserMessagePreferences()
        elif (action == 'edit'):
            return self.editUser()
        elif (action == 'password'):
            return self.changePassword()
        else:
            return self.not_found()
        
    def showAccountPage(self):
        if (self.user):
            userActivity = self.user.getActivityDictionary()
            
            self.template_data['user_activity'] = dict(data = userActivity, json = self.json(userActivity))
        
            return self.render('useraccount')
        else:
            return self.not_found()
            
    def showProfilePage(self, userId):
        user = mUser.User(self.db, userId)
        userActivity = user.getProfileActivityDictionary()
        
        log.info("*** activity = %s" % userActivity)

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
        imageId = self.request('image_id')
        
        log.info("*** attempt update: %s, %s, %s" % (firstName, lastName, email))
        
        if (not util.strNullOrEmpty(firstName) and
            not util.strNullOrEmpty(lastName) and
            not util.strNullOrEmpty(email)):
            return self.user.updateInfo(email, firstName, lastName, imageId)
        else:
            log.info("*** not enough info to update user")
            return False
        
    def changePassword(self):
        password = self.request('new_password')
        
        return self.user.updatePassword(password)   
    