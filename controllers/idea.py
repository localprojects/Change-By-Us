import giveaminute.idea as mIdea
import giveaminute.keywords as mKeywords
import giveaminute.project as mProject
import giveaminute.messaging as mMessaging
import framework.util as util
from framework.controller import *
from framework.config import *

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
            return self.removeIdea()
        else:
            return self.newIdea()
        
    def newIdea(self):
        if (self.request('main_text')): return False
    
        description = self.request('text')
        locationId = util.try_f(int, self.request('location_id'), -1)

        if (self.user):
            userId = self.user.id
            email = self.user.email
        else:
            userId = None
            email = self.request('email')
        
        ideaId = mIdea.createIdea(self.db, description, locationId, 'web', userId, email)
        
        if (ideaId):
            mMessaging.emailIdeaConfirmation(email, Config.get('email').get('from_address'), locationId)

            return ideaId
        else:
            return False

        return ideaId if ideaId else False 
        
    def flagIdea(self):
        ideaId = self.request('idea_id')
        
        if (ideaId):
            return mIdea.flagIdea(self.db, ideaId)
        else:
            return False
            
    def removeIdea(self):
        ideaId = self.request('idea_id')
        
        if (ideaId):
            idea = mIdea.Idea(self.db, ideaId)
        
            if (idea.data):
                if (not self.user.isAdmin and 
                    not self.user.isModerator and
                    not self.user.id == idea.data.user_id):
                    log.warning("*** unauthorized idea removal attempt by user_id = %s" % self.user.id)
                    return False
                else:
                    return mIdea.setIdeaIsActive(self.db, ideaId, 0)
            else:
                log.error("*** idea does not exist for idea id %s" % ideaId)
        else:
            log.error("*** attempting to delete idea with no id")
            return False
        
        
    def getRelatedProjects(self):
        ideaId = self.request('idea_id')
        limit = int(self.request('n_limit')) if self.request('n_limit') else 5
        relatedProjects = []
        citywideProjects = []
        kw = []
        isLocationOnlyMatch = False
        
        if (not ideaId):
            log.error("No idea id")
        else: 
            idea = mIdea.Idea(self.db, ideaId)
        
            if (idea):
                kw = mKeywords.getKeywords(self.db, idea.description)
                
                if (idea.locationId != -1):
                    relatedProjects = mProject.searchProjects(self.db, kw, idea.locationId, limit)
                    
                    if (len(relatedProjects) == 0):
                        isLocationOnlyMatch = True
                        relatedProjects = mProject.searchProjects(self.db, [], idea.locationId, limit)
                    
                citywideProjects = mProject.searchProjects(self.db, kw, -1, limit)
            else:
                log.error("No idea found for id = %s" % ideaId)
            
        obj = dict(is_location_only_match = isLocationOnlyMatch, related = relatedProjects, citywide = citywideProjects, search_terms = ','.join(kw))
            
        return self.json(obj)
        

    