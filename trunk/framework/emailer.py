import smtplib, os
from email.MIMEMultipart import MIMEMultipart
from email.MIMEBase import MIMEBase
from email.MIMEText import MIMEText
from email import Encoders
from lib.web.contrib.template import render_jinja
from jinja2.exceptions import TemplateNotFound
from framework.log import log
from framework.controller import *

class Emailer():

    @classmethod
    def send_from_template(cls, addresses, subject, template_name, template_values=None, attachment=None, from_address=None):
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
        return cls.send(addresses, subject, text, html, attachment, from_address)

    @classmethod
    def send(cls, addresses, subject, text, html=None, attachment=None, from_address=None):
        log.info("Emailer.send [%s] [%s] from: %s" % (addresses, subject, from_address))
        if isinstance(addresses, basestring):
            addresses = [r.strip() for r in addresses.split(',')]
        account = Config.get('email')   
        if html:
            msg = MIMEMultipart('alternative')
            msg.attach(MIMEText(text, 'plain'))  
            msg.attach(MIMEText(html, 'html'))
        else:
            msg = MIMEText(text, 'plain')
        if attachment:
            tmpmsg = msg
            msg = MIMEMultipart()
            msg.attach(tmpmsg)
            msg.attach(MIMEText("\n\n", 'plain')) # helps to space the attachment from the body of the message
            log.info("--> adding attachment")
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(open(attachment, 'rb').read())
            Encoders.encode_base64(part)
            part.add_header('Content-Disposition', 'attachment; filename="%s"' % os.path.basename(attachment))
            msg.attach(part)                
        msg['From'] = from_address
        msg['To'] = ','.join(addresses)
        msg['Subject'] = subject
        # log.info("\n%s" % msg.as_string())
        try:
            server = smtplib.SMTP(account['host'], account['port'])
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(account['username'], account['password'])
            log.info("about to run server.sendmail with from_address: %s" % from_address)
            server.sendmail(from_address, addresses, msg.as_string())
            server.close()
        except Exception, e:
            log.error("Could not send email (%s)" % e)
            return False
        return True    

    @classmethod
    def render(cls, template_name, template_values=None, suffix="html"):
        if template_values is None: template_values = {}        
        template_values['template_name'] = template_name
        log.info("TEMPLATE %s: %s" % (template_name, template_values))        
        renderer = render_jinja(os.path.dirname(__file__) + '/../templates/')      
        renderer._lookup.filters.update(custom_filters.filters)
        return (renderer[template_name + "." + suffix](template_values)).encode('utf-8')
