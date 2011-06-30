from framework.controller import *
import framework.util as util
import giveaminute.user as mUser
import giveaminute.idea as mIdea
import giveaminute.project as mProject
import giveaminute.metrics as mMetrics
import giveaminute.projectResource as mProjectResource
import giveaminute.messaging as mMessaging
import json

class Admin(Controller):
    def GET(self, action = None, param0 = None, param1 = None):
        self.require_login("/login", True)
            
        if (action == 'admin'):
            return self.showAdmin()
        elif (action == 'content'):
            return self.showContent()
        elif (action == 'users'):
            return self.getAdminUsers()
        elif (action == 'all'):
            if (param0 == 'getflagged'):
                if (param1 == 'counts'):
                    return self.getFlaggedItemCounts()
                else:
                    # TODO: eholda
                    # this is temporary until we decide how aggregate view will work
                    return self.getFlaggedIdeas()
            else:
                return self.not_found()
        elif (action == 'project'):
            if (param0 == 'getflagged'):
                return self.getFlaggedProjects()
            else:
                return self.not_found()
        elif (action == 'idea'):
            if (param0 == 'getflagged'):
                return self.getFlaggedIdeas()
            else:
                return self.not_found()
        elif (action == 'message'):
            if (param0 == 'getflagged'):
                return self.getFlaggedMessages()
            else:
                return self.not_found()
        elif (action == 'goal'):
            if (param0 == 'getflagged'):
                return self.getFlaggedGoals()
            else:
                return self.not_found()
        elif (action == 'link'):
            if (param0 == 'getflagged'):
                return self.getFlaggedLinks()
            else:
                return self.not_found()
        elif (action == 'resource'):
            if (param0 == 'getunreviewed'):
                return self.getUnreviewedResources()
            else:
                return self.not_found()
        elif (action == 'metrics'):
            return self.getBasicMetrics()
        elif (action == 'csv'):
            if (param0 == 'metrics'):
                if (param1 == 'keywords'):
                    return self.getTagsCSV()
                elif (param1 == 'project'):
                    return self.getProjectCSV()
                elif (param1 == 'resource'):
                    return self.getResourceCSV()
                elif (param1 == 'user'):
                    return self.getUserCSV()
                elif (param1 == 'location'):
                    return self.getLocationCSV()
                else:
                    return self.not_found()
            elif (param0 == 'site'):
                if (param1 == 'feedback'):
                    return self.getSiteFeedbackCSV()
                elif (param1 == 'betarequests'):
                    return self.getBetaRequestsCSV()
                else:
                    return self.not_found()
            else:
                return self.not_found()
        else:
            return self.not_found()                   
            
    def POST(self, action = None, param0 = None, param1 = None):
        self.require_login("/login", True)
    
        if (action == 'user'):
            if (param0 == 'add'):
                return self.addUser()
            elif (param0 == 'delete'):
                return self.deleteUser()
            elif (param0 == 'setrole'):
                return self.setUserGroup()
            elif (param0 == 'oncall'):
                return self.setUserOncall()
            else:
                return self.not_found()
        elif (action == 'blacklist'):
            return self.updateBlacklist()
        elif (action == 'idea'):
            if (param0 == 'delete'):
                return self.deleteItem('idea', self.request('idea_id'))
            elif (param0 == 'approve'):
                return self.approveItem('idea', self.request('idea_id'))
            else:
                return self.not_found()
        elif (action == 'project'):
            if (param0 == 'delete'):
                return self.deleteProject()
            elif (param0 == 'approve'):
                return self.approveItem('project', self.request('project_id'))
            elif (param0 == 'feature'):
                if (param1 == 'delete'):
                    return self.unfeatureProject()
                else:
                    return self.featureProject()
            else:
                return self.not_found()
        elif (action == 'message'):
            if (param0 == 'delete'):
                return self.deleteItem('project_message', self.request('message_id'))
            elif (param0 == 'approve'):
                return self.approveItem('project_message', self.request('message_id'))                
            else:
                return self.not_found()
        elif (action == 'goal'):
            if (param0 == 'delete'):
                return self.deleteItem('project_goal', self.request('goal_id'))
            elif (param0 == 'approve'):
                return self.approveItem('project_goal', self.request('goal_id'))
            else:
                return self.not_found()
        elif (action == 'link'):
            if (param0 == 'delete'):
                return self.deleteItem('project_link', self.request('link_id')) 
            elif (param0 == 'approve'):
                return self.approveItem('project_link', self.request('link_id'))                
            else:
                return self.not_found()
        elif (action == 'resource'):
            if (param0 == 'delete'):
                return self.deleteItem('project_resource', self.request('resource_id'))
            elif (param0 == 'approve'):
                return self.approveProjectResource()
            else:
                return self.not_found()
        else:
            return self.not_found()
            
    def showAdmin(self):
        # first page of admin
        users = mUser.getAdminUsers(self.db, 10, 0)
        
        # blacklist/graylist
        words = self.getBadwords()
        
        self.template_data['users'] = dict(data = users, json = json.dumps(users))
        self.template_data['words'] = dict(data = words, json = json.dumps(words))
        
        return self.render('cms_adminsettings')
        
        
    def showContent(self):
        featuredProjects = mProject.getFeaturedProjectsDictionary(self.db)
        
        self.template_data['featured_projects'] = dict(data = featuredProjects, json = json.dumps(featuredProjects))
    
        return self.render('cms_content')
    
    def deleteProject(self):
        projectId = self.request('project_id')
        
        isDeleted = self.deleteItem('project', projectId)
        
        if (isDeleted):
            self.db.delete('featured_project', where="project_id = $id", vars = {'id':projectId})
            
        return isDeleted
        
    def featureProject(self):
        featuredProjectId = self.request('project_id')
        unfeaturedProjectId = self.request('replace_project_id')
        
        if (not featuredProjectId):
            log.error("*** feature project submitted w/o project id")
            return False   
        else:
            if (unfeaturedProjectId):
                ordinal = mProject.unfeatureProject(self.db, unfeaturedProjectId)
            else:
                ordinal = None
            
            return mProject.featureProject(self.db, featuredProjectId, ordinal)
        
    def unfeatureProject(self):
        unfeaturedProjectId = self.request('project_id')
        
        if (not unfeaturedProjectId):
            log.error("*** unfeature project submitted w/o project id")
            return False            
        else:
            return mProject.unfeatureProject(self.db, unfeaturedProjectId)
        
    def getFlaggedProjects(self):
        sql = """select p.title as project_title, 
                         p.project_id,
                         'project' as item_type,
                         p.project_id as item_id,
                         p.description as item_description,
                         cast(p.created_datetime as char) as item_created_datetime,
                         u.first_name as owner_first_name,
                         u.last_name as owner_last_name,
                         u.user_id as owner_user_id
                  from project p
                  left join project__user pu on pu.project_id = p.project_id and pu.is_project_admin
                  left join user u on u.user_id = pu.user_id
                  where p.is_active = 1 and p.num_flags > 0
                  order by p.created_datetime desc
                limit $limit offset $offset"""
                
        return self.getFlaggedItems(sql)
        
    def getFlaggedIdeas(self):
        sql = """select null as project_title, 
                         null as project_id,
                         'idea' as item_type,
                         i.idea_id as item_id,
                         i.description as item_description,
                         cast(i.created_datetime as char) as item_created_datetime,
                         u.first_name as owner_first_name,
                         u.last_name as owner_last_name,
                         u.user_id as owner_user_id
                  from idea i
                  left join user u on u.user_id = i.user_id
                  where i.is_active = 1 and i.num_flags > 0
                  order by i.created_datetime desc
                  limit $limit offset $offset"""
                  
        return self.getFlaggedItems(sql)

    def getFlaggedMessages(self):
        sql = """select p.title as project_title, 
                         p.project_id,
                         'message' as item_type,
                         pm.project_id as item_id,
                         pm.message as item_description,
                         cast(pm.created_datetime as char) as item_created_datetime,
                         u.first_name as owner_first_name,
                         u.last_name as owner_last_name,
                         u.user_id as owner_user_id
                  from project_message pm
                  inner join project p on pm.project_id = p.project_id
                  inner join user u on u.user_id = pm.user_id
                  where pm.is_active = 1 and pm.num_flags > 0
                  order by pm.created_datetime desc
                  limit $limit offset $offset"""
                  
        return self.getFlaggedItems(sql)

        
    def getFlaggedGoals(self):
        sql = """select p.title as project_title, 
                         p.project_id,
                         'goal' as item_type,
                         pg.project_goal_id as item_id,
                         pg.description as item_description,
                         cast(pg.created_datetime as char) as item_created_datetime,
                         u.first_name as owner_first_name,
                         u.last_name as owner_last_name,
                         u.user_id as owner_user_id
                  from project_goal pg
                  inner join project p on pg.project_id = p.project_id
                  inner join user u on u.user_id = pg.user_id
                  where pg.is_active = 1 and pg.num_flags > 0
                  order by pg.created_datetime desc
                  limit $limit offset $offset"""
                  
        return self.getFlaggedItems(sql)

    def getFlaggedLinks(self):
        sql = """select p.title as project_title, 
                         p.project_id,
                         'link' as item_type,
                         pl.project_link_id as item_id,
                         concat(pl.title, ': ', pl.url) as item_description,
                         cast(pl.created_datetime as char) as item_created_datetime,
                         u.first_name as owner_first_name,
                         u.last_name as owner_last_name,
                         u.user_id as owner_user_id
                  from project_link pl
                  inner join project p on pl.project_id = p.project_id
                  left join project__user pu on pu.project_id = p.project_id and pu.is_project_admin
                  left join user u on u.user_id = pu.user_id
                  where pl.is_active = 1 and pl.num_flags > 0
                  limit $limit offset $offset"""
                  
        return self.getFlaggedItems(sql)
        
    def getFlaggedItems(self, sql):
        limit = util.try_f(int, self.request('n_limit'), 10)
        offset = util.try_f(int, self.request('offset'), 0)
        data = []
        
        try:
            data = list(self.db.query(sql, {'limit':limit, 'offset':offset}))
        except Exception, e:
            log.info("*** problem getting flagged items")
            log.error(e)
            
        return self.json(data)
        
    def getFlaggedItemCounts(self):
        obj = None
    
        sql = """select 'projects' as flagged_item,
                          count(p.project_id) as num
                  from project p
                  where p.is_active = 1 and p.num_flags > 0
                  union
                  select 'ideas' as flagged_item,
                         count(i.idea_id) as num
                  from idea i
                  where i.is_active = 1 and i.num_flags > 0
                  union
                  select 'messages' as flagged_item,
                         count(pm.project_message_id) as num
                  from project_message pm
                  inner join project p on pm.project_id = p.project_id
                  inner join user u on u.user_id = pm.user_id
                  where pm.is_active = 1 and pm.num_flags > 0
                  union
                  select 'goals' as flagged_item,
                         count(pg.project_goal_id) as num
                  from project_goal pg
                  inner join project p on pg.project_id = p.project_id
                  inner join user u on u.user_id = pg.user_id
                  where pg.is_active = 1 and pg.num_flags > 0
                  union
                  select 'links' as flagged_item,
                         count(pl.project_link_id) as num
                  from project_link pl
                  inner join project p on pl.project_id = p.project_id
                  where pl.is_active = 1 and pl.num_flags > 0"""
                  
        try:
            data = list(self.db.query(sql))
            
            obj = dict(flagged_items = dict((item.flagged_item, item.num) for item in data))
        except Exception, e:
            log.info("*** couldn't get flagged item counts")
            log.error(e)
        
        return self.json(obj)

        
    def getUnreviewedResources(self):
        limit = util.try_f(int, self.request('n_limit'), 10)
        offset = util.try_f(int, self.request('offset'), 0)
        
        return self.json(mProjectResource.getUnreviewedProjectResources(self.db, limit, offset))
        
    # BEGIN metrics methods
    def getBasicMetrics(self):
        numbers = mMetrics.getCounts(self.db)
        kwUsage = mMetrics.getKeywordUsage(self.db, 6, 0)
        kwNum = mMetrics.getNumKeywords(self.db)
    
        data = dict(overall = numbers,
                    tags = dict(num_total = kwNum,
                                top = kwUsage))
        return self.json(data)        
                
    def getTagsCSV(self):
        data = mMetrics.getKeywordUsage(self.db, 1000, 0)
        csv = []
        
        csv.append('"WORD","TOTAL","PROJECTS","RESOURCES"')
        
        for item in data:
            csv.append('"%s","%s","%s","%s"' % (item.word, str(item.num_projects + item.num_resources), item.num_projects, item.num_resources))
        
        return self.csv('\n'.join(csv), "change_by_us.tags.csv")

    def getProjectCSV(self):
        data = mMetrics.getProjectCounts(self.db)
        csv = []
        
        csv.append('"PROJECT","USERS","IDEAS","RESOURCES","ENDORSEMENTS","KEYWORDS"')
        
        for item in data:
            csv.append('"%s","%s","%s","%s","%s","%s"' % (item.title, item.num_users, item.num_ideas, item.num_resources, item.num_endorsements, len(item.keywords.split())))
        
        return self.csv('\n'.join(csv), "change_by_us.project.csv")
        
    def getResourceCSV(self):
        data = mMetrics.getResourceCounts(self.db)
        csv = []
        
        csv.append('"RESOURCE","DETAIL","NUM PROJECTS ADDED","DATE CREATED"')
        
        for item in data:
            csv.append('"%s","%s","%s","%s"' % (item.title, item.description, item.project_count, item.created_datetime))
        
        return self.csv('\n'.join(csv), "change_by_us.resource.csv")

    def getUserCSV(self):
        data = mMetrics.getUserCounts(self.db)
        csv = []
        
        csv.append('"LAST NAME","FIRST NAME","EMAIL","PROJECTS JOINED","DATE JOINED"')
        
        for item in data:
            csv.append('"%s","%s","%s","%s","%s"' % (item.last_name, item.first_name, item.email, item.num_projects, item.created_datetime))
            
        return self.csv('\n'.join(csv), "change_by_us.user.csv")

    def getLocationCSV(self):
        data = mMetrics.getLocationCounts(self.db)
        csv = []
        
        csv.append('"LOCATION","BOROUGH","PROJECTS","IDEAS","RESOURCES"')
        
        for item in data:
            csv.append('"%s","%s","%s","%s","%s"' % (item.name, item.borough, item.num_projects, item.num_ideas, item.num_resources))            
        
        return self.csv('\n'.join(csv), "change_by_us.location.csv")

    def getSiteFeedbackCSV(self):
        csv = []
        
        csv.append('"ID","NAME","EMAIL","COMMENT","TYPE","TIMESTAMP"')
        
        try:
            sql = "select site_feedback_id, submitter_name, submitter_email, comment, feedback_type, created_datetime from site_feedback order by site_feedback_id"
            data = list(self.db.query(sql))
        
            for item in data:
                csv.append('"%s","%s","%s","%s","%s","%s"' % (item.site_feedback_id, item.submitter_name, item.submitter_email, item.comment, item.feedback_type, str(item.created_datetime))) 
        except Exception, e:
            log.info("*** there was a problem getting site feedback")
            log.error(e)
        
        return self.csv('\n'.join(csv), "change_by_us.feedback.csv")
        
    def getBetaRequestsCSV(self):
        csv = []
        
        csv.append('"EMAIL","TIMESTAMP"')
        
        try:
            sql = "select email, created_datetime from beta_invite_request order by created_datetime"
            data = list(self.db.query(sql))
        
            for item in data:
                csv.append('"%s","%s"' % (item.email, str(item.created_datetime))) 
        except Exception, e:
            log.info("*** there was a problem getting beta invite requests")
            log.error(e)
        
        return self.csv('\n'.join(csv), "change_by_us.beta_invite_requests.csv")
    # END metrics methods
    
    def getAdminUsers(self):
        limit = util.try_f(int, self.request('n_users'), 10)
        offset = util.try_f(int, self.request('offset'), 0)
            
        return self.json(mUser.getAdminUsers(self.db, limit, offset))
        
    def setUserGroup(self):
        userId = self.request('user_id')
        userGroupId = self.request('role')
        
        return mUser.assignUserToGroup(self.db, userId, userGroupId)
        
    def setUserOncall(self):
        userId = self.request('user_id')
        isOncall = self.request('is_oncall')
    
        return mUser.setUserOncallStatus(self.db, userId, isOncall)
    
    def addUser(self):
        firstName = self.request('f_name')
        lastName = self.request('l_name')
        email = self.request('email')
        password = self.request('password')    
        userGroupId = util.try_f(int, self.request('role'))
        affiliation = self.request('affiliation')
        
        if (util.strNullOrEmpty(email)or not util.validate_email(email)): 
            log.error("*** cms user submitted with invalid email")
            return False
        elif (util.strNullOrEmpty(password)): 
            log.error("*** cms user submitted with no password")
            return False
        elif (not userGroupId):
            log.error("*** cms user submitted with no role")
            return False
        else:
            userId = mUser.createUser(self.db, email, password, firstName, lastName, affiliation = affiliation, isAdmin = (userGroupId == 1 or userGroupId == 3))
            
            # do we want to attach ideas to cms users?
            mIdea.attachIdeasByEmail(self.db, email)

            mUser.assignUserToGroup(self.db, userId, userGroupId)

            return userId
            
    def deleteUser(self):
        userId = self.request('user_id')
              
        if (self.deleteItem('user', userId)):
            self.removeUserFromAllProjects(userId)
            self.deleteProjectsByUser(userId)
            self.deleteItemsByUser('project_goal', userId)
            self.deleteItemsByUser('project_message', userId)
            self.deleteItemsByUser('idea', userId)
            
            # email deleted user
