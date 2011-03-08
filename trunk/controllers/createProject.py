import giveaminute.keywords as keywords
import giveaminute.project as project
from framework.controller import *

class CreateProject(Controller):
    def GET(self, action=None):
        if (action == 'keywords'):
            s = "%s %s" % (self.request('text'), self.request('title'))
            kw = keywords.getKeywords(self.db, s)
            
            log.info(kw)
            
            dic = dict(suggested_keywords=kw)
        
            return self.json(dic)
        else:
            return self.render('create')
            
    def POST(self):
        return self.newProject()
        
        
        
    def newProject(self):
        title = self.request('title')
        description = self.request('text')
        keywords = ' '.join(self.request('keywords'))
        locationId = self.request('location')
        imageId = self.request('image')
        resourceIds = self.request('resources')
        
        projectId = project.createProject(self.db, title, description, keywords, locationId, imageId)
        
        for resourceId in resourceIds:
            project.attachResourceToProject(self.db, projectId, resourceId)
            
        if (projectId):
            return True
        else:
            return False