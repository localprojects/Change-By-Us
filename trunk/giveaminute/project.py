from framework.log import log

class Project():
    def __init__(self, db, projectId):
        self.id = projectId
        self.db = db
#         self.data = 
        
    def populateProjectData(self):
        sql = """select user_key 
                      ,email
                      ,password
                      ,salt
                      ,phone
                      ,first_name
                      ,last_name
                      ,image_id
                      ,location_id
                from user where user_id = $id"""
        
        try:
            data = list(self.db.query(sql, {'id':self.id}))[0]
            
            if len(data) > 0:
                return data
            else:
                return None
        except Exception, e:
            log.info("*** couldn't get user into")
            log.error(e)
            return None            
    
    # dummy data    
    def getFullDictionary(self):
        data = dict(project_id = 12, 
                    editable = True,
                    info = dict(title = "Start a Garden on 161st and Melrose Ave",
                                owner = dict(u_id = 37,
                                            name = "Andrew M."),
                                mission = "Tired of the empty lot at 161st and Melrose Ave. Lets start a community garden to help out the Bronx and get kids involved up here!",
                                keywords = ["garden","trees","green","environment"],
                                endorsements = dict(items = [dict(endorsement_id = 1,
                                                                user_id = 10,
                                                                name = "Michael Bloomberg",
                                                                title = "Mayor",
                                                                organization = "City of New York"),
                                                             dict(endorsement_id = 2,
                                                                user_id = 11,
                                                                name = "Adrian Benepe",
                                                                title = "Commissioner",
                                                                organization = "New York City Department of Parks and Recreation")]),
                                location = dict(location_id = 501,
                                                name = "South Bronx",
                                                position = dict(lat = "40.692064", lng = "-73.974187")),
                                members = dict(items = [dict(u_id = 37,
                                                            name = "Andrew M."),
                                                        dict(u_id = 38,
                                                            name = "Ethan H."),
                                                        dict(u_id = 39,
                                                            name = "Steven M."),
                                                        dict(u_id = 40,
                                                            name = "JD"),
                                                        dict(u_id = 41,
                                                            name = "Hasim Q.")]),
                                resources = dict(links = dict(items = [dict(link_id = 1,
                                                                            title = "Our Facebook Page",
                                                                            url = "http://www.facebook.com/",
                                                                            image_id = 1),
                                                                        dict(link_id = 2,
                                                                            title = "Our Google Group",
                                                                            url = "http://www.google.com/",
                                                                            image_id = 2),
                                                                        dict(link_id = 3,
                                                                            title = "Local Projects",
                                                                            url = "http://www.localprojects.net/",
                                                                            image_id = 3)]),
                                                organizations = dict(items = [dict(organization_id = 1,
                                                                            title = "Bronx River Alliance",
                                                                            url = "http://www.bronxriver.org/",
                                                                            image_id = 4),
                                                                        dict(organization_id = 2,
                                                                            title = "NYC 311",
                                                                            url = "http://www.nyc.gov/311/",
                                                                            image_id = 5),
                                                                        dict(organization_id = 3,
                                                                            title = "Local Projects",
                                                                            url = "http://www.localprojects.net/",
                                                                            image_id = 6)])),
                                goals = dict(items = [dict(goal_id = 12345,
                                                        active = True,
                                                        text = "Contact the City Parks Department and find out the situation for planting trees in the area.",
                                                        timeframe = "1 month",
                                                        owner = dict(u_id = 39,
                                                                    name = "Steven M.")),
                                                    dict(goal_id = 3412,
                                                        active = False,
                                                        text = "Some other goal with Short descriptive text",
                                                        timeframe = "1 day",
                                                        owner = dict(u_id = 39,
                                                                    name = "Steven M.")),
                                                    dict(goal_id = 56,
                                                        active = True,
                                                        text = "Short text",
                                                        timeframe = "1 week",
                                                        owner = dict(u_id = 41,
                                                                    name = "Hasim Q.")),
                                                    dict(goal_id = 434,
                                                        active = True,
                                                        text = "REPEAT 1: Contact the City Parks Department and find out the situation for planting trees in the area.",
                                                        timeframe = "1 month",
                                                        owner = dict(u_id = 39,
                                                                    name = "Steven M.")),
                                                    dict(goal_id = 44,
                                                        active = False,
                                                        text = "REPEAT 2: Contact the City Parks Department and find out the situation for planting trees in the area.",
                                                        timeframe = "1 month",
                                                        owner = dict(u_id = 39,
                                                                    name = "Steven M."))]),
                                messages = dict(n_returned = 10,
                                                offset = 0,
                                                total = 30,
                                                items = [dict(message_id = 87634,
                                                             message_type = "join", 
                                                             owner = dict(u_id = 39,
                                                                        name = "Steven M."),
                                                             body = "Hasim Q. joined our group",
                                                            created = "2011-02-12 12:30:02",
                                                            idea = dict(idea_id = 78634,
                                                                    owner = dict(u_id = 41,
                                                                                name = "Hasim Q."),
                                                                    message = "Theres a big need on my street for a garden...",
                                                                    created = "2011-02-12 12:30:02")),
                                                        dict(message_id = 87634,
                                                             message_type = "join", 
                                                             owner = dict(u_id = 39,
                                                                        name = "Steven M."),
                                                             body = "Hey this is great, I think we should set up weekly meetings so we can me more efficient. <img src='http://someimagehere.html'></img>",
                                                            created = "2011-02-12 12:30:02",
                                                            idea = None),
                                                        dict(message_id = 87634,
                                                             message_type = "join", 
                                                             owner = dict(u_id = 39,
                                                                        name = "Steven M."),
                                                             body = "Hey this is great, I think we should set up weekly meetings so we can me more efficient. <img src='http://someimagehere.html'></img>",
                                                            created = "2011-02-12 12:30:02",
                                                            idea = dict(idea_id = 78634,
                                                                    owner = dict(u_id = 41,
                                                                                name = "Hasim Q."),
                                                                    message = "Theres a big need on my street for a garden...",
                                                                    created = "2011-02-12 12:30:02")),
                                                        dict(message_id = 87634,
                                                             message_type = "join", 
                                                             owner = dict(u_id = 39,
                                                                        name = "Steven M."),
                                                             body = "Hey this is great, I think we should set up weekly meetings so we can me more efficient. <img src='http://someimagehere.html'></img>",
                                                            created = "2011-02-12 12:30:02",
                                                            idea = dict(idea_id = 78634,
                                                                    owner = dict(u_id = 41,
                                                                                name = "Hasim Q."),
                                                                    message = "Theres a big need on my street for a garden...",
                                                                    created = "2011-02-12 12:30:02"))]),
                                related_ideas = dict(items = [dict(idea_id = 78634,
                                                                    owner = dict(u_id = 41,
                                                                                name = "Hasim Q."),
                                                                    message = "Theres a big need on my street for a garden...",
                                                                    created = "2011-02-12 12:30:02"),
                                                              dict(idea_id = 78634,
                                                                    owner = dict(u_id = 41,
                                                                                name = "Hasim Q."),
                                                                    message = "Theres a big need on my street for a garden...",
                                                                    created = "2011-02-12 12:30:02"),
                                                              dict(idea_id = 78634,
                                                                    owner = dict(u_id = 41,
                                                                                name = "Hasim Q."),
                                                                    message = "Theres a big need on my street for a garden...",
                                                                    created = "2011-02-12 12:30:02"),
                                                              dict(idea_id = 78634,
                                                                    owner = dict(u_id = 41,
                                                                                name = "Hasim Q."),
                                                                    message = "Theres a big need on my street for a garden...",
                                                                    created = "2011-02-12 12:30:02"),
                                                              dict(idea_id = 78634,
                                                                    owner = dict(u_id = 41,
                                                                                name = "Hasim Q."),
                                                                    message = "Theres a big need on my street for a garden...",
                                                                    created = "2011-02-12 12:30:02")])))
                                
        return data
        

