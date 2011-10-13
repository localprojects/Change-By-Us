"""
Module to handle general messaging, though mostly emailing.
Emailing templates can be found in templates/email.

"""
import helpers.sms
from framework.emailer import Emailer
from framework.log import log
from framework.config import Config

## EMAIL FUNCTIONS

# send email to invited users
def emailInvite(email, inviterName, projectId, title, description, message = None):
    """
    Send invitation email.  Using template: project_invite
        
    @type   email: string
    @param  email: Email address to send to
    ...
    
    @rtype: Boolean
    @returns: Whether emailer was successful or not.
    
    """
    
    # Create values for template.
    emailAccount = Config.get('email')
    subject = "You've been invited by %s to join a project" % inviterName
    link = "%sproject/%s" % (Config.get('default_host'), str(projectId))
    template_values = {
        'inviter': inviterName,
        'title':title,
        'description':description,
        'link': link,
        'message': message,
        'config': Config.get_all()
    }
    
    # Render email body.
    body = Emailer.render('email/project_invite', template_values, suffix = 'txt')     
    
    # Send email.
    try:
        return Emailer.send(email, subject,  body, from_name = emailAccount['from_name'], 
            from_address = emailAccount['from_email'])  
    except Exception, e:
        log.info("*** couldn't send invite email")
        log.error(e)
        return False
        

def emailProjectJoin(email, projectId, title, userId, userName):
    """
    Email project admins when new user joins.  Using template: project_join
        
    @type   email: string
    @param  email: Email address to send to
    ...
    
    @rtype: Boolean
    @returns: Whether emailer was successful or not.
    
    """
    
    # Create values for template.
    emailAccount = Config.get('email')
    defaultUrl = Config.get('default_host')
    subject = "A new member %s has joined your project %s" % (userName, title)
    userLink = "%suseraccount/%s" % (defaultUrl, str(userId))
    memberLink = "%sproject/%s#show,members" % (defaultUrl, str(projectId))
    template_values = {
        'title': title,
        'user_name': userName,
        'user_link': userLink,
        'member_link': memberLink,
        'config': Config.get_all()
    }
    
    # Render email body.
    body = Emailer.render('email/project_join', template_values, suffix = 'txt')
         
    # Send email.
    try:
        return Emailer.send(email, subject, body, from_name = emailAccount['from_name'],
            from_address = emailAccount['from_email'])
    except Exception, e:
        log.info("*** couldn't send join email")
        log.error(e)
        return False

      
def emailProjectEndorsement(email, title, leaderName):
    """
    Email project admins about endorsements.  Using template: project_endorsement
        
    @type   email: string
    @param  email: Email address to send to
    ...
    
    @rtype: Boolean
    @returns: Whether emailer was successful or not.
    
    """
    
    # Create values for template.
    emailAccount = Config.get('email')
    subject = "%s liked your project!" % leaderName
    template_values = {
        'title': title,
        'leader_name': leaderName,
        'config': Config.get_all()
    }
    
    # Render email body.
    body = Emailer.render('email/project_endorsement', template_values, suffix = 'txt')
         
    # Send email.
    try:
        return Emailer.send(email, subject, body, from_name = emailAccount['from_name'],
            from_address = emailAccount['from_email'])
    except Exception, e:
        log.info("*** couldn't send endorsement email")
        log.error(e)
        return False

        
def emailResourceNotification(email, projectId, title, description, resourceName):
    """
    Email resource contacts on resource add.  Using template: resource_notification
        
    @type   email: string
    @param  email: Email address to send to
    ...
    
    @rtype: Boolean
    @returns: Whether emailer was successful or not.
    
    """
    
    # If dev, don't email resources
    if (Config.get('dev')):
        log.info("*** body = %s" % body)
        return True
    
    # Create values for template.
    emailAccount = Config.get('email')
    subject = "A project on Changeby.us has added %s as a resource" % resourceName
    link = "%sproject/%s" % (Config.get('default_host'), str(projectId))
    template_values = {
        'title': title,
        'description': description,
        'resource_name': resourceName,
        'link': link,
        'config': Config.get_all()
    }
    
    # Render email body.
    body = Emailer.render('email/resource_notification', template_values, suffix = 'txt')

    # Send email.
    try:
        return Emailer.send(email, subject, body, from_name = emailAccount['from_name'],
            from_address = emailAccount['from_email'])
    except Exception, e:
        log.info("*** couldn't send resource notification email")
        log.error(e)
        return False
      

