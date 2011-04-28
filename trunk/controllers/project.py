from framework.controller import *
import framework.util as util
import giveaminute.project as mProject
import giveaminute.idea as mIdea
import giveaminute.projectResource as mProjectResource
import giveaminute.messaging as mMessaging
import json
import re

class Project(Controller):
    def GET(self, action=None, param0=None):
        if (action == 'resource'):
            if (param0 == 'info'):
                return self.getResourceInfo()
            else:
                return self.not_found()
        elif (action == 'resources'):
            if (param0 == 'related'):
                return self.getRelatedResources()
            else:
                return self.getResourcesAndLinks()
        elif (action == 'goals'):
            return self.getGoals()
        elif (action == 'messages'):
            return self.getMessages()
        elif (action == 'featured'):
            return self.getFeaturedProjects()
        elif (action == 'small'):
            return self.getProject()            
        else:
            return self.showProject(action)                                        
            
    def POST(self, action=None, param0=None):
        if (action == 'join'):
            return self.join()
        elif (action == 'endorse'):
            return self.endorse()
        elif (action == 'link'):
            if (param0 == 'add'):
                return self.addLink()
            elif (param0 == 'remove'):
                return self.removeLink()
            else:
                return self.not_found()
        elif (action == 'resource'):
            if (param0 == 'add'):
                return self.addResource()
            elif (param0 == 'remove'):
                return self.removeResource()                
            else:
                return self.not_found()
        elif (action == 'goal'):
            if (param0 == 'add'):
                return self.addGoal()
            elif (param0 == 'active'):
                return self.featureGoal()
            elif (param0 == 'accomplish'):
                return self.accomplishGoal()
            elif (param0 == 'remove'):
                return self.removeGoal()
            else:
                return self.not_found()
        elif (action == 'message'):
            if (param0 == 'add'):
                return self.addMessage()
            elif (param0 == 'remove'):
                return self.removeMessage()
            else:
                return self.not_found()
        elif (action == 'tag'):
            if (param0 == 'add'):
                return self.addKeywords()
            elif (param0 == 'remove'):
                return self.removeKeyword()
            else:
                return self.not_found()
        elif (action == 'invite'):
            return self.invite()
        elif (action == 'leave'):
            return self.leaveProject()
        elif (action == 'user'):
            if (param0 == 'remove'):
                return self.removeUser()
            else:
                return self.not_found()
        elif (action == 'photo'):
            return self.updateImage()
        elif (action == 'description'):
            return self.updateDescription()
        else:
            return self.not_found()
        
    def showProject(self, projectId):
        if (not projectId or projectId == -1):
            projDictionary = mProject.getTestData()
        else:
            project = mProject.Project(self.db, projectId)
            
            projDictionary = project.getFullDictionary()
            
        project_user = self.getProjectUser(projectId)  
        self.template_data['project_user'] = dict(data = project_user, json = json.dumps(project_user))
        
        self.template_data['project'] = dict(json = json.dumps(projDictionary), data = projDictionary)
    
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
                project = mProject.Project(self.db, projectId)
            
                # create the user's "hello there" idea and add to project
                newIdeaId = mIdea.createIdea(self.db, 
                                            description, 
                                            project.data.location_id,
                                            'web',
                                            self.user.id,
                                            self.user.email)
                                            
                if (newIdeaId):
                    if (not mIdea.addIdeaToProject(self.db, newIdeaId, projectId)):
                        log.error("*** new idea not created for user %s on joining project %s" % (self.user.id, projectId))
                else:
                    log.error("*** new idea not created for user %s on joining project %s" % (self.user.id, projectId))
                
                # automatically insert any ideas attached to invites for this user and this project    
                if (not mIdea.addInvitedIdeaToProject(self.db, projectId, self.user.id)):
                    log.error("*** couldn't add invited idea to project for user %s on joining project %s" % (self.user.id, projectId))
                
                # add a message to the queue about the join
                message = 'New Member! Your group now has %s total!' % project.data.num_members
                
                # email admin
                if (not mMessaging.emailProjectJoin(project.data.owner_email, 
                                                    projectId, 
                                                    project.data.title, 
                                                    self.user.id, 
                                                    mProject.userName(self.user.firstName, self.user.lastName))):
                    log.error("*** couldn't email admin on user_id = %s joining project %s" % (self.user.id, projectId))
                
                if (not mProject.addMessage(self.db, 
                                            projectId, 
                                            message, 
                                            'join', 
                                            self.user.id, 
                                            newIdeaId)):
                    log.error("*** new message not created for user %s on joining project %s" % (self.user.id, projectId))
                
        return isJoined
    
    def invite(self):
        projectId = self.request('project_id')
        ideaId = self.request('idea_id')
        emails = self.request('email_list')
        message = self.request('message')
        
        if (not self.user):
            log.error("*** invite w/o logged in user")
            return False
        elif (not projectId):
            log.error("***invite w/o project id")
            return False
        else:
            if (ideaId):
                return mProject.inviteByIdea(self.db, projectId, ideaId, message, self.user)
            elif (emails):
                return mProject.inviteByEmail(self.db, projectId, emails.split(','), message, self.user)
            else:
                log.error("*** invite w/o idea or email")
                return False
        
            
    def endorse(self):
        projectId = self.request('project_id')
        
        if (not self.user or not self.user.isLeader):
            log.error("*** endorsement submitted w/o logged in user or with non-project leader user account")
            return False
        else:
            isEndorsed = mProject.endorse(self.db, projectId, self.user.id)
            
            if (isEndorsed):
                # TODO do we need to get the whole project here?
                project = mProject.Project(self.db, projectId)
            
                # email admin
                if (not mMessaging.emailProjectEndorsement(project.data.owner_email, 
                                                    project.data.title, 
                                                    "%s %s" % (self.user.firstName, self.user.lastName))):
                    log.error("*** couldn't email admin on user_id = %s endorsing project %s" % (self.user.id, projectId))
            
                # add a message to the queue about the join
                message = 'Congratulations! Your group has now been endorsed by %s %s.' % (self.user.firstName, self.user.lastName)
                
                if (not mProject.addMessage(self.db, 
                                            projectId, 
                                            message, 
                                            'endorsement', 
                                            self.user.id)):
                    log.error("*** new message not created for user %s on endorsing project %s" % (self.user.id, projectId))
            
            return isEndorsed
         
    def addLink(self):
        projectId = self.request('project_id')
        title = self.request('title')
        url = self.request('url')
        
        if (not projectId or util.strNullOrEmpty(title) or util.strNullOrEmpty(url)):
            log.error("*** link submitted w/o id, title, or url")
            return False
        else:
            return mProject.addLinkToProject(self.db, projectId, title, util.makeUrlAbsolute(url))
            
    def removeLink(self):
        projectId = self.request('project_id')
        linkId = self.request('link_id')
        
        if (not linkId):
            log.error("*** link removal submitted missing an id")
            return False            
        else:        
            if (not self.user.isAdmin and 
                not self.user.isModerator and
                not self.user.isProjectAdmin(projectId)):
                log.warning("*** unauthorized link removal attempt by user_id = %s" % self.user.id)
                return False
            else:
                return mProject.setLinkIsActive(self.db, linkId, 0)
        
        
    def addResource(self):
        projectId = self.request('project_id')
        projectResourceId = self.request('project_resource_id')
        
        if (not projectId or not projectResourceId):
            log.error("*** resource submitted missing an id")
            return False
        else:
            if (mProject.addResourceToProject(self.db, projectId, projectResourceId)):
                # TODO do we need to get the whole project here?    
                project = mProject.Project(self.db, projectId)
                res = mProjectResource.ProjectResource(self.db, projectResourceId)
                
                if (not mMessaging.emailResourceNotification(res.data.contact_email, projectId, project.data.title, project.data.description, res.data.title)):
                    log.error("*** couldn't email resource id %s" % projectResourceId)
            else:
                log.error("*** couldn't add resource %s to project %s" % (projectResourceId, projectId))
                return False
            
    def removeResource(self):
        projectId = self.request('project_id')
        projectResourceId = self.request('project_resource_id')
        
        if (not projectId or not projectResourceId):
            log.error("*** resource removal submitted missing an id")
            return False            
        else:        
            if (not self.user.isAdmin and 
                not self.user.isModerator and
                not self.user.isProjectAdmin(projectId)):
                log.warning("*** unauthorized resource removal attempt by user_id = %s" % self.user.id)
                return False
            else:
                return mProject.removeResourceFromProject(self.db, projectId, projectResourceId)
                
        
    def getResourceInfo(self):
        projectResourceId = self.request('project_resource_id')
        info = None
        resource = mProjectResource.ProjectResource(self.db, projectResourceId)
        
        if (resource.data):
            info = self.json(resource.getFullDictionary())
        
        return info
        
    def getResourcesAndLinks(self):
        projectId = self.request('project_id')
        
        data = dict(links = mProject.getLinks(self.db, projectId),
                    resources = mProject.getResources(self.db, projectId))
        
        return self.json(data)
        
    def getRelatedResources(self):
        projectId = self.request('project_id')
        resources = []
        
        project = mProject.Project(self.db, projectId)
        
        keywords = project.data.keywords.split()
        locationId = project.data.location_id
                
        if (locationId and len(keywords) > 0):
            resources = mProjectResource.getProjectResources(self.db, keywords, locationId, projectId)
        elif (locationId):
            resources = mProjectResource.getProjectResourcesByLocation(self.db, locationId, projectId)
        elif (len(keywords) > 0):
            resources = mProjectResource.getProjectResourcesByKeywords(self.db, keywords, projectId)
        
        obj = dict(resources = resources)
        
        return self.json(obj)
        
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
            
    def removeGoal(self):
        projectGoalId = self.request('goal_id')
        
        if (not projectGoalId):
            log.error("*** goal remove attempted w/o goal id")
            return False              
        else:
            return mProject.removeProjectGoal(self.db, projectGoalId)                    
            
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
            
    def removeMessage(self):
        messageId = self.request('message_id')
        
        if (not messageId):
            log.error("*** message remove attempted w/o ids")
            return False        
        else:
            return mProject.removeMessage(self.db, messageId)
        
    def getMessages(self):
        projectId = self.request('project_id')
        limit = util.try_f(int, self.request('n_messages'), 10)
        offset = util.try_f(int, self.request('offset'), 0)
        filterBy = self.request('filter')
        
        return self.json(mProject.getMessages(self.db, projectId, limit, offset, filterBy))        
        
    def getFeaturedProjects(self):
        projects = []
        data = mProject.getFeaturedProjects(self.db)
        
        for item in data:
            projects.append(mProject.smallProject(item.project_id, 
                                            item.title, 
                                            item.description, 
                                            item.image_id, 
                                            item.num_members,
                                            item.owner_user_id, 
                                            item.owner_first_name, 
                                            item.owner_last_name, 
                                            item.owner_image_id))
        return self.json(projects)
            
        
    def getProject(self):
        projectId = self.request('project_id')
    
        project = mProject.Project(self.db, projectId)
        
        return mProject.smallProject(project.id, 
                                project.data.title, 
                                project.data.description, 
                                project.data.image_id, 
                                project.data.num_members,
                                project.data.owner_user_id, 
                                project.data.owner_first_name, 
                                project.data.owner_last_name, 
                                project.data.owner_image_id)
                  
    def addKeywords(self):
        projectId = self.request('project_id')
        keywords = self.request('text')
                
        if (projectId and keywords):
            return mProject.addKeywords(self.db, projectId, keywords.split(','))        
        else:
            log.error("*** add keyword attempted w/o project id or keywords")
            return False
      
    def removeKeyword(self):
        projectId = self.request('project_id')
        keyword = self.request('text')
        
        return mProject.removeKeyword(self.db, projectId, keyword)             
        
    def leaveProject(self):
        userId = self.session.user_id
        projectId = self.request('project_id')
        
        return mProject.removeUserFromProject(self.db, projectId, userId)
    
    def removeUser(self):
        projectId = self.request('project_id')
        userId = self.request('user_id')
        
        return mProject.removeUserFromProject(self.db, projectId, userId)    
        
    def updateImage(self):
        projectId = self.request('project_id')
        imageId = self.request('image_id')
        
        return mProject.updateProjectImage(self.db, projectId, imageId)
        
    def updateDescription(self):
        projectId = self.request('project_id')
        description = self.request('text')
        
        return mProject.updateProjectDescription(self.db, projectId, description)
            