def createProject(db, title, description, keywords, locationId, imageId):
    try:
        if (not locationId or locationId < 1):
            locationId = -1
    
        projectId = db.insert('project', title = title,
                                    description = description, 
                                    image_id = imageId, 
                                    location_id = locationId, 
                                    keywords = keywords, 
                                    created_datetime=None)
                                    
        
    except Exception, e:
        log.info("*** problem creating project")
        log.error(e)    
        return None
        
    return projectId
    
def attachResourceToProject(db, projectId, resourceId):
    try:
        db.insert('project__project_resource', project_id = projectId,
                                    project_resource_id = resourceId)
                                    
        return True;
    except Exception, e:
        log.info("*** problem attaching resource to project")
        log.error(e)    
        return False 
        
def getProjectsByLocation(db, locationId, limit = 100):
    try:
        sql = """select p.project_id, p.title, p.description, p.image_id, p.location_id, 0 as num_members 
                    from project p where p.is_active = 1 and p.location_id = $locationId
                    limit $limit"""
        data = list(db.query(sql, {'locationId':locationId, 'limit':limit}))
        
        return data
    except Exception, e:
        log.info("*** couldn't get projects by location")
        log.error(e)
        return None
    
def getProjectsByKeywords(db, keywords, limit = 100):
    # there's a better way to do this
    keywordClause = "%%' or p.keywords like '%%".join(keywords)
    
    try:
        sql = """select p.project_id, p.title, p.description, p.image_id, p.location_id, 0 as num_members 
                    from project p where p.is_active = 1 and (p.keywords like '%%%%%s%%%%')
                    limit $limit""" % keywordClause
        data = list(db.query(sql, {'limit':limit}))
        
        return data
    except Exception, e:
        log.info("*** couldn't get projects by keywords")
        log.error(e)
        return None
                 
def getProjects(db, keywords, locationId, limit = 100):
    keywordClause = "%%' or p.keywords like '%%".join(keywords)
    
    try:
        sql = """select p.project_id, p.title, p.description, p.image_id, p.location_id, 0 as num_members 
                from project p where p.is_active = 1 and (p.location_id = $locationId and (p.keywords like '%%%%%s%%%%'))
                limit $limit""" % keywordClause
        data = list(db.query(sql, {'locationId':locationId, 'limit':limit}))
            
        return data
    except Exception, e:
        log.info("*** couldn't get projects")
        log.error(e)
        return None