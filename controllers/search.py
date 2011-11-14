# -*- coding: utf-8 -*-

"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
import framework.util as util
import giveaminute.location as mLocation
import giveaminute.project as mProject
import giveaminute.idea as mIdea
import giveaminute.projectResource as mProjectResource
from framework.controller import *
import json

class Search(Controller):
    def GET(self, action = None):
        if action == 'map':
            return self.showMap()
        elif (action == 'ideas'):
            return self.searchIdeasJSON() 
        elif (action == 'resources'):
            return self.searchProjectResourcesJSON() 
        elif (action == 'projects'):
            return self.searchProjectsJSON() 
        else:
            return self.showSearch()   
                        
    def showMap(self):
        locationData = self.getLocationData()
    
        self.template_data['locations_scored'] = json.dumps(locationData)
        self.template_data['max_score'] = locationData[0]['score']
    
        return self.render('map')
        
    def showSearch(self):            
        if (self.request('main_text')): return False
    
        terms = self.request('terms').split(',') if self.request('terms') else []
        limit = int(self.request('n')) if self.request('n') else 6
        offset = int(self.request('offset')) if self.request('offset') else 0
        locationId = self.request('location_id')
        
        self.template_data['search_terms'] = self.request('terms')
        self.template_data['search_location_id'] = locationId
        
        projects = mProject.searchProjects(self.db, terms, locationId, limit, offset)
        resources = mProjectResource.searchProjectResources(self.db, terms, locationId, limit, offset)
        ideas = mIdea.searchIdeas(self.db, terms, locationId, limit, offset)
        
        results = dict(projects = projects, resources = resources, ideas = ideas)
        
        self.template_data['results'] = dict(json = json.dumps(results), data = results)

        total_count = dict(projects = mProject.searchProjectsCount(self.db, terms, locationId), 
                          resources = mProjectResource.searchProjectResourcesCount(self.db, terms, locationId), 
                          ideas = mIdea.searchIdeasCount(self.db, terms, locationId))

        self.template_data['total_count'] = dict(json = json.dumps(total_count), data = total_count)
        
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
        
    def searchProjectsJSON(self):
        terms = self.request('terms').split(',') if self.request('terms') else []
        limit = int(self.request('n')) if self.request('n') else 6
        offset = int(self.request('offset')) if self.request('offset') else 0
        locationId = self.request('location_id')
    
        return self.json({'results':mProject.searchProjects(self.db, terms, locationId, limit, offset),
                          'total_count':100})
        
    def searchProjectResourcesJSON(self):
        terms = self.request('terms').split(',') if self.request('terms') else []
        limit = int(self.request('n')) if self.request('n') else 6
        offset = int(self.request('offset')) if self.request('offset') else 0
        locationId = self.request('location_id')
        
        return self.json({'results':mProjectResource.searchProjectResources(self.db, terms, locationId, limit, offset),
                          'total_count':100})

    def searchIdeasJSON(self):
        terms = self.request('terms').split(',') if self.request('terms') else []
        limit = int(self.request('n')) if self.request('n') else 6
        offset = int(self.request('offset')) if self.request('offset') else 0
        locationId = self.request('location_id')
        
        return self.json({'results':mIdea.searchIdeas(self.db, terms, locationId, limit, offset),
                          'total_count':100})


            
            
            
                