#
# Get a list of posts for the day
# Send to the recipient list for this group
# TODO:
#   * Add digest to database
#   * Document all the functions
# 

import yaml
import os, sys
import boto
from datetime import datetime
from dateutil.relativedelta import relativedelta
from optparse import OptionParser, IndentedHelpFormatter  # for command-line menu

# Assuming we start in the scripts folder, we need
# to traverse up for everything in our project
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from framework import util
from framework.emailer import Emailer
from lib import web
import logging

LOG_LEVELS = {
  'debug': logging.DEBUG,
  'info': logging.INFO,
  'warning': logging.WARNING,
  'error': logging.ERROR,
  'critical': logging.CRITICAL }

class Loggable():
    def configureLogger(self):
        conf = self.Config
        logFile = None
        logLevel = None
        try:
            logFile = conf.get('email').get('digest').get('log_file')
            logLevel = conf.get('email').get('digest').get('log_level')
        except Exception, e:
            pass
        
        if logFile and logLevel:
            if not os.path.exists((os.path.split(logFile)[0])):
                print("Created folder for logfile %s" % logFile)
                os.makedirs((os.path.split(logFile)[0]))
        else:
            return

        print "Logging to file %s" % logFile
        logging.basicConfig(filename=logFile,
                            level=LOG_LEVELS.get(logLevel),
                            format='[%(asctime)s] %(levelname)s: %(message)s',
                            filemode='a')
        logging.info('Started logging')

class Mailable():
    SESHandle = None
    SESSendQuota = None
    MailerSettings = {}

    def setupMailer(self, settings=None):
        self.MailerSettings['FromName']  = settings.get('from_name')
        self.MailerSettings['FromEmail'] = settings.get('from_email')

        print self.MailerSettings
        if not settings.get('aws_ses'):
            self._enable_smtp(settings)
            return

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
            self._enable_smtp()

        self._enable_aws_ses(settings)

    def _enable_smtp(self, settings):
        smtp_config = settings.get('smtp')
        web.webapi.config.smtp_server = smtp_config.get('host')
        web.webapi.config.smtp_port = smtp_config.get('port')
        web.webapi.config.smtp_starttls = smtp_config.get('starttls')
        web.webapi.config.smtp_username = smtp_config.get('username')
        web.webapi.config.smtp_password = smtp_config.get('password')

    def _enable_aws_ses(self, settings):
        # AWS SES config
        ses_config = settings.get('aws_ses')
        web.webapi.config.email_engine = 'aws'
        web.webapi.config.aws_access_key_id = ses_config.get('access_key_id')
        web.webapi.config.aws_secret_access_key = ses_config.get('secret_access_key')

    def htmlify(self, body):
        return "<html><head></head><body>%s</body></html>" % body 
    
    def sendEmail(self, to=None, recipients=None, subject=None, body=None):
        return Emailer.send(addresses=to,
                        subject=subject,
                        text=body,
                        html=self.htmlify(body),
                        from_name = self.MailerSettings.get('FromName'),
                        from_address = self.MailerSettings.get('FromEmail'),
                        bcc=recipients)

        
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

class GiveAMinuteDigest(Configurable, WebpyDBConnectable, Mailable, Loggable):
    Config = None
    FromDate = None     # Start Date that queries should use for created_datetime filter
    ToDate = None       # End Date that queries should use for create_datetime filter

    def __init__(self, configFile=None):
        # Connect to the mysql database based on the params from Config.yaml
        self.Config = self.loadConfigs(config_file=configFile)
        self.configureLogger()
        dbParams = self.Config.get('database')
        self.setupMailer(settings=self.Config.get('email'))
        self.connectDB(dbParams)

    # def __del__(self):
    #     self.disconnectDB()
        
    # Publicly visible functions

    def getRecentMessages(self, projectId=None, filterBy='member_comment'):
        """
        from: datetime of last digest
        """

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
    and pm.created_datetime between $fromDate and $toDate
order by pm.created_datetime desc
"""
        # TODO:
        # Should we be ordering/grouping by something other than the creationtime?

        # cursor = self.DBHandle.cursor()
        comments = self.executeSQL(sql, {'id':int(projectId), 'fromDate':self.FromDate, 'toDate': self.ToDate, 'filterBy':filterBy})
        groups = {}
        for comment in comments:
            if not groups.get(comment.project_id):
                groups[comment.project_id] = []
            groups[int(comment.project_id)].append(comment)
        
        if len(groups.keys()) == 0:
            return False

        return groups
 
    def getRecentMembers(self):
        """
        from: datetime of last digest
        """

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
where u.created_datetime between $fromDate and $toDate
order by pu.project_id, u.created_datetime desc
"""
        members = self.executeSQL(sql, params = {'fromDate':self.FromDate, 'toDate':self.ToDate})
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
    pu.project_id,
    pu.is_project_admin
from user u
    join project__user as pu on u.user_id = pu.user_id
where pu.project_id in $projects
    and (u.email_notification = $digestNotifyFlag or pu.is_project_admin = 1)

