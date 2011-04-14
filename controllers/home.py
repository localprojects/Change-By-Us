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
    def GET(self, action=None, page=None):
        project_user = dict(is_member = True,
                              is_project_admin = True)
        self.template_data['project_user'] = dict(data = project_user, json = json.dumps(project_user))
                                          
        if (not action or action == 'home'):
            return self.showHome()
        elif (action == 'mobile'):
            return self.showMobile()   
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
        elif (action == 'tempupload'):
            return self.showTempUpload()                                  
        else:
            return self.render(action)
            
            
    def POST(self, action=None):
        if (action == 'login'):
             return self.login()
        elif (action == 'logout'):
            return self.logout()
        elif (action == 'resource'):
            #todo move this to its own controller
            return self.addResource()
        elif (action == 'feedback'):
            return self.submitFeedback()
        elif (action == 'tempupload'):
            self.tempUpload()
            return self.showTempUpload() 
        else:
            return self.not_found()
         
    # BEGIN temp page for uploading resource images
    def showTempUpload(self):
        sql = "select project_resource_id, title, image_id from project_resource order by title;"
        res = list(self.db.query(sql))
        
        self.template_data['res'] = res
        
        return self.render('tempupload')   

    def tempUpload(self):
        data = [s for s in web.input().items() if "image_" in s[0]]
        
        for item in data:
            if (self.request(item[0])):
                imageId = ImageServer.add(self.db, item[1], 'giveaminute', [100, 100])
                resourceId = item[0].split('_')[1]
                if (mResource.updateProjectResourceImage(self.db, resourceId, imageId)):
                    log.info("*** resource %s image %s" % (resourceId, imageId))
                else:
                    log.info("*** FAILED: resource %s image %s" % (resourceId, imageId))


    # END temp page for uploading resource images
            
    def showHome(self):
        locations = mLocation.getSimpleLocationDictionary(self.db)
        allIdeas = self.getFeaturedProjectIdeas();

        locations = dict(data = locations, json = json.dumps(locations))
        allIdeas = dict(data = allIdeas, json = json.dumps(allIdeas))
        
        self.template_data['locations'] = locations
        self.template_data['all_ideas'] = allIdeas
        
        return self.render('home', {'locations':locations, 'all_ideas':allIdeas})
        
    def showMobile(self):
        locations = dict(data = mLocation.getSimpleLocationDictionary(self.db), json = json.dumps(mLocation.getSimpleLocationDictionary(self.db)))
        self.template_data['locations'] = locations
        return self.render('mobile')
        
    def showLogin(self):
        referer = web.ctx.env.get('HTTP_REFERER')
        
        if (referer and "/join" not in referer):
            self.template_data['redir_from'] = referer
    
        return self.render('login')
    
    def login(self):
        email = self.request("email")
        password = self.request("password")
        
        if (email and password):
            userId = mUser.authenticateUser(self.db, email, password)
                
            if (userId):        
                self.session.user_id = userId
                self.session.invalidate()
                
                return userId
            else:
                return False    
        else:
            log.warning("Missing email or password")                        
            return False
            
    def login_facebook(self):
    
        fb_settings = Config.get('facebook')
    
        cookiename = "fbs_%s" % fb_settings['app_id']
        fbcookie = web.cookies().get(cookiename) 
        entries = fbcookie.split("&")
        dc = {}
        for e in entries:
            es = e.split("=")
            dc[es[0]] = es[1]
        
        details = urllib2.urlopen("https://graph.facebook.com/%s?access_token=%s" % (dc["uid"], dc["access_token"]))    
        profile = json.loads(details.read())
        
        sql = "select * from facebook_user where facebook_id = %s" % str(profile['id'])
        res = list(self.db.query(sql))
        
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
            check_if_email_exists = "select * from user where email = '%s'" % str(email)
            users_with_this_email = list(self.db.query(check_if_email_exists))
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
        sql = "select * from twitter_user where twitter_id = %s" % str(access_token['user_id'])
        res = list(self.db.query(sql))
        
        associated_user = -1
        
        created_user = False
        created_twitter_user = False
        
        # do we already have twitter data for this user?
        if len(res) == 1:
            twitter_user = res[0]
            self.session.user_id = twitter_user.user_id
            self.session.invalidate()

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
            raise web.seeother("/")
            
            
    def login_twitter_create(self):
        
        s = SessionHolder.get_session()
        access_token = s.tw_access_token
       
        #access_token = self.request('twitter_data')
        
        email = self.request('email')
        firstname = self.request('firstname')
        lastname = self.request('lastname')
        uid = mUser.createUser(self.db, email, access_token['oauth_token_secret'], firstname, lastname)
        self.db.insert('twitter_user', user_id = uid, twitter_username = access_token['screen_name'], twitter_id = access_token['user_id'])
        
        self.session.user_id = uid
        self.session.invalidate()
        
        raise web.seeother("/")
        
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

        return True    
        
    def addResource(self):
        title = self.request('title')
        description = self.request('description')
        physical_address = self.request('physical_address')
        location_id = self.request('location_id') if not util.strNullOrEmpty(self.request('keywords')) else -1
        url = self.request('url')
        keywords = self.request('keywords').replace(',', ' ') if not util.strNullOrEmpty(self.request('keywords')) else None
        contact_name = self.request('contact_name')
        contact_email = self.request('contact_email')
        other_urls = self.request('other_urls').split(',') if not util.strNullOrEmpty(self.request('other_urls')) else []
        image_id = self.request('image')

        try:
            projectResourceId = self.db.insert('project_resource', 
                                        title = title,
                                        description = description,
                                        physical_address = physical_address,
                                        location_id = location_id,
                                        url = url,
                                        keywords = keywords,
                                        contact_name = contact_name,
                                        contact_email = contact_email,
                                        created_datetime = None,
                                        image_id = image_id,
                                        is_hidden = 1)
            
            return True
        except Exception,e:
            log.info("*** couldn't add resource to system")
            log.error(e)
            return False
    
        
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
        
        sql = """select i.idea_id, i.description as text, u.first_name as f_name, u.last_name as l_name, i.submission_type as submitted_by 
                from idea i
                inner join project__idea pi on pi.idea_id = i.idea_id and pi.project_id = $id
                left join user u on u.user_id = i.user_id
                limit $limit"""
                
        try:
            data = list(self.db.query(sql, {'id':projectId, 'limit':limit}))
        
            for item in data:
                betterData.append(dict(text = str(item.text),
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