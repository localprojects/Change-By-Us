import json
from framework import util
from lib import twilio
from lib import web
from framework.log import log
from framework.config import *
from framework.controller import *

def reply(user, message):    
    
    message = clean(message)
    try:
        message_id = Controller.get_db().insert("messages", user_id=user.id, message=message, sms=1, outgoing=1, status="queued")        
    except Exception, e:
        log.error(e) 
    Tasks().add(tube='sms', data={'user': user, 'message_id': message_id, 'message': message}, timeout=10)                   
    web.header("Content-Type", "text/plain")    
    return ''


def send(user, message_id, message):
    
    log.info("Sending sms...")    
    
    message = clean(message)
    
    settings = Config.get('twilio')
    account = twilio.Account(settings['sid'], settings['token'])
    callback = Config.base_url()
    if not callback:
        callback = Config.get('default_host')
    
    data = {    'From': settings['phone'],
                'To': user.phone,
                'Body': message,
                'StatusCallback': "%stwilio/status" % callback
                }
    log.debug(data)
    try:
        response = account.request('/%s/Accounts/%s/SMS/Messages.json' % (settings['api'], settings['sid']), 'POST', data)
        log.info("--> %s" % response)        
        response = json.loads(response)        
        smsid = response['TwilioResponse']['SMSMessage']['Sid']
        status = "passed"
    except Exception, e:
        log.error(e)
        smsid = None
        status = "blocked"        
    try:
        Controller.get_db().query("UPDATE messages SET smsid=$smsid, status=$status WHERE id=$id", {'id': message_id, 'smsid': smsid, 'status': status})
    except Exception, e:
        log.error(e)
    return True


def validate(request):    
    # this is just a cheap validate that depends on the attacker not knowing our AccountSid, it's not secure        
        
    settings = Config.get('twilio')        
    if request('AccountSid') != settings['sid']:
        log.error("Request from Twilio does not have correct sid! Possibly an attack! Blocking message.")
        log.error("--> was theirs [%s] vs ours [%s]" % (request('AccountSid'), settings['sid']))
        return False
    return True
    
    
def clean(message):
    message = message.strip()
    if len(message) > 160:
        log.warning("--> message is too long! will be cut off!")
        message = message[:160]    
    for c in range(len(message)):
        if ord(message[c]) > 127:
            log.warning("--> message contains a weird character that will be converted to '?'")            
            message = message[:c] + '?' + message[c+1:]
    return message
    