from framework.log import log

def getCounts(db):
    obj = None

    try:
        sql = """
select count(*) as num, 'num_users' as type from user where is_active = 1
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

def getKeywordUsage(db, limit = 10, offset = 0):
    data = []
    
    try:
        sql = """
select k.keyword as word, 
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