import hashlib
import giveaminute.project as mProject
import giveaminute.idea as mIdea
import giveaminute.messaging as mMessaging
import framework.util as util
from framework.log import log

class User():
    """
    An instance of a user.  A layer over the ``user`` table and related tables.
    
    
    **Attributes:**
    
    ``db``
        A ``web.db.DB`` instance. CBU uses a MySQL database, so this is
        specifically a ``web.db.MySQLDB`` instance. It is created with the
        ``web.db.database`` factory in ``framework.controller``.
    
    ``id``
        The ID of the user instance.
    
    ``data``
        The database row corresponding to the user, as a ``list``.
    
    ``projectData``
        A set of rows of project data for *active* projects for which this user
        is an administrator.
    
    ``userKey``
        The ``user_key`` field from the table
    
    ``email``
        The ``email`` field from the table
    
    ``firstName``
        The ``first_name`` field from the table
    
    ``lastName``
        The ``last_name`` field from the table
    
    ``imageId``
        The ``image_id`` field from the table
    
    ``locationId``
        The ``location_id`` field from the table
    
    ``location``
        The ``location_name`` field from the table
    
    ``description``
        The ``description`` field from the table
    
    ``affiliation``
        The ``affiliation`` field from the table
    
    ``groupMembershipBitmask``
        The ``group_membership_bitmask`` field from the table
    
    ``emailNotification``
        The ``email_notification`` field from the table
    
    ``isAdmin``
        True if the 2nd-lowest bit in the group membership bitmask is 1;
        otherwise False
        
    ``isModerator``
        True if the 3rd-lowest bit in the group membership bitmask is 1;
        otherwise False
        
    ``isLeader``
        True if the 4th-lowest bit in the group membership bitmask is 1;
        otherwise False
    
    ``numMessages``
        The number of new messages since the last time the user accessed their
        account page
        
    """
    def __init__(self, db, userId):
        """
        Initializes a ser instance.
        
        **Arguments:**
        
        db -- A ``web.db.DB`` instance. CBU uses a MySQL database, so this is
              specifically a ``web.db.MySQLDB`` instance. It is created with the
              ``web.db.database`` factory in ``framework.controller``.
        userId -- The ID of the user instance to pull from the database.
        
        """
        self.db = db
        self.id = userId        
        self.data = self.populateUserData()

        if (self.data):
            self.projectData = self.getUserProjectList()
            
            self.userKey = self.data.user_key
            self.email = self.data.email
            self.phone = self.data.phone
            self.firstName = self.data.first_name
            self.lastName = self.data.last_name
            self.imageId = self.data.image_id
            self.locationId = self.data.location_id
            self.location = self.data.location_name
            self.description = self.data.description
            self.affiliation = self.data.affiliation
            self.groupMembershipBitmask = self.data.group_membership_bitmask
            self.emailNotification = self.data.email_notification
            self.isAdmin = isAdminBitmask(self.data.group_membership_bitmask)
            self.isModerator = isModeratorBitmask(self.data.group_membership_bitmask)
            self.isLeader = isLeaderBitmask(self.data.group_membership_bitmask)
            self.numNewMessages = self.getNumNewMessages()
    
    def isProjectAdmin(self, projectId):
        sql = "select is_project_admin from project__user where user_id = $userId and project_id = $projectId and is_project_admin = 1 limit 1"
        
        try:
            data = self.db.query(sql, {'userId':self.id, 'projectId':projectId})
            
            return (len(data) > 0)
        except Exception, e:
            log.info("*** couldn't get user project admin status")
            log.error(e)
            return False
            
    def isResourceOwner(self, projectResourceId):
        sql = "select project_resource_id from project_resource where contact_user_id = $userId and project_resource_id = $projectResourceId"
        
        try:
            data = self.db.query(sql,{'userId':self.id, 'projectResourceId':projectResourceId})

            return (len(data) > 0)
        except Exception, e:
            
            log.info("*** couldn't get user resource ownership status")
            log.error(e)
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
                    affiliation = self.affiliation,
                    email = self.email,
                    mobile = self.phone,
                    email_notification = self.emailNotification,
                    num_new_messages = self.numNewMessages,
                    projects = projects,
                    image_id = self.imageId)
                                        
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
      ,l.name as location_name
      ,u.description
      ,u.affiliation
      ,u.group_membership_bitmask
      ,u.email_notification
      ,coalesce(u.last_account_page_access_datetime, u.created_datetime) as last_account_page_access_datetime
      ,pl.title
      ,pl.organization
