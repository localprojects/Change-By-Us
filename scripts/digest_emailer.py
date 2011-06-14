#
# Get a list of posts for the day
# Send to the recipient list for this group
#
# 

import yaml
import os, sys
import boto

sys.path.append("..")
sys.path.append("..")

from framework.emailer import Emailer
from lib import web
from datetime import datetime
from dateutil.relativedelta import relativedelta

class Mailable():
    SESHandle = None
    SESSendQuota = None
    MailerSettings = {}

    def setupMailer(self, settings=None):
        self.MailerSettings['FromName']  = settings.get('from_name')
        self.MailerSettings['FromEmail'] = settings.get('from_email')

        print self.MailerSettings
        self.SESHandle = boto.connect_ses(
          aws_access_key_id     = settings.get('aws_ses').get('access_key_id'),
          aws_secret_access_key = settings.get('aws_ses').get('secret_access_key'))

        self.SESSendQuota = self.SESHandle.get_send_quota()["GetSendQuotaResponse"]["GetSendQuotaResult"]
        # Check if we're close to the smtp quota. 10 seems like a good number

        sentLast24Hours = self.SESSendQuota.get('SentLast24Hours')
        if sentLast24Hours is None:
            sentLast24Hours = 0
        sentLast24Hours = int(float(sentLast24Hours))
        max24HourSend = self.SESSendQuota.get('Max24HourSend')
        if max24HourSend is None:
            max24HourSend = 0
        max24HourSend = int(float(max24HourSend))
        if sentLast24Hours >= max24HourSend- 10:
            enable_smtp()

    def sendEmailMessage(self):
        pass


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

    def disconnectDB(self):
        if self.DBHandle is not None:
            self.DBHandle.close()

    def executeSQL(self, sql, params):
        return self.DBHandle.query(sql, params)

class GiveAMinuteDigest(Configurable, WebpyDBConnectable, Mailable):
    def __init__(self, configFile=None):
        print "Will load from config file %s" % configFile
        # Connect to the mysql database based on the params from Config.yaml
        confs = self.loadConfigs(config_file=configFile)
        dbParams = confs.get('database')
        self.setupMailer(settings=confs.get('email'))
        self.connectDB(dbParams)

    # def __del__(self):
    #     self.disconnectDB()
        
    # Publicly visible functions

    def getRecentMessages(self, projectId=None, fromDate=None, filterBy='member_comment'):
        """
        from: datetime of last digest
        """
        if fromDate is None:
            raise "Cannot continue wihthout an explicit FromDate!"

        sql = """
    select 
        pm.project_message_id,
        pm.project_id,
        pm.message_type,
        pm.message,
        pm.created_datetime,
        u.user_id,
        u.first_name,
        u.last_name,
        u.image_id,
        u.email,
        i.idea_id,
        i.description as idea_description,
        i.submission_type as idea_submission_type,
        i.created_datetime as idea_created_datetime
        from project_message pm
        inner join user u on u.user_id = pm.user_id
        left join idea i on i.idea_id = pm.idea_id
        where pm.project_id = $id and pm.is_active = 1
        and ($filterBy is null or pm.message_type = $filterBy)
        and pm.created_datetime > $fromDate
        order by pm.created_datetime desc
    """
        # TODO:
        # Should we be ordering/grouping by something other than the creationtime?

        # cursor = self.DBHandle.cursor()
        comments = self.executeSQL(sql, {'id':int(projectId), 'fromDate':fromDate, 'filterBy':filterBy})
        groups = {}
        for comment in comments:
            if not groups.get(comment.project_id):
                groups[comment.user_group_id] = []
            groups[comment.user_group_id].append(comment)
        
        if len(groups.keys()) == 0:
            return False

        return groups
 
    def getRecentUsers(self, fromDate=None):
        """
        from: datetime of last digest
        """

        if fromDate is None:
                        raise "Cannot continue wihthout an explicit FromDate!"

        sql = """
    select 
    u.user_id,
    u.first_name,
    u.last_name,
    u.image_id,
    u.email_notification,
    u.created_datetime,
    pu.project_id,
    from user u 
    join project__user pu on u.user_id = pu.user_id
    where u.created_datetime >= $fromDate
    order by p.project_id, u.created_datetime desc
    """
        users = self.executeSQL(sql, params = {'fromDate':fromDate})
        groups = {}
        for user in users:
            if not groups.get(user.user_group_id):
                groups[user.user_group_id] = []
            groups[user.user_group_id].append(user)

        return groups

    def getDataToCreateDigest(self, fromDate=None):
        # users_by_group = self.getRecentUsers(fromDate=fromDate)

        project_messages = {}
        projects = self.getProjects(fromDate=fromDate)
        for project in projects:
            projId = int(project.project_id)
            print "Will get messages for project %s" % projId
            messages_by_group = self.getRecentMessages(projectId=projId, fromDate=fromDate)
            
            if messages_by_group:
                if project_messages.get(projId) is None:
                    project_messages[projId] = []
                project_messages[projId].append(messages_by_group)

        return {'users': users_by_group, 'messages' : project_messages}

        # Uniquify the list
        # groups = dict((x[0], x) for x in groups).values()

        # Create the message
        # for group in groups:
        #    pass
            # Create the digest()

    def createDigest(self):
        fromDate = datetime.now() + relativedelta(days=-31)

        resp = self.getDataToCreateDigest(fromDate=fromDate)
        print resp.get('users')
        print resp.get('messages')

    def getProjects(self, fromDate=None):
        sql = """
        select distinct pm.project_id
        from project_message pm
        where pm.created_datetime > $fromDate
        and pm.message_type='member_comment'
        order by pm.project_id
        """
        projects = self.executeSQL(sql, params = {'fromDate':fromDate})
        return projects

    def sendDigestEmail(self, recipients=None, subject=None, body=None):
        # We can send the digest either via SES or SMTP, let's
        # do the quota-based detection
        print "MailerSettings: ..."
        print self.MailerSettings

        return Emailer.send(recipients,
                        subject,
                        body,
                        from_name = self.MailerSettings.get('FromName'),
                        from_address = self.MailerSettings.get('FromEmail'))


# End class definition

gamDigest = GiveAMinuteDigest(configFile="/Users/sundar/Projects/LP/gam2/branches/webpyUpgrade/config.yaml")
# gamDigest.sendDigestEmail(recipients=["cybertoast@gmail.com"], subject="Test", body="Test")
gamDigest.createDigest()
