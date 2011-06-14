#
# Get a list of posts for the day
# Send to the recipient list for this group
#
# 

import yaml
import os, sys
sys.path.append("../lib/")

import web
from datetime import datetime
from dateutil.relativedelta import relativedelta

class Configurable():
    def loadConfigs(self, config_file, section=None):
        if not os.path.exists(config_file):
            raise IOError("Could not open %s" % config_file)

        f = open(config_file)
        conf = yaml.load(f)
        f.close()
        if section:
            return conf.get(section)
        else:
            return conf
     
class WebpyDBConnectable():
    """
    Provide database connections stuff
    """

    DBHandle = None

    # Library functions (internal only)
    def connectDB(self, dbParams):
        self.DBHandle = web.database(dbn=dbParams.get('dbn'),user=dbParams.get('user'), pw=dbParams.get('password'), db=dbParams.get('db'), host=dbParams.get('host'))
        # self.DBHandle = web.db.connect( host=dbParams.get('host'), user=dbParams.get('user'), 
        #                                  passwd=dbParams.get('password'), db=dbParams.get('db') )

    def disconnectDB(self):
        if self.DBHandle is not None:
            self.DBHandle.close()

    def executeSQL(self, sql, params):
        return self.DBHandle.query(sql, params)

class GiveAMinuteDigest(Configurable, WebpyDBConnectable):
    def __init__(self, configFile=None):
        print "Will load from config file %s" % configFile
        # Connect to the mysql database based on the params from Config.yaml
        dbParams = self.loadConfigs(config_file=configFile, section='database')
        self.connectDB(dbParams)

    # def __del__(self):
    #     self.disconnectDB()
        
    # Publicly visible functions

    def getRecentMessages(self, projectId=None, fromDate=None, filterBy='member_comment'):
        """
        from: datetime of last digest
        """
        projectId = 6
        if fromDate is None:
            fromdate = 

        sql = """
    select 
        pm.project_message_id,
        pm.message_type,
        pm.message,
        pm.created_datetime,
        u.user_id,
        u.first_name,
        u.last_name,
        u.image_id,
        g.user_group_id,
        g.group_name,
        i.idea_id,
        i.description as idea_description,
        i.submission_type as idea_submission_type,
        i.created_datetime as idea_created_datetime
        from project_message pm
        inner join user u on u.user_id = pm.user_id
        join user__user_group ug on ug.user_id = u.user_id
        join user_group g on g.user_group_id = ug.user_group_id
        left join idea i on i.idea_id = pm.idea_id
        where pm.project_id = %(id)s and pm.is_active = 1
        and (%(filterBy)s is null or pm.message_type = %(filterBy)s)
        and i.created_datetime > %(from)s
        order by g.user_group_id, pm.created_datetime desc
    """

        # cursor = self.DBHandle.cursor()
        comments = self.executeSQL(sql, {'id':projectId, 'from':fromDate, 'filterBy':filterBy})
        groups = {}
        for comment in comments:
            if not groups.get(comment.user_group_id):
                groups[comment.user_group_id] = []
            groups[comment.user_group_id].append(comment)
        
        return groups
 
    def getRecentUsers(self, fromDate=None):
        """
        from: datetime of last digest
        """

        if fromDate is None:
            fromDate = datetime.now() + relativedelta(days=-1)

        sql = """
    select 
    u.user_id,
    u.first_name,
    u.last_name,
    u.image_id,
    u.created_datetime,
    g.user_group_id,
    g.group_name
    from user u 
    join user__user_group ug on ug.user_id = u.user_id
    join user_group g on g.user_group_id = ug.user_group_id
    where u.created_datetime >= $fromDate
    order by g.user_group_id, u.created_datetime desc
    """
        users = self.executeSQL(sql, params = {'fromDate':fromDate})
        groups = {}
        for user in users:
            if not groups.get(comment.user_group_id):
                groups[user.user_group_id] = []
            groups[user.user_group_id].append(user)

        return groups

    def getDataToCreateDigest(self, fromDate=None):
        users_by_group = self.getRecentUsers(fromDate=fromDate)

        projectmessages = {}
        projects = self.getProjects(fromDate=fromDate)
        for project in projects:
            messages_by_group = self.getRecentMessages(projectId=project, fromDate=fromDate)
            print messages_by_group
            
            project_messages[project].append(messages_by_group)

        # Uniquify the list
        groups = dict((x[0], x) for x in groups).values()

        # Create the message
        for group in groups:
            pass
            # Create the digest()

    def getProjects(self):
        sql = """
        select distinct pm.project_id
        from project_message pm
        where pm.created_datetime > $fromDate
        order by pm.project_id
        """
        projects = self.executeSQL(sql, params = {'fromDate':fromDate})
        return projects

# End class definition

gamDigest = GiveAMinuteDigest(configFile="/Users/sundar/Projects/LP/gam2/branches/webpyUpgrade/config.yaml")
gamDigest.getDataToCreateDigest()