from user u 
left join location l on l.location_id = u.location_id
left join project_leader pl on pl.user_id = u.user_id
where u.user_id = $id and u.is_active = 1"""
        
        try:
            data = list(self.db.query(sql, {'id':self.id}))[0]
            
            if len(data) > 0:
                return data
            else:
                return None
        except Exception, e:
            log.info("*** couldn't get user info user id %s" % self.id)
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
            
    def updateInfo(self, email, first, last, imageId = None, locationId = None):
        # check if email already in user
        if not (findUserByEmail(self.db, self.email)):
            return False
            
        try:
            self.db.update('user', where = 'user_id = $userId', 
                            first_name = first,
                            last_name = last,
                            email = email,
                            image_id = imageId,
                            location_id = locationId,
                                vars = {'userId':self.id})
            
            return True
        except Exception, e:
            log.info("*** problem updating user info")
            log.error(e)
            return False
            
    def updateDescription(self, description):
        try:
            self.db.update('user', 
                            where = 'user_id = $userId', 
                            description = description,
                            vars = {'userId':self.id})
            return True
        except Exception, e:
            log.info("*** problem updating user description")
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
        """
        Returns a set of rows of project data for *active* projects for which 
        this user is an administrator.
        
        """
        data = []
        
        try:
            sql = """select p.project_id, p.title, pu.is_project_admin 
                    from project p
                    inner join project__user pu on pu.project_id = p.project_id and pu.user_id = $id
                    inner join project__user o on o.project_id = p.project_id and o.is_project_admin = 1
                    where p.is_active = 1"""
            data  = list(self.db.query(sql, { 'id': self.id }))
        except Exception,e:
            log.info("*** couldn't get user projects")
            log.error(e)
            
        return data    
        
    def getUserResources(self):
        data = []
        
        try:
            sql = """select r.project_resource_id, r.title, r.description, r.location_id, l.name as location_name,
                            r.image_id, r.url, r.contact_email, r.physical_address, replace(r.keywords, ' ', ',') as keywords 
                    from project_resource r
                    inner join location l on l.location_id = r.location_id
                    where r.is_active = 1 and r.is_hidden = 0 and r.contact_user_id = $id"""
            data  = list(self.db.query(sql, { 'id': self.id }))
        except Exception,e:
            log.info("*** couldn't get user resources")
            log.error(e)
            
        return data    
        
    def getEndorsedProjects(self):
        betterData = []
        
        try:
            sql = """select p.project_id, 
                        p.title, 
                        p.description, 
                        p.image_id, 
                        p.location_id,
                        o.user_id as owner_user_id,
                        o.first_name as owner_first_name,
                        o.last_name as owner_last_name,
                        o.affiliation as owner_affiliation,
                        o.group_membership_bitmask as owner_group_membership_bitmask,
                        o.image_id as owner_image_id, 
                    (select count(cpu.user_id) from project__user cpu where cpu.project_id = p.project_id) as num_members 
                from project p
                inner join project_endorsement pe on pe.project_id = p.project_id and pe.user_id = $id
                inner join project__user pu on pu.project_id = p.project_id and pu.is_project_admin = 1
                inner join user o on o.user_id = pu.user_id
                 where p.is_active = 1"""
            data  = list(self.db.query(sql, { 'id': self.id }))
            
            for item in data:
                betterData.append(dict(project_id = item.project_id,
                                        title = item.title,
                                        description = item.description,
                                        image_id = item.image_id,
                                        location_id = item.location_id,
                                        owner = mProject.smallUserDisplay(item.owner_user_id, 
                                                                          mProject.userNameDisplay(item.owner_first_name, 
                                                                                                   item.owner_last_name, 
                                                                                                   item.owner_affiliation, 
                                                                                                   mProject.isFullLastName(item.owner_group_membership_bitmask)), 
                                                                 item.owner_image_id),
                                        num_members = item.num_members))
        except Exception,e:
            log.info("*** couldn't get user endorsed projects")
            log.error(e)
            
        return betterData         
        
    def getActivityDictionary(self):
        user = mProject.smallUserDisplay(self.id, 
                                         mProject.userNameDisplay(self.firstName, 
                                                                  self.lastName, 
                                                                  self.affiliation,
                                                                  mProject.isFullLastName(self.groupMembershipBitmask)),
                                         self.imageId)        
        user['location_id'] = self.locationId
        user['location'] = self.location
        user['description'] = self.description
        user['is_leader'] = self.isLeader
    
        data = dict(projects = self.getProjects(),
                    ideas = self.getIdeas(),
                    messages = self.getMessages(10, 0),
                    resources = self.getUserResources(),
                    endorsed_projects = self.getEndorsedProjects(),
                    user = user)
                    
        return data
        
    # data for other users accessing a user's profile/account page
    def getProfileActivityDictionary(self):
        user = mProject.smallUserDisplay(self.id, 
                                         mProject.userNameDisplay(self.firstName, 
                                                                  self.lastName, 
                                                                  self.affiliation,
                                                                  mProject.isFullLastName(self.groupMembershipBitmask)),
                                         self.imageId)
        user['location_id'] = self.locationId
        user['location'] = self.location
        user['description'] = self.description
        user['is_leader'] = self.isLeader
    
        data = dict(projects = self.getProjects(),
                    ideas = self.getIdeas(),
                    endorsed_projects = self.getEndorsedProjects(),
                    user = user)
                    
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
        """
        Returns a list of messages for this user.  The results are paginated
        (i.e., this will return ``limit`` rows, starting at ``ofsset``-th row).
        
        """
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
                        mu.affiliation,
                        mu.group_membership_bitmask,
                        mu.image_id,
                        i.idea_id,
                        i.description as idea_description,
                        i.submission_type as idea_submission_type,
                        i.created_datetime as idea_created_datetime
                    from project_message m
                    inner join project__user pu on pu.project_id = m.project_id and pu.user_id = $userId
                    inner join project p on p.project_id = pu.project_id and p.is_active = 1
                    inner join user mu on mu.user_id = m.user_id
                    left join idea i on i.idea_id = m.idea_id
                    where m.is_active = 1
                        union
                    select 
                        p.project_id,
                        p.title,
                        null as project_message_id,
                        'invite' as message_type,
                        concat('You''ve been invited to the ', 
                                ucase(p.title), 
                                ' project!', 
                                coalesce(concat('<br/><br/>"', inv.message, '"'), '')) as message,
                        inv.created_datetime as created_datetime,
                        iu.user_id,
                        iu.first_name,
                        iu.last_name,
                        iu.affiliation,
                        iu.group_membership_bitmask,
                        iu.image_id,
                        i.idea_id,
                        i.description as idea_description,
                        i.submission_type as idea_submission_type,
                        i.created_datetime as idea_created_datetime
                    from project_invite inv
                    inner join project p on p.project_id = inv.project_id and p.is_active = 1
                    inner join user iu on iu.user_id = inv.inviter_user_id
                    inner join idea i on i.idea_id = inv.invitee_idea_id and i.user_id =$userId
                    order by created_datetime desc
                    limit $limit offset $offset"""
            data = list(self.db.query(sql, {'userId':self.id, 'limit':limit, 'offset':offset}))  
               
            for item in data:
                messages.append(mProject.message(item.project_message_id, 
                                        item.message_type, 
                                        item.message, 
                                        item.created_datetime, 
                                        item.user_id, 
                                        mProject.userNameDisplay(item.first_name,
                                                                 item.last_name,
                                                                 item.affiliation,
                                                                 mProject.isFullLastName(item.group_membership_bitmask)), 
                                        item.image_id,
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
        """
        
        """
        num = 0
        
        try:
            # Select the number of times that someone invited this user to a 
            # project based on this user's idea.  TODO: is my interpretation
            # correct?  Why is it selecting when this user is the invitee?
            
            # Select the number of times that this user submitted a message

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
        
def createUser(db, email, password, firstName = None, lastName = None, phone = None, imageId = None, locationId = None, affiliation = None, isAdmin = False):
    userId = None
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
                                    affiliation=affiliation, 
                                    image_id=imageId, 
                                    location_id=locationId,
                                    created_datetime=None)
                                    
    except Exception, e:
        log.info("*** problem creating user")
        log.error(e)    
        
    return userId

def createUserFromAuthGuid(db, authGuid):
    userId = None

    try:
        sql = "select email, password, salt, phone, first_name, last_name from unauthenticated_user where auth_guid = $guid limit 1"
        data = list(db.query(sql, {'guid':authGuid}))
        
        if (len(data) == 1):
            userData = data[0]
            userId = db.insert('user', email = userData.email, 
                                        password = userData.password, 
                                        salt = userData.salt, 
                                        phone = userData.phone, 
                                        first_name = userData.first_name, 
                                        last_name = userData.last_name, 
                                        created_datetime = None)
    except Exception, e:
        log.info("*** problem creating user from auth guid %s" % authGuid)
        log.error(e)      
    
    return userId 

def createUnauthenticatedUser(db, authGuid, email, password, firstName = None, lastName = None, phone = None, imageId = None, locationId = None):
    encrypted_password, salt = makePassword(password)
    
    if (findUserByEmail(db, email)):
        return False
    
    try:
        db.insert('unauthenticated_user', auth_guid=authGuid,
                                    email=email, 
                                    password=encrypted_password, 
                                    salt=salt, 
                                    phone=phone, 
                                    first_name=firstName, 
                                    last_name=lastName)
        
        return True                            
    except Exception, e:
        log.info("*** problem creating unauthenticated user record")
        log.error(e)    
        return False
        
    return userId
        
def setUserOncallStatus(db, userId, status):
    try:
        db.update('user', where = "user_id = $userId", is_oncall = status, vars = {'userId':userId})
        return True
    except Exception, e:
        log.info("*** problem setting oncall status to %s for user id %s" % (status, userId))
        log.error(e)
        return False
    
def authenticateUser(db, email, password):
    sql = "select user_id, email, password, salt from user where email = $email and is_active = 1"
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

def authGetUser(db, email, password):
    sql = "select user_id, first_name, last_name, affiliation, group_membership_bitmask, image_id, email, password, salt from user where email = $email and is_active = 1"
    data = db.query(sql, {'email':email})
    
    if (len(data) > 0):
        user = list(data)[0]
        hashed_password = makePassword(password, user.salt)
    
        if (hashed_password[0] == user.password):
            log.info("*** User authenticated")
            return mProject.smallUserDisplay(user.user_id, 
                                             mProject.userNameDisplay(user.first_name, 
                                                                      user.last_name, 
                                                                      user.affiliation, 
                                                                      mProject.isFullLastName(user.group_membership_bitmask)), 
                                             user.image_id)
        else:
            log.warning("*** User not authenticated for email = %s" % email)
            return None
    else:
        log.warning("*** No record for email= %s" % email)
        return None
        
def resetPassword(db, userId):
    forgetfulUser = User(db, userId)
    newPassword = util.random_string(10)
    
    if (forgetfulUser.updatePassword(newPassword)):
        return mMessaging.emailTempPassword(forgetfulUser.email, newPassword)
    else:
        return False    
        
def makePassword(password, salt = None):
    if (not salt):
        salt = util.random_string(10)
        
    hashed_password = hashlib.md5(password + salt).hexdigest()
    return [hashed_password, salt]   
    
def findUserByEmail(db, email):
    sql = "select user_id from user where email = $email limit 1"
    data = list(db.query(sql, vars = locals()))
    
    if len(data) > 0:
        return data[0].user_id
    else:
        return None
    
def findUserByPhone(db, phone):
    sql = "select user_id from user where phone = $phone limit 1"
    data = list(db.query(sql, vars = locals()))
    
    if len(data) > 0:
        return data[0].user_id
    else:
        return None  
    
def assignUserToGroup(db, userId, userGroupId):
    try:
        db.update('user', where = "user_id = $id",
                          group_membership_bitmask = util.setBit(1, int(userGroupId)),
                          vars = {'id' : userId})
                                      
        return True
    except Exception, e:
        log.info("*** couldn't assign user id %s to group id %s" % (userId, userGroupId))
        log.error(e)
        return False
    
def getAdminUsers(db, limit = 10, offset = 0):
    betterData = []

    try:
        sql = """select distinct 
                    u.user_id
                    ,u.email
                    ,u.first_name
                    ,u.last_name
                    ,u.affiliation
                    ,u.group_membership_bitmask
                    ,u.is_oncall
                from user u 
                where u.is_active = 1 
                   and u.group_membership_bitmask > 1
                order by u.last_name
                limit $limit offset $offset"""
        data = list(db.query(sql, {'limit':limit, 'offset':offset}))
        
        for item in data:
            betterData.append({'user_id' : item.user_id,
                               'email' : item.email,
                               'first_name' : item.first_name,
                               'last_name' : item.last_name,
                               'affiliation' : item.affiliation,
                               'group_membership_bitmask' : item.group_membership_bitmask,
                               'full_display_name' : mProject.userNameDisplay(item.first_name,
                                                                              item.last_name,
                                                                              item.affiliation,
                                                                              mProject.isFullLastName(item.group_membership_bitmask)),
                               'is_admin' : isAdminBitmask(item.group_membership_bitmask),
                               'is_moderator' : isModeratorBitmask(item.group_membership_bitmask),
                               'is_leader' : isLeaderBitmask(item.group_membership_bitmask),
                               'is_oncall' : item.is_oncall})
    except Exception, e:
        log.info("*** couldn't get admin users")
        log.error(e)
        
    return betterData
    
def isAdminBitmask(bitmask):
    return util.getBit(bitmask, 1)

def isModeratorBitmask(bitmask):
    return util.getBit(bitmask, 2)

def isLeaderBitmask(bitmask):
    return util.getBit(bitmask, 3)

  
