import framework.util as util
import giveaminute.location as mLocation
import giveaminute.project as mProject
import giveaminute.idea as mIdea
import giveaminute.projectResource as mProjectResource
from framework.controller import *
import json

class Search(Controller):
    def GET(self, action=None):
        if action == 'map':
            return self.showMap()
        else:
            return self.showSearch()   
                        
    def showMap(self):
        locationData = self.getLocationData()
    
        self.template_data['locations_scored'] = json.dumps(locationData)
        self.template_data['max_score'] = locationData[0]['score']
    
        return self.render('map')
        
    def showSearch(self):
        if (self.request('terms')):
            terms = self.request('terms').split(',')
        else:
            terms = []
            
        locationId = self.request('location_id')
        
        self.template_data['search_terms'] = self.request('terms')
        self.template_data['search_location_id'] = locationId
        
        log.info("*** search for '%s', %s" % (terms, locationId))
        
        projects = self.searchProjects(terms, locationId)
        resources = self.searchProjectResources(terms, locationId)
        ideas = self.searchIdeas(terms, locationId)
        
        results = dict(projects = projects, resources = resources, ideas = ideas)
        
        self.template_data['results'] = dict(json = json.dumps(results), data = results)
        
        locations_list = mLocation.getSimpleLocationDictionary(self.db)
        self.template_data['locations'] = dict(json = json.dumps(locations_list), data = locations_list)
        
        locationData = self.getLocationData()
        
        self.template_data['locations_scored'] = json.dumps(locationData)
        self.template_data['max_score'] = locationData[0]['score']
        
        return self.render('search')
            
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

    ## DEBUG ONLY
    def getDummyResources(self):
        limit = 10
        sql = "select project_resource_id as link_id, title, url, image_id from project_resource limit $limit"
        data = list(self.db.query(sql, {'limit':limit}))
                
        return data
    ## END DEBUG ONLY

    def searchProjects(self, terms, locationId):
        return mProject.searchProjects(self.db, terms, locationId)
        
    def searchProjectResources(self, terms, locationId):
        return mProjectResource.searchProjectResources(self.db, terms, locationId)

    def searchIdeas(self, terms, locationId):
        return mIdea.searchIdeas(self.db, terms, locationId)

            
            
            
                