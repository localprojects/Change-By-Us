from framework.log import log

class ProjectResource():
    def __init__(self, db, projectResourceId):
        self.id = projectResourceId
        
def getProjectResourcesByLocation(db, locationId):
    try:
        sql = """select pr.project_resource_id, pr.title, pr.description, pr.image_id, pr.location_id, pr.url 
                    from project_resource pr where pr.is_active = 1 and pr.location_id = $locationId"""
        data = list(db.query(sql, {'locationId':locationId}))
    
        return data
    except Exception, e:
        log.info("*** couldn't get project resources by location")
        log.error(e)
        return None
        
def getProjectResourcesByKeywords(db, keywords):
    # there's a better way to do this
    keywordClause = "%%' or pr.keywords like '%%".join(keywords)
    
    try:
        sql = """select pr.project_resource_id, pr.title, pr.description, pr.image_id, pr.location_id, pr.url 
                    from project_resource pr where pr.is_active = 1 and (pr.keywords like '%%%%%s%%%%')""" % keywordClause

        data = list(db.query(sql))
    
        return data
    except Exception, e:
        log.info("*** couldn't get project resources by keywords")
        log.error(e)
        return None        
        
def getProjectResources(db, keywords, locationId):
    keywordClause = "%%' or p.keywords like '%%".join(keywords)
    
    try:
        sql = """select pr.project_resource_id, pr.title, pr.description, pr.image_id, pr.location_id, pr.url 
                    from project_resource pr where pr.is_active = 1 and (location_id = $locationId or (pr.keywords like '%%%%%s%%%%'))""" % keywordClause
        data = list(db.query(sql, {'locationId':locationId}))
        
        log.info("*** kw sql = %s" % sql)
    
        return data
    except Exception, e:
        log.info("*** couldn't get projects by keywords")
        log.error(e)
        return None