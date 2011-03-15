import yaml, memcache, json
import helpers.custom_filters as custom_filters
from lib.web.contrib.template import render_jinja
from lib import web
from framework.log import log
from framework.config import *
from framework.session_holder import *
from framework.task_manager import *
import giveaminute.user as mUser

class Controller():
    
    _db = None
    
    @classmethod
    def get_db(cls):
        # settings = Config.get('database')
        # db = web.database(dbn=settings['dbn'], user=settings['user'], pw=settings['password'], db=settings['db'], host=settings['host'])        
        if cls._db != None:
            return cls._db
        else:
            cls.db_connect()
            return cls._db
    
    @classmethod
    def db_connect(cls):
        settings = Config.get('database')
        cls._db = web.database(dbn=settings['dbn'], user=settings['user'], pw=settings['password'], db=settings['db'], host=settings['host'])
        log.info("Connected to db: %s" % cls._db)
    
    def __init__(self):
        
        log.info("---------- %s %s --------------------------------------------------------------------------" % (web.ctx.method, web.ctx.path))

        # database
        self.db = Controller.get_db()
        
        # memcache
        self.cache = memcache.Client([Config.get('memcache')['address'] + ":" + str(Config.get('memcache')['port'])])                
        
        # session
        self.session = SessionHolder.get_session()
        log.info("SESSION: %s " % self.session)    
        
        # template data
        self.template_data = {}

        # user
        self.user = None
        if hasattr(self.session, 'user_id'):
            # todo would like to move gam-specific user attrs out of controller module
            try:
                self.user = mUser.User(self.db, self.session['user_id'])
                
                self.template_data['user'] = dict(json = self.json(self.user.getDictionary()),
                                                is_admin = self.user.isAdmin,
                                                is_moderator = self.user.isModerator,
                                                is_leader = self.user.isLeader)            
            except Exception, e:
                log.error(e)
                self.session.user_id = None                

    def require_login(self, url="/", admin=False):
        if not self.user:
            log.info("--> not logged in")
            self.redirect(url)
            return False
        if admin and self.user['admin'] != 1:
            log.info("--> not an admin")            
            self.redirect(url)                      
            return False
        return True                             
                
    def request(self, var):
        try:
            if not web.input():
                return None
        except TypeError, e:
            querystring = web.ctx.query[1:]         
            params = dict([part.split('=') for part in querystring.split('&')]) 
            try:
                var = params[var]
            except KeyError:
                return None
        else:
            var = web.input()[var] if hasattr(web.input(), var) else None
        if type(var) is basestring:
            var = util.strip_html(var)
            var = var.strip()
            if len(var) == 0: return None
            var = util.safeuni(var)
        return var              
        
    def render(self, template_name, template_values=None, suffix="html"):
        if template_values is None: template_values = {}        
        
        config = Config.get_all()       
        config['base_url'] = Config.base_url()
        for key in config:      
            if type(config[key]) is dict:
                for param in config[key]:
                    template_values["%s_%s" % (key, param)] = config[key][param]
            else:
                template_values[key] = config[key]              
        if self.user: template_values['user'] = self.user
        
        #add template data object
        if self.template_data: template_values['template_data'] = self.template_data 
        
        if hasattr(self.session, 'flash') and self.session.flash is not None:
            template_values['flash'] = self.session.flash
            log.info('showing flash message: "' + self.session.flash + '"')
            self.session.flash = None
            self.session.invalidate()
        template_values['session_id'] = self.session.session_id    
        for key in self.session:
            template_values[key] = self.session[key]
        template_values['template_name'] = template_name
        renderer = render_jinja(os.path.dirname(__file__) + '/../templates/')      
        renderer._lookup.filters.update(custom_filters.filters)
        web.header("Content-Type", "text/html")
        #log.info("TEMPLATE %s: %s" % (template_name, template_values))
        log.info("200: text/html (%s)" % template_name)
        return (renderer[template_name + "." + suffix](dict(d=template_values))).encode('utf-8')

    def json(self, data):
        output = json.dumps(data)
        web.header("Content-Type", "text/plain")
        log.info("200: text/plain (JSON)")                                
        return output
        
    def xml(self, data):    
        web.header("Content-Type", "application/xml")
        output = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n"
        output += data                                          ## should make this use a real library
        log.info("200: application/xml")                        
        return output

    def html(self, html):
        web.header("Content-Type", "text/html")
        doc = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" /></head><body>"
        doc += html
        doc += "</body></html>"
        log.info("200: text/html")                
        return doc
        
    def text(self, string):
        web.header("Content-Type", "text/plain")
        log.info("200: text/plain")        
        return string

    def csv(self, string, filename):
        web.header("Content-Type", "text/csv")
        web.header("Content-Disposition", "attachment; filename=%s" % filename)
        log.info("200: text/csv")
        return string
        
    def image(self, image):
        web.header("Content-Type", "image/png")
        web.header("Expires","Thu, 15 Apr 2050 20:00:00 GMT")
        log.info("200: image/png")        
        return image

    def temp_image(self, image):
        web.header("Content-Type", "image/png")     
        web.header("Cache-Control", "no-cache")
        log.info("200: image/png (temporary)")        
        return image

    def error(self, message):
        log.error("400: %s" % message)
        return web.BadRequest(message)
        
    def warning(self, message):
        log.warning("400: %s" % message)
        return web.BadRequest(message)        

    def not_found(self):
        log.error("404: Page not found")
        return web.NotFound()
        
    def redirect(self, url):
        log.info("303: Redirecting to " + url)      
        return web.SeeOther(url)

    def refresh(self):
        url = web.ctx.path
        log.info("303: Redirecting to " + url + " (refresh)")
        return web.SeeOther(url)