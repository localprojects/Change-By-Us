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
            
    def getLocationJSON(self):
        data = mLocation.getLocationsWithScoring(self.db)
        
        locations = {}
        
        for item in data:
            locations[item.name] = {'location_id':item.location_id, 'lat':str(item.lat), 'lon':str(item.lon), 'score': (item.score if item.score else 0)}
            
        return self.json(dict(locations))            
            
            
