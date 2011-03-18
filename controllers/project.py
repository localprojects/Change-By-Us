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
            self.template_data['project_user'] = self.getProjectUser(action)  
                                                
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
        elif (action == 'invite'):
            return self.invite()
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
        
    def getProjectUser(self, projectId):
        projectUser = dict(is_project_admin = False, is_member = False)
        
        if (self.user):
            sql = "select is_project_admin from project__user where user_id = $userId and project_id = $projectId limit 1"
            data = list(self.db.query(sql, {'userId':self.user.id, 'projectId':projectId}))
            
            if (len(data)== 1):
                projectUser['is_member'] = True
                
                if (data[0].is_project_admin == 1):
                    projectUser['is_project_admin'] = True
                
        return projectUser
        
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
                newIdeaId = mIdea.createIdea(self.db, 
                                            description, 
                                            mProject.getProjectLocation(self.db, projectId).location_id,
                                            'web',
                                            self.user.id,
                                            self.user.email)
                                            
                if (newIdeaId):
                    mIdea.addIdeaToProject(self.db, newIdeaId, projectId)
                
        return isJoined                        
    
    def invite(self):
        projectId = self.request('project_id')
        ideaId = self.request('idea_id')
        emails = self.request('email_list')
        message = self.request('message')
        
        log.info("*** %s" % emails)
        
        if (not self.user):
            log.error("*** invite w/o logged in user")
            return False
        elif (not projectId):
            log.error("***invite w/o project id")
            return False
        elif (util.strNullOrEmpty(message)):
            log.error("*** invite submitted w/o message")
            return False        
        else:
            if (ideaId):
                return mProject.inviteByIdea(self.db, projectId, ideaId, message, self.user.id)
            elif (emails):
                return mProject.inviteByEmail(self.db, projectId, emails.split(','), message, self.user.id)
            else:
                log.error("*** invite w/o idea or email")
                return False
        
            
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
        userId = self.request('user_id')
        
        if (not self.user):
            log.error("*** goal submitted w/o logged in user")
            return False
        else:
            return mProject.addGoalToProject(self.db, projectId, description, timeframeNumber, timeframeUnit, userId)
        
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
        
        if (not projectId):
            log.error("*** message add attempted w/o project id")
            return False
        elif (util.strNullOrEmpty(message)):
            log.error("*** message add attempted w/ no message")
            return False
        else:
            return mProject.addMessage(self.db, projectId, message, 'member_comment', self.user.id)
        
        
        
        
        
        
        
        
        
        