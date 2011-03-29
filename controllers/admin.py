from framework.controller import *
import framework.util as util
import giveaminute.user as mUser
import giveaminute.idea as mIdea

class Admin(Controller):
    def GET(self, action = None, param0 = None, param1 = None):
        pass                                      
            
    def POST(self, action = None, param0 = None, param1 = None):
        self.require_login("/login", True)
    
        if (action == 'adduser'):
            return self.addUser()
        elif (action == 'blacklist'):
            return self.updateBlacklist()
        else:
            return self.not_found()
            

    def addUser(self):
        firstName = self.request('f_name')
        lastName = self.request('l_name')
        email = self.request('email')
        password = self.request('password')    
        userGroupId = self.request('role')
        
        if (util.strNullOrEmpty(firstName)): 
            log.error("*** cms user submitted with no first name")
            return False
        elif (util.strNullOrEmpty(lastName)): 
            log.error("*** cms user submitted with no last name")
            return False
        elif (util.strNullOrEmpty(email)or not util.validate_email(email)): 
            log.error("*** cms user submitted with invalid email")
            return False
        elif (util.strNullOrEmpty(password)): 
            log.error("*** cms user submitted with no password")
            return False
        elif (util.strNullOrEmpty(userGroupId)):
            log.error("*** cms user submitted with no role")
            return False
        else:
            userId = mUser.createUser(self.db, email, password, firstName, lastName)
            
            # do we want to attach ideas to cms users?
            mIdea.attachIdeasByEmail(self.db, email)

            mUser.assignUserToGroup(self.db, userId, userGroupId)

            return userId
            
    def updateBlacklist(self):
        blacklist = self.request('blacklist')
        graylist = self.request('graylist')
        
        try:
            #replace delimiters, strip whitespace
            newBlacklist = ' '.join([item.strip() for item in blacklist.split(',')])
            newGraylist = ' '.join([item.strip() for item in graylist.split(',')])
        
            self.db.update('badwords', where = "id = 1", 
                                kill_words = newBlacklist,
                                warn_words = newGraylist)
            return True
        except Exception, e:
            log.info("*** couldn't update blacklist")
            log.error(e)
            return False
        
        