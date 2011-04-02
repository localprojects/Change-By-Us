import re
import framework.util as util
from framework.controller import *
import giveaminute.user as user
import giveaminute.idea as idea
import lib.web

class Join(Controller):
    def GET(self, action=None):
        if (action == 'users'):
            return self.getUsers()
        elif (action == 'ideas'):
            return self.getIdeas()
        else:
            return self.showJoin()            
            
    def POST(self,*args, **kw):
        return self.newUser()
        
    def showJoin(self):
        referer = web.ctx.env.get('HTTP_REFERER')
        
        if (referer and "/login" not in referer):
            self.template_data['redir_from'] = referer
                
        return self.render('join',{'user':None})  
        
    def getUsers(self, action=None):
        try:
            email = self.request('email')

            if (user.findUserByEmail(self.db, email)):
                return self.json(dict(n_users = 1))
            else:
                return self.json(dict(n_users = 0))
        except Exception, e:
            log.error(e)
            return self.json(dict(n_users = 0))
        
    def getIdeas(self):
        try:
            phone = util.cleanUSPhone(self.request('sms_phone'))
            
            dataUser = user.findUserByPhone(self.db, phone)
            
            if (dataUser):
                return self.json(dict(sms_number_already_used = True))
            
            data = idea.findIdeasByPhone(self.db, phone)
            
            if (data):
                return self.json(dict(sms_number_already_used = False, n_ideas = len(data)))
            else:
                return self.json(dict(sms_number_already_used = False, n_ideas = 0))
        except Exception, e:
            log.error(e)
            return self.json(dict(sms_number_already_used = False, n_ideas = 0))
        
    def newUser(self):
        firstName = self.request('f_name')
        lastName = self.request('l_name')
        email = self.request('email')
        password = self.request('password')
        phone = util.cleanUSPhone(self.request('sms_phone'))
                
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
            userId = user.createUser(self.db, email, password, firstName, lastName, phone)
            
            idea.attachIdeasByEmail(self.db, email)
            
            if (phone and len(phone) > 0):
                idea.attachIdeasByPhone(self.db, phone)
        return userId;
    

    
