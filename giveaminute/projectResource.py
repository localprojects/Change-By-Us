from framework.log import log

class ProjectResource():
    def __init__(self, db, projectResourceId):
        self.id = projectResourceId
        self.db = db
        self.data = self.populateResourceData()
        
    def populateResourceData(self):
        sql = """select project_resource_id, title, description, url, contact_name, contact_email, image_id, location_id
                from project_resource where project_resource_id = $id;"""
        
        try:
            data = list(self.db.query(sql, {'id':self.id}))
            
            if len(data) > 0:
                return data[0]
            else:
                return None
        except Exception, e:
            log.info("*** couldn't get project resource info")
            log.error(e)
            return None 
            
    def getFullDictionary(self):
        data = dict(image_id = self.data.image_id,
                    project_resource_id = self.data.project_resource_id,
                    description = self.data.description,
                    title = self.data.title,
                    url = self.data.url,
                    location_id = self.data.location_id)
        return data
        
def getProjectResourcesByLocation(db, locationId, notInProjectId = None):
    try:
        sql = """select pr.project_resource_id, pr.title, pr.description, pr.image_id, pr.location_id, pr.url 
                    from project_resource pr where pr.is_active = 1 and pr.location_id = $locationId"""
                    
        if (notInProjectId):
            sql += " and pr.project_resource_id not in (select project_resource_id from project__project_resource where project_id = %s)" % notInProjectId
                    
        data = list(db.query(sql, {'locationId':locationId}))
    
        return data
    except Exception, e:
        log.info("*** couldn't get project resources by location")
        log.error(e)
        return None
        
def getProjectResourcesByKeywords(db, keywords, notInProjectId = None):
    # there's a better way to do this
    keywordClause = "%%' or pr.keywords like '%%".join(keywords)
    
    try:
        sql = """select pr.project_resource_id, pr.title, pr.description, pr.image_id, pr.location_id, pr.url 
                    from project_resource pr where pr.is_active = 1 and (pr.keywords like '%%%%%s%%%%')""" % keywordClause

        if (notInProjectId):
            sql += " and pr.project_resource_id not in (select project_resource_id from project__project_resource where project_id = %s)" % notInProjectId

        data = list(db.query(sql))
    
        return data
    except Exception, e:
        log.info("*** couldn't get project resources by keywords")
        log.error(e)
        return None        
        
def getProjectResources(db, keywords, locationId, notInProjectId = None):
    keywordClause = "%%' or pr.keywords like '%%".join(keywords)
    
    try:
        sql = """select pr.project_resource_id, pr.title, pr.description, pr.image_id, pr.location_id, pr.url 
                    from project_resource pr where pr.is_active = 1 and (location_id = $locationId and (pr.keywords like '%%%%%s%%%%'))""" % keywordClause

        if (notInProjectId):
            sql += " and pr.project_resource_id not in (select project_resource_id from project__project_resource where project_id = %s)" % notInProjectId

        data = list(db.query(sql, {'locationId':locationId}))
    
        return data
    except Exception, e:
        log.info("*** couldn't get projects by keywords")
        log.error(e)
        return None