class Project():
    def __init__(self, db, projectId):
        self.id = projectId

def createProject(db, title, description, imageId, locationId, keywords, ):
    try:
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
    
