from framework.log import log
import giveaminute.idea as mIdea

class Project():
    def __init__(self, db, projectId):
        self.id = projectId
        self.db = db
        self.data = self.populateProjectData()
        
    def populateProjectData(self):
        sql = """
select p.project_id 
    ,p.title
    ,p.description
    ,p.keywords
    ,p.image_id
    ,p.is_active
    ,p.created_datetime
    ,p.updated_datetime
    ,l.location_id
    ,l.name as location_name
    ,u.user_id as owner_user_id
    ,u.first_name as owner_first_name
    ,u.last_name as owner_last_name
from project p
left join location l on l.location_id = p.location_id
left join project__user pu on pu.project_id = p.project_id
left join user u on u.user_id = pu.user_id
where p.project_id = $id;"""
        
        try:
            data = list(self.db.query(sql, {'id':self.id}))
            
            if len(data) > 0:
                return data[0]
            else:
                return None
        except Exception, e:
            log.info("*** couldn't get project info")
            log.error(e)
            return None            
    
    # dummy data    
    def getFullDictionary(self):
        members = self.getMembers()
        endorsements = self.getEndorsements()
        links = self.getLinks()
        projectResources = self.getResources()
        goals = self.getGoals()
        messages = []
        relatedIdeas = self.getRelatedIdeas()
    
        data = dict(project_id = self.id,
                    editable = True,
                    info = dict(title = self.data.title,
                                owner = smallUser(self.data.owner_user_id, self.data.owner_first_name, self.data.owner_last_name),
                                mission = self.data.description,
                                keywords = (self.data.keywords.split() if self.data.keywords else []),
                                endorsements = dict(items = endorsements),
                                location = dict(location_id = self.data.location_id,
                                                name = self.data.location_name,
                                                position = {}),
                                members = dict(items = members),
                                resources = dict(links = dict(items = links),
                                                organizations = dict(items = projectResources)),
                                goals = dict(items = goals),
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
                                related_ideas = dict(items = relatedIdeas)))
                                
        return data                                                    
        
    def getMembers(self):
        members = []
        
        sql = """select u.user_id, u.first_name, u.last_name from user u
                inner join project__user pu on pu.user_id = u.user_id and pu.project_id = $id"""
                
        try:
            data = list(self.db.query(sql, {'id':self.id}))
            
            if len(data) > 0:
                for item in data:
                    members.append(smallUser(item.user_id, item.first_name, item.last_name))
        except Exception, e:
            log.info("*** couldn't get project members")
            log.error(e)                  
            
        return members
                                                
    def getEndorsements(self):
        endorsements = []
        
        sql = """select u.user_id, u.first_name, u.last_name, u.image_id, pl.title, pl.organization from user u
                inner join project_leader pl on pl.user_id = u.user_id
                inner join project_endorsement pe on pe.user_id = pl.user_id and pe.project_id = $id"""
                
        try:
            data = list(self.db.query(sql, {'id':self.id}))
            
            if len(data) > 0:
                for item in data:
                    endorsements.append(endorsementUser(item.user_id, item.first_name, item.last_name, item.image_id, item.title, item.organization))
        except Exception, e:
            log.info("*** couldn't get project endorsements")
            log.error(e)                  
            
        return endorsements
        
    def getLinks(self):
        links = []
        
        sql = "select project_link_id, title, url, image_id from project_link where project_id = $id"
                
        try:
            data = list(self.db.query(sql, {'id':self.id}))
            
            if len(data) > 0:
                for item in data:
                    links.append(link(item.project_link_id, item.title, item.url, item.image_id))
        except Exception, e:
            log.info("*** couldn't get links")
            log.error(e)                  
            
        return links
        
    def getResources(self):
        resources = []
        
        sql = """select pr.project_resource_id, pr.title, pr.url, pr.image_id from project_resource pr 
                inner join project__project_resource ppr on ppr.project_resource_id = pr.project_resource_id and ppr.project_id = $id"""
                
        try:
            data = list(self.db.query(sql, {'id':self.id}))
            
            if len(data) > 0:
                for item in data:
                    resources.append(resource(item.project_resource_id, item.title, item.url, item.image_id))
        except Exception, e:
            log.info("*** couldn't get project resources")
            log.error(e)                  
            
        return resources
        
    def getRelatedIdeas(self):
        ideas = []
        
        try: 
            data = mIdea.findIdeas(self.db, self.data.keywords.split(), self.data.location_id)
        
            if len(data) > 0:
                for item in data:
                    ideas.append(idea(item.idea_id, item.description, item.user_id, item.first_name, item.last_name, item.created_datetime, item.submission_type))
        except Exception, e:
            log.info("*** couldn't get related")
            log.error(e)                  
            
        return ideas
        
    def getGoals(self):
        goals = []
        
        sql = """select g.project_goal_id, g.description, g.time_frame_numeric, g.time_frame_unit, g.is_accomplished, g.is_featured,
                      u.user_id, u.first_name, u.last_name
                from project_goal g
                inner join user u on u.user_id = g.user_id
                where g.project_id = $id"""
                
        try:
            data = list(self.db.query(sql, {'id':self.id}))

        
            if len(data) > 0:
                for item in data:
                    goals.append(goal(item.project_goal_id, 
                                      item.description, 
                                      bool(item.is_featured),
                                      bool(item.is_accomplished),
                                      item.time_frame_numeric,
                                      item.time_frame_unit,
                                      item.user_id, 
                                      item.first_name, 
                                      item.last_name))
        except Exception, e:
            log.info("*** couldn't get related")
            log.error(e)                  
            
        return goals
                                                
