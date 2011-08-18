import yaml, memcache, json, gettext, locale
from cgi import escape
import helpers.custom_filters as custom_filters
from lib.web.contrib.template import render_jinja
from lib import web
from framework.log import log
from framework.config import *
from framework.session_holder import *
from framework.task_manager import *
import framework.util as util
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

        # set mode
        self.template_data['app_mode'] = self.appMode = Config.get('app_mode')

        self.template_data['app_env'] = self.appEnv = Config.get('app_env')

        #set media root
        self.template_data['media_root'] = Config.get('media')['root']

        # user
        self.setUserObject()

        # beta redirect
        if (self.appMode == 'beta' and not self.user):
            path = web.ctx.path.split('/')
            allowed = ['beta',

                       'login',

                       'join',

                       'tou',
                       'logout',
                       # Twitter related paths
                       'twitter',
                       # 'twitter/login', 'twitter/create', 'twitter/callback', 'twitter/disconnect'

                       # Facebook paths - not relevant until FB app is updated
                       'facebook',
                       # 'facebook/login', 'facebook/create', 'facebook/callback', 'facebook/disconnect'

                       # Remove the following facebook paths once app is updated
                       # 'login_facebook',
                       # 'login_facebook_create',
                       # 'disconnect_facebook',

                       ]

            if (path[1] not in allowed):
                self.redirect('/beta')

    def setUserObject(self):
        self.user = None
        if hasattr(self.session, 'user_id'):
            # todo would like to move gam-specific user attrs out of controller module
            try:
                self.user = mUser.User(self.db, self.session['user_id'])

                self.template_data['user'] = dict(data = self.user.getDictionary(),
                                                json = json.dumps(self.user.getDictionary()),
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
        # gam-specific admin
        #if admin and self.user['admin'] != 1:
        if (admin and not self.user.isAdmin):
            log.info("--> not an admin")

            self.redirect(url)

            return False
        return True

    def parameters(self):
        """Gets a ``dict`` of request parameters"""
        try:
            if not web.input():
                return None
        except TypeError, e:
            import urlparse
            querystring = web.ctx.query[1:]
            params = urlparse.parse_qs(querystring)
            return params
        else:
            return dict(web.input().items())
    
    def request(self, var):
        """Gets the value of the request parameter named ``var``"""
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

        if isinstance(var, basestring):
            #var = util.strip_html(var)
            var = escape(var)
            var = var.strip()
            if len(var) == 0: return None
            var = util.safeuni(var)

        return var

    def render(self, template_name, template_values=None, suffix="html", content_type = "text/html"):
        """
        Custom renderer for Change by Us templates.

        @type   template_name: string
        @param  template_name: Name of template (without extension)
        @type   template_values: dict
        @param  template_values: Values to include in the template.
        @type   suffix: string
        @param  suffix: Extension of template file.
        @type   content_type: string
        @param  content_type: HTTP header content type to output.

        @rtype: ?
        @returns: ?

        """
        if template_values is None:

            template_values = {}

        # Set the user object in case it's been created since we initialized.
        self.setUserObject()

        # Hand all config values to the template.  This method is deprecated
        # but around until all templates have been updated.
        config = Config.get_all()

        config['base_url'] = Config.base_url()
        for key in config:

            log.debug("--- Config: handling key %r" % key)
            if type(config[key]) is dict:

                log.debug("--- Config: key %r is a dictionary: %r" % (key, config[key]))
                for param in config[key]:

                    log.debug("--- Config: setting %s_%s to %r" % (key, param, config[key][param]))
                    template_values["%s_%s" % (key, param)] = config[key][param]
            else:
                template_values[key] = config[key]

        # Give all config values as a dict in a config space.
        template_values['config'] = config

        # Send user data to template
        if self.user:
            template_values['user'] = self.user

        # Add template data object
        if self.template_data:
            template_values['template_data'] = self.template_data

        # Create full URL from web.py values
        template_values['full_url'] = web.ctx.home + web.ctx.fullpath

        # Check for "flash"?
        if hasattr(self.session, 'flash') and self.session.flash is not None:
            template_values['flash'] = self.session.flash
            log.info('showing flash message: "' + self.session.flash + '"')
            self.session.flash = None
            self.session.invalidate()

        template_values['session_id'] = self.session.session_id

        # Put session values into template ??
        keys = self.session.keys()
        for key in keys:
            template_values[key] = self.session[key]

        # Set up template and Jinja
        template_values['template_name'] = template_name
        renderer = render_jinja(os.path.dirname(__file__) + '/../templates/', extensions=['jinja2.ext.i18n'])
        renderer._lookup.filters.update(custom_filters.filters)

        # Install the translation
        translation = self.get_gettext_translation(self.get_language())
        renderer._lookup.install_gettext_translations(translation)
        
        # Insert HTML for the language chooser
        curr_lang = self.get_language()
        all_langs = self.get_supported_languages()

        template_values['language'] = {"current": curr_lang, "list":
                all_langs.iteritems()}
        
        template_values['language_selector'] = self.choice_list(
            all_langs, curr_lang)

        # Set HTTP header
        web.header("Content-Type", content_type)

        # Debug data.
        log.info("200: %s (%s)" % (content_type, template_name))
        log.info("*** session  = %s" % self.session)

        # Return template and data.
        return (renderer[template_name + "." + suffix](dict(d=template_values))).encode('utf-8')

    def get_language(self):
        """
        Gets the language that has been set by the user, first checking the
        querystring and then the session. The session variable is set before
        the value is returned.
        
        """
        lang = ""
        if (self.request('lang')):
            lang = self.request('lang')
        elif hasattr(self.session, 'lang') and self.session.lang is not None:
            lang = self.session.lang
        
        # TODO: As a last resort, we should check for the user's language in 
        #       their browser settings.  This is available from the request 
        #       header Accept-Language, and is available to the controller 
        #       through web.ctx.environ.get('HTTP_ACCEPT_LANGUAGE').
        #
        #       For more info, see 
        #       http://www.w3.org/International/questions/qa-accept-lang-locales
        #                                                      - MP 2011-07-27

        self.session.lang = lang
        return lang
    
    
    def get_i18n_dir(self):
        """Return the path to the directory with the locale files"""
        cur_dir = os.path.abspath(os.path.dirname(__file__))

        # i18n directory.
        locale_dir = os.path.join(cur_dir, '..', 'i18n')
        return locale_dir
    
    
    def get_supported_languages(self):
        """
        Find the language files available in the translations directory. Returns
        a dictionary which has language codes as keys, and human-readable
        language names as values.
        
        """
        try:
            enabled_langs = Config.get('lang')
        except KeyError:
            enabled_langs = {}
        return enabled_langs
        

    def get_gettext_translation(self, locale_id):
        """
        Returns the translation object for the specified locale.
        """
        # i18n directory.
        locale_dir = self.get_i18n_dir()

        # Look in the translaton for the locale_id in locale_dir. Fallback to the 
        # default text if not found.
        return gettext.translation('messages', locale_dir, [locale_id], fallback=True)

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
    
    def choice_list(self, options, selected_option=None):
        """Return an options list."""
        select_tag = '<select>'
        
        for value, label in options.iteritems():
            checked = ' selected="selected"' if value == selected_option else ''
            select_tag += '<option value="%s"%s>%s</option>' \
                          % (value, checked, label)
        select_tag += '</select>'
        return select_tag
        

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
        # Set the user object in case it's been created since we initialized
        self.setUserObject()

        log.info("303: Redirecting to " + url)

        return web.SeeOther(url)
    
    def no_method(self):
        log.error("405: Method not Allowed")
        return web.NoMethod()

    def refresh(self):
        url = web.ctx.path
        log.info("303: Redirecting to " + url + " (refresh)")
        return web.SeeOther(url)
