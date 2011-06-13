from framework.controller import *
import framework.util as util
import giveaminute.location as mLocation
import giveaminute.projectResource as mProjectResource

class Resource(Controller):
    def GET(self, action = None, param0 = None):
        self.require_login("/login")
        
        return self.showAddResource()    
    
    def POST(self, action = None, param0 = None):
        if (self.user):
            if (not action):
                return self.addResource()
            elif (action == 'edit'):
                if (param0 == 'image'):
                    return self.updateResourceImage()
                elif (param0 == 'location'):
                    return self.updateResourceLocation()
                elif (param0 == 'description'):
                    return self.updateResourceDescription()
                elif (param0 == 'url'):
                    return self.updateResourceUrl()
                elif (param0 == 'contactemail'):
                    return self.updateResourceContactEmail()
                elif (param0 == 'address'):
                    return self.updateResourceAddress()
                elif (param0 == 'keywords'):
                    return self.updateResourceKeywords()
                else:
                    #return self.not_found()
                    return 'param0 not found'
            else:
#                 return self.not_found() 
                return 'param0 not found'
        else:
            return self.not_found()
        
    def showAddResource(self):
        locationData = mLocation.getSimpleLocationDictionary(self.db)
        locations = dict(data = locationData, json = json.dumps(locationData))
        self.template_data['locations'] = locations
        
        return self.render('resource')    
        
        
    def addResource(self):
        if (self.request('main_text')): return False

        title = self.request('title')
        description = self.request('description')
        physical_address = self.request('physical_address')
        location_id = util.util.try_f(int, self.request('location_id'), -1)
        url = util.makeUrlAbsolute(self.request('url')) if self.request('url')  else None
        keywords = ' '.join([word.strip() for word in self.request('keywords').split(',')]) if not util.strNullOrEmpty(self.request('keywords')) else None
        contact_name = self.request('contact_name')
        contact_email = self.request('contact_email')
        facebook_url = util.makeUrlAbsolute(self.request('facebook_url')) if self.request('facebook_url') else None
        twitter_url = util.makeUrlAbsolute(self.request('twitter_url')) if self.request('twitter_url') else None
        image_id = util.util.try_f(int, self.request('image')) 
        
        # TODO this is a temp fix for a form issue
        if (contact_name == 'null'):
            contact_name = None
            
        try:
            projectResourceId = self.db.insert('project_resource', 
                                        title = title,
                                        description = description,
                                        physical_address = physical_address,
                                        location_id = location_id,
                                        url = url,
                                        facebook_url = facebook_url,
                                        twitter_url = twitter_url,
                                        keywords = keywords,
                                        contact_name = contact_name,
                                        contact_email = contact_email,
                                        created_datetime = None,
                                        image_id = image_id,
                                        is_hidden = 1,
                                        contact_user_id = self.user.id)
            
            return True
        except Exception,e:
            log.info("*** couldn't add resource to system")
            log.error(e)
            return False
            
    def updateResourceImage(self):
        resourceId = util.try_f(int, self.request('resource_id'))

        if (not self.user or not self.user.isResourceOwner(resourceId)): 
            return False

        imageId = util.try_f(int, self.request('image_id'))
        
        if (imageId):
            return mProjectResource.updateProjectResourceImage(self.db, resourceId, imageId)
        else:
            return False
        
    def updateResourceLocation(self):
        resourceId = util.try_f(int, self.request('resource_id'))

        if (not self.user or not self.user.isResourceOwner(resourceId)): 
            return False

        locationId = util.try_f(int, self.request('location_id'))
        
        if (locationId):
            return mProjectResource.updateProjectResourceLocation(self.db, resourceId, locationId)
        else:
            return False
        
    def updateResourceDescription(self):
        resourceId = util.try_f(int, self.request('resource_id'))

        if (not self.user or not self.user.isResourceOwner(resourceId)): 
            return False

        description = self.request('description')
        
        if (description):
            return mProjectResource.updateProjectResourceTextData(self.db, resourceId, 'description', description)
        else:
            return False
        
    def updateResourceUrl(self):
        resourceId = util.try_f(int, self.request('resource_id'))

        if (not self.user or not self.user.isResourceOwner(resourceId)): 
            return False

        url = self.request('url')
        
        if (url):
            return mProjectResource.updateProjectResourceTextData(self.db, resourceId, 'url', util.makeUrlAbsolute(url))
        else:
            return False
                
    def updateResourceContactEmail(self):
        resourceId = util.try_f(int, self.request('resource_id'))

        if (not self.user or not self.user.isResourceOwner(resourceId)): 
            return False

        email = self.request('email')
        
        if (email):
            return mProjectResource.updateProjectResourceTextData(self.db, resourceId, 'contact_email', email)
        else:
            return False
        
    def updateResourceAddress(self):
        resourceId = util.try_f(int, self.request('resource_id'))

        if (not self.user or not self.user.isResourceOwner(resourceId)): 
            return False

        address = self.request('address')
        
        if (address):
            return mProjectResource.updateProjectResourceTextData(self.db, resourceId, 'physical_address', address)
        else:
            return False
    
    def updateResourceKeywords(self):
        resourceId = util.try_f(int, self.request('resource_id'))

        if (not self.user or not self.user.isResourceOwner(resourceId)): 
            return False

        keywords = ' '.join([word.strip() for word in self.request('keywords').split(',')]) if not util.strNullOrEmpty(self.request('keywords')) else None
        
        return mProjectResource.updateProjectResourceTextData(self.db, resourceId, 'keywords', keywords)
