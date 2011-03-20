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
        
        log.info("*** search for '%s', %s" % (terms, locationId))

        projects = self.searchProjects(terms, locationId)
        resources = self.searchProjectResources(terms, locationId)
        ideas = self.searchIdeas(terms, locationId)
        
        results = dict(projects = projects, resources = resources, ideas = ideas)
        
        self.template_data['results'] = dict(json = self.json(results), data = results)
        
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
        data = []
        
        clause = self.makeMatchClause(terms, "p.title, p.description")
    
        #obviously must optimize here
        try:
            sql = """select p.project_id, p.title, p.description, p.image_id, p.location_id, 
                        (select count(*) from project__user pu where pu.project_id = p.project_id) as num_members
                        from project p
                        where
                        p.is_active = 1 %s
                        %s
                        order by p.created_datetime desc""" % ((("and p.location_id = %s " % str(locationId)) if locationId else ""),
                                                                "and %s" % clause if len(clause) > 0 else "")
                        
            data = list(self.db.query(sql))
        except Exception, e:
            log.info("*** couldn't get project search data")
            log.error(e)
            
        return data
        
    def searchProjectResources(self, terms, locationId):
        data = []

        clause = self.makeMatchClause(terms, "title, description")
        
        try:
            sql = """select project_resource_id as link_id, title, url, image_id 
                    from project_resource
                        where
                        is_active = 1 %s
                        %s
                        order by created_datetime desc""" % ((("and location_id = %s " % str(locationId)) if locationId else ""),
                                                                "and %s" % clause if len(clause) > 0 else "")

            data = list(self.db.query(sql))
        except Exception, e:
            log.info("*** couldn't get resources search data")
            log.error(e)
                    
        return data

    def searchIdeas(self, terms, locationId):
        clause = self.makeMatchClause(terms, "i.description")
                
        sql = """select i.idea_id
                       ,i.description
                      ,i.submission_type
                      ,i.created_datetime
                      ,u.user_id
                      ,u.first_name
                      ,u.last_name
                from idea i
                left join user u on u.user_id = i.user_id
                where
                i.is_active = 1 %s
                %s
                order by i.created_datetime desc""" % ((("and i.location_id = %s " % str(locationId)) if locationId else ""),
                                                        "and %s" % clause if len(clause) > 0 else "")


        data = list(self.db.query(sql))
        
        betterData = []
        
        for item in data:
            owner = None
            
            if (item.user_id):
                owner = mProject.smallUser(item.user_id, item.first_name, item.last_name)
        
            betterData.append(dict(idea_id = item.idea_id,
                            message = item.description,
                            created = str(item.created_datetime),
                            submission_type = item.submission_type,
                            owner = owner))
                
        return betterData

    def makeMatchClause(self, words, fieldstring):
        clauseList = []
    
        for word in words:
            clauseList.append("match(%s) against ('%s')" % (fieldstring, word))
            
        return ' or '.join(clauseList)
            
            
            
                