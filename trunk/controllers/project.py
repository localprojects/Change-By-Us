from framework.controller import *
import framework.util as util
import giveaminute.project as mProject
import giveaminute.idea as mIdea

class Project(Controller):
    def GET(self, action=None, param0=None):
        self.template_data['project_user'] = dict(is_member = True,
                                                is_project_admin = True)          
                                          
        return self.showProject(action)                                        
            
    def POST(self, action=None, page=None):
        if (action == 'join'):
            return self.join()
        elif (action == 'endorse'):
            return self.endorse()
        else:
            return self.not_found()
        
    def showProject(self, projectId):
        if (not projectId or projectId == -1):
            projDictionary = mProject.getTestData()
        else:
            project = mProject.Project(self.db, projectId)
            
            projDictionary = project.getFullDictionary()
        
        self.template_data['project'] = dict(json = self.json(projDictionary), data = projDictionary)
    
        return self.render('project')
        
    def join(self):
        projectId = self.request('project_id')
        description = self.request('message')
            
        if (not self.user):
            log.error("*** join submitted w/o logged in user")
            return False
        elif (not projectId):
            log.error("*** join submitted w/o logged in user")
            return False
        elif (util.strNullOrEmpty(description)):
            log.error("*** join submitted w/o idea")
            return False
        else:
            isJoined = mProject.join(self.db, projectId, self.user.id)
                    
            if (isJoined):
                mIdea.createIdea(self.db, 
                            description, 
                            mProject.getProjectLocation(self.db, projectId).location_id,
                            'web',
                            self.user.id,
                            self.user.email)
            return isJoined                        
            
    def endorse(self):
        projectId = self.request('project_id')
        
        if (not self.user or not self.user.isLeader):
            log.error("*** endorsement submitted w/o logged in user or with non-project leader user account")
            return False
        else:
            return mProject.endorse(self.db, projectId, self.user.id)
            
        