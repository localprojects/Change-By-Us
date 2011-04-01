import framework.util as util
import helpers.censor as censor
from framework.log import log

class Idea:
    def __init__(self, db, ideaId):
        self.id = ideaId
        self.db = db
        self.data = self.populateIdeaData()
        self.description = self.data.description
        self.locationId = self.data.location_id
        
    def populateIdeaData(self):
        sql = """select i.idea_id, i.description, i.location_id, i.submission_type, i.user_id, i.email as idea_email, i.phone, i.num_flags,
                        u.first_name, u.last_name, u.email as user_email
                from idea  i               
                left join user u on u.user_id = i.user_id
                                where idea_id = $id"""
        
        try:
            data = list(self.db.query(sql, {'id':self.id}))
            
            if len(data) > 0:
                return data[0]
            else:
                return None
        except Exception, e:
            log.info("*** couldn't get idea into")
            log.error(e)
            return None        
        

def createIdea(db, description, locationId, submissionType, userId=None, email=None, phone=None):
    try:
        # censor behavior
        numFlags = censor.badwords(db, description)
        isActive = 0 if numFlags == 2 else 1
        
        ideaId = db.insert('idea', description = description,
                                    location_id = locationId,
                                    submission_type = submissionType,
                                    user_id = userId,
                                    email = email,
                                    phone = phone,
                                    is_active = isActive,
                                    num_flags = numFlags)
    except Exception, e:
        log.info("*** problem creating idea")
        log.error(e)    
        return None
        
    return ideaId
    
# deprecated
def attachIdeasToUser(db, userId, ideaIdList):
    try:    
        for id in ideaIdList:
            db.update('idea', 'idea_id = $id', user_id = userId, vars = locals())
            
        return True
    except Exception, e:
        log.info("*** problem adding ideas to user")
        log.error(e)    
        return False
        
    return True
    
def attachIdeasByEmail(db, email):
    try:
        sql = """
update idea i, user u 
set i.user_id = u.user_id
where i.email = u.email 
    and u.email = $email
    and u.is_active = 1
""" 
        db.query(sql, vars = locals())
        return True;
    except Exception, e:
        log.info("*** problem updating ideas by email")
        log.error(e)
        return False
        
def attachIdeasByPhone(db, phone):
    try:
        sql = """
update idea i, user u 
set i.user_id = u.user_id
where (i.phone is not null and i.phone <> '' and i.phone = u.phone) 
    and u.phone = $phone
    and u.is_active = 1
""" 
        db.query(sql, vars = locals())
        return True;
    except Exception, e:
        log.info("*** problem updating ideas by phone")
        log.error(e)
        return False
        
def findIdeasByPhone(db, phone):
    try:
        sql = "select idea_id from idea where phone = $phone"
        return list(db.query(sql, vars = locals()))
    except Exception, e:
        log.info("*** problem getting ideas by phone")
        log.error(e)    
        return None

def findIdeasByKeywords(db, keywords):
    ideas = []
    
    try:
        clauseList = []
    
        for word in keywords:
            clauseList.append("match(i.description) against ('%s')" % word)

        sql = """select i.idea_id, i.description, i.location_id, i.submission_type, i.user_id, u.first_name, u.last_name, i.created_datetime
                    from idea i 
                    left join user u on u.user_id = i.user_id
                    where %s and i.is_active = 1""" % ' and '.join(clauseList)
        
        ideas = list(db.query(sql))
    except Exception, e:
        log.info("*** problem getting ideas by keywords")
        log.error(e)    
    
    return ideas

def findIdeas(db, keywords, locationId):
    ideas = []
    
    try:
        clauseList = []
    
        for word in keywords:
            clauseList.append("match(i.description) against ('%s')" % word)

        sql = """select i.idea_id, i.description, i.location_id, i.submission_type, i.user_id, u.first_name, u.last_name, i.created_datetime
                from idea i 
                left join user u on u.user_id = i.user_id
                where i.is_active = 1 and i.location_id = $locationId and (%s)""" % ' or '.join(clauseList)
        
        ideas = list(db.query(sql, { 'locationId':locationId}))
    except Exception, e:
        log.info("*** problem getting ideas")
        log.error(e)    
    
    return ideas 
    
def findIdeasByUser(db, userId, limit=100):
    ideas = []
    
    try:
        sql = """select i.idea_id, i.description, i.location_id, i.submission_type, i.user_id, u.first_name, u.last_name, i.created_datetime
                    from idea i 
                    inner join user u on u.user_id = i.user_id
                    where i.is_active = 1 and u.is_active = 1 and u.user_id = $userId
                order by i.created_datetime desc
                limit $limit"""
        
        ideas = list(db.query(sql, { 'userId':userId, 'limit':limit}))
    except Exception, e:
        log.info("*** problem getting ideas for user %s" % userId)
        log.error(e)    
    
    return ideas 
        
def flagIdea(db, ideaId):
    try:
        sql = "update idea set num_flags = num_flags + 1 where idea_id = $ideaId"
        db.query(sql, {'ideaId':ideaId})
        return True
    except Exception, e:
        log.info("*** problem flagging idea")
        log.error(e)    
        return False
        
def setIdeaIsActive(db, ideaId, b):
    try:
        sql = "update idea set is_active = $b where idea_id = $ideaId"
        db.query(sql, {'ideaId':ideaId, 'b':b})
        return True
    except Exception, e:
        log.info("*** problem setting idea is_active = %s for idea_id = %s" % (b, ideaId))
        log.error(e)    
        return False

        
def addIdeaToProject(db, ideaId, projectId):
    try:
        db.insert('project__idea', idea_id = ideaId, project_id = projectId)
                    
        return True
    except Exception, e:
        log.info("*** problem adding idea to project")
        log.error(e)    
        return False
    
    