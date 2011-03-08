import framework.util as util
import giveaminute.location as location
from framework.controller import *

class Search(Controller):
    def GET(self, action=None):
        if action == 'map':
            neighborhoodJSON = self.json(location.getLocationDictionary(self.db))
            
            return self.render('map', {'neighborhoodJSON':neighborhoodJSON})
        else:
            log.info("*** render search")
            return self.render('search')   
            
            
            

            
            
            
