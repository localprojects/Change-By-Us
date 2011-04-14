from framework.emailer import *
from framework.log import log
from framework.config import *

# send email to invited users
def emailInvite(email, inviterName, projectId, title, description):
    emailAccount = Config.get('email')
    subject = "You've been invited by %s to join a project" % inviterName
    link = "%sproject/%s" % (Config.get('default_host'), str(projectId))
    body = Emailer.render('email/project_invite', 
                          {'subject':subject, 'title':title, 'description':description, 'link': link}, 
                          suffix = 'txt')     
    try:
        return Emailer.send(email, 
                            subject, 
                            body,
                            from_name = emailAccount['from_name'],
                            from_address = emailAccount['username'])  
    except Exception, e:
        log.info("*** couldn't send invite email")
        log.error(e)
        return False
        
# email project admins when new user joins
def emailProjectJoin(email, projectId, title, userId, userName):
    emailAccount = Config.get('email')
    defaultUrl = Config.get('default_host')
    subject = "A new member %s has joined your group %s" % (userName, title)
    userLink = "%suseraccount/%s" % (defaultUrl, str(userId))
    memberLink = "%sproject/%s#show,members" % (defaultUrl, str(projectId))
    body = Emailer.render('email/project_join',
                        {'title':title, 'user_name':userName, 'user_link':userLink, 'member_link':memberLink},
                        suffix = 'txt')
                        
    try:
        return Emailer.send(email, 
                            subject, 
                            body,
                            from_name = emailAccount['from_name'],
                            from_address = emailAccount['username'])  
    except Exception, e:
        log.info("*** couldn't send join email")
        log.error(e)
        return False
        
def emailProjectEndorsement(email, title, leaderName):
    emailAccount = Config.get('email')
    subject = "%s liked your project!" % leaderName
    body = Emailer.render('email/project_endorsement',
                        {'title':title, 'leader_name':leaderName},
                        suffix = 'txt')

    try:
        return Emailer.send(email, 
                            subject, 
                            body,
                            from_name = emailAccount['from_name'],
                            from_address = emailAccount['username'])  
    except Exception, e:
        log.info("*** couldn't send endorsement email")
        log.error(e)
        return False
        
def emailResourceNotification(email, projectId, title, description, resourceName):
    emailAccount = Config.get('email')
    subject = "A project on Changeby.us has added %s as a resource" % resourceName
    link = "%sproject/%s" % (Config.get('default_host'), str(projectId))
    body = Emailer.render('email/resource_notification',
                        {'title':title, 'description':description, 'resource_name':resourceName, 'link':link},
                        suffix = 'txt')
    try:
        return Emailer.send(email, 
                            subject, 
                            body,
                            from_name = emailAccount['from_name'],
                            from_address = emailAccount['username'])  
    except Exception, e:
        log.info("*** couldn't send resource notification email")
        log.error(e)
        return False
        
def emailAccountDeactivation(email):
    emailAccount = Config.get('email')
    subject = "Your account has been deactivated"
    link = "%stou" % Config.get('default_host')
    body = Emailer.render('email/account_deactivation',
                        {'link':link},
                        suffix = 'txt')
    try:
        return Emailer.send(email, 
                            subject, 
                            body,
                            from_name = emailAccount['from_name'],
                            from_address = emailAccount['username'])  
    except Exception, e:
        log.info("*** couldn't send account deactivation email")
        log.error(e)
        return False
