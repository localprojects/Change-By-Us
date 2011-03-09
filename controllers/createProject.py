import giveaminute.keywords as keywords
import giveaminute.project as project
import giveaminute.projectResource as resource
from framework.controller import *
import lib.web

class CreateProject(Controller):
    def GET(self, action=None):
        if (action == 'keywords'):
            return self.getKeywordsJSON()
        elif (action == 'similar'):
            return self.getSimilarProjectsJSON()
        elif (action == 'resources'):
            return self.getSimilarResourcesJSON()
        else:
            return self.render('create')
            
    def POST(self,*args, **kw):
        return self.newProject()  
        
    def newProject(self):
        title = self.request('title')
        description = self.request('text')
        locationId = self.request('location_id')
        imageId = self.request('image')
        keywords = self.request('keywords').split(',')
        resourceIds = self.request('resources').split(',')
        
        projectId = project.createProject(self.db, title, description, ' '.join(keywords), locationId, imageId)
        
        ##TODO add keywords to dictionary, hence the splitting and joining
        
        for resourceId in resourceIds:
            log.info("*** insert resource id %s" % resourceId)
            project.attachResourceToProject(self.db, projectId, resourceId)
            
        if (projectId):
            return projectId
        else:
            return False
            
    def getKeywordsJSON(self):
        s = "%s %s" % (self.request('text'), self.request('title'))
        kw = keywords.getKeywords(self.db, s)
        
        log.info(kw)
        
        obj = dict(suggested_keywords=kw)
    
        return self.json(obj)    
        
    def getSimilarProjectsJSON(self):
        locationId = self.request('location_id')
        keywords = self.request('keywords').split(',') if self.request('keywords') else []
                
        if (locationId and len(keywords) > 0):
            projects = project.getProjects(self.db, keywords, locationId)
        elif (locationId):
            projects = project.getProjectsByLocation(self.db, locationId)
        elif (len(keywords) > 0):
            projects = project.getProjectsByKeywords(self.db, keywords)
        else:
            return None
        
        obj = dict(projects = projects)
        
        return self.json(obj)
        
    def getSimilarResourcesJSON(self):
        locationId = self.request('location')
        keywords = self.request('keywords').split(',') if self.request('keywords') else []
                
        if (locationId and len(keywords) > 0):
            resources = resource.getProjectResources(self.db, keywords, locationId)
        elif (locationId):
            resources = resource.getProjectResourcesByLocation(self.db, locationId)
        elif (len(keywords) > 0):
            resources = resource.getProjectResourcesByKeywords(self.db, keywords)
        else:
            return None
        
        obj = dict(resources = resources)
        
        return self.json(obj)
    
    