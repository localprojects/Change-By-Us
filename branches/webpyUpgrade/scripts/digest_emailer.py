#
# Get a list of posts for the day
# Send to the recipient list for this group
#
# 

def get_recent_messages(db, projectId, fromDate=None, filterBy='member_comment'):
    """
    from: datetime of last digest
    """
    messages = []
    if (filterBy not in ['member_comment','admin_comment','goal_achieved','join','endorsement']):
        filterBy = None
    sql = """
select 
    pm.project_message_id,
    pm.message_type,
    pm.message,
    pm.created_datetime,
    u.user_id,
    u.first_name,
    u.last_name,
    u.image_id,
    g.user_group_id,
    g.group_name,
    i.idea_id,
    i.description as idea_description,
    i.submission_type as idea_submission_type,
    i.created_datetime as idea_created_datetime
    from project_message pm
    inner join user u on u.user_id = pm.user_id
    join user__user_group ug on ug.user_id = u.user_id
    join user_group g on g.user_group_id = ug.user_group_id
    left join idea i on i.idea_id = pm.idea_id
    where pm.project_id = $projectId and pm.is_active = 1
    and ($filterBy is null or pm.message_type = $filterBy)
    and i.created_datetime > $from
    order by g.user_group_id, pm.created_datetime desc
"""

    comments = list(db.query(sql, {'id':projectId, 'from':fromDate, 'filterBy':filterBy}))
    groups = {}
    for comment in comments:
        groups[comment.user_group_id].append(comment)
    
    return groups

def get_recent_users(db, fromDate=None)
    """
    from: datetime of last digest
    """

    messages = []
    if (filterBy not in ['member_comment','admin_comment','goal_achieved','join','endorsement']):
        filterBy = None

    sql = """
select 
u.user_id,
u.first_name,
u.last_name,
u.image_id,
u.created_datetime,
g.user_group_id,
g.group_name
from user u 
join user__user_group ug on ug.user_id = u.user_id
join user_group g on g.user_group_id = ug.user_group_id
where u.created_datetime >= $from
order by g.user_group_id, u.created_datetime desc
"""
    users = list(db.query(sql, {'from':fromdate}))
    groups = {}
    for user in users:
        groups[user.user_group_id].append(user)

    return groups

def create_digest(db, fromDate=None):
    users_by_group = get_recent_users(db=db, fromDate=fromDate)

    projectmessages = {}
    for project in projects:
        messages_by_group = get_recent_messages(db=db, projectId=project, fromDate=fromDate)
        
        project_messages[project].append(messages_by_group)

    # Uniquify the list
    groups = dict((x[0], x) for x in groups).values()

    # Create the message
    for group in gruops:
        # Create the digest()
