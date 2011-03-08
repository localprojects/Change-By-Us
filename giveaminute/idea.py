import framework.util as util

def createIdea(db, idea, submissionType, userId=None, email=None, phone=None):
    try:
        ideaId = db.insert('idea', idea = idea,
                                    submission_type = submissionType,
                                    user_id = userId,
                                    email = email,
                                    phone = phone)
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
    
def findUsersByEmail(db, email):
    try:
        sql = "select user_id from user where email = $email"
        return list(db.query(sql, vars = locals()))
    except Exception, e:
        log.info("*** problem getting user by email")
        log.error(e)    
        return None    
        
def findIdeasByPhone(db, phone):
    try:
        sql = "select idea_id from idea where phone = $phone"
        return list(db.query(sql, vars = locals()))
    except Exception, e:
        log.info("*** problem getting ideas by phone")
        log.error(e)    
        return None
        
def flagIdea(db, ideaId):
    try:
        sql = "update idea set num_flags = num_flags + 1 where idea_id = $ideaId"
        self.db.query(sql, vars = locals())
        return True
    except Exception, e:
        log.info("*** problem flagging idea")
        log.error(e)    
        return False
    