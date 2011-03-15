import framework.util as util
import giveaminute.location as mLocation
from framework.controller import *

class Search(Controller):
    def GET(self, action=None):
        if action == 'map':
            return self.showMap()
        else:
            return self.render('search')
                        
    def showMap(self):
        locationData = self.getLocationData()
    
        self.template_data['locations_scored'] = self.json(locationData)
        self.template_data['max_score'] = locationData[0]['score']
    
        return self.render('map')
            
    def getLocationData(self):
        data = mLocation.getLocationsWithScoring(self.db)
        
        locations = []
        
        for item in data:
            score = self.calcScore(item.num_projects, item.num_ideas, item.num_project_resources)
        
            locations.append(dict(name = item.name, 
                                location_id = item.location_id, 
                                lat = str(item.lat), 
                                lon = str(item.lon),
                                n_projects = item.num_projects,
                                n_ideas = item.num_ideas,
                                n_resources = item.num_project_resources,
                                score = score))
                                
        sortedLocations = sorted(locations, key = lambda k:k['score'], reverse = True) 
        
        return sortedLocations
        
    def calcScore(self, numProjects, numIdeas, numResources):
        score = numProjects + numIdeas + numResources
        
        return score 
            
            
