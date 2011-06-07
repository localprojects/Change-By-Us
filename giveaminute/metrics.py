from framework.log import log

def getCounts(db):
    obj = None

    try:
        sql = """select count(*) as num, 'num_users' as type from user where is_active = 1
                  union
                select count(*) as num, 'num_projects' as type from project where is_active = 1
                  union
                select count(*) as num, 'num_ideas' as type from idea where is_active = 1
                  union
                select count(*) as num, 'num_resources' as type from project_resource where is_active = 1
                  union
                select cast((count(pu.user_id) / (select count(project_id) from project where is_active = 1)) as unsigned) as num, 
                      'num_avg_users_per_project' as type 
                from project__user pu
                  inner join user u on u.user_id = pu.user_id and u.is_active = 1
                  union
                select cast((count(idea_id) / datediff(now(), min(created_datetime))) as unsigned) as num, 'num_avg_ideas_per_day' as type from idea where is_active = 1"""
        data = list(db.query(sql))
        
        obj = dict((item.type, item.num) for item in data)
    except Exception,e:
        log.info("*** couldn't get metrics counts")
        log.error(e)
    
    return obj
    
def getProjectCounts(db):
    data = []
    
    try:
        sql = """select p.title,
                  (select count(pu.user_id) from project__user pu 
                      inner join user u on u.user_id = pu.user_id and u.is_active = 1
                      where pu.project_id = p.project_id) as num_users,
                  (select count(pi.idea_id) from project__idea pi  
                      inner join idea i on i.idea_id = pi.idea_id and i.is_active = 1
                      where pi.project_id = p.project_id) as num_ideas,
                  (select count(pr.project_resource_id) from project__project_resource pr 
                      inner join project_resource r on r.project_resource_id = pr.project_resource_id and r.is_active = 1
                      where pr.project_id = p.project_id) as num_resources,
                  (select count(pe.user_id) from project_endorsement pe 
                      inner join user u on u.user_id = pe.user_id and u.is_active = 1
                      where pe.project_id = p.project_id) as num_endorsements,
                  coalesce(p.keywords, '') as keywords
                from project p
                where p.is_active = 1
                order by p.title"""
        data = list(db.query(sql))
    except Exception, e:
        log.info("*** couldn't get project counts")
        log.error(e)
        
    return data
    
def getResourceCounts(db):
    data = []
    
    try:
        sql = """select r.project_resource_id,
                       r.title, 
                       r.description,
                       r.created_datetime,
                       (select count(*) from project__project_resource ppr
                          inner join project p on p.project_id = ppr.project_id and p.is_active = 1
                          where ppr.project_resource_id = r.project_resource_id) as project_count
                from project_resource r
                where r.is_active = 1 and is_hidden = 0
                order by r.title"""
        data = list(db.query(sql))
    except Exception, e:
        log.info("*** couldn't get resource counts")
        log.error(e)
        
    return data
    
def getUserCounts(db):
    data = []
    
    try:
        sql = """select u.first_name,
                      u.last_name,
                      u.email,
                      u.created_datetime,
                      (select count(pu.project_id) from project__user pu
                        inner join project p on p.project_id = pu.project_id and p.is_active = 1
                        where pu.user_id = u.user_id) as num_projects
                from user u
                where u.is_active = 1
                order by u.last_name, u.first_name"""
        data = list(db.query(sql))
    except Exception, e:
        log.info("*** couldn't get user counts")
        log.error(e)
        
    return data

def getLocationCounts(db):
    data = []
    
    try:
        sql = """select l.name,
                        l.borough,
                        (select count(p.project_id) from project p where p.is_active = 1 and p.location_id = l.location_id) as num_projects,
                        (select count(i.idea_id) from idea i where i.is_active = 1 and i.location_id = l.location_id) as num_ideas,
                        (select count(r.project_resource_id) from project_resource r where r.is_active = 1 and r.location_id = l.location_id) as num_resources
                from location l
                order by l.borough, l.location_id"""
        data = list(db.query(sql))
    except Exception, e:
        log.info("*** couldn't get location counts")
        log.error(e)
        
    return data

def getKeywordUsage(db, limit = 10, offset = 0):
    data = []
    
    try:
        sql = """select k.keyword as word, 
                      (select count(p.project_id) from project p where p.keywords like concat('%%%%', k.keyword, '%%%%')) as num_projects,
                      (select count(r.project_resource_id) from project_resource r where r.keywords like concat('%%%%', k.keyword, '%%%%')) as num_resources
                from keyword k
                order by 
                    ((select count(p.project_id) from project p where keywords like concat('%%%%', k.keyword, '%%%%'))
                    + (select count(r.project_resource_id) from project_resource r where r.keywords like concat('%%%%', k.keyword, '%%%%'))) desc
                limit $limit offset $offset"""
        data = list(db.query(sql, {'limit':limit, 'offset':offset}))
    except Exception, e:
        log.info("*** couldn't get keyword usage")
        log.error(e)
        
    return data
    
def getNumKeywords(db):
    num = 0
    
    try:
        sql = "select count(*) as count from keyword"
        data = list(db.query(sql))
        
        num = data[0].count
    except Exception, e:
        log.info("*** couldn't get keyword count")
        log.error(e)
        
    return num