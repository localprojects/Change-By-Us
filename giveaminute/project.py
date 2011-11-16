"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import os
from datetime import timedelta

from framework import util
from framework.log import log
#from framework.config import *
from framework.config import Config
#from framework.emailer import *
from framework.util import local_utcoffset
import giveaminute.idea
import giveaminute.messaging
import helpers.censor

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
    ,p.is_official
    ,if(fp.ordinal, 1, 0) as is_featured
    ,(select count(npu.user_id) from project__user npu
        inner join user nu on nu.user_id = npu.user_id and nu.is_active = 1
        where npu.project_id = p.project_id)  as num_members
    ,l.location_id
    ,l.name as location_name
    ,l.lat as location_lat
    ,l.lon as location_lon
    ,u.user_id as owner_user_id
    ,u.first_name as owner_first_name
    ,u.last_name as owner_last_name
    ,u.email as owner_email
    ,u.image_id as owner_image_id
    ,u.affiliation as owner_affiliation
    ,u.group_membership_bitmask as owner_group_membership_bitmask
from project p
inner join location l on l.location_id = p.location_id
inner join project__user pu on pu.project_id = p.project_id and pu.is_project_admin
inner join user u on u.user_id = pu.user_id
left join featured_project fp on fp.project_id = p.project_id
where p.project_id = $id and p.is_active = 1
limit 1"""

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

    def getFullDictionary(self):
        members = self.getMembers()
        endorsements = self.getEndorsements()
        links = self.getLinks()
        projectResources = self.getResources()
        messages = self.getMessages()
        relatedIdeas = self.getRelatedIdeas()

        data = dict(project_id = self.id,
                    editable = True,
                    info = dict(title = self.data.title,
                                image_id = self.data.image_id,
                                owner = smallUserDisplay(self.data.owner_user_id,
                                                         userNameDisplay(self.data.owner_first_name,
                                                                         self.data.owner_last_name,
                                                                         self.data.owner_affiliation,
                                                                         isFullLastName(self.data.owner_group_membership_bitmask)),
                                                         self.data.owner_image_id),
                                mission = self.data.description,
                                keywords = (self.data.keywords.split() if self.data.keywords else []),
                                endorsements = dict(items = endorsements),
                                is_featured = self.data.is_featured,
                                is_official = self.data.is_official,
                                location = dict(location_id = self.data.location_id,
                                                name = self.data.location_name,
                                                position = dict(lat = str(self.data.location_lat), lng = str(self.data.location_lon))),
                                members = dict(items = members),
                                resources = dict(links = dict(items = links),
                                                organizations = dict(items = projectResources)),
                                messages = dict(n_returned = len(messages),
                                                offset = 0,
                                                total = len(messages),
                                                items = messages),
                                related_ideas = dict(items = relatedIdeas)))

        return data

    def getMembers(self):
        members = []

        sql = """select u.user_id, u.first_name, u.last_name, u.affiliation, u.group_membership_bitmask, u.image_id from user u
                inner join project__user pu on pu.user_id = u.user_id and pu.project_id = $id"""

        try:
            data = list(self.db.query(sql, {'id':self.id}))

            if len(data) > 0:
                for item in data:
                    members.append(smallUserDisplay(item.user_id,
                                                    userNameDisplay(item.first_name,
                                                                         item.last_name,
                                                                         item.affiliation,
                                                                         isFullLastName(item.group_membership_bitmask)),
                                                    item.image_id))
        except Exception, e:
            log.info("*** couldn't get project members")
            log.error(e)

        return members

    def getEndorsements(self):
        endorsements = []

        sql = """select u.user_id, u.first_name, u.last_name, u.affiliation, u.group_membership_bitmask, u.image_id
                    from project_endorsement pe
                    inner join user u on pe.user_id = u.user_id
                    where pe.project_id = $id"""

        try:
            data = list(self.db.query(sql, {'id':self.id}))

            if len(data) > 0:
                for item in data:
                    endorsements.append(smallUserDisplay(item.user_id,
                                                         userNameDisplay(item.first_name,
                                                                         item.last_name,
                                                                         item.affiliation,
                                                                         isFullLastName(item.group_membership_bitmask)),
                                                        item.image_id))
        except Exception, e:
            log.info("*** couldn't get project endorsements")
            log.error(e)

        return endorsements

    def getLinks(self):
        return getLinks(self.db, self.id)

    def getResources(self):
        return getResources(self.db, self.id)

    def getRelatedIdeas(self):
        ideas = []

        try:
            ideas = giveaminute.idea.searchIdeas(self.db, self.data.keywords.split(), self.data.location_id, excludeProjectId = self.id)
        except Exception, e:
            log.info("*** couldn't get related")
            log.error(e)

        return ideas

    def getMessages(self):
        return getMessages(self.db, self.id, 10, 0)

## FORMATTING FUNCTIONS
# TODO: move these into their own module
def isFullLastName(bitmask):
    # is admin or lead
    return (util.getBit(bitmask, 1) or util.getBit(bitmask, 3))

def smallProject(id, title, description, imageId, numMembers, ownerUserId, ownerFirstName, ownerLastName, ownerImageId):
    return dict(project_id = id,
                title = title,
                description = description,
                image_id = imageId,
                num_members = numMembers,
                owner = smallUser(ownerUserId, ownerFirstName, ownerLastName, ownerImageId))

def message(id,
            type,
            message,
            createdDatetime,
            userId,
            name,
            imageId,
            attachmentId = None,
            ideaId = None,
            idea = None,
            ideaSubType = None,
            ideaCreatedDatetime = None,
            attachmentMediaType = None,
            attachmentMediaId = None,
            attachmentTitle = None,
            projectId = None,
            projectTitle = None):
    """
    Construct and return a dictionary consisting of the data related to a
    message, given by the parameters.  This data is usually pulled off of
    several database tables with keys linking back to a message_id.

    NOTE: It is recommended to specify all of these as keyword arguments, not
          positional. If the model changes, the positions of the arguments may
          as well.

    **Return:**

    A ``dict`` with keys:

    - ``message_id`` -- Primary key
    - ``message_type`` -- ``'join'``,  ``'endorsement'``,
      ``'member_comment'``, or ``'admin_comment'``
    - ``file_id`` -- The primary key of the attachment, if any
    - ``owner`` -- The user that owns the message
    - ``body`` -- The content of the message
    - ``created`` -- The creation date
    - ``idea`` -- The idea instance attached to the message, if any
    - ``project_id`` -- The primary key of the project that the message is for
    - ``project_title`` -- The title of the project

    """
    if (ideaId):
        ideaObj = smallIdea(ideaId, idea, None, None, ideaSubType)
    else:
        ideaObj = None

    attachmentObj = smallAttachment(attachmentMediaType,
                                    attachmentMediaId,
                                    attachmentTitle)

    return dict(message_id = id,
                message_type = type,
                file_id = attachmentId,
                owner = smallUserDisplay(userId, name, imageId),
                body = message,
                created = str(createdDatetime - timedelta(hours=util.local_utcoffset())),
                idea = ideaObj,
                attachment = attachmentObj,
                project_id = projectId,
                project_title = projectTitle,
                )


def smallAttachment(media_type, media_id, title):
    """Returns a dictionary representing basic attachment information"""
    if media_type and media_id:
        return dict(type=media_type,
                    id=media_id,
                    title=title,
                    url=getAttachmentUrl(media_type, media_id),
                    small_thumb_url=getAttachmentThumbUrl(media_type, media_id, 'small'),
                    medium_thumb_url=getAttachmentThumbUrl(media_type, media_id, 'medium'),
                    large_thumb_url=getAttachmentThumbUrl(media_type, media_id, 'large'))
    else:
        return None


def getAttachmentUrl(media_type, media_id):
    """Get the URL to wherever the media is stored."""
    if media_type in ('file', 'image'):
        media_root = Config.get('media').get('root')

        return os.path.join(media_root, media_id)


def getAttachmentThumbFileName(media_type, media_id, size):
    """Get a file name for an image representation of the media."""
    if media_type == 'file':
        return 'generic_file_thumbnail.png'

    elif media_type == 'image':
        return '%s_thumb_%s' % (media_id, size)


def getAttachmentThumbUrl(media_type, media_id, size):
    """
    Get the URL to an image representation of the media. For images, this may be
    used for getting a thumbnail. Specify max width and height in that case.
    Otherwise you'll probably just get a generic file image.

    """
    if media_type == 'file':
        static_root = Config.get('staticfiles').get('root')
        stub_thumb_name = 'generic_file_thumbnail.png'

        return os.path.join(static_root, 'images', stub_thumb_name)

    elif media_type == 'image':
        media_root = Config.get('media').get('root')
        image_thumb_name = getAttachmentThumbFileName(media_type, media_id, size)

        return os.path.join(media_root, image_thumb_name)


def smallUser(id, first, last, image):
    if (id and first and last):
        return dict(u_id = id,
                    image_id = image,
                    name = userName(first, last))
    else:
        return None

def smallUserDisplay(id, fullDisplayName, image = None):
    if (id and fullDisplayName):
        return dict(u_id = id,
                    image_id = image,
                    name = fullDisplayName)
    else:
        return None


def userName(first, last, isFullLast = False):
    if (isFullLast):
        return "%s %s" % (first, last)
    else:
        return "%s %s." % (first, last[0])

def userNameDisplay(first, last, affiliation = None, isFullLast = False):
    name = None

    if (first and last):
        name = userName(first, last, isFullLast)

    if (affiliation):
        if (name):
            name = "%s, %s" % (name, affiliation)
        else:
            name = affiliation

    return name

def smallIdea(ideaId, description, firstName, lastName, submissionType):
    return dict(idea_id = ideaId,
                text = description,
                f_name = firstName,
                l_name = lastName,
                submitted_by = submissionType)

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
                owner = smallUser(userId, firstName, lastName, None),
                created = str(createdDatetime),
                submission_type = submissionType)

## END FORMATTING FUNCTIONS

def createProject(db, ownerUserId, title, description, keywords, locationId, imageId, isOfficial = False, organization = None):
    projectId = None

    try:
        # censor behavior
        numFlags = helpers.censor.badwords(db, ' '.join([title, description, keywords]))

        isActive = 0 if numFlags == 2 else 1

        projectId = db.insert('project', title = title,
                                    description = description,
                                    image_id = imageId,
                                    location_id = locationId,
                                    keywords = keywords,
                                    created_datetime=None,
                                    num_flags = numFlags,
                                    is_active = isActive,
                                    is_official = isOfficial,
                                    organization = organization)

        if (projectId):
            join(db, projectId, ownerUserId, True)
        else:
            log.error("*** no project id returned, probably no project created")
    except Exception, e:
        log.info("*** problem creating project")
        log.error(e)

    return projectId

def getNumMembers(db, projectId):
    count = 0

    try:
        sql = """select count(npu.user_id) as count from project__user npu
                    inner join user nu on nu.user_id = npu.user_id and nu.is_active = 1
                    where npu.project_id = $projectId"""
        data = list(db.query(sql, {'projectId':projectId}))

        if (len(data) > 0):
            count = data[0].count
        else:
            log.info("*** couldn't get member count for project %s" % projectId)
    except Exception, e:
            log.info("*** couldn't get member count for project %s" % projectId)
            log.error(e)

    return count


def approveItem(db, table, id):
    try:
        whereClause = "%s_id = %s" % (table, id)
        db.update(table, where = whereClause, num_flags = 0)
        return True
    except:
        log.info("*** couldn't approve item for table = %s, id = %s" % (table, id))
        log.error(e)
        return False

def deleteItem(db, table, id):
    try:
        whereClause = "%s_id = %s" % (table, id)
        db.update(table, where = whereClause, is_active = 0)
        return True
    except:
        log.info("*** couldn't delete item for table = %s, id = %s" % (table, id))
        log.error(e)
        return False

def deleteItemsByUser(db, table, userId):
    try:
        db.update(table, where = "user_id = $userId", is_active = 0, vars = { 'userId': userId })
        return True
    except:
        log.info("*** couldn't delete item for table =  %s, user_id = %s" % (table, userId))
        log.error(e)
        return False

def deleteProjectsByUser(db, userId):
    try:
        sql = """update project p, project__user pu set p.is_active = 1
                    where p.project_id = pu.project_id and pu.is_project_admin = 1 and pu.user_id = $userId"""
        db.query(sql, { 'userId':userId })
    except:
        log.info("*** couldn't delete projects for user_id = %s" % userId)
        log.error(e)
        return False

def updateProjectImage(db, projectId, imageId):
    try:
        sql = "update project set image_id = $imageId where project_id = $projectId"
        db.query(sql, {'projectId':projectId, 'imageId':imageId})
        return True
    except Exception, e:
        log.info("*** couldn't update project image")
        log.error(e)
        return False

def updateProjectDescription(db, projectId, description):
    try:
        # censor behavior
        numFlags = helpers.censor.badwords(db, description)
        isActive = 0 if numFlags == 2 else 1

        if (numFlags == 2):
            return False
        else:
            sql = "update project set description = $description, num_flags = num_flags + $flags where project_id = $projectId"
            db.query(sql, {'projectId':projectId, 'description':description, 'flags':numFlags})
            return True
    except Exception, e:
        log.info("*** couldn't update project description")
        log.error(e)
        return False

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
        log.info("*** user already endorsed project")
        return False

def removeEndorsement(db, projectId, userId):
    try:
        db.delete('project_endorsement', where = "project_id = $projectId and user_id = $userId", vars = { 'userId':userId, 'projectId':projectId })

        return True
    except Exception, e:
        log.info("*** error deleting endorsement")
        log.error(e)
        return False

def removeEndorsementMessage(db, projectId, userId):
    try:
        db.update('project_message', where = "project_id = $projectId and user_id = $userId", is_active = 0, vars = {'projectId':projectId, 'userId':userId})
        return True
    except Exception, e:
        log.info("*** couldn't delete endorsement message")
        log.error(e)
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

def removeUserFromProject(db, projectId, userId):
    from giveaminute import models
    from framework.orm_holder import OrmHolder

    try:
        orm = OrmHolder().orm

        user = orm.query(models.User).get(userId)
        project = orm.query(models.Project).get(projectId)

        result = user.leave(project)
        if result:
            orm.commit()
        return result
    except Exception, e:
        log.info("*** couldn't remove user from project")
        log.error(e)
        return False

def removeUserFromAllProjects(db, userId):
    try:
        db.delete('project__user', where = "user_id = $userId", vars = {'userId':userId})
        return True
    except Exception, e:
        log.info("*** couldn't remove user from project")
        log.error(e)
        return False

def addKeywords(db, projectId, newKeywords):
    try:
       # censor behavior
        numFlags = helpers.censor.badwords(db, ' '.join(newKeywords))

        if (numFlags == 2):
            return False

        sqlGet = "select keywords from project where project_id = $projectId"
        data = list(db.query(sqlGet, {'projectId':projectId}))

        if (len(data) > 0):
            keywords = data[0].keywords.split()
            newKeywords = [word.strip() for word in newKeywords]
            addKeywords = []

            for newWord in newKeywords:
                if (newWord not in keywords):
                    addKeywords.append(newWord)

            if (len(addKeywords) > 0):
                keywords = ' '.join(keywords + addKeywords)
        
                sql = "update project set keywords = $keywords, num_flags = num_flags + $flags where project_id = $projectId"
                db.query(sql, {'projectId':projectId, 'keywords':keywords, 'flags':numFlags})
                    
            # return true whether keyword exists or not
            return True
        else:
            log.error("*** couldn't get keywords for project")
            return False
    except Exception, e:
        log.info("*** couldn't add keyword to project")
        log.error(e)
        return False

def removeKeyword(db, projectId, keyword):
    try:
        sqlGet = "select keywords from project where project_id = $projectId"
        data = list(db.query(sqlGet, {'projectId':projectId}))

        if (len(data) > 0):
            keywords = data[0].keywords.split()

            if (keyword in keywords):
                i = keywords.index(keyword) # save the index to return for proper client side removal
                keywords.remove(keyword)
                
                newKeywords = ' '.join(keywords)

                sql = "update project set keywords = $keywords where project_id = $projectId"
                db.query(sql, {'projectId':projectId, 'keywords':newKeywords})
                
            # return true whether keyword exists or not
            return True
        else:
            log.error("*** couldn't get keywords for project")
            return False
    except Exception, e:
        log.info("*** couldn't remove keyword from project")
        log.error(e)
        return False

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

def removeResourceFromProject(db, projectId, projectResourceId):
    try:
        sql = "delete from project__project_resource where project_id = $projectId and project_resource_id = $projectResourceId"
        db.query(sql, {'projectId':projectId, 'projectResourceId':projectResourceId})

        return True
    except Exception, e:
        log.info("*** problem deleting resource %s to is_active = %s for project %s" % (projectResourceId, b, projectId))
        log.error(e)
        return False

def addLinkToProject(db, projectId, title, url):
    try:
        # censor behavior
        numFlags = helpers.censor.badwords(db, title)
        isActive = 0 if numFlags == 2 else 1

        db.insert('project_link', project_id = projectId,
                                    title = title,
                                    url = url,
                                    num_flags = numFlags,
                                    is_active = isActive)

        return True;
    except Exception, e:
        log.info("*** problem adding link to project")
        log.error(e)
        return False

def setLinkIsActive(db, linkId, b):
    try:
        db.update('project_link', where = "project_link_id = $linkId", is_active = b, vars = {'linkId':linkId})

        return True
    except Exception, e:
        log.info("*** problem setting link %s to is_active = %s" % (linkId, b))
        log.error(e)
        return False

def featureProject(db, projectId, ordinal = None):
    try:
        homepage = Config.get('homepage')
        numFeatured = homepage['num_featured_projects']

        # if no ordinal submitted, find first gap
        if (ordinal < 1):
            sql = """select ordinal + 1 as first_gap from featured_project fp1
                    where not exists
                      (select null from featured_project fp2 where fp2.ordinal = fp1.ordinal + 1)
                    order by ordinal limit 1"""
            data = list(db.query(sql))

            if (len(data) > 0 and data[0].first_gap <= numFeatured):
                ordinal = data[0].first_gap
            else:
                ordinal = 1

        if (ordinal > numFeatured):
            log.error("*** couldn't feature project id %s, too many featured projects")
            return False
        else:
            db.insert('featured_project',
                      ordinal = ordinal,
                      project_id = projectId)

            return True
    except Exception, e:
        log.info("*** couldn't feature project id %s" % projectId)
        log.error(e)
        return False

def unfeatureProject(db, projectId):
    try:
        sql = "select ordinal from featured_project where project_id = $projectId order by ordinal desc limit 1"
        data = list(db.query(sql, {'projectId':projectId}))

        if (len(data) > 0):
            ordinal = data[0].ordinal
            db.delete('featured_project',
                      where = "project_id = $projectId and ordinal = $ordinal",
                      vars = {'projectId':projectId, 'ordinal':ordinal})

            return ordinal
        else:
            log.error("*** couldn't unfeature project, project id %s not in feature table" % projectId)
            return -1
    except Exception, e:
        log.info("*** couldn't unfeature project id %s" % projectId)
        log.error(e)
        return -1


def getFeaturedProjects(db, limit = 6):
    betterData = []

    try:
        sql = """select
                    p.project_id,
                    p.title,
                    p.description,
                    p.image_id,
                    p.location_id,
                    o.user_id as owner_user_id,
                    o.first_name as owner_first_name,
                    o.last_name as owner_last_name,
                    o.affiliation as owner_affiliation,
                    o.group_membership_bitmask as owner_group_membership_bitmask,
                    o.image_id as owner_image_id,
                    (select count(npu.user_id) from project__user npu
                        inner join user nu on nu.user_id = npu.user_id and nu.is_active = 1
                        where npu.project_id = p.project_id)  as num_members
                from project p
                inner join featured_project fp on fp.project_id = p.project_id
                inner join project__user opu on opu.project_id = p.project_id and opu.is_project_admin = 1
                inner join user o on o.user_id = opu.user_id
                where p.is_active = 1
                order by fp.ordinal
                limit $limit"""
        data = list(db.query(sql, {'limit':limit}))

        for item in data:
            betterData.append({'project_id' : item.project_id,
                                'title' : item.title,
                                'description' : item.description,
                                'image_id' : item.image_id,
                                'location_id' : item.location_id,
                                'owner_user_id' : item.owner_user_id,
                                'owner_full_display_name' : userNameDisplay(item.owner_first_name,
                                                                      item.owner_last_name,
                                                                      item.owner_affiliation,
                                                                      isFullLastName(item.owner_group_membership_bitmask)),
                                'owner_image_id' : item.owner_image_id,
                                'num_members' : item.num_members})
    except Exception, e:
        log.info("*** couldn't get featured projects")
        log.error(e)

    return betterData

def getFeaturedProjectsDictionary(db):
    betterData = []

    try:
        sql = """select
                    p.project_id,
                    p.title,
                    p.description,
                    p.image_id,
                    p.location_id,
                    o.user_id as owner_user_id,
                    o.first_name as owner_first_name,
                    o.last_name as owner_last_name,
                    o.affiliation as owner_affiliation,
                    o.group_membership_bitmask as owner_group_membership_bitmask,
                    o.image_id as owner_image_id,
                    fp.updated_datetime as featured_datetime,
                    (select count(npu.user_id) from project__user npu
                        inner join user nu on nu.user_id = npu.user_id and nu.is_active = 1
                        where npu.project_id = p.project_id)  as num_members,
                    (select count(npi.idea_id) from project__idea npi
                        inner join idea ni on ni.idea_id = npi.idea_id and ni.is_active = 1
                        where npi.project_id = p.project_id)  as num_ideas,
                    (select count(npr.project_resource_id) from project__project_resource npr
                        inner join project_resource nr on nr.project_resource_id = npr.project_resource_id and nr.is_active = 1
                        where npr.project_id = p.project_id)  as num_project_resources,
                    (select count(e.user_id) from project_endorsement e
                        where e.project_id = p.project_id) as num_endorsements
                from project p
                inner join featured_project fp on fp.project_id = p.project_id
                inner join project__user opu on opu.project_id = p.project_id and opu.is_project_admin = 1
                inner join user o on o.user_id = opu.user_id
                where p.is_active = 1
                order by fp.ordinal"""
        data = list(db.query(sql))

        for item in data:
            betterData.append({'project_id' : item.project_id,
                                'title' : item.title,
                                'description' : item.description,
                                'image_id' : item.image_id,
                                'location_id' : item.location_id,
                                'owner' : smallUserDisplay(item.owner_user_id,
                                                           userNameDisplay(item.owner_first_name,
                                                                           item.owner_last_name,
                                                                           item.owner_affiliation,
                                                                           isFullLastName(item.owner_group_membership_bitmask)),
                                                           item.owner_image_id),
                                'featured_datetime' : str(item.featured_datetime),
                                'owner_image_id' : item.owner_image_id,
                                'num_members' : item.num_members,
                                'num_ideas' : item.num_ideas,
                                'num_project_resources' : item.num_project_resources,
                                'num_endorsements' : item.num_endorsements})
    except Exception, e:
        log.info("*** couldn't get featured projects with stats")
        log.error(e)

    return betterData

# find projects by location id
def getProjectsByLocation(db, locationId, limit = 100):
    data = []

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
                    inner join user o on o.user_id = opu.user_id where p.is_active = 1 and p.location_id = $locationId
                    limit $limit"""
        data = list(db.query(sql, {'locationId':locationId, 'limit':limit}))
    except Exception, e:
        log.info("*** couldn't get projects by location")
        log.error(e)

    return data

