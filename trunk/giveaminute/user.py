import hashlib
import framework.util as util
from framework.log import log
#from framework.controller import *

class User():
    def __init__(self, db, userId):
        self.db = db
        self.id = userId
        self.data = self.populateUserData()
        
        self.userKey = self.data.user_key
        self.email = self.data.email
        self.phone = self.data.phone
        self.firstName = self.data.first_name
        self.lastName = self.data.last_name
        self.imageId = self.data.image_id
        self.locationId = self.data.location_id
        self.isAdmin = bool(self.data.is_admin)
        self.isModerator = bool(self.data.is_moderator)
        self.isLeader = bool(self.data.is_leader)
    
    def getDictionary(self):
        data = dict(u_id = self.id,
                    f_name = self.firstName,
                    l_name = self.lastName,
                    email = self.email,
                    mobile = self.phone)
                    
        return data
        
    def populateUserData(self):
        sql = """
select u.user_key 
      ,u.email
      ,u.password
      ,u.salt
      ,u.phone
      ,u.first_name
      ,u.last_name
      ,u.image_id
      ,u.location_id
      ,if(ug1.user_group_id, 1, 0) as is_admin
      ,if(ug2.user_group_id, 1, 0) as is_moderator
      ,if(ug3.user_group_id, 1, 0) as is_leader
      ,pl.title
      ,pl.organization
from user u 
left join user__user_group ug1 on ug1.user_id = u.user_id and ug1.user_group_id = 1
left join user__user_group ug2 on ug2.user_id = u.user_id and ug2.user_group_id = 2
left join user__user_group ug3 on ug3.user_id = u.user_id and ug3.user_group_id = 3
left join project_leader pl on pl.user_id = u.user_id
where u.user_id = $id"""
        
        try:
            data = list(self.db.query(sql, {'id':self.id}))[0]
            
            if len(data) > 0:
                return data
            else:
                return None
        except Exception, e:
            log.info("*** couldn't get user into")
            log.error(e)
            return None
            
    def updateImage(self, locationId):
        try:
            sql = "update user set location_id = $location_id where user_id = $id"
            self.db.query(sql, {'id':self.userId, 'location_id':locationId})
            
            return True
        except Exception, e:
            log.info("*** problem updating user image")
            log.error(e)
            return False
            
    def updateInfo(self, email, first, last):
        try:
            sql = "update user set first_name = $first, last_name = $last, email = $email where user_id = $id"
            self.db.query(sql, {'id':self.userId, 'first':first, 'last':last, 'email':email})
            
            return True
        except Exception, e:
            log.info("*** problem updating user info")
            log.error(e)
            return False
        
def createUser(db, email, password, firstName = None, lastName = None, phone = None, imageId = None, locationId = None):
    key = util.random_string(10)

    encrypted_password, salt = makePassword(password)
    
    try:
        userId = db.insert('user', user_key=key,
                                    email=email, 
                                    password=encrypted_password, 
                                    salt=salt, 
                                    phone=phone, 
                                    first_name=firstName, 
                                    last_name=lastName, 
                                    image_id=imageId, 
                                    location_id=locationId,
                                    created_datetime=None)
                                    
    except Exception, e:
        log.info("*** problem creating user")
        log.error(e)    
        return None
        
    return userId
    
def deleteUser(db, userId):
    try:
        db.delete('user', where = "user_id = $userId", vars=locals())
    except Exception, e:
        log.info("*** problem deleting user")
        log.error(e)    
        return False
        
    return True
    
def authenticateUser(db, email, password):
    sql = "select user_id, email, password, salt from user where email = $email"
    data = db.query(sql, {'email':email})
    
    if (len(data) > 0):
        user = list(data)[0]
        hashed_password = makePassword(password, user.salt)
        
        log.info("*** hashed_password = %s" % hashed_password)
        log.info("*** user.password = %s" % user.password)
    
        if (hashed_password[0] == user.password):
            log.info("*** User authenticated")
            return user.user_id
        else:
            log.warning("*** User not authenticated for email = %s" % email)
            return None
    else:
        log.warning("*** No record for email= %s" % email)
        return None
        
        
def makePassword(password, salt = None):
    if (not salt):
        salt = util.random_string(10)
        
    hashed_password = hashlib.md5(password + salt).hexdigest()
    return [hashed_password, salt]   
    
def findUserByEmail(db, email):
    sql = "select user_id from user where email = $email and is_active = 1 limit 1"
    data = list(db.query(sql, vars = locals()))
    
    if len(data) > 0:
        return data[0].user_id
    else:
        return None
    
def findUserByPhone(db, phone):
    sql = "select user_id from user where phone = $phone and is_active = 1 limit 1"
    data = list(db.query(sql, vars = locals()))
    
    if len(data) > 0:
        return data[0].user_id
    else:
        return None  
    
#temp get dummy data
def getDummyDictionary():
    data = dict(u_id = 37,
                f_name = "Andrew",
                l_name = "Mahon",
                email = "andrew@typeslashcode.com",
                mobile = "9173241470")
                
    return data    