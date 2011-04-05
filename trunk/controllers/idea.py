import giveaminute.idea as mIdea
import giveaminute.keywords as mKeywords
import giveaminute.project as mProject
import framework.util as util
from framework.controller import *

class Idea(Controller):
    def GET(self, action = None, id = None):
        if (action == 'related'):
            return self.getRelatedProjects()
        else:
            return self.not_found()
            
            
    def POST(self, action=None):
        if (action == 'flag'):
            return self.flagIdea()
        elif (action == 'remove'):
            log.info("*** remove POST")
            return self.removeIdea()
        else:
            return self.newIdea()
        
    def newIdea(self):
        description = self.request('text')
        locationId = util.try_f(int, self.request('location_id'), -1)

        if (self.user):
            userId = self.user.id
            email = self.user.email
        else:
            userId = None
            email = self.request('email')
        
        ideaId = mIdea.createIdea(self.db, description, locationId, 'web', userId, email)
        
        return ideaId if ideaId else False 
        
    def flagIdea(self):
        ideaId = self.request('idea_id')
        
        if (ideaId):
            return mIdea.flagIdea(self.db, ideaId)
        else:
            return False
            
    def removeIdea(self):
        if (not self.user.isAdmin and not self.user.isModerator):
            log.warning("*** unauthorized idea removal attempt by user_id = %s" % self.user.id)
            return False
    
        ideaId = self.request('idea_id')
        
        if (ideaId):
            return mIdea.setIdeaIsActive(self.db, ideaId, 0)
        else:
            return False
        
        
    def getRelatedProjects(self):
        ideaId = self.request('idea_id')
        limit = int(self.request('n_limit')) if self.request('n_limit') else 5
        relatedProjects = []
        citywideProjects = []
        isLocationOnlyMatch = False
        
        if (not ideaId):
            log.error("No idea id")
        else: 
            idea = mIdea.Idea(self.db, ideaId)
        
            if (idea):
                kw = mKeywords.getKeywords(self.db, idea.description)
                
                if (idea.locationId != -1):
                    relatedProjects = mProject.getProjects(self.db, kw, idea.locationId, limit)
                    
                    if (len(relatedProjects) == 0):
                        isLocationOnlyMatch = True
                        relatedProjects = mProject.getProjectsByLocation(self.db, idea.locationId, limit)
                    
                citywideProjects = mProject.getProjects(self.db, kw, -1, limit)
            else:
                log.error("No idea found for id = %s" % ideaId)
            
        obj = dict(is_location_only_match = isLocationOnlyMatch, related = relatedProjects, citywide = citywideProjects)
            
        return self.json(obj)
        

    