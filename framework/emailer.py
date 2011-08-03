import smtplib, os
import helpers.custom_filters as custom_filters

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase

from email import Encoders
from lib.web.contrib.template import render_jinja
from lib.jinja2.exceptions import TemplateNotFound
from framework.log import log
from framework.controller import *
import lib.web.utils as webpyutils

class Emailer():

    @classmethod
    def send_from_template(cls, addresses, subject, template_name, template_values=None, attachment=None, from_name=None, from_address=None, **kwags):
        log.info("Emailer.send_from_template (%s)" % template_name)
        try:
            html = Emailer.render(template_name, template_values)
        except TemplateNotFound:
            log.warning("html template not found")
            html = None
        try:    
            text = Emailer.render(template_name, template_values, suffix="txt")        
        except TemplateNotFound:
            log.warning("text template not found")
            text = None
        log.debug(html)
        return cls.send(addresses, subject, text, html, attachment, from_name, from_address)

    @classmethod
    def send(cls, addresses, subject, text, html=None, attachments=None, from_name=None, from_address=None, **kwargs):
        log.info("Emailer.send [%s] [%s]" % (addresses, subject))
        if isinstance(addresses, basestring):
            addresses = [r.strip() for r in addresses.split(',')]
                
        try:
            if webapi.config.get('email_engine') == 'aws':
                try:                   
                    self.send_via_ses(addresses, subject, text, html, attachments, from_name, from_address, **kwargs)
                except:
                    self.send_via_smtp(addresses, subject, text, html, attachments, from_name, from_address, **kwargs)
            else:
                self.send_via_smtp(addresses, subject, text, html, attachments, from_name, from_address, **kwargs)
        except Exception, e:
            log.error("Could not send email due to: %s" % e)
            return False
        
            
#        if html:
#            # SR: Theres' a problem with gmail and multi-part messages. So may as well just send html
#            # msg = MIMEMultipart('alternative')
#            # msg.attach(MIMEText(html, 'html'))
#            # msg.attach(MIMEText(text, 'plain'))
#            msg = MIMEText(html, 'html')
#        else:
#            msg = MIMEText(text, 'plain')
#
#        if attachment:
#            tmpmsg = msg
#            msg = MIMEMultipart()
#            msg.attach(tmpmsg)
#            msg.attach(MIMEText("\n\n", 'plain')) # helps to space the attachment from the body of the message
#            log.info("--> adding attachment")
#            part = MIMEBase('application', 'octet-stream')
#            part.set_payload(open(attachment, 'rb').read())
#            Encoders.encode_base64(part)
#            part.add_header('Content-Disposition', 'attachment; filename="%s"' % os.path.basename(attachment))
#            msg.attach(part)
#
#        sender = from_name + "<" + from_address + ">"
#        
#        msg['Subject'] = subject
#        msg['From'] = sender
#        msg['To'] = ", ".join(addresses)
#
#        try:
#            # The use_msg_directly parameter should be set to True if we're adding message headers. This is the case
#            # with MIMEText() usage. If we send text directly (ie without MIMEText()) then use_msg_directly should be False
#            webpyutils.sendmail(from_address=sender, to_address=addresses, subject=subject, message=msg, attachment=attachment, use_msg_directly=True, **kwargs)
#
#        except Exception, e:
#            log.error("Could not send email (%s)" % e)
#
#            return False
#        return True    

    def send_email_via_smtp(self, addresses, subject, text, html=None, attachment=None, from_name=None, from_address=None, **kwargs):
        """
        Send email via SMTP
        """
        server = webapi.config.get('smtp_server')
        port = webapi.config.get('smtp_port', 0)
        username = webapi.config.get('smtp_username')
        password = webapi.config.get('smtp_password')
        debug_level = webapi.config.get('smtp_debuglevel', None)
        starttls = webapi.config.get('smtp_starttls', False)

        import smtplib
        smtpserver = smtplib.SMTP(server, port)

        if debug_level:
            smtpserver.set_debuglevel(debug_level)

        if starttls:
            smtpserver.ehlo()
            smtpserver.starttls()
            smtpserver.ehlo()

        if username and password:
            smtpserver.login(username, password)
        
        if html and text:
            message = MIMEMultipart('alternative')
            message.attach(MIMEText(html, 'html'))
            message.attach(MIMEText(text, 'plain'))
        elif html:
            message = MIMEText(html, 'html')
        else:
            message = MIMEText(text, 'plain')

        if attachments:
            tmpmessage = message
            message = MIMEMultipart()
            message.attach(tmpmessage)
            message.attach(MIMEText("\n\n", 'plain')) # helps to space the attachment from the body of the message
            log.info("--> adding attachment")
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(open(attachment, 'rb').read())
            Encoders.encode_base64(part)
            part.add_header('Content-Disposition', 'attachment; filename="%s"' % os.path.basename(attachment))
            message.attach(part)

        sender = from_name + "<" + from_address + ">"
        cc = listify(kw.get('cc', []))
        bcc = listify(kw.get('bcc', []))

        message['Subject'] = subject
        message['From'] = sender
        message['To'] = ", ".join(addresses)
        message['Cc']     = ','.join(cc)
        message['Bcc']    = ','.join(bcc)

        smtpserver.sendmail(sender, addresses, message.as_string())
        smtpserver.quit()
    
    
    def send_email_via_ses(self, addresses, subject, text, html=None, attachment=None, from_name=None, from_address=None, **kwargs):
        """
        BCC is in kwargs
        If SES has any error, the request will be passed back to the caller and domino down to SMTP 
        """
        import boto.ses
        try:
            sesConn = boto.ses.SESConnection( aws_access_key_id = webapi.config.get('aws_access_key_id'),
                                          aws_secret_access_key = webapi.config.get('aws_secret_access_key'))
        except Exception, e:
            raise
        
        cc = listify(kw.get('cc', []))
        bcc = listify(kw.get('bcc', []))
        sender = from_name + "<" + from_address + ">"

        # First send emails without attachments and not multipart
        if (text and not html and not attachments) or \
           (html and not text and not attachments):
            return sesConn.send_email(sender, subject,
                                       text or html,
                                       addresses, cc, bcc,
                                       format='text' if text else 'html')
        else:
            if not attachment:
                message = MIMEMultipart('alternative')
                
                message['Subject'] = subject
                message['From'] = sender
                if isinstance(addresses, (list, tuple)):
                    message['To'] = ','.join(addresses)
                else:
                    message['To'] = addresses
                message['Cc']     = ','.join(cc)
                message['Bcc']    = ','.join(bcc)
                
                message.attach(MIMEText(text, 'plain'))
                message.attach(MIMEText(html, 'html'))
            else:
                # This raise should fall back into SMTP
                raise NotImplementedError, 'SES does not currently allow ' + \
                                           'messages with attachments.'

        return self.ses.send_raw_email(sender, message.as_string(), destinations=addresses)                                           


    @classmethod
    def render(cls, template_name, template_values=None, suffix="html"):
        if template_values is None: template_values = {}        
        template_values['template_name'] = template_name
        log.info("TEMPLATE %s: %s" % (template_name, template_values))        
        renderer = render_jinja(os.path.dirname(__file__) + '/../templates/')      
        renderer._lookup.filters.update(custom_filters.filters)
        return (renderer[template_name + "." + suffix](template_values)).encode('utf-8')
    