# find project by user id
def getProjectsByUser(db, userId, limit = 100):
    betterData = []

    try:
        sql = """select p.project_id,
                        p.title,
                        p.description,
                        p.image_id,
                        p.location_id,
                        o.user_id as owner_user_id,
                        o.first_name as owner_first_name,
                        o.last_name as owner_last_name,
                        o.affiliation as owner_affiliation,
                        o.group_membership_bitmask as owner_group_membership_bitmask,
                        o.image_id as owner_image_id,
                    (select count(cpu.user_id) from project__user cpu where cpu.project_id = p.project_id) as num_members
                from project p
                inner join project__user opu on opu.project_id = p.project_id and opu.is_project_admin = 1
                inner join user o on o.user_id = opu.user_id
                inner join project__user pu on pu.user_id = $userId and pu.project_id = p.project_id
                 where p.is_active = 1
                 limit $limit"""
        data = list(db.query(sql, {'userId':userId, 'limit':limit}))

        for item in data:
            betterData.append(dict(project_id = item.project_id,
                            title = item.title,
                            description = item.description,
                            image_id = item.image_id,
                            location_id = item.location_id,
                            owner = smallUserDisplay(item.owner_user_id,
                                                     userNameDisplay(item.owner_first_name,
                                                                     item.owner_last_name,
                                                                     item.owner_affiliation,
                                                                     isFullLastName(item.owner_group_membership_bitmask)),
                                                     item.owner_image_id),
                            num_members = item.num_members))
    except Exception, e:
        log.info("*** couldn't get projects")
        log.error(e)

    return betterData