def smallUser(id, first, last):
    return dict(u_id = id,
                name = "%s %s" % (first, last))
                
def endorsementUser(id, first, last, image_id, title, org):
    return dict(u_id = id,
                name = "%s %s" % (first, last),
                image_id = image_id,
                title = title,
                organization = org)
                
def link(id, title, url, imageId):
    return dict(link_id = id, title = title, url = url, image_id = imageId)
    
def resource(id, title, url, imageId):
    return dict(organization = id, title = title, url = url, image_id = imageId)
    
def idea(id, description, userId, firstName, lastName, createdDatetime, submissionType):
    return dict(idea_id = id,
                message = description,
                owner = smallUser(userId, firstName, lastName),
                created = str(createdDatetime),
                submission_type = submissionType)
                
def goal(id, description, isFeatured, isAccomplished, time_n, time_unit, userId, firstName, lastName):
    return dict(goal_id = id,
                text = description,
                active = isFeatured,
                accomplished = isAccomplished,
                timeframe = "%s %s" % (str(time_n), time_unit),
                owner = smallUser(userId, firstName, lastName))

    
def getTestData():
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
        

def createProject(db, ownerUserId, title, description, keywords, locationId, imageId):
    projectId = None
    
    try:
        if (not locationId or locationId < 1):
            locationId = -1
    
        projectId = db.insert('project', title = title,
                                    description = description, 
                                    image_id = imageId, 
                                    location_id = locationId, 
                                    keywords = keywords, 
                                    created_datetime=None)
                                    
        if (projectId):
            join(db, projectId, ownerUserId, True)
        else:
            log.error("*** no project id returned, probably no project created")
    except Exception, e:
        log.info("*** problem creating project")
        log.error(e)    
        
    return projectId
    
def join(db, projectId, userId, isAdmin = False):
    if (not isUserInProject(db, projectId, userId)):
        db.insert('project__user', project_id = projectId, user_id = userId, is_project_admin = (1 if isAdmin else 0))

        return True
    else:
        log.info("*** user already in project")
        return False
    
def endorse(db, projectId, userId):
    if (not hasUserEndorsedProject(db, projectId, userId)):
        db.insert('project_endorsement', project_id = projectId, user_id = userId)

        return True
    else:
        log.info("*** user already in project")
        return False
        
    
