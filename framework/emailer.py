<<<<<<< HEAD
import smtplib, os
import helpers.custom_filters as custom_filters

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase

=======
"""
Emailing utility.  Emailing is ultimately handled through webpy.

"""
import smtplib
import os
import helpers.custom_filters as custom_filters
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
from email import Encoders
from lib.web.contrib.template import render_jinja
from lib.jinja2.exceptions import TemplateNotFound
from framework.log import log
from framework.controller import *
import lib.web.utils as webpyutils

<<<<<<< HEAD
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
=======

class Emailer():
    """
    Email class for handling emailing for the application.
    """

    @classmethod
    def send_from_template(cls, addresses, subject, template_name, template_values=None, attachment=None, from_name=None, from_address=None, **kwags):
        """
        Create HTML and text emails from template, then send.
        
        """
        log.info("Emailer.send_from_template (%s)" % template_name)
        
        # Render email template as HTML.
        try:
            html = cls.render(template_name, template_values)
        except TemplateNotFound:
            log.warning("HTML template not found.")
            html = None
            
        try:    
            text = cls.render(template_name, template_values, suffix="txt")        
        except TemplateNotFound:
            log.warning("Text template not found.")
            text = None
            
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
        log.debug(html)
        return cls.send(addresses, subject, text, html, attachment, from_name, from_address)

    @classmethod
    def send(cls, addresses, subject, text, html=None, attachment=None, from_name=None, from_address=None, **kwargs):
<<<<<<< HEAD
        log.info("Emailer.send [%s] [%s]" % (addresses, subject))
        if isinstance(addresses, basestring):
            addresses = [r.strip() for r in addresses.split(',')]

        if html:
            # SR: Theres' a problem with gmail and multi-part messages. So may as well just send html
=======
        """
        Send email to recipients.
        
        """
        log.info("Emailer.send [%s] [%s]" % (addresses, subject))
        sender = from_name + "<" + from_address + ">"
        
        if isinstance(addresses, basestring):
            addresses = [r.strip() for r in addresses.split(',')]

        # If HTML, send just HTML, otherwise send text.  This is mostly because
        # theres' a problem with gmail and multi-part messages.
        if html:
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
            # msg = MIMEMultipart('alternative')
            # msg.attach(MIMEText(html, 'html'))
            # msg.attach(MIMEText(text, 'plain'))
            msg = MIMEText(html, 'html')
        else:
            msg = MIMEText(text, 'plain')

<<<<<<< HEAD
=======
        # Handle attachments.
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
        if attachment:
            tmpmsg = msg
            msg = MIMEMultipart()
            msg.attach(tmpmsg)
<<<<<<< HEAD
            msg.attach(MIMEText("\n\n", 'plain')) # helps to space the attachment from the body of the message
            log.info("--> adding attachment")
=======
            # Add a little space
            msg.attach(MIMEText("\n\n", 'plain'))
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(open(attachment, 'rb').read())
            Encoders.encode_base64(part)
            part.add_header('Content-Disposition', 'attachment; filename="%s"' % os.path.basename(attachment))
            msg.attach(part)

<<<<<<< HEAD
        sender = from_name + "<" + from_address + ">"
        
=======
        # Fill in message dict.
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = ", ".join(addresses)

<<<<<<< HEAD
        try:
            # The use_msg_directly parameter should be set to True if we're adding message headers. This is the case
            # with MIMEText() usage. If we send text directly (ie without MIMEText()) then use_msg_directly should be False
            webpyutils.sendmail(from_address=sender, to_address=addresses, subject=subject, message=msg, attachment=attachment, use_msg_directly=True, **kwargs)

        except Exception, e:
            log.error("Could not send email (%s)" % e)

            return False
=======
        # The use_msg_directly parameter should be set to True if we're adding message 
        # headers. This is the case with MIMEText() usage. If we send text directly
        # (ie without MIMEText()) then use_msg_directly should be False
        try:
            webpyutils.sendmail(from_address=sender, to_address=addresses, subject=subject, message=msg, attachment=attachment, use_msg_directly=True, **kwargs)
        except Exception, e:
            log.error("Could not send email (%s)" % e)
            return False
            
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
        return True    

    @classmethod
    def render(cls, template_name, template_values=None, suffix="html"):
<<<<<<< HEAD
        if template_values is None: template_values = {}        
        template_values['template_name'] = template_name
        log.info("TEMPLATE %s: %s" % (template_name, template_values))        
        renderer = render_jinja(os.path.dirname(__file__) + '/../templates/')      
        renderer._lookup.filters.update(custom_filters.filters)
=======
        """
        Render an email template, given values.  Uses the jinja engine.
        Assumes templates are in a `templates` directory one above current.
        
        """
        if template_values is None:
            template_values = {}       
             
        template_values['template_name'] = template_name       
        renderer = render_jinja(os.path.dirname(__file__) + '/../templates/')      
        renderer._lookup.filters.update(custom_filters.filters)
        
        log.info("Email template %s: %s" % (template_name, template_values)) 
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
        return (renderer[template_name + "." + suffix](template_values)).encode('utf-8')
    