def searchProjectsCount(db, terms, locationId):
    count = 0
    match = ' '.join([(item + "*") for item in terms])

    try:
        sql = """select count(*) as count
                    from project p
                    inner join project__user opu on opu.project_id = p.project_id and opu.is_project_admin = 1
                    where
                    p.is_active = 1
                    and ($locationId is null or p.location_id = $locationId)
                    and ($match = '' or match(p.title, p.keywords, p.description) against ($match in boolean mode))"""

        data = list(db.query(sql, {'match':match, 'locationId':locationId}))

        count = data[0].count
    except Exception, e:
        log.info("*** couldn't get project search count")
        log.error(e)

    return count


# find projects by full text search and location id
def searchProjects(db, terms, locationId, limit=1000, offset=0):
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
                        o.affiliation as owner_affiliation,
                        o.group_membership_bitmask as owner_group_membership_bitmask,
                        o.image_id as owner_image_id,
                    (select count(*) from project__user pu where pu.project_id = p.project_id) as num_members
                    from project p
                    inner join project__user opu on opu.project_id = p.project_id and opu.is_project_admin = 1
                    inner join user o on o.user_id = opu.user_id
                    where
                    p.is_active = 1
                    and ($locationId is null or p.location_id = $locationId)
                    and ($match = '' or match(p.title, p.keywords, p.description) against ($match in boolean mode))
                    order by p.created_datetime desc
                    limit $limit offset $offset"""

        data = list(db.query(sql, {'match':match, 'locationId':locationId, 'limit':limit, 'offset':offset}))

        for item in data:
            betterData.append(dict(project_id = item.project_id,
                            title = item.title,
                            description = item.description,
                            image_id = item.image_id,
                            location_id = item.location_id,
                            owner = smallUserDisplay(item.owner_user_id,
                                                     userNameDisplay(item.owner_first_name,
                                                                     item.owner_last_name,
                                                                     item.owner_affiliation,
                                                                     isFullLastName(item.owner_group_membership_bitmask)),
                                                     item.owner_image_id),
                            num_members = item.num_members))
    except Exception, e:
        log.info("*** couldn't get project search data")
        log.error(e)

    return betterData

def getLeaderboardProjects(db, limit = 10, offset = 0):
    data = []

    try:
        sql = """select @rownum := @rownum + 1 as ordinal,
                      p.title,
                      p.project_id,
                      p.image_id,
                      u.first_name as owner_first_name,
                      u.last_name as owner_last_name,
                      u.user_id as owner_user_id,
                      u.affiliation as owner_affiliation,
                      u.group_membership_bitmask as owner_group_membership_bitmask,
                      (select count(*) from project__user pu where pu.project_id = p.project_id)
                        as user_count
                from project p
                inner join (select @rownum := 0) r
                inner join project__user o on o.project_id = p.project_id and o.is_project_admin = 1
                inner join user u on u.user_id = o.user_id and u.is_active = 1
                where p.is_active = 1
                order by (user_count * 5) desc
                limit $limit offset $offset"""

        data = list(db.query(sql, {'limit':limit, 'offset':offset}))
    except Exception, e:
        log.info("*** couldn't get project leaderboard data")
        log.error(e)

    return data

def addMessage(db, projectId, message, message_type, userId = None, ideaId = None, attachmentId = None):
    """
    Insert a new record into the project_message table.  Return true if
    successful.  Otherwise, if any exceptions arise, log and return false.

    """
    try:
        # censor behavior
        numFlags = helpers.censor.badwords(db, message)
        isActive = 0 if numFlags == 2 else 1

        db.insert('project_message', project_id = projectId,
                                    message = message,
                                    user_id = userId,
                                    idea_id = ideaId,
                                    file_id = attachmentId,
                                    message_type  = message_type,
                                    num_flags = numFlags,
                                    is_active = isActive)

        return True;
    except Exception, e:
        log.info("*** problem adding message to project")
        log.error(e)
        return False

def removeMessage(db, messageId):
    try:
        db.update('project_message', where="project_message_id = $messageId", is_active=0, vars = {'messageId':messageId})

        return True
    except Exception, e:
        log.info("*** problem removing message  ")
        log.error(e)
        return False

def getMessages(db, projectId, limit = 10, offset = 0, filterBy = None):
    """
    Return a list of dictionaries with data representing project messages
    associated with the given projectId.  This data come from the tables
    project_message, user, and idea.

    """
    messages = []

    if (filterBy not in ['member_comment','admin_comment','join','endorsement']):
        filterBy = None

    try:
        sql = """select
                    m.project_message_id,
                    m.message_type,
                    m.message,
                    m.file_id,
                    m.created_datetime,
                    a.type as attachment_type,
                    a.media_id as attachment_id,
                    a.title as attachment_title,
                    u.user_id,
                    u.first_name,
                    u.last_name,
                    u.affiliation,
                    u.group_membership_bitmask,
                    u.image_id,
                    i.idea_id,
                    i.description as idea_description,
                    i.submission_type as idea_submission_type,
                    i.created_datetime as idea_created_datetime
                from project_message m
                inner join user u on u.user_id = m.user_id
                left join idea i on i.idea_id = m.idea_id
                left join attachments a on a.id = m.file_id
                where m.project_id = $id and m.is_active = 1
                and ($filterBy is null or m.message_type = $filterBy)
                order by m.created_datetime desc
                limit $limit offset $offset"""
        data = list(db.query(sql, {'id':projectId, 'limit':limit, 'offset':offset, 'filterBy':filterBy}))

        for item in data:
            messages.append(message(id = item.project_message_id,
                                    type = item.message_type,
                                    message = item.message,
                                    attachmentId = item.file_id,
                                    createdDatetime = item.created_datetime,
                                    userId = item.user_id,
                                    name = userNameDisplay(item.first_name, item.last_name, item.affiliation, isFullLastName(item.group_membership_bitmask)),
                                    imageId = item.image_id,
                                    ideaId = item.idea_id,
                                    idea = item.idea_description,
                                    ideaSubType = item.idea_submission_type,
                                    ideaCreatedDatetime = item.idea_created_datetime,
                                    attachmentMediaType = item.attachment_type,
                                    attachmentMediaId = item.attachment_id,
                                    attachmentTitle = item.attachment_title))
    except Exception, e:
        log.info("*** couldn't get messages")
        log.error(e)

    return messages


def getLinks(db, projectId):
    links = []

    sql = "select project_link_id, title, url, image_id from project_link where project_id = $id and is_active = 1"

    try:
        data = list(db.query(sql, {'id':projectId}))

        if len(data) > 0:
            for item in data:
                links.append(link(item.project_link_id, item.title, item.url, item.image_id))
    except Exception, e:
        log.info("*** couldn't get links")
        log.error(e)

    return links

def getResources(db, projectId):
    resources = []

    sql = """select pr.project_resource_id as organization, pr.title, pr.url, pr.image_id, pr.is_official
            from project_resource pr
            inner join project__project_resource ppr on ppr.project_resource_id = pr.project_resource_id and ppr.project_id = $id
            where pr.is_active = 1 and pr.is_hidden = 0"""

    try:
        resources = list(db.query(sql, {'id':projectId}))
    except Exception, e:
        log.info("*** couldn't get project resources")
        log.error(e)

    return resources

def getProjectIdeas(db, projectId, limit = 100):
    ideas = []

    try:
        sql = """select i.idea_id, i.description, i.user_id, u.first_name, u.last_name, item.submission_type
                    from idea i
                    left join user u on u.user_id = i.user_id
                    where i.project_id = $projectId and i.is_active = 1
                    limit $limit"""
        data = list(db.query(sql, { 'projectId':projectId, 'limit':limit }))

        if len(data) > 0:
            for item in data:
                ideas.append(smallIdea(item.idea_id, item.description, item.first_name, item.last_name, item.submission_type))
    except Exception, e:
        log.info("*** couldn't get project ideas")
        log.error(e)

def findInviteByPhone(db, phone):
    data = []

    if (phone):
        try:
            sql = """select inv.project_invite_id, inv.project_id, i.idea_id, i.user_id, inv.created_datetime
                        from project_invite inv
                        inner join idea i on i.idea_id = inv.invitee_idea_id and i.phone = $phone"""
            data = list(db.query(sql, {'phone':phone}))

        except Exception, e:
            log.info("*** couldn't get invite data for phone %s" % phone)
            log.error(e)

    return data

def inviteByIdea(db, projectId, ideaId, message, inviterUser):
    if (createInviteRecord(db, projectId, message, inviterUser.id, ideaId)):
        try:
            idea = giveaminute.idea.Idea(db, ideaId)
            project = Project(db, projectId)

            # IF message is not attached to a user account AND
            # the idea was sent via sms AND
            # the phone number has not previously received an invite
            # send by SMS
            # ELSE
            # send by email
            if (not idea.data.user_id and
                idea.data.submission_type == 'sms' and
                idea.data.phone):
                if (len(findInviteByPhone(db, idea.data.phone)) == 1):
                    return giveaminute.messaging.sendSMSInvite(db, idea.data.phone, projectId)
                else:
                    log.info("*** phone number %s already received an invite" % idea.data.phone)
                    return True
            else:
                return giveaminute.messaging.emailInvite(idea.data.email,
                                              userNameDisplay(inviterUser.firstName,
                                                              inviterUser.lastName,
                                                              inviterUser.affiliation,
                                                              isFullLastName(inviterUser.groupMembershipBitmask)),
                                              projectId,
                                              project.data.title,
                                              project.data.description,
                                              message)
        except Exception, e:
            log.info("*** couldn't get send invite")
            log.error(e)
            return False
    else:
        log.error("*** could not create invite record")
        return False

def inviteByEmail(db, projectId, emails, message, inviterUser):
    try:
        project = Project(db, projectId)

        for email in emails:
            if (createInviteRecord(db, projectId, message, inviterUser.id, None, email)):
               if (not giveaminute.messaging.emailInvite(email,
                                          userNameDisplay(inviterUser.firstName,
                                                              inviterUser.lastName,
                                                              inviterUser.affiliation,
                                                              isFullLastName(inviterUser.groupMembershipBitmask)),
                                          projectId,
                                          project.data.title,
                                          project.data.description,
                                          message)):
                    log.warning("*** failed to create invite record for %s on project %" % (email, projectId))
            else:
                log.warning("*** failed to create invite record for %s on project %" % (email, projectId))

        return True
    except Exception, e:
        log.info("*** couldn't get send one or more emails")
        log.error(e)
        return False


def createInviteRecord(db, projectId, message, inviterUserId, ideaId, email = None):
    try:
        db.insert('project_invite', project_id = projectId,
                                    message = message,
                                    inviter_user_id = inviterUserId,
                                    invitee_idea_id = ideaId,
                                    invitee_email = email)

        return True;
    except Exception, e:
        log.info("*** problem adding invite to project")
        log.error(e)
        return False

def createInviteBody(message, projectId):
    return "%s\n\n%sproject/%s" % (message, Config.get('default_host'), str(projectId))

def createAttachment (db, media_type, media_id,
                      title, description=None):
    """
    Adds a new row to the attachments table.

    Arguments:
    ----------
    ``db``
        A ``web.db.DB`` database wrapper
    ``media_type``
        The type of media.  For now, the supported types are ``'image'`` and
        ``'file'``.
    ``media_id``
        The context-specific ID of the attachment media.  For files and images,
        this is the name under which the content is saved on the filesystem.
    ``title``
        The title of the attachment.  This will be the display name.  For files
        and images, this is the name that the file had before uploading.
    ``description``
        A longer description of the attachment

    Return:
    -------
    ``True`` if the record was successfully created; otherwise ``False``.

    """
    try:
        attachment_id = db.insert('attachments',
                                  type=media_type,
                                  media_id=media_id,
                                  title=title,
                                  descriptions=description)
        return attachment_id
    except Exception, e:
        log.info("*** problem adding attachment to the database")
        log.error(e)
        return None
