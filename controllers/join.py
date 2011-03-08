import re
import framework.util as util
from framework.controller import *
from giveaminute.user import *
from giveaminute.idea import *

class Join(Controller):
    def GET(self, action=None):
        if (action == 'users'):
            return self.getUsers()
        elif (action == 'ideas'):
            return self.getIdeas()
        else:
            return self.render('join')
            
            
    def POST(self,*args, **kw):
        log.info("*** args =  %s" % args)
        log.info("*** kw = %s" % kw)
        
        return self.newUser()
        
    def getUsers(self, action=None):
        try:
            email = self.request('email')
            
            sql = "select count(user_id) as count from user where email = $email"
            data = list(self.db.query(sql, vars = locals()))[0]
            
            return self.json(dict(n_users = data.count))
        except Exception, e:
            log.error(e)
            return self.json(dict(n_users = 0))
        
    def getIdeas(self):
        try:
            phone = self.cleanPhone(self.request('sms_phone'))
            
            sql = "select count(idea_id) as count from idea where phone = $phone"
            data = list(self.db.query(sql, vars = locals()))[0]
            
            return self.json(dict(n_ideas = data.count))
        except Exception, e:
            log.error(e)
            return self.json(dict(n_users = 0))
        
    def newUser(self):
        firstName = self.request('f_name')
        lastName = self.request('l_name')
        email = self.request('email')
        password = self.request('password')
        phone = self.request('sms_phone')
                
        if (len(firstName) == 0): 
            #return self.error("no first name")
            log.error("no first name")
            return False
        elif (len(lastName) == 0): 
            #return self.error("no last name")
            log.error("no last name")
            return False
        elif (len(email) == 0 or not util.validate_email(email)): 
            #return self.error("invalid email")
            log.error("invalid email")
            return False
        elif (len(password) == 0): 
            #return self.error("no password")
            log.error("no password")
            return False
        else:
            userId = createUser(self.db, email, password, firstName, lastName, phone)
            
            attachIdeasByEmail(self.db, email)
            
            if (phone and len(phone) > 0):
                attachIdeasByPhone(self.db, phone)
        return True;
    
    #strip leading 1 and any non-numerics
    def cleanPhone(self, phone):
        phone = phone.strip()
        
        phone = re.sub("\D", "", phone)
        phone = re.sub("^1", "", phone)
        
        return phone
    
