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
                        u.first_name, u.last_name, u.email as user_email,
                        coalesce(u.email, i.email) as email
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


def deleteIdea(db, ideaId):
    try:
        sql = """delete from idea where idea.idea_id = $id"""
        db.query(sql, {'id':ideaId})
        return True;
    except Exception, e:
        log.info("*** problem deleting id with id %s" % str(ideaId))
        log.error(e)
        return False


def attachIdeasByEmail(db, email):
    try:
        sql = """
update idea i, user u 
set i.user_id = u.user_id
where i.email = u.email 
    and u.email = $email
    and u.is_active = 1
""" 
        db.query(sql, {'email':email})
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
        db.query(sql, {'phone':phone})
        return True;
    except Exception, e:
        log.info("*** problem updating ideas by phone")
        log.error(e)
        return False
        
def findIdeasByPhone(db, phone):
    try:
        sql = "select idea_id from idea where phone = $phone"
        return list(db.query(sql, {'phone':phone}))
    except Exception, e:
        log.info("*** problem getting ideas by phone")
        log.error(e)    
        return None

def searchIdeasCount(db, terms, locationId, excludeProjectId = None):
    count = 0
    match = ' '.join([(item + "*") for item in terms])
            
    try:
        sql = """select count(*) as count
                from idea i
                where
                i.is_active = 1 
                and ($locationId is null or i.location_id = $locationId)
                and ($match = '' or match(i.description) against ($match in boolean mode))
                and ($projectId is null or i.idea_id not in (select pi.idea_id from project__idea pi where pi.project_id = $projectId))"""  

        data = list(db.query(sql, {'match':match, 'locationId':locationId, 'projectId':excludeProjectId}))
        
        count = data[0].count
    except Exception, e:
        log.info("*** couldn't get idea search count")
        log.error(e)
            
    return count

def searchIdeas(db, terms, locationId, limit=1000, offset=0, excludeProjectId = None):
    betterData = []
    match = ' '.join([(item + "*") for item in terms])
            
    try:
        sql = """select i.idea_id
                       ,i.description
                      ,i.submission_type
                      ,i.created_datetime
                      ,u.user_id
                      ,u.first_name
                      ,u.last_name
                      ,u.affiliation
                      ,u.image_id
                from idea i
                left join user u on u.user_id = i.user_id
                where
                i.is_active = 1 
                and ($locationId is null or i.location_id = $locationId)
                and ($match = '' or match(i.description) against ($match in boolean mode))
                and ($projectId is null or i.user_id not in (select pu.user_id from project__user pu where pu.project_id = $projectId))
                order by i.created_datetime desc
                limit $limit offset $offset"""  

        data = list(db.query(sql, {'match':match, 'locationId':locationId, 'limit':limit, 'offset':offset, 'projectId':excludeProjectId}))
        
        for item in data:
            owner = None
            
            if (item.user_id):
                # repeating smallUser method from giveaminute.project to avoid circular reference
                owner = dict(u_id = item.user_id,
                            image_id = item.image_id,
                            name = ideaName(item.first_name, item.last_name, item.affiliation))

            betterData.append(dict(idea_id = item.idea_id,
                            message = item.description,
                            created = str(item.created_datetime),
                            submission_type = item.submission_type,
                            owner = owner))
    except Exception, e:
        log.info("*** couldn't get idea search data")
        log.error(e)
            
    return betterData

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
        
def addInvitedIdeaToProject(db, projectId, userId):
    try:
        sql = """insert into project__idea (project_id, idea_id)
                  select $projectId, inv.invitee_idea_id from project_invite inv
                    inner join idea i on i.idea_id = inv.invitee_idea_id and i.user_id = $userId
                    where project_id = $projectId
                    limit 1"""    
        db.query(sql, {'projectId':projectId, 'userId':userId})
        
        return True
    except Exception, e:
        log.info("*** couldn't add invited idea(s) from user id %s to project %s" % (userId, projectId))
        log.error(e)
        return False
        
def getMostRecentIdeas(db, limit=100, offset=0):
    data = []
    betterData = []
    
    sql = """select i.idea_id, i.description as text, u.user_id, u.first_name, u.last_name, u.affiliation, i.submission_type as submitted_by 
            from idea i
            left join user u on u.user_id = i.user_id and u.is_active = 1
            where i.is_active = 1
            order by i.created_datetime desc
            limit $limit offset $offset"""
            
    try:
        data = list(db.query(sql, {'limit':limit, 'offset':offset}))
    
        for item in data:
            betterData.append(dict(text = item.text,
                        user_id = item.user_id,
                        name = ideaName(item.first_name, item.last_name, item.affiliation),
                        submitted_by =  str(item.submitted_by)))   
    
    except Exception, e:
        log.info("*** couldn't get most recent ideas")
        log.error(e)    
        
    return betterData
    
# TODO put this with the rest of the formatting functions
def ideaName(first, last, affiliation = None):
    if (first and last):
        # TODO should use general username formatter
        #return userName(first, last, False)
        return "%s %s." % (first, last[0])
    elif (affiliation):
        return affiliation
    else:
        return None