order by pu.project_id, u.created_datetime desc
"""
        # We have to map() because python is too stupid to deal with dynamic typecasting for
        members = self.executeSQL(sql, params = {'projects':projects, 'digestNotifyFlag':'digest'})
        projects = {}
        for member in members:
            if not projects.get(member.project_id):
                projects[member.project_id] = []
            projects[int(member.project_id)].append(member.email)

        return projects

    def getDataToCreateDigest(self):
        members_by_project = self.getRecentMembers()
        projects_new_members = [int(m) for m in members_by_project.keys()]
        projects = self.getProjects(projects=projects_new_members)
        projectIds = projects.keys()
        recipients_by_project = self.getProjectNotificationRecipients(projectIds)

        project_feed = {}
        for projId in projectIds:
            if project_feed.get(projId) is None:
                project_feed[projId] = {}

            messages_by_project = self.getRecentMessages(projectId=projId)

            if members_by_project.get(projId) is not None:
                project_feed[projId]['members'] = members_by_project.get(projId)
            
            if messages_by_project:
                project_feed[projId]['messages'] = messages_by_project.get(projId)

            project_feed[projId]['recipients'] = recipients_by_project.get(projId)
            project_feed[projId]['title'] = projects.get(projId).get('title')
        return project_feed


        # Create the message
        # for group in groups:
        #    pass
            # Create the digest()

    def createDigests(self):
        resp = self.getDataToCreateDigest()
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
            digests[projId]['title'] = resp[projId].get('title')
            digests[projId]['link'] = "<a href='%s/project/%s'>%s</a>" % (self.Config.get('default_host'), projId, resp[projId].get('title'))

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

    def getProjects(self, projects=[]):
        sql = """
select distinct
    pm.project_id,
    p.title
from project_message pm
    join project p on pm.project_id = p.project_id
where pm.message_type='member_comment'
    and (pm.created_datetime between $fromDate and $toDate or pm.project_id in $projects)
    order by pm.project_id
"""
        projectInfo = {}
        # Create a dummy list of project_id's to keep SQL happy in case we don't have any projects
        if len(projects) == 0:
            projects = [0]
        results = self.executeSQL(sql, params = {'fromDate':self.FromDate, 'toDate': self.ToDate, 'projects': projects})
        for project in results:
            projectInfo[int(project.project_id)] = project
        return projectInfo


    def createAndSendDigests(self):
        digests = self.createDigests()
        for digest in digests:
            subject = "%s%s\n\n" % (self.Config.get('email').get('digest').get('digest_subject_prefix'), digests.get(digest).get('title'))
            body = ""
            body += digests.get(digest).get('link') + "\n\n"
            if digests.get(digest).get('members'):
                body += "Recent Members:\n\n"
                body += '\n'.join(digests.get(digest).get('members'))
                body += "\n\n\n"
            if digests.get(digest).get('messages'):
                body += "Recent Messages:\n\n"
                body += '\n'.join(digests.get(digest).get('messages'))
                body += "\n\n\n"

            recipients = digests.get(digest).get('recipients')

            if self.Config.get('dev'):
                body += "Recipients are " + ','.join(digests.get(digest).get('recipients')) + "\n\n"
                recipients = self.Config.get('email').get('digest').get('digest_debug_recipients').split(',')

            self.sendEmail(to=self.Config.get('email').get('from_email'), recipients=recipients, subject=subject, body=body)
            
            # Finally, save the email that we sent to the database, for future reference
            # self.saveDigestToDB(to=self.Config.get('email').get('from_email'), recipients=recipients, subject=subject, body=body)

    def saveDigestToDB(self, to=None, recipients=None, subject=None, body=None):
        """
        Once the email is sent we need to save the email to a table, defined by config
        """
        sql = """
insert 
into gam2.digest
    (sender, to, recipients, subject, body, start_datetime, end_datetime, created_datetime)
values
    ($(sender)s, ${to)s, $(recipients)s, $(subject)s, $(body), $(fromDate)s, $(toDate)s, NOW(), 
"""
        results = self.executeSQL(sql, params = {'fromDate':self.FromDate, 'toDate':self.ToDate, 
                                                 'sender': self.Config.get('email').get('from_email'), 
                                                 'recipients': recipients, 'subject':subject, 'body': body})

# /GiveAMinuteDigest class 

def usage():
    print "Usage: %s -c/--configFile=<configfile> ] " % sys.argv[0]
    sys.exit(2)

def main():
    if (len(sys.argv) == 1):
        print "Try -h for help"
        exit(0)

    description = """
Deploy Freshplanet Games to AppEngine. Only works for the games right now. See -h for help
    """

    parser = OptionParser()
    parser.add_option("-c", "--configFile", help="Configuration Yaml file", default="config.yaml")
    parser.add_option("-f", "--dateFrom", help="Date to use as start-point for digest generation, in mysql-compatible format")
    parser.add_option("-t", "--dateTo", help="Date to use as end-point for digest generation, in mysql-compatible format")

    (opts, args) = parser.parse_args()

    # Ensure that mandatory options exist
    if not (opts.configFile):
        parser.print_help()
        exit(-1)
    if not opts.dateFrom:
        print "Warning: using the default start-date as 1 day ago. It's recommended that you pass in -f (--dateFrom)"

    gamDigest = GiveAMinuteDigest(opts.configFile)
    # gamDigest.FromDate = datetime.strptime(opts.dateFrom, '%Y/%m/%d %H:%M:%S')
    gamDigest.FromDate = opts.dateFrom
    gamDigest.ToDate = opts.dateTo

    gamDigest.createAndSendDigests()


if __name__ == "__main__":

    # We don't want all the debug stuff that webpy gives us
    # .. especially not the SQL statements
    web.webapi.config.debug = True

    main()
    exit(0)