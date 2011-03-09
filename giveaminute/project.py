from framework.log import log

class Project():
    def __init__(self, db, projectId):
        self.id = projectId

def createProject(db, title, description, keywords, locationId, imageId):
    try:
        if (not locationId or locationId < 1):
            locationId = -1
    
        projectId = db.insert('project', title = title,
                                    description = description, 
                                    image_id = imageId, 
                                    location_id = locationId, 
                                    keywords = keywords, 
                                    created_datetime=None)
                                    
        
    except Exception, e:
        log.info("*** problem creating project")
        log.error(e)    
        return None
        
    return projectId
    
def attachResourceToProject(db, projectId, resourceId):
    try:
        db.insert('project__project_resource', project_id = projectId,
                                    project_resource_id = resourceId)
                                    
        return True;
    except Exception, e:
        log.info("*** problem attaching resource to project")
        log.error(e)    
        return False 
        
def getProjectsByLocation(db, locationId, limit = 100):
    try:
        sql = """select p.project_id, p.title, p.description, p.image_id, p.location_id, 0 as num_members 
                    from project p where p.is_active = 1 and p.location_id = $locationId
                    limit $limit"""
        data = list(db.query(sql, {'locationId':locationId, 'limit':limit}))
        
        return data
    except Exception, e:
        log.info("*** couldn't get projects by location")
        log.error(e)
        return None
    
def getProjectsByKeywords(db, keywords, limit = 100):
    # there's a better way to do this
    keywordClause = "%%' or p.keywords like '%%".join(keywords)
    
    try:
        sql = """select p.project_id, p.title, p.description, p.image_id, p.location_id, 0 as num_members 
                    from project p where p.is_active = 1 and (p.keywords like '%%%%%s%%%%')
                    limit $limit""" % keywordClause
        data = list(db.query(sql, {'limit':limit}))
        
        return data
    except Exception, e:
        log.info("*** couldn't get projects by keywords")
        log.error(e)
        return None
                 
def getProjects(db, keywords, locationId, limit = 100):
    keywordClause = "%%' or p.keywords like '%%".join(keywords)
    
    try:
        sql = """select p.project_id, p.title, p.description, p.image_id, p.location_id, 0 as num_members 
                from project p where p.is_active = 1 and (p.location_id = $locationId and (p.keywords like '%%%%%s%%%%'))
                limit $limit""" % keywordClause
        data = list(db.query(sql, {'locationId':locationId, 'limit':limit}))
            
        return data
    except Exception, e:
        log.info("*** couldn't get projects")
        log.error(e)
        return None