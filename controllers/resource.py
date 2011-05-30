from framework.controller import *
import framework.util as util
import giveaminute.location as mLocation

class Resource(Controller):
    def GET(self, action = None):
        return self.showAddResource()    
    
    def POST(self, action = None):
        return self.addResource()
        
    def showAddResource(self):
        locationData = mLocation.getSimpleLocationDictionary(self.db)
        locations = dict(data = locationData, json = json.dumps(locationData))
        self.template_data['locations'] = locations
        
        return self.render('resource')    
        
        
    def addResource(self):
        title = self.request('title')
        description = self.request('description')
        physical_address = self.request('physical_address')
        location_id = util.try_f(int, self.request('location_id'), -1)
        url = util.makeUrlAbsolute(self.request('url'))
        keywords = ' '.join([word.strip() for word in self.request('keywords').split(',')]) if not util.strNullOrEmpty(self.request('keywords')) else None
        contact_name = self.request('contact_name')
        contact_email = self.request('contact_email')
        facebook_url = util.makeUrlAbsolute(self.request('facebook_url'))
        twitter_url = util.makeUrlAbsolute(self.request('twitter_url'))
        image_id = util.try_f(int, self.request('image'))
        
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
                                        is_hidden = 1)
            
            return True
        except Exception,e:
            log.info("*** couldn't add resource to system")
            log.error(e)
            return False