def isUserInProject(db, projectId, userId):
    try:
        sql = "select user_id from project__user where project_id = $projectId and user_id = $userId"
        data = db.query(sql, {'projectId':projectId, 'userId':userId})
        
        return len(data) > 0
    except Exception, e:
        log.info("*** couldn't determine if user in project")
        log.error(e)
        return False
 
def isResourceInProject(db, projectId, projectResourceId):
    try:
        sql = "select project_resource_id from project__project_resource where project_id = $projectId and project_resource_id = $projectResourceId"
        data = db.query(sql, {'projectId':projectId, 'projectResourceId':projectResourceId})
        
        return len(data) > 0
    except Exception, e:
        log.info("*** couldn't determine if resource in project")
        log.error(e)
        return False 
 
def hasUserEndorsedProject(db, projectId, userId):
    try:
        sql = "select user_id from project_endorsement where project_id = $projectId and user_id = $userId"
        data = db.query(sql, {'projectId':projectId, 'userId':userId})
        
        return len(data) > 0
    except Exception, e:
        log.info("*** couldn't determine if user endorsed project")
        log.error(e)
        return False 

def getProjectLocation(db, projectId):
    try:
        sql = """select l.location_id, l.name, l.lat, l.lon from location l
                inner join project p on p.location_id = l.location_id and p.project_id = $id"""
        data = list(db.query(sql, {'id':projectId}))
        
        if (len(data) > 0):
            return data[0]
        else:
            return None
    except Exception, e:
        log.info("*** couldn't get project location data")
        log.error(e)
        return None
    
def addResourceToProject(db, projectId, resourceId):
    try:
        if (not isResourceInProject(db, projectId, resourceId)): 
            db.insert('project__project_resource', project_id = projectId,
                                        project_resource_id = resourceId)
        
            return True
        else:
            log.error("*** resource already in project")
            return False
    except Exception, e:
        log.info("*** problem attaching resource to project")
        log.error(e)    
        return False 
        
def addLinkToProject(db, projectId, title, url):
    try:
        db.insert('project_link', project_id = projectId,
                                    title = title,
                                    url = url)
                                    
        return True;
    except Exception, e:
        log.info("*** problem adding link to project")
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
        
def addGoalToProject(db, projectId, description, timeframeNumber, timeframeUnit, userId):
    try:
        db.insert('project_goal', project_id = projectId,
                                    description = description,
                                    time_frame_numeric = int(timeframeNumber),
                                    time_frame_unit = timeframeUnit,
                                    user_id = userId)
                                    
        return True;
    except Exception, e:
        log.info("*** problem adding goal to project")
        log.error(e)    
        return False     
        
def featureProjectGoal(db, projectGoalId):
    # TODO should put rollback/commit here
    try:
        sqlupdate1 = """update project_goal g1, project_goal g2 set g1.is_featured = 0 
                where g1.project_id = g2.project_id and g2.project_goal_id = $id"""
        db.query(sqlupdate1, {'id':projectGoalId})
        
        sqlupdate2 = "update project_goal set is_featured = 1 where project_goal_id = $id"
        db.query(sqlupdate2, {'id':projectGoalId})

        return True           
    except Exception, e:
        log.info("*** problem featuring goal")
        log.error(e)    
        return False     

def accomplishProjectGoal(db, projectGoalId):
    # TODO should put rollback/commit here
    try:
        sql = "update project_goal set is_accomplished = 1 where project_goal_id = $id"
        db.query(sql, {'id':projectGoalId})

        return True           
    except Exception, e:
        log.info("*** problem accomplishing goal")
        log.error(e)    
        return False 
        
def addMessage(db, projectId, message, message_type, userId = None, ideaId = None,  projectGoalId = None):
    try:
        db.insert('project_message', project_id = projectId,
                                    message = message,
                                    user_id = user_id,
                                    idea_id = ideaId,
                                    project_goal_id = projectGoalId,
                                    message_type  = message_type)
                                    
        return True;
    except Exception, e:
        log.info("*** problem adding message to project")
        log.error(e)    
        return False  


