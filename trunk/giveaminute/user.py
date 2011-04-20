import hashlib
import giveaminute.project as mProject
import giveaminute.idea as mIdea
import framework.util as util
from framework.log import log

class User():
    def __init__(self, db, userId):
        self.db = db
        self.id = userId
        self.data = self.populateUserData()
        self.projectData = self.getUserProjectList()
        
        self.userKey = self.data.user_key
        self.email = self.data.email
        self.phone = self.data.phone
        self.firstName = self.data.first_name
        self.lastName = self.data.last_name
        self.imageId = self.data.image_id
        self.locationId = self.data.location_id
        self.emailNotification = self.data.email_notification
        self.isAdmin = bool(self.data.is_admin)
        self.isModerator = bool(self.data.is_moderator)
        self.isLeader = bool(self.data.is_leader)
        self.numNewMessages = self.getNumNewMessages()
    
    def isProjectAdmin(self, projectId):
        sql = "select is_project_admin from project__user where user_id = $userId and project_id = $projectId and is_project_admin = 1 limit 1"
        
        try:
            data = self.db.query(sql, {'userId':self.id, 'projectId':projectId})
            
            return (len(data) > 0)
        except Exception, e:
            log.info("*** couldn't get user project admin status")
            log.err(e)
            return False
    
    def getDictionary(self):
        projects = []
        
        for item in self.projectData:
            projects.append(dict(project_id = item.project_id,
                            title = item.title,
                            is_project_admin = item.is_project_admin))
    
        data = dict(u_id = self.id,
                    f_name = self.firstName,
                    l_name = self.lastName,
                    email = self.email,
                    mobile = self.phone,
                    email_notification = self.emailNotification,
                    num_new_messages = self.numNewMessages,
                    projects = projects)
                                        
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
      ,u.email_notification
      ,coalesce(u.last_account_page_access_datetime, u.created_datetime) as last_account_page_access_datetime
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
            self.db.query(sql, {'id':self.id, 'location_id':locationId})
            
            return True
        except Exception, e:
            log.info("*** problem updating user image")
            log.error(e)
            return False
            
    def updateInfo(self, email, first, last, imageId):
        # check if email already in user
        if not (findUserByEmail(self.db, self.email)):
            log.info("*** cannot find user email["+email+"]")
            return False
    
        try:
            if (not imageId):
                imageId = None
        
            sql = "update user set first_name = $first, last_name = $last, email = $email, image_id = $imageId where user_id = $userId"
            self.db.query(sql, {'userId':self.id, 'first':first, 'last':last, 'email':email, 'imageId':imageId})
            
            return True
        except Exception, e:
            log.info("*** problem updating user info")
            log.error(e)
            return False
            
    def updatePassword(self, password):
        try:
            hashedPassword, salt = makePassword(password)
            
            sql = "update user set password = $pw, salt = $salt where user_id = $id"
            self.db.query(sql, {'id':self.id, 'pw':hashedPassword, 'salt':salt})
            
            return True
        except Exception, e:
            log.info("*** problem updating user's password")
            log.error(e)
            return False 
            
    def setMessagePreferences(self, pref):
        try:
            sql = "update user set email_notification = $pref where user_id = $id"
            self.db.query(sql, {'id':self.id, 'pref':pref})
            
            return True
        except Exception, e:
            log.info("*** problem updating user message preferences")
            log.error(e)
            return False    
            
    def updateAccountPageVisit(self):
        try:
            sql = "update user set last_account_page_access_datetime = now() where user_id = $userId"
            self.db.query(sql, {'userId':self.id})
            
            return True
        except Exception, e:
            log.info("*** problem updating last_account_page_access_datetime for user id %s" % self.id)
            log.error(e)
            return False    
            
    # get abbreviated data for projects for which user is a member
    def getUserProjectList(self):
        data = []
        
        try:
            sql = """select p.project_id, p.title, pu.is_project_admin 
                    from project p
                    inner join project__user pu on pu.project_id = p.project_id and pu.user_id = $id"""
            data  = list(self.db.query(sql, { 'id': self.id }))
        except Exception,e:
            log.info("*** couldn't get user data")
            log.error(e)
            
        return data    
        
    def getActivityDictionary(self):
        data = dict(projects = self.getProjects(),
                    ideas = self.getIdeas(),
                    messages = self.getMessages(10, 0),
                    user = mProject.smallUser(self.id, self.firstName, self.lastName, self.imageId))
                    
        return data
        
    # data for other users accessing a user's profile/account page
    def getProfileActivityDictionary(self):
        data = dict(projects = self.getProjects(),
                    ideas = self.getIdeas(),
                    user = mProject.smallUser(self.id, self.firstName, self.lastName, self.imageId))
                    
        return data
        
    def getProjects(self):
        return mProject.getProjectsByUser(self.db, self.id)
    
    def getIdeas(self):
        ideas = []
        
        try: 
            data = mIdea.findIdeasByUser(self.db, self.id)
        
            if len(data) > 0:
                for item in data:
                    ideas.append(mProject.idea(item.idea_id, item.description, item.user_id, item.first_name, item.last_name, item.created_datetime, item.submission_type))
        except Exception, e:
            log.info("*** couldn't get user ideas")
            log.error(e) 
            
        return ideas
        
    def getMessages(self, limit, offset):
        messages = []
    
        try:
            sql = """select 
                        p.project_id,
                        p.title,
                        m.project_message_id,
                        m.message_type,
                        m.message,
                        m.created_datetime as created_datetime,
                        mu.user_id,
                        mu.first_name,
                        mu.last_name,
                        i.idea_id,
                        i.description as idea_description,
                        i.submission_type as idea_submission_type,
                        i.created_datetime as idea_created_datetime
                    from project_message m
                    inner join project__user pu on pu.project_id = m.project_id and pu.user_id = $userId
                    inner join project p on p.project_id = pu.project_id
                    inner join user mu on mu.user_id = m.user_id
                    left join idea i on i.idea_id = m.idea_id
                    where m.is_active = 1
                        union
                    select 
                        p.project_id,
                        p.title,
                        null as project_message_id,
                        'invite' as message_type,
                        concat('You''ve been invited to the ', ucase(p.title), ' group!<br/><br/>"', inv.message, '"') as message,
                        inv.created_datetime as created_datetime,
                        iu.user_id,
                        iu.first_name,
                        iu.last_name,
                        i.idea_id,
                        i.description as idea_description,
                        i.submission_type as idea_submission_type,
                        i.created_datetime as idea_created_datetime
                    from project_invite inv
                    inner join project p on p.project_id = inv.project_id
                    inner join user iu on iu.user_id = inv.inviter_user_id
                    inner join idea i on i.idea_id = inv.invitee_idea_id and i.user_id =$userId
                    order by created_datetime desc
                    limit $limit offset $offset"""
            data = list(self.db.query(sql, {'userId':self.id, 'limit':limit, 'offset':offset}))  
               
            for item in data:
                messages.append(mProject.userMessage(item.project_message_id, 
                                        item.message_type, 
                                        item.message, 
                                        item.created_datetime, 
                                        item.user_id, 
                                        item.first_name, 
                                        item.last_name, 
                                        item.idea_id, 
                                        item.idea_description, 
                                        item.idea_submission_type, 
                                        item.idea_created_datetime,
                                        item.project_id,
                                        item.title))
        except Exception, e:
            log.info("*** couldn't get messages")
            log.error(e)
            
        return messages  
        
    def getNumNewMessages(self):
        num = 0
        
        try:
            sql = """select 
                        (select count(inv.project_invite_id) from project_invite inv
                          inner join idea i on i.idea_id = inv.invitee_idea_id and i.user_id = $userId
                          where inv.created_datetime > $last) +
                        (select count(pm.project_message_id) from project_message pm
                          inner join project__user pu on pu.project_id = pm.project_id  and pu.user_id = $userId
                          where pm.is_active = 1 and pm.created_datetime > $last) as total"""
            data = list(self.db.query(sql, {'userId':self.id, 'last':self.data.last_account_page_access_datetime}))
             
            num = data[0].total             
        except Exception, e:
            log.info("*** couldn't get number of new msgs for user id %s" % self.id)
            log.error(e)
            
        return num
                    
        
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
        
