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
            
    def POST(self,action=None):
        if (action == 'code'):
            return self.verifyBetaCode(self.request('beta_code'))
        else:   
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
        code = self.request('beta_code')        
                
        if (self.appMode == 'beta' and not self.verifyBetaCode(code)):
            log.error("*** beta user attempted register w/ invalid code")
            return False        
        elif (len(firstName) == 0): 
            log.error("*** error on user create: no first name")
            return False
        elif (len(lastName) == 0): 
            log.error("*** error on user create: no last name")
            return False
        elif (len(email) == 0 or not util.validate_email(email)): 
            log.error("*** error on user create: invalid email")
            return False
        elif (len(password) == 0): 
            log.error("*** error on user create: no password")
            return False
        else:
            userId = user.createUser(self.db, email, password, firstName, lastName, phone)
            
            if (userId > 0 and self.appMode == 'beta'):
                self.expireBetaCode(self, code, userId)
            
            idea.attachIdeasByEmail(self.db, email)
            
            if (phone and len(phone) > 0):
                idea.attachIdeasByPhone(self.db, phone)
        return userId;
    
    def verifyBetaCode(self, code):
        try:
            sql = "select code from beta_invite_code where code = $code and user_id is null limit 1"
            data = list(self.db.query(sql, {'code':code}))
            
            return (len(data) == 1)
        except Exception, e:
            log.info("*** problem verifying beta code")
            log.error(e)
            return False
        
    def expireBetaCode(self, code, userId):
        try:
            self.db.update(beta_invite_code, where = "code = $code", user_id = userId, vars = {'code':code})
            return True
        except Exception, e:
            log.info("*** couldn't expire beta code")
            log.error(e)
            return False
            
            