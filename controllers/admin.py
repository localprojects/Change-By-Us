from framework.controller import *
import framework.util as util
import giveaminute.user as mUser
import giveaminute.idea as mIdea
import giveaminute.project as mProject

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
        elif (action == 'metrics'):
            if (param0 == 'csv'):
                if (param1 == 'tags'):
                    return self.getTagsCSV()
                elif (param1 == 'project'):
                    return self.getProjectCSV()
                elif (param1 == 'user'):
                    return self.getUserCSV()
                elif (param1 == 'location'):
                    return self.getLocationCSV()
                else:
                    return self.not_found()
            else:            
                return self.getBasicMetrics()
        else:
            return self.not_found()                   
            
    def POST(self, action = None, param0 = None, param1 = None):
        self.require_login("/login", True)
    
        if (action == 'user'):
            if (param0 == 'add'):
                return self.addUser()
            elif (param0 == 'delete'):
                return self.deleteItem('user', self.request('user_id'))
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
                return self.deleteItem('project', self.request('project_id'))
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
        else:
            return self.not_found()
            
    def showAdmin(self):
        # first page of admin
        users = mUser.getAdminUsers(self.db, 10, 0)
        
        # blacklist/graylist
        words = self.getBadwords()
        
        self.template_data['users'] = dict(data = users, json = self.json(users))
        self.template_data['words'] = dict(data = words, json = self.json(words))
        
        return self.render('cms_adminsettings')
        
        
    def showContent(self):
        featuredProjects = []
        
        data = mProject.getFeaturedProjectsWithStats(self.db)
        
        for item in data:
            featuredProjects.append(dict(project_id = item.project_id,
                                        title = item.title,
                                        description = item.description,
                                        image_id = item.image_id,
                                        num_members = item.num_members,
                                        owner = mProject.smallUser(item.owner_user_id, item.owner_first_name, item.owner_last_name, item.owner_image_id),
                                        num_ideas = item.num_ideas,
                                        num_resources = item.num_project_resources,
                                        num_endorsements = item.num_endorsements,
                                        featured_datetime = str(item.featured_datetime)))
        
        self.template_data['featured_projects'] = dict(data = featuredProjects, json = self.json(featuredProjects))
    
        return self.render('cms_content')
        
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
        
    # BEGIN metrics methods
    def getBasicMetrics(self):
        data = dict(overall = dict(num_users = 100,
                                   num_projects = 67,
                                   num_ideas = 987,
                                   num_resources = 82,
                                   num_avg_users_per_project = 15,
                                   num_avg_ideas_per_day = 38),
                    tags = dict(num_total = 135,
                                top = [dict(word = "trees", num_projects = 50, num_resources = 12),
                                       dict(word = "recycling", num_projects = 48, num_resources = 11),
                                       dict(word = "bicycle", num_projects = 30, num_resources = 10),
                                       dict(word = "solar", num_projects = 25, num_resources = 10),
                                       dict(word = "green", num_projects = 21, num_resources = 10),
                                       dict(word = "water", num_projects = 19, num_resources = 8)]))
        return data        
                
    def getTagsCSV(self):
        return self.csv("tag,data", "change_by_us.tags.csv")

    def getProjectCSV(self):
        return self.csv("project,data", "change_by_us.project.csv")

    def getUserCSV(self):
        return self.csv("user,data", "change_by_us.user.csv")

    def getLocationCSV(self):
        return self.csv("location,data", "change_by_us.location.csv")
    # END metrics methods
    
    def getAdminUsers(self):
        limit = util.try_f(int, self.request('n_users'), 10)
        offset = util.try_f(int, self.request('offset'), 0)
            
        return self.json(mUser.getAdminUsers(self.db, limit, offset))
        
    def setUserGroup(self):
        userId = self.request('user_id')
        userGroupId = self.request('role')
        
        return mUser.setUserGroup(self.db, userId, userGroupId)
        
    def setUserOncall(self):
        userId = self.request('user_id')
        isOncall = self.request('is_oncall')
    
        return mUser.setUserOncallStatus(self.db, userId, isOncall)
    
    def addUser(self):
        firstName = self.request('f_name')
        lastName = self.request('l_name')
        email = self.request('email')
        password = self.request('password')    
        userGroupId = self.request('role')
        
        if (util.strNullOrEmpty(firstName)): 
            log.error("*** cms user submitted with no first name")
            return False
        elif (util.strNullOrEmpty(lastName)): 
            log.error("*** cms user submitted with no last name")
            return False
        elif (util.strNullOrEmpty(email)or not util.validate_email(email)): 
            log.error("*** cms user submitted with invalid email")
            return False
        elif (util.strNullOrEmpty(password)): 
            log.error("*** cms user submitted with no password")
            return False
        elif (util.strNullOrEmpty(userGroupId)):
            log.error("*** cms user submitted with no role")
            return False
        else:
            userId = mUser.createUser(self.db, email, password, firstName, lastName)
            
            # do we want to attach ideas to cms users?
            mIdea.attachIdeasByEmail(self.db, email)

            mUser.assignUserToGroup(self.db, userId, userGroupId)

            return userId

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
        