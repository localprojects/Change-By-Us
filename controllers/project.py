from framework.controller import *
import framework.util as util
import giveaminute.project as mProject
import giveaminute.idea as mIdea
import giveaminute.projectResource as mProjectResource

class Project(Controller):
    def GET(self, action=None, param0=None):
        if (action == 'resource'):
            if (param0 == 'info'):
                return self.getResourceInfo()
            else:
                return self.not_found()
        elif (action == 'goals'):
            return self.getGoals()
        else:
            self.template_data['project_user'] = dict(is_member = True,
                                                is_project_admin = True)      
                                                
            return self.showProject(action)                                        
            
    def POST(self, action=None, param0=None):
        if (action == 'join'):
            return self.join()
        elif (action == 'endorse'):
            return self.endorse()
        elif (action == 'link'):
            if (param0 == 'add'):
                return self.addLink()
            else:
                return self.not_found()
        elif (action == 'resource'):
            if (param0 == 'add'):
                return self.addResource()
            else:
                return self.not_found()
        elif (action == 'goal'):
            if (param0 == 'add'):
                return self.addGoal()
            elif (param0 == 'active'):
                return self.featureGoal()
            elif (param0 == 'accomplish'):
                return self.accomplishGoal()
            else:
                return self.not_found()
        elif (action == 'message'):
            if (param0 == 'add'):
                return self.addMessage()
            else:
                return self.not_found()
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
            log.error("*** join submitted w/o logged project id")
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
            
    def addLink(self):
        projectId = self.request('project_id')
        title = self.request('title')
        url = self.request('url')
        
        if (not projectId or util.strNullOrEmpty(title) or util.strNullOrEmpty(url)):
            log.error("*** link submitted w/o id, title, or url")
            return False
        else:
            return mProject.addLinkToProject(self.db, projectId, title, url)
        
    def addResource(self):
        projectId = self.request('project_id')
        projectResourceId = self.request('project_resource_id')
        
        if (not projectId or not projectResourceId):
            log.error("*** resource submitted missing an id")
            return False
        else:
            return mProject.addResourceToProject(self.db, projectId, projectResourceId)
        
    def getResourceInfo(self):
        projectResourceId = self.request('project_resource_id')
        info = None
        resource = mProjectResource.ProjectResource(self.db, projectResourceId)
        
        if (resource.data):
            info = self.json(resource.getFullDictionary())
        
        return info
        
    def addGoal(self):
        projectId = self.request('project_id')
        description = self.request('text')
        timeframeNumber = self.request('timeframe_n')
        timeframeUnit = self.request('timeframe_unit')
        
        if (not self.user):
            log.error("*** goal submitted w/o logged in user")
            return False
        else:
            return mProject.addGoalToProject(self.db, projectId, description, timeframeNumber, timeframeUnit, self.user.id)
        
    def featureGoal(self):
        projectGoalId = self.request('goal_id')
        
        if (not projectGoalId):
            log.error("*** goal feature attempted w/o goal id")
            return False              
        else:
            return mProject.featureProjectGoal(self.db, projectGoalId)
        
    def accomplishGoal(self):
        projectGoalId = self.request('goal_id')
        
        if (not projectGoalId):
            log.error("*** goal accomplish attempted w/o goal id")
            return False              
        else:
            return mProject.accomplishProjectGoal(self.db, projectGoalId)        
            
    def getGoals(self):
        projectId = self.request('project_id')
        
        return self.json(mProject.getGoals(self.db, projectId))
        
    def addMessage(self):
        projectId = self.request('project_id')
        message = self.request('message')
        
        if (not projectGoalId):
            log.error("*** message add attempted w/o project id")
            return False
        elif (util.strNullOrEmpty(message)):
            log.error("*** message add attempted w/ no message")
            return False
        else:
            return mProject.addMessage(self.db, projectId, message, 'member_comment', self.user.id)
        
        
        
        
        
        
        
        
        
        