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
        
    def getAdminUsers(self):
        limit = util.try_f(int, self.request('n_users'), 10)
        offset = util.try_f(int, self.request('offset'), 0)
            
        return self.json(mUser.getAdminUsers(self.db, limit, offset))
        
    def deleteUser(self):
        userId = self.request('user_id')
        
        return mUser.deleteUser(self.db, userId)
        
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
        