def emailResourceApproval(email, title):
    """
    Email resource owner on approval.  Using template: resource_approval
        
    @type   email: string
    @param  email: Email address to send to
    ...
    
    @rtype: Boolean
    @returns: Whether emailer was successful or not.
    
    """
    
    # Create values for template.
    emailAccount = Config.get('email')
    subject = "Your resource has been approved"
    template_values = {
        'link': Config.get('default_host'),
        'title': title,
        'config': Config.get_all()
    }
    
    # Render email body.
    body = Emailer.render('email/resource_approval', template_values, suffix = 'txt')

    # Send email.
    try:
        return Emailer.send(email, subject, body, from_name = emailAccount['from_name'],
            from_address = emailAccount['from_email'])  
    except Exception, e:
        log.info("*** couldn't send resource approval email")
        log.error(e)
        return False
        

def emailAccountDeactivation(email):
    """
    Email deleted users.  Using template: account_deactivation
        
    @type   email: string
    @param  email: Email address to send to
    ...
    
    @rtype: Boolean
    @returns: Whether emailer was successful or not.
    
    """
    
    # Create values for template.
    emailAccount = Config.get('email')
    subject = "Your account has been deactivated"
    link = "%stou" % Config.get('default_host')
    template_values = {
        'link': link,
        'config': Config.get_all()
    }
    
    # Render email body.
    body = Emailer.render('email/account_deactivation', template_values, suffix = 'txt')

    # Send email.
    try:
        return Emailer.send(email, subject, body, from_name = emailAccount['from_name'],
            from_address = emailAccount['from_email'])
    except Exception, e:
        log.info("*** couldn't send account deactivation email")
        log.error(e)
        return False


def emailTempPassword(email, password):
    """
    Email temporary password.  Using template: forgot_password
        
    @type   email: string
    @param  email: Email address to send to
    ...
    
    @rtype: Boolean
    @returns: Whether emailer was successful or not.
    
    """
    
    # Create values for template.
    emailAccount = Config.get('email')
    subject = "Your password has been reset"
    link = "%slogin" % Config.get('default_host')
    link = "%stou" % Config.get('default_host')
    template_values = {
        'password': password,
        'link': link,
        'config': Config.get_all()
    }
    
    # Render email body.
    body = Emailer.render('email/forgot_password', template_values, suffix = 'txt')

    # Send email.
    try:
        return Emailer.send(email, subject, body, from_name = emailAccount['from_name'],
            from_address = emailAccount['from_email'])
    except Exception, e:
        log.info("*** couldn't send forgot password email")
        log.error(e)
        return False


def directMessageUser(db, toUserId, toName, toEmail, fromUserId, fromName, message):
    """
    Email user about direct message.  Using template: direct_message
        
    @type   email: string
    @param  email: Email address to send to
    ...
    
    @rtype: Boolean
    @returns: Whether emailer was successful or not.
    
    """
    
    # Create values for template.
    emailAccount = Config.get('email')
    #email = "%s <%s>" % (toName, toEmail)
    email = toEmail
    subject = "Change By Us message from %s" % fromName
    link = "%suseraccount/%s" % (Config.get('default_host'), fromUserId)
    template_values = {
        'name': fromName,
        'message': message,
        'link': link,
        'config': Config.get_all()
    }
    
    # Render email body.
    body = Emailer.render('email/direct_message', template_values, suffix = 'txt')

    # Send email.
    try:
        isSent = Emailer.send(email, subject, body, from_name = emailAccount['from_name'],
            from_address = emailAccount['from_email'])
                                                       
        if (isSent):
            db.insert('direct_message', message = message, to_user_id = toUserId, from_user_id = fromUserId)
            return True
        else:
            log.info("*** couldn't log direct message")
            # Not sure if best to return False
            return False

    except Exception, e:
        log.info("*** couldn't send direct message email")
        log.error(e)
        return False
        

