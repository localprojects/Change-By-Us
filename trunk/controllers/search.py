import framework.util as util
import giveaminute.location as mLocation
from framework.controller import *

class Search(Controller):
    def GET(self, action=None):
        if action == 'map':
            return self.render('map', {'neighborhoodJSON':self.getLocationJSON()})
        else:
            log.info("*** render search")
            return self.render('search')
            
    def POST(self, action=None):
        if (action == 'info'):
            return self.getLocationInfoJSON()
        else:
            return self.not_found()
            
    def getLocationJSON(self):
        data = mLocation.getLocationsWithScoring(self.db)
        
        locations = []
        
        for item in data:
            locations.append(dict(name = item.name, 
                                location_id = item.location_id, 
                                lat = str(item.lat), 
                                lon = str(item.lon),
                                score = (item.score if item.score else 0)))
            
        return self.json(locations)
        
    def getLocationInfoJSON(self):
        locationId = self.request('location_id')
    
        info = mLocation.getLocationInfo(self.db, locationId)
        
        return self.json(info)
            
            
