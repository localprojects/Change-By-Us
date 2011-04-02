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
        
        self.template_data['results'] = dict(json = self.json(results), data = results)
        
        locations_list = mLocation.getSimpleLocationDictionary(self.db)
        self.template_data['locations'] = dict(json = self.json(locations_list), data = locations_list)
        
        locationData = self.getLocationData()
        
        self.template_data['locations_scored'] = self.json(locationData)
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
        betterData = []
        
        match = ' '.join([(item + "*") for item in terms])
    
        #obviously must optimize here
        try:
            sql = """select p.project_id, 
                            p.title, 
                            p.description, 
                            p.image_id, 
                            p.location_id,
                            o.user_id as owner_user_id,
                            o.first_name as owner_first_name,
                            o.last_name as owner_last_name,
                            o.image_id as owner_image_id, 
                        (select count(*) from project__user pu where pu.project_id = p.project_id) as num_members
                        from project p
                        inner join project__user opu on opu.project_id = p.project_id and opu.is_project_admin = 1
                        inner join user o on o.user_id = opu.user_id
                        where
                        p.is_active = 1 
                        and ($locationId is null or p.location_id = $locationId)
                        and ($match = '' or match(p.title, p.description) against ($match in boolean mode))
                        order by p.created_datetime desc"""
                        
            data = list(self.db.query(sql, {'match':match, 'locationId':locationId}))
            
            for item in data:
                betterData.append(dict(project_id = item.project_id,
                                title = item.title,
                                description = item.description,
                                image_id = item.image_id,
                                location_id = item.location_id,
                                owner = mProject.smallUser(item.owner_user_id, item.owner_first_name, item.owner_last_name, item.owner_image_id),
                                num_members = item.num_members))
        except Exception, e:
            log.info("*** couldn't get project search data")
            log.error(e)
            
        return betterData
        
    def searchProjectResources(self, terms, locationId):
        data = []

        match = ' '.join([(item + "*") for item in terms])
        
        try:
            sql = """select project_resource_id as link_id, title, url, image_id 
                    from project_resource
                        where
                        is_active = 1 
                        and ($locationId is null or location_id = $locationId)
                        and ($match = '' or match(title, description) against ($match in boolean mode))
                        order by created_datetime desc"""

            data = list(self.db.query(sql, {'match':match, 'locationId':locationId}))
        except Exception, e:
            log.info("*** couldn't get resources search data")
            log.error(e)
                    
        return data

    def searchIdeas(self, terms, locationId):
        betterData = []
        match = ' '.join([(item + "*") for item in terms])
                
        try:
            sql = """select i.idea_id
                           ,i.description
                          ,i.submission_type
                          ,i.created_datetime
                          ,u.user_id
                          ,u.first_name
                          ,u.last_name
                          ,u.image_id
                    from idea i
                    left join user u on u.user_id = i.user_id
                    where
                    i.is_active = 1 
                    and ($locationId is null or i.location_id = $locationId)
                    and ($match = '' or match(i.description) against ($match in boolean mode))
                    order by i.created_datetime desc"""
    
            data = list(self.db.query(sql, {'match':match, 'locationId':locationId}))
            
            for item in data:
                owner = None
                
                if (item.user_id):
                    owner = mProject.smallUser(item.user_id, item.first_name, item.last_name, item.image_id)
            
                betterData.append(dict(idea_id = item.idea_id,
                                message = item.description,
                                created = str(item.created_datetime),
                                submission_type = item.submission_type,
                                owner = owner))
        except Exception, e:
            log.info("*** couldn't get idea search data")
            log.error(e)
                
        return betterData

    def makeMatchClause(self, words, fieldstring):
        clauseList = []
    
        for word in words:
            clauseList.append("match(%s) against ('%s')" % (fieldstring, word))
            
        return ' or '.join(clauseList)
            
            
            
                