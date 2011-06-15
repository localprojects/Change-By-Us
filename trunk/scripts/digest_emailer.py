#
# Get a list of posts for the day
# Send to the recipient list for this group
#
# 

import yaml
import os, sys
import boto
from datetime import datetime
from dateutil.relativedelta import relativedelta

# Assuming we start in the scripts folder, we need
# to traverse up for everything in our project
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from framework.emailer import Emailer
from lib import web

def uniquify(seq):
    # f3() From http://www.peterbe.com/plog/uniqifiers-benchmark
    keys = {}
    for e in seq:
        keys[e] = 1
    return keys.keys()

def flatten(l, ltypes=(list, tuple)):
    '''
    Flatten a list of lists into a single list. Not as cool as ruby's flatten, but it works
    Thanks to: http://rightfootin.blogspot.com/2006/09/more-on-python-flatten.html
    '''

    ltype = type(l)
    l = list(l)
    i = 0
    while i < len(l):
        while isinstance(l[i], ltypes):
            if not l[i]:
                l.pop(i)
                i -= 1
                break
            else:
                l[i:i + 1] = l[i]
        i += 1
    return ltype(l)

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
    Config = None

    def __init__(self, configFile=None):
        print "Will load from config file %s" % configFile
        # Connect to the mysql database based on the params from Config.yaml
        self.Config = self.loadConfigs(config_file=configFile)
        dbParams = self.Config.get('database')
        self.setupMailer(settings=self.Config.get('email'))
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
                groups[comment.project_id] = []
            groups[int(comment.project_id)].append(comment)
        
        if len(groups.keys()) == 0:
            return False

        return groups
 
    def getRecentMembers(self, fromDate=None):
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
    pu.project_id
from user u 
join project__user as pu on u.user_id = pu.user_id
where u.created_datetime >= $fromDate
order by pu.project_id, u.created_datetime desc
"""
        members = self.executeSQL(sql, params = {'fromDate':fromDate})
        projects = {}
        for member in members:
            if not projects.get(member.project_id):
                projects[member.project_id] = []
            projects[int(member.project_id)].append(member)

        return projects

    def getProjectNotificationRecipients(self, projects=[]):
        """
        Get a list of all the members of a project who should receive digest emails
        This includes admins, who might not have "digest" notification set, but since
        they're project
        """

        sql = """
select
    u.user_id,
    u.first_name,
    u.last_name,
    u.image_id,
    u.email,
    u.email_notification,
    u.created_datetime,
    pu.project_id
from user u
    join project__user as pu on u.user_id = pu.user_id
    where pu.project_id in $projects
