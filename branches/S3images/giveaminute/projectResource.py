from framework.log import log

class ProjectResource():
    def __init__(self, db, projectResourceId):
        self.id = projectResourceId
        self.db = db
        self.data = self.populateResourceData()
        
    def populateResourceData(self):
        sql = """select project_resource_id, title, description, url, contact_name, contact_email, image_id, location_id, is_official
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

def searchProjectResourcesCount(db, terms, locationId):
    count = 0
    match = ' '.join([(item + "*") for item in terms])
    
    try:
        sql = """select count(*) as count
                from project_resource
                    where
                    is_active = 1 and is_hidden = 0
                    and ($locationId is null or location_id = $locationId)
                    and ($match = '' or match(title, description) against ($match in boolean mode))"""

        data = list(db.query(sql, {'match':match, 'locationId':locationId}))
        
        count = data[0].count
    except Exception, e:
        log.info("*** couldn't get resources search data")
        log.error(e)
                
    return count

def searchProjectResources(db, terms, locationId, limit=1000, offset=0):
    data = []

    match = ' '.join([(item + "*") for item in terms])
    
    try:
        sql = """select project_resource_id as link_id, title, url, image_id, is_official 
                from project_resource
                    where
                    is_active = 1 and is_hidden = 0
                    and ($locationId is null or location_id = $locationId)
                    and ($match = '' or match(title, description) against ($match in boolean mode))
                    order by created_datetime desc
                    limit $limit offset $offset"""

        data = list(db.query(sql, {'match':match, 'locationId':locationId, 'limit':limit, 'offset':offset	}))
    except Exception, e:
        log.info("*** couldn't get resources search data")
        log.error(e)
                
    return data
        
def updateProjectResourceImage(db, projectResourceId, imageId):
    try:
        sql = "update project_resource set image_id = $imageId where project_resource_id = $projectResourceId"
        db.query(sql, {'projectResourceId':projectResourceId, 'imageId':imageId})
        return True
    except Exception, e:
        log.info("*** couldn't update project image")
        log.error(e)
        return False
        
def getUnreviewedProjectResources(db, limit = 10, offset = 0):
    data = []
    
    try:
        sql = """select pr.project_resource_id, 
                        pr.title, pr.description, 
                        pr.image_id, 
                        pr.location_id, 
                        pr.url,
                        pr.twitter_url,
                        pr.facebook_url,
                        pr.physical_address,
                        pr.contact_name,
                        pr.contact_email,
                        replace(pr.keywords, ' ', ',') as keywords,
                        l.name as location_name
                    from project_resource pr 
                    left join location l on l.location_id = pr.location_id
                    where pr.is_active = 1 and pr.is_hidden = 1 
                    limit $limit offset $offset"""
                    
        data = list(db.query(sql, {'limit':limit, 'offset':offset}))
    except Exception, e:
        log.info("*** couldn't get unreviewed resources")
        log.error(e)
        
    return data
    
def approveProjectResource(db, projectResourceId, isOfficial = False):
    try:
        db.update('project_resource', where = "project_resource_id = $projectResourceId", is_hidden = 0, is_official = isOfficial, vars = {'projectResourceId':projectResourceId})
        return True
    except Exception, e:
        log.info("*** couldn't approve project resource %s" % projectResourceId)
        log.error(e)
        return False