# TODO: temporarily commenting out because the only place this currently gets sent from is deletion of admins
#             u = mUser.User(self.db, userId)
#             
#             if (not mMessaging.emailAccountDeactivation(u.email)):
#                 log.error("*** couldn't email deleted user_id = %s" % userId)            
            
            return True
        else:
            log.error("*** couldn't delete user %s" % userId)
            return False

    def approveItem(self, table, id):
        if (not id):
            log.error("*** approve item attempted w/o id for table = %s" % table)
            return False
        else:
            return mProject.approveItem(self.db, table, id)
            
    def deleteItem(self, table, id):
        if (not id):
            log.error("*** delete item attempted w/o id for table = %s" % table)
            return False
        else:
            return mProject.deleteItem(self.db, table, id)

    def deleteItemsByUser(self, table, userId):
        if (not userId):
            log.error("*** delete items by user attempted w/o user_id for table = %s" % table)
            return False
        else:
            return mProject.deleteItemsByUser(self.db, table, userId)

    def deleteProjectsByUser(self, userId):
        if (not userId):
            log.error("*** delete projects by user attempted w/o user_id ")
            return False
        else:
            return mProject.deleteProjectsByUser(self.db, userId)
            
    def removeUserFromAllProjects(self, userId):
        if (not userId):
            log.error("*** remove user from projects attempted w/o user_id ")
            return False
        else:
            return mProject.removeUserFromAllProjects(self.db, userId)
            
    def approveProjectResource(self):
        projectResourceId = self.request('resource_id')
        isOfficial = bool(int(self.request('is_official')))

        if (not projectResourceId):
            log.error("*** attempted to approve resource w/o id")
            return False
        else:
            if mProjectResource.approveProjectResource(self.db, projectResourceId, isOfficial):
                resource = mProjectResource.ProjectResource(self.db, projectResourceId)
            
                mMessaging.emailResourceApproval(resource.data.contact_email, resource.data.title)
                
                if (resource.data.owner_email):
                    mMessaging.emailResourceApproval(resource.data.owner_email, resource.data.title)
                return True
            else:
                return False
                
           
    def updateBlacklist(self):
        blacklist = self.request('blacklist')
        graylist = self.request('graylist')
        
        try:
            #replace delimiters, strip whitespace
            newBlacklist = ' '.join([item.strip() for item in blacklist.split(',')])
            newGraylist = ' '.join([item.strip() for item in graylist.split(',')])
        
            self.db.update('badwords', where = "id = 1", 
                                kill_words = newBlacklist,
                                warn_words = newGraylist)
            return True
        except Exception, e:
            log.info("*** couldn't update blacklist")
            log.error(e)
            return False
        
    def getBadwords(self):
        words = dict(blacklist = '', graylist = '')
    
        try:
            sql = "select kill_words, warn_words from badwords where id = 1 limit 1"
            data = list(self.db.query(sql))
            
            if (len(data) > 0):
                words['blacklist'] = data[0].kill_words
                words['graylist'] = data[0].warn_words
        except Exception, e:
            log.info("*** couldn't get badwords")
            log.error(e)
            
        return words
        