def emailUnauthenticatedUser(email, authGuid):
    """
    Send unauthenticated user a link to authenticate.  Using 
    template: auth_user
        
    @type   email: string
    @param  email: Email address to send to
    
    @rtype: *
    @returns: Emailer send response.
    
    """
    
    # Create values for template.
    emailAccount = Config.get('email')
    subject = "Please authenticate your account"
    link = "%sjoin/auth/%s" % (Config.get('default_host'), authGuid)
    template_values = {
        'link': link,
        'config': Config.get_all()
    }
    
    # Render email body.
    body = Emailer.render('email/auth_user', template_values, suffix = 'txt')
            
    # Send email.            
    try:
        return Emailer.send(email, subject, body, from_name = emailAccount['from_name'],
            from_address = emailAccount['from_email'])  
    except Exception, e:
        log.info("*** couldn't send authenticate user email")
        log.error(e)
        return False

        
def emailIdeaConfirmation(email, responseEmail, locationId):
    """
    Email upon idea submission.  Using template: idea_confirmation
        
    @type   email: string
    @param  email: Email address to send to
    ...
    
    @rtype: Boolean
    @returns: Whether emailer was successful or not.
    
    """
    
    # Create values for template.
    emailAccount = Config.get('email')
    host = Config.get('default_host')
    subject = "Thanks for submitting an idea to Change by Us!"
    searchLink = "%ssearch?location_id=%s" % (host, locationId)
    createLink = "%screate" % host
    
    body = Emailer.render('email/idea_confirmation',
                        {'search_link':searchLink,
                         'create_link':createLink,
                         'response_email':emailAccount['from_email']},
                        suffix = 'txt')
                        
    try:
        return Emailer.send(email, subject, body, from_name = emailAccount['from_name'],
            from_address = emailAccount['from_email'])
    except Exception, e:
        log.info("*** couldn't send authenticate user email")
        log.error(e)
        return False


### SMS FUNCTIONS
        
# add phone number to table of stopped numbers
def stopSMS(db, phone):
    try:
        db.insert('sms_stopped_phone', phone = phone)
        return True
    except Exception, e:
        log.info("*** couldn't stop messages to phone number %s.  Number may already be in database." % phone)
        log.error(e)
        return False
        
def isPhoneStopped(db, phone):
    try:
        sql = "select phone from sms_stopped_phone where phone = $phone limit 1";
        data = list(db.query(sql, {'phone':phone}))
        
        return len(data) > 0
    except Exception, e:
        log.info("*** couldn't get sms stopped value for %s" % phone)
        log.error(e)
        
        # in this case, we err on NOT sending messages and thus return True
        return True

def sendSMSConfirmation(db, phone):
    log.info("*** sending confirmation to %s" % phone)
    
    if (not isPhoneStopped(db, phone)):
        message = "Thanks for adding your idea to changeby.us Visit %smobile to browse and join projects related to your idea." % Config.get('default_host')
        
        return helpers.sms.send(phone, message)
    else:
        return False
    
def sendSMSInvite(db, phone, projectId):
    log.info("*** sending invite to %s" % phone)  
    
    try:
        if (not isPhoneStopped(db, phone)):
            link = "%sproject/%s" % (Config.get('default_host'), str(projectId))
            message = "You've been invited to a project on changeby.us. Visit %s to see the project. Reply 'STOP' to stop changeby.us messages." % link        
            return helpers.sms.send(phone, message)
        else:
            return False    
    except Exception, e:
        log.info("*** something failed in sending sms invite")
        log.error(e)
        return False    
    