def setUserGroup(db, userId, userGroupId):
    t = db.transaction()
    
    try:
        db.delete('user__user_group', where = "user_id = $userId", vars = {'userId':userId})
        db.insert('user__user_group', user_id = userId, user_group_id = userGroupId)
    except Exception, e:
        log.info("*** problem setting user id %s to group %s" % (userId, userGroupId))
        log.error(e)
        t.rollback()
        return False
    else:
        t.commit()
        return True
        
def setUserOncallStatus(db, userId, status):
    try:
        db.update('user', where = "user_id = $userId", is_oncall = status, vars = {'userId':userId})
        return True
    except Exception, e:
        log.info("*** problem setting oncall status to %s for user id %s" % (status, userId))
        log.error(e)
        return False
    
def authenticateUser(db, email, password):
    sql = "select user_id, email, password, salt from user where email = $email"
    data = db.query(sql, {'email':email})
    
    if (len(data) > 0):
        user = list(data)[0]
        hashed_password = makePassword(password, user.salt)
    
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
    
def assignUserToGroup(db, userId, userGroupId, title = None, organization = None):
    try:
        db.insert('user__user_group', user_id = userId, 
                                      user_group_id = userGroupId)
                    
        if (userGroupId == 3):
            db.insert('project_leader', user_id = userId,
                                        title = title,
                                        organization = organization)
                                      
        return True
    except Exception, e:
        log.info("*** couldn't assign user id %s to group id %s" % (userId, userGroupId))
        log.error(e)
        return False
    
def getAdminUsers(db, limit = 10, offset = 0):
    data = []

    try:
        sql = """select distinct 
                    u.user_id, u.email, u.first_name, u.last_name
                    ,if(ug1.user_group_id, 1, 0) as is_admin
                    ,if(ug2.user_group_id, 1, 0) as is_moderator
                    ,if(ug3.user_group_id, 1, 0) as is_leader
                    ,u.is_oncall
                from user u 
                left join user__user_group ug1 on ug1.user_id = u.user_id and ug1.user_group_id = 1
                left join user__user_group ug2 on ug2.user_id = u.user_id and ug2.user_group_id = 2
                left join user__user_group ug3 on ug3.user_id = u.user_id and ug3.user_group_id = 3
                where u.is_active = 1 
                   and (ug1.user_group_id is not null or ug2.user_group_id is not null or ug3.user_group_id is not null)
                order by u.last_name
                limit $limit offset $offset"""
        data = list(db.query(sql, {'limit':limit, 'offset':offset}))
    except Exception, e:
        log.info("*** couldn't get admin users")
        log.error(e)
        
    return data
    
#temp get dummy data
def getDummyDictionary():
    data = dict(u_id = 37,
                f_name = "Andrew",
                l_name = "Mahon",
                email = "andrew@typeslashcode.com",
                mobile = "9173241470")
                
    return data    