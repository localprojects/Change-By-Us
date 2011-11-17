"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import helpers.sms as sms
from framework import util
from framework.controller import *
import giveaminute.user as mUser
import giveaminute.idea as mIdea
import giveaminute.messaging as mMessaging

class Twilio(Controller):
    
    #phone_numbers = Config.get('phone_numbers')
    #log.info("Twilio: phone_numbers: %s" % phone_numbers)
    
    def GET(self, nop=None):
        return self.not_found()

    def POST(self, action=None):
        if action == 'receive': return self.receive()
        if action == 'status': return self.on_status()
        return self.not_found()
        
    def receive(self):
        # TODO: could do more w/ validation
        if not sms.validate(self.request):
            return self.text('')
            
        phone = util.cleanUSPhone(self.request('From'))
        message = self.request('Body')
        
        userId = mUser.findUserByPhone(self.db, phone)
        
        if (not phone or not message):
            log.error("*** sms received but idea not created.  missing phone or message")
        else:
            if (message.lower() == 'stop'):
                return mMessaging.stopSMS(self.db, phone)        
            else:
                if (mIdea.createIdea(self.db, message, -1, 'sms', userId, None, phone)):
                    mMessaging.sendSMSConfirmation(self.db, phone)
                    
                    return True
                else:
                    return False


    def on_receive(self):
        log.info("Twilio.on_receive: %s" % web.input())
        log.info("self.request('To'): %s" % self.request('To'))
        if not sms.validate(self.request):
            return self.text('')
        message = self.request('Body')
        to = int(self.request('To'))
        # this is evidently the most elegant way to do a reverse look-up in a dictionary
        to_city = [k for k, v in self.phone_numbers.iteritems() if v==to][0]
        #log.info('to_city: %s' % to_city)
        
        if util.check_bad_words(message):
            log.info('Twilio: Bad word(s) in text message')
            return self.error('Bad word(s) in message')
        
        user = Users.get_or_create(self.db, phone=self.request('From'), location=self.request('FromZip'), city_id=to_city)
        if user.blocked:
            log.info("--> user is blocked!")
            return self.text('')
        try:
            mId = self.db.insert("messages", user_id=user.id, message=message, sms=1, outgoing=0)
        except Exception, e:
            log.error(e)
            return self.text('')
        
        if message.lower() == 'stop' or message.lower() == 'unsubscribe' or message.lower() == 'quit':
            try:
                self.db.query("UPDATE users SET stopped=1 WHERE id=$id", {'id': user.id})
            except Exception, e:
                return self.error(e)
            reply = Config.get('stop_response')
            log.debug("--> replying: %s" % reply)
            return sms.reply(user, reply)
        else:
            if user.new:
                log.info('Twilio: Submitting card to db and renderer')
                name_string = "SMS from "+str(self.request('FromZip'))
                cardID = cards.submitCard(mId=mId, src="SMS", uid=user.id, city_id=to_city, message=message, name=name_string, user=user)
                reply = Config.get('initial_message')
                return sms.reply(user, reply)
            else:
                #return self.text('User already submitted message')
                return self.text(Config.get('already_submitted'))
                
    def on_status(self):
        log.info("Twilio.on_status %s" % web.input())
        smsid = self.request('SmsSid')
        status = self.request('SmsStatus')
        try:
            message = list(self.db.query("SELECT id FROM messages WHERE smsid=$smsid", {'smsid': smsid}))[0]
        except Exception, e:
            try:
                message = list(self.db.query("SELECT id FROM messages WHERE smsid='REPLY'"))[0]                
            except Exception, e:
                return self.error(e)
        try:
            self.db.query("UPDATE messages SET status=$status, smsid=$smsid WHERE id=$id", {'id': message.id, 'status': status, 'smsid': smsid})
        except Exception, e:
            return self.error(e)
        return self.text("OK")
                        
