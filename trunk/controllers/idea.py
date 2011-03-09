import giveaminute.idea as mIdea
import giveaminute.keywords as mKeywords
import giveaminute.project as mProject
from framework.controller import *

class Idea(Controller):
    def GET(self, action = None, id = None):
        if (action == 'related'):
            return self.getRelatedProjects()
        else:
            return self.not_found()
            
            
    def POST(self,*args, **kw):
        return self.newIdea()
        
    def newIdea(self):
        description = self.request('text')
        email = self.request('email')
        locationId = self.request('location_id')
        
        #get user id
        userId = None
        
        ideaId = mIdea.createIdea(self.db, description, locationId, 'web', userId, email)
        
        return ideaId if ideaId else False 
        
    def getRelatedProjects(self):
        ideaId = self.request('idea_id')
        limit = int(self.request('n_limit')) if self.request('n_limit') else 5
        relatedProjects = []
        citywideProjects = []
        
        if (not ideaId):
            log.error("No idea id")
        else: 
            idea = mIdea.Idea(self.db, ideaId)
        
            if (idea):
                kw = mKeywords.getKeywords(self.db, idea.description)
                
                relatedProjects = mProject.getProjects(self.db, kw, idea.locationId, limit)
                
                if (len(relatedProjects) == 0):
                    relatedProjects = mProject.getProjectsByLocation(self.db, idea.locationId, limit)
                    
                citywideProjects = mProject.getProjects(self.db, kw, -1, limit)
                
            else:
                log.error("No idea found for id = %s" % ideaId)
            
        obj = dict(related = relatedProjects, citywide = citywideProjects)
            
        return self.json(obj)
        

    