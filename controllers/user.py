import framework.util as util
import giveaminute.user as mUser
import giveaminute.location as mLocation
from framework.controller import *
import json

class UserAccount(Controller):
    def GET(self, action=None):
        userId = util.try_f(int, action)
    
        if (userId and
            (not self.user or self.user.id != userId)):
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
        if (self.user and self.user.data):
            self.user.updateAccountPageVisit()
                    
            userActivity = self.user.getActivityDictionary()
            locations = mLocation.getSimpleLocationDictionary(self.db)
            resources = self.user.getUserResources()
            self.template_data['user_activity'] = dict(data = userActivity, json = json.dumps(userActivity))
            self.template_data['locations'] = dict(json = json.dumps(locations), data = locations)
            self.template_data['resources'] = dict(json = json.dumps(resources), data = resources)
            
            connected_fb = False
            connected_tw = False
            s = SessionHolder.get_session()
            if s.user_id:
                check_fb = "select * from facebook_user where user_id = $id"
                res_fb = list(self.db.query(check_fb, {'id':s.user_id }))
                if len(res_fb) == 1:
                    connected_fb = True
                    
                check_tw = "select * from twitter_user where user_id = $id"
                res_tw = list(self.db.query(check_tw, {'id':s.user_id }))
                if len(res_tw) == 1:
                    connected_tw = True

            return self.render('useraccount', {'connected_fb':connected_fb, 'connected_tw':connected_tw, 'test':True})
        else:
            log.error("*** attempt to access account page without user object")
            # quick fix to avoid error when logging in too quickly
            self.redirect("/")
            #return self.not_found()
            
    def showProfilePage(self, userId):
        user = mUser.User(self.db, userId)
        
        if (user.data):
            userActivity = user.getProfileActivityDictionary()
            locations_list = mLocation.getSimpleLocationDictionary(self.db)
            self.template_data['user_activity'] = dict(data = userActivity, json = json.dumps(userActivity))
            self.template_data['locations'] = dict(json = json.dumps(locations_list), data = locations_list)
            
            if (self.user and
                (self.user.isModerator or
                self.user.isAdmin)):
                self.template_data['user_profile_email'] = user.email
        
            return self.render('useraccount')
        else:
            # user doesn't exist/is inactive
            return self.not_found()
        
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
    
    def editUser(self):
        firstName = self.request('f_name')
        lastName = self.request('l_name')
        email = self.request('email')
        imageId = self.request('image_id')
        locationId = self.request('location_id')
        description = self.request('description')
        
        if (not util.strNullOrEmpty(firstName) and
            not util.strNullOrEmpty(lastName) and
            not util.strNullOrEmpty(email)):
            return self.user.updateInfo(email, firstName, lastName, imageId, locationId, description)
        else:
            log.info("*** not enough info to update user")
            return False
        
    def changePassword(self):
        password = self.request('new_password')
        
        return self.user.updatePassword(password)   
    