order by pu.project_id, u.created_datetime desc
"""
        # We have to map() because python is too stupid to deal with dynamic typecasting for
        members = self.executeSQL(sql, params = {'projects':projects})
        projects = {}
        for member in members:
            if not projects.get(member.project_id):
                projects[member.project_id] = []
            projects[int(member.project_id)].append(member.email)

        return projects

    def getDataToCreateDigest(self, fromDate=None):
        members_by_project = self.getRecentMembers(fromDate=fromDate)
        projects = [int(p.project_id) for p in self.getProjects(fromDate=fromDate)]
        projects.append([int(m) for m in members_by_project.keys()])
        projects = uniquify(flatten(projects))
        recipients_by_project = self.getProjectNotificationRecipients(projects)

        project_feed = {}
        for project in projects:
            projId = int(project)
            print "Will get messages and recipients for project %s" % projId

            if project_feed.get(projId) is None:
                project_feed[projId] = {}

            messages_by_project = self.getRecentMessages(projectId=projId, fromDate=fromDate)

            if members_by_project.get(projId) is not None:
                if project_feed[projId].get('members') is None:
                    project_feed[projId]['members'] = []
                project_feed[projId]['members'] = members_by_project.get(projId)
            
            if messages_by_project:
                if project_feed[projId].get('messages') is None:
                    project_feed[projId]['messages'] = []
                project_feed[projId]['messages'] = messages_by_project.get(projId)

            if project_feed[projId].get('recipients') is None:
                project_feed[projId]['recipients'] = []
            project_feed[projId]['recipients'] = recipients_by_project.get(projId)

        return project_feed


        # Create the message
        # for group in groups:
        #    pass
            # Create the digest()

    def createDigests(self):
        fromDate = datetime.now() + relativedelta(days=-31)
        
        resp = self.getDataToCreateDigest(fromDate=fromDate)
        base_url = self.Config.get('default_host')
        member_profile_url = "%s/member/#" % base_url
        digests = {}
        for projId in resp.keys():
            # Ignore all empty projects, and projects that have no recipients
            if ((resp[projId].get('members') is None or len(resp[projId].get('members')) == 0) and\
                (resp[projId].get('messages') is None or len(resp[projId].get('messages')) == 0)) or\
                resp[projId].get('recipients') is None or len(resp[projId].get('recipients')) == 0:
               continue
            
            # Initialize the digest data structure
            if digests.get(projId) is None:
                digests[projId] = {'members':[], 'messages':[], 'recipients': ""}
            
            digests[projId]['recipients'] = resp[projId].get('recipients')

            if resp[projId].get('members') is not None and len(resp[projId].get('members')) > 0:
                for user in resp[projId].get('members'):
                    username = (user.first_name + ' ' + user.last_name[1] + '.').title()
                    digests[projId]['members'].append("<a href='%s%s'>%s</a>" % (member_profile_url, user.user_id, username))
            
            if resp[projId].get('messages') is not None and len(resp[projId].get('messages')) > 0:
                for message in resp[projId].get('messages'):
                    digests[projId]['messages'].append(self._formatMemberMessage(message))

        return digests

    def _formatMemberMessage(self, message):
        """
        The idea is to have something that looks like:
            Dan M. on 3/23/11 at 10:09 AM
            "I think this is great, we should really do more though to organize the event on the 14th"
        """
        dt = message.created_datetime
        msgDate = '%s/%s/%s at %s:%02d %s' % (dt.month, dt.day, dt.year, (dt.hour % 12), dt.minute, 'AM' if dt.hour<12 else 'PM')
        msg_vars = { 'userName': message.first_name + ' ' + message.last_name,
                     'msgDate' : msgDate,
                     'msgText' : message.message
                    }
        resp = "%(userName)s on %(msgDate)s\n\"%(msgText)s\"" % msg_vars
        return resp

    def getProjects(self, fromDate=None):
        sql = """
select
    distinct pm.project_id
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
        return Emailer.send(recipients,
                        subject,
                        body,
                        from_name = self.MailerSettings.get('FromName'),
                        from_address = self.MailerSettings.get('FromEmail'))


# End class definition

# We don't want all the debug stuff that webpy gives us
# .. especially not the SQL statements
web.webapi.config.debug = False

gamDigest = GiveAMinuteDigest(configFile="/Users/sundar/Projects/LP/gam2/branches/webpyUpgrade/config.yaml")
# gamDigest.sendDigestEmail(recipients=["cybertoast@gmail.com"], subject="Test", body="Test")
digests = gamDigest.createDigests()
for digest in digests:
    body = "Digest for Project ID %s:\n\n" % digest
    if digests.get(digest).get('members'):
        body += "Recent Members:\n"
        body += '\n\n'.join(digests.get(digest).get('members'))
    if digests.get(digest).get('messages'):
        body += "\n"
        body += "Recent Messages:\n"
        body += '\n\n'.join(digests.get(digest).get('messages'))

    body += "\n\n"
    body += "Recipients are " + ','.join(digests.get(digest).get('recipients')) + "\n\n"
    print body
    gamDigest.sendDigestEmail(recipients=['cybertoast@gmail.com'], subject=gamDigest.Config.get('email').get('digest_subject'), body=body)
