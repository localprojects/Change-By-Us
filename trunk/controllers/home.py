from framework.controller import *
import giveaminute.location as mLocation
import giveaminute.user as mUser
import giveaminute.project as mProject
import framework.util as util
import lib.web
#temp
from framework.image_server import *  
import giveaminute.projectResource as mResource  

import cgi
import oauth2 as oauth
import urllib2
import json
import hashlib

tw_settings = Config.get('twitter')
tw_consumer = oauth.Consumer(tw_settings['consumer_key'], tw_settings['consumer_secret'])
tw_client = oauth.Client(tw_consumer)

class Home(Controller):
    def GET(self, action=None, param0=None):
        project_user = dict(is_member = True,
                              is_project_admin = True)
        self.template_data['project_user'] = dict(data = project_user, json = json.dumps(project_user))
                                          
        if (not action or action == 'home'):
            return self.showHome()
        elif (action == 'mobile'):
            return self.showMobile()
        elif (action == 'bb'):
            return self.showMobile(isBlackBerry = True)
        elif (action == 'login'):
            return self.showLogin() 
        elif (action == 'login_twitter'):
            return self.login_twitter()
        elif (action == 'login_facebook'):
            return self.login_facebook() 
        elif (action == 'twitter_callback'):
            return self.tw_authenticated()
        elif (action == 'login_twitter_create'):
            return self.login_twitter_create()
        elif (action == 'login_facebook_create'):
            return self.login_facebook_create()
        elif (action == 'disconnect_facebook'):
            return self.disconnect_facebook()
        elif (action == 'disconnect_twitter'):
            return self.disconnect_twitter()
        elif (action == 'nyc'):
            self.redirect('http://nyc.changeby.us/')
        elif (action == 'beta'):
            return self.showBeta()
        else:
            return self.render(action)
            
            
    def POST(self, action=None, param0=None):
        if (action == 'login'):
            if (param0 == 'forgot'):
                return self.forgotPassword()
            else:
                return self.login()
        elif (action == 'logout'):
            return self.logout()
        elif (action == 'feedback'):
            return self.submitFeedback()
        elif (action == 'beta' and param0 == 'submit'):
            return self.submitInviteRequest()
        else:
            return self.not_found()
            
    def showHome(self):
        locationData = mLocation.getSimpleLocationDictionary(self.db)
        allIdeasData = self.getFeaturedProjectIdeas();

        locations = dict(data = locationData, json = json.dumps(locationData))
        allIdeas = dict(data = allIdeasData, json = json.dumps(allIdeasData))
        
        news = self.getNewsItems()
        
        self.template_data['locations'] = locations
        self.template_data['all_ideas'] = allIdeas
        self.template_data['news'] = news
        
        return self.render('home', {'locations':locations, 'all_ideas':allIdeas})
        
    def showMobile(self, isBlackBerry = False):
        locationData = mLocation.getSimpleLocationDictionary(self.db)
        locations = dict(data =locationData, json = json.dumps(locationData))
        self.template_data['locations'] = locations
        
        t = 'bb' if isBlackBerry else 'mobile'
        
        return self.render(t)
        
    def showLogin(self):
        if (not self.user):
            referer = web.ctx.env.get('HTTP_REFERER')
            
            if (referer and "/join" not in referer and "/login" not in referer):
                self.template_data['redir_from'] = referer
        
            return self.render('login')
        else:
            return self.redirect('/')
    
    # if in beta mode and user is not logged in show splash
    # otherwise redirect homepage    
    def showBeta(self):
        if (self.appMode == 'beta' and not self.user):
            return self.render('splash')
        else:
            return self.redirect('/')
    
    def login(self):
        email = self.request("email")
        password = self.request("password")
        
        if (email and password):
            #userId = mUser.authenticateUser(self.db, email, password)
            user = mUser.authGetUser(self.db, email, password)
                
            if (user):        
                self.session.user_id = user['u_id']
                self.session.invalidate()
                # set cbu_key for blog access
                web.setcookie('cbu_key', util.obfuscate(user['u_id']), domain = ".changeby.us")
                
                return self.json(user)
            else:
                return False    
        else:
            log.error("*** Login attempt missing email or password")                        
            return False
            
    def forgotPassword(self):
        email = self.request('email')
        
        if (email):
            userId = mUser.findUserByEmail(self.db, email)
            
            if (not userId):
                log.error("*** couldn't find user matching forgotten password request email")
                return False
            else:
                return mUser.resetPassword(self.db, userId)
        else:
            log.error("*** Forgot password attempt w/o email")
            return False
            
    def login_facebook(self):
    
        fb_settings = Config.get('facebook')
        
        #cookiename = "fbs_%s" % fb_settings['app_id']
        #fbcookie = web.cookies().get(cookiename)
        #entries = fbcookie.split("&")
        #dc = {}
        #for e in entries:
        #    es = e.split("=")
        #    dc[es[0]] = es[1]
        
        details = urllib2.urlopen("https://graph.facebook.com/%s?access_token=%s" % (self.request('uid'), self.request("access_token")))    
        profile = json.loads(details.read())
        
        sql = "select * from facebook_user where facebook_id = $id"
        res = list(self.db.query(sql, { 'id':profile['id'] }))
        
        associated_user = -1
        
        created_user = False
        created_facebook_user = False
        # do we already have fb data for this user? -> log them in
        if len(res) == 1:
            facebook_user = res[0]
            self.session.user_id = facebook_user.user_id
            self.session.invalidate()
            
        else:
            email = profile["email"]
            check_if_email_exists = "select * from user where email = $email"
            users_with_this_email = list(self.db.query(check_if_email_exists, {'email':email}))
            email_exists = len(users_with_this_email)
            
            # see if we have a user with this email on a regular account
            if email_exists == 1:
                uid = users_with_this_email[0].user_id
            else: # no regular account with this email
            
                # see if the user is logged in
                s = SessionHolder.get_session()
                
                make_new_user = True
                try:
                    uid = s.user_id
                    if uid is not None:
                        make_new_user = False # user is logged in
                except AttributeError:
                    pass
                    #uid = mUser.createUser(self.db, profile["email"], passw, profile["first_name"], profile["last_name"])
                
                # not logged in, so make a new user
                if make_new_user:
                    created_user = True
                    self.session.profile = profile
                    self.session._changed = True
                    SessionHolder.set(self.session)
            
            if not created_user: # we can associate an existing account with this data
                self.db.insert('facebook_user', user_id = uid, facebook_id = profile['id'])
                associated_user = uid
                created_facebook_user = True
        
                self.session.user_id = associated_user
                self.session.invalidate()

        if created_user:
            return self.render('join', {'new_account_via_facebook': True, 'facebook_data': profile}) # go to TOS
        else:
            raise web.seeother("/") # user had already signed up with us before
     
    def login_facebook_create(self):
        
        s = SessionHolder.get_session()
        profile = s.profile
        
        # profile = self.request('facebook_data')
        
        passw = hashlib.sha224(profile["email"]).hexdigest()[:10]
        uid = mUser.createUser(self.db, profile["email"], passw, profile["first_name"], profile["last_name"])
        self.db.insert('facebook_user', user_id = uid, facebook_id = profile['id'])
        
        self.session.user_id = uid
        self.session.invalidate()
        
        raise web.seeother("/")
       
    def login_twitter(self):
        # Step 1. Get a request token from Twitter.
            
        resp, content = tw_client.request(tw_settings['request_token_url'], "GET")
            
        if resp['status'] != '200':
            raise web.seeother("/")
    
        # Step 2. Store the request token in a session for later use.
        
        
        req_token = dict(cgi.parse_qsl(content))
        
        
        self.session.request_token = req_token
        self.session._changed = True
        SessionHolder.set(self.session)
        s = SessionHolder.get_session()
    
        # Step 3. Redirect the user to the authentication URL.
        
        url = "%s?oauth_token=%s&force_login=true" % (tw_settings['authenticate_url'], req_token['oauth_token'])
        
        log.info("twitter login")
        log.info(s)

        raise web.seeother(url)
        
    def tw_authenticated(self):
        # Step 1. Use the request token in the session to build a new client.

        s = SessionHolder.get_session()
        token = oauth.Token(s.request_token['oauth_token'],
            s.request_token['oauth_token_secret'])
        client = oauth.Client(tw_consumer, token)
    
        # Step 2. Request the authorized access token from Twitter.
        resp, content = client.request(tw_settings['access_token_url'], "GET")
        if resp['status'] != '200':
            raise web.seeother("/")
    
        access_token = dict(cgi.parse_qsl(content))
        log.info(str(access_token))
    
        # Step 3. Lookup the user or create them if they don't exist
        sql = "select * from twitter_user where twitter_id = $id"
        res = list(self.db.query(sql, {'id':access_token['user_id']}))
        
        associated_user = -1
        
        created_user = False
        created_twitter_user = False
        
        # do we already have twitter data for this user?
        if len(res) == 1:
            twitter_user = res[0]
            self.session.user_id = twitter_user.user_id
            self.session.invalidate()
            return self.redirect('/')

        else: # no existing twitter data
            # is the user logged in with a regular or FB account?
            make_new_user = True
            try:
                uid = s.user_id
                if uid is not None:
                    make_new_user = False # user is logged in
            except AttributeError:
                pass
                #uid = mUser.createUser(self.db, profile["email"], passw, profile["first_name"], profile["last_name"])
            
            if make_new_user: # no existing account data, make a new one after TOS
                created_user = True
                self.session.tw_access_token = access_token
                self.session._changed = True
                SessionHolder.set(self.session)
            
            else: # no twitter data, but logged in, associate the accounts
                self.db.insert('twitter_user', user_id = uid, twitter_username = access_token['screen_name'], twitter_id = access_token['user_id'])
                associated_user = uid
                created_twitter_user = True
        
                self.session.user_id = associated_user
                self.session.invalidate()
    
        if created_user:
            return self.render('join', {'new_account_via_twitter': True, 'twitter_data': access_token}) # go to TOS
        else:
            return self.render('join', {'twitter_error': True}) # go to TOS
            
            
    def login_twitter_create(self):
        email = self.request('email')
        firstName = self.request('f_name')
        lastName = self.request('l_name')
        phone = util.cleanUSPhone(self.request('sms_phone'))
        
        s = SessionHolder.get_session()
        access_token = s.tw_access_token
        #access_token = self.request('twitter_data')
        
        if (len(firstName) == 0):
            log.error("no first name")
            return False
        elif (len(lastName) == 0):
            log.error("no last name")
            return False
        elif (len(email) == 0 or not util.validate_email(email)):
            log.error("invalid email")
            return False
        else:
            #userId = user.createUser(self.db, email, password, firstName, lastName, phone)
            userId = mUser.createUser(self.db, email, access_token['oauth_token_secret'], firstName, lastName, phone)
            self.db.insert('twitter_user', user_id = userId, twitter_username = access_token['screen_name'], twitter_id = access_token['user_id'])
            self.session.user_id = userId
            self.session.invalidate()
            #following 3 lines commented out for oauth dev
            #idea.attachIdeasByEmail(self.db, email)
            #if (phone and len(phone) > 0):
            #    idea.attachIdeasByPhone(self.db, phone)
            
        return userId;
        
    def disconnect_twitter(self):
    
        uid = self.session.user_id
        
        self.db.delete("twitter_user", "user_id = %d" % uid)
        
        return json.dumps({'success':True})
        
    def disconnect_facebook(self):
    
        uid = self.session.user_id
        
        self.db.delete("facebook_user", "user_id = %d" % uid)
        
        return json.dumps({'success':True})
            
    def logout(self):
        self.session.kill()
        web.setcookie('cbu_key', None, expires = -1, domain = ".changeby.us")

        return True    

    def getNewsItems(self):
        data = []
        feedUrl = "%s?feed=cbujson" % Config.get('blog_host')

        try:
            data = json.load(urllib2.urlopen(feedUrl, timeout = 5))
        except Exception, e:
            log.info("*** couldn't get feed for news items at %s" % feedUrl)
            log.error(e)
                        
        return data        
        
    def getFeaturedProjectIdeas(self):
        data = []
        
        sql = """select p.project_id, p.title from project p
                inner join featured_project fp on fp.project_id = p.project_id order by fp.ordinal"""
        
        featured = list(self.db.query(sql))
        
        for project in featured:
            data.append(dict(project_id = str(project.project_id),
                            title = str(project.title),
                            ideas = self.getProjectIdeas(project.project_id, 30)))
        
        return data
        
    def getProjectIdeas(self, projectId, limit):
        data = []
        betterData = []
        
        sql = """select i.idea_id, i.description as text, u.user_id, u.first_name as f_name, u.last_name as l_name, i.submission_type as submitted_by 
                from idea i
                inner join project__idea pi on pi.idea_id = i.idea_id and pi.project_id = $id
                left join user u on u.user_id = i.user_id
                limit $limit"""
                
        try:
            data = list(self.db.query(sql, {'id':projectId, 'limit':limit}))
        
            for item in data:
                betterData.append(dict(text = str(item.text),
                            user_id = item.user_id,
                            f_name = str(item.f_name) if item.f_name else '',
                            l_name = str(item.l_name)[0] + '.' if item.l_name else '',
                            submitted_by =  str(item.submitted_by)))   
        
        except Exception, e:
            log.info("*** couldn't get project ideas for home page")
            log.error(e)    
            
        return betterData
                
    def submitFeedback(self):
        name = self.request('name')
        email = self.request('email')
        comment = self.request('text')
        
        try:
            self.db.insert('site_feedback', submitter_name = name,
                                            submitter_email = email,
                                            comment = comment,
                                            created_datetime = None)
                                            
            return True
        except Exception, e:
            log.info("*** problem submitting feedback comment")
            log.error(e)
            return False
            
    def submitInviteRequest(self):
        email = self.request('email')
        comment = self.request('text')
        
        try:
            self.db.insert('beta_invite_request',email = email,
                                            comment = comment)
                                            
            return True
        except Exception, e:
            log.info("*** problem submitting beta invite request")
            log.error(e)
            return False