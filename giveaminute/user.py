import hashlib
import framework.util as util
from framework.log import log
#from framework.controller import *

class User():
    def __init__(self, db, userId):
        self.db = db
        self.id = userId
        self.data = self.populateUserData()
        
        log.info("*** self.data = %s" % str(self.data))
        
        self.userKey = self.data.user_key
        self.email = self.data.email
        self.phone = self.data.phone
        self.firstName = self.data.first_name
        self.lastName = self.data.last_name
        self.imageId = self.data.image_id
        self.locationId = self.data.location_id
        
    def populateUserData(self):
        sql = """select user_key 
                      ,email
                      ,password
                      ,salt
                      ,phone
                      ,first_name
                      ,last_name
                      ,image_id
                      ,location_id
                from user where user_id = $id"""
        
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
        
def makePassword(password):
    salt = util.random_string(10)
    encrypted_password = hashlib.md5(password + salt).hexdigest()
    return [encrypted_password, salt]   
    
def findUserByEmail(db, email):
    sql = "select user_id from user where email = $email and is_active = 1"
    data = list(db.query(sql, vars = locals()))
    
    if len(data) > 0:
        return data[0].user_id
    else:
        return None
    
    
    
    