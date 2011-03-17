import framework.util as util
import giveaminute.location as mLocation
import giveaminute.project as mProject
from framework.controller import *

class Search(Controller):
    def GET(self, action=None):
        if action == 'map':
            return self.showMap()
        else:
            return self.showSearch()   
                        
    def showMap(self):
        locationData = self.getLocationData()
    
        self.template_data['locations_scored'] = self.json(locationData)
        self.template_data['max_score'] = locationData[0]['score']
    
        return self.render('map')
        
    def showSearch(self):
        # dummied up from real data
        projects = mProject.getProjectsByKeywords(self.db, 'bicycle')
        resources = self.getDummyResources()        
        ideas = self.getDummyIdeas()
        
        results = dict(projects = projects, resources = resources, ideas = ideas)
        
        self.template_data['results'] = dict(json = self.json(results), data = results)
        
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

    # temp dummy functions
    def getDummyResources(self):
        limit = 10
        sql = "select project_resource_id as link_id, title, url, image_id from project_resource limit $limit"
        data = list(self.db.query(sql, {'limit':limit}))
                
        return data
        
    def getDummyIdeas(self):
        limit = 10
        sql = """
select i.idea_id
       ,i.description
      ,i.submission_type
      ,i.created_datetime
      ,u.user_id
      ,u.first_name
      ,u.last_name
from idea i
left join user u on u.user_id = i.user_id limit $limit"""

        data = list(self.db.query(sql, {'limit':limit}))
        
        betterData = []
        
        for item in data:
            owner = None
            
            if (item.user_id):
                name = "%s %s." % (item.first_name, item.last_name[0])
                
                owner = dict(name = name, user_id = item.user_id)
        
            betterData.append(dict(idea_id = item.idea_id,
                            message = item.description,
                            created = str(item.created_datetime),
                            submission_type = item.submission_type,
                            owner = owner))
                            
        log.info("*** %s" % str(betterData))
                
        return betterData
        
        
        
        
        
        
        