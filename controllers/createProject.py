import giveaminute.keywords as keywords
import giveaminute.project as mProject
import giveaminute.projectResource as mProjectResource
import giveaminute.location as mLocation
import framework.util as util
from framework.controller import *
from framework.image_server import *
from framework.file_server import FileServer, S3FileServer
from framework.config import Config
from PIL import Image
from StringIO import StringIO
import lib.web
import json

class CreateProject(Controller):
    def GET(self, action=None):
        if (action == 'keywords'):
            return self.getKeywordsJSON()
        elif (action == 'similar'):
            return self.getSimilarProjectsJSON()
        elif (action == 'resources'):
            return self.getSimilarResourcesJSON()
        else:
            locations_data = mLocation.getSimpleLocationDictionary(self.db)
            locations = dict(json = json.dumps(locations_data), data = locations_data)

            return self.render('create', {'locations':locations})

    def POST(self, action=None):
        if (action == 'photo'):
            imageId = self.uploadImage()

            return self.json(dict(thumbnail_id = imageId, success = (imageId != None) ))
        elif (action == 'attachment'):
            return self.newFile()
        else:
            return self.newProject()

    def newProject(self):
        if (self.request('main_text')): return False

        if (self.user):
            owner_user_id = self.user.id
            title = self.request('title')
            description = self.request('text')
            organization = self.request('organization')
            locationId = util.try_f(int, self.request('location_id'), -1)
            imageId = self.request('image')
            keywords = [word.strip() for word in self.request('keywords').split(',')] if not util.strNullOrEmpty(self.request('keywords')) else []
            resourceIds = self.request('resources').split(',')
            isOfficial = self.user.isAdmin

            projectId = mProject.createProject(self.db, owner_user_id, title, description, ' '.join(keywords), locationId, imageId, isOfficial, organization)

            for resourceId in resourceIds:
                log.info("*** insert resource id %s" % resourceId)
                mProject.addResourceToProject(self.db, projectId, resourceId)

            if (projectId):
                return projectId
            else:
                log.error("*** couldn't create project")
                return False
        else:
            log.error("*** only logged in users can create projects")
            return False

    def newFile(self):
        """
        Controller for the ``/create/attachment`` endpoint.

        **Parameters:**

        ``qqfile`` (required)
            Contains the file to be uploaded.

        ``max_width``/``max_height``
            The maximum width and height to use for the thumbnail image.

        """
        # Upload the file to the server
        file_info = self.uploadFile()

        if not file_info['id']:
            log.error("*** createProject.newFile: Failed to create file.")
            return self.json({ 'success' : False })

        # Save an attachment record to the database
        attachment_id = mProject.createAttachment(self.db,
                                                  media_id=file_info['id'],
                                                  media_type=file_info['type'],
                                                  title=file_info['name'])

        if attachment_id is None:
            log.error(("*** createProject.newFile: Failed insert row for file "
                       "with info %s into the attachments table." % file_info))
            return self.json({ 'success' : False })

        return self.json({
            'id' : attachment_id,
            'media_id' : file_info['id'],
            'media_type' : file_info['type'],
            'title' : file_info['name'],
            'small_thumb_url' : mProject.getAttachmentThumbUrl(file_info['type'], file_info['id'], 'small'),
            'medium_thumb_url' : mProject.getAttachmentThumbUrl(file_info['type'], file_info['id'], 'medium'),
            'large_thumb_url' : mProject.getAttachmentThumbUrl(file_info['type'], file_info['id'], 'large'),
            'success' : (file_info['id'] != None)
            #TODO add url
        })

    def getKeywordsJSON(self):
        s = "%s %s" % (self.request('text'), self.request('title'))
        kw = keywords.getKeywords(self.db, s)

        log.info(kw)

        obj = dict(suggested_keywords=kw)

        return self.json(obj)

    def getSimilarProjectsJSON(self):
        locationId = self.request('location_id')
        keywords = self.request('keywords').split(',') if self.request('keywords') else []

        projects = mProject.searchProjects(self.db, keywords, locationId)

        obj = dict(projects = projects)

        return self.json(obj)

    def getSimilarResourcesJSON(self):
        locationId = self.request('location')
        keywords = self.request('keywords').split(',') if self.request('keywords') else []

        resources = mProjectResource.searchProjectResources(self.db, keywords, locationId)

        obj = dict(resources = resources)

        return self.json(obj)

    def uploadImage(self):
        if (len(self.request('qqfile')) > 100):
            log.info("*** == %s" % type(web.input()['qqfile']))
            data = web.input()['qqfile']
        else:
            data = web.data()

        imageId = ImageServer.add(self.db, data, 'giveaminute', [100, 100])

        return imageId

    def uploadFile(self):
        """
        Handler for the /create/file endpoint. Looks for the variable named
        qqfile from the request and saves it to a file on the server.

        Return information about the file in a ``dict`` with keys ``id``,
        ``type``, and ``name``

        """
        file_info = {}

        # Get file from the request
        if (len(self.request('qqfile')) > 100):
            log.info("*** == %s" % type(web.input()['qqfile']))
            data = web.input()['qqfile']
        else:
            data = web.data()

        file_info['name'] = self.request('qqfile') or ''

        # Get a file server wrapper
        fs = S3FileServer(self.db)

        # Determine whether it's an image or another type of file
        media_type = file_info['type'] = self.getFileMediaType(data)

        # Upload the file to the server
        media_id = file_info['id'] = fs.add(data, None)

        # If it's an image, upload the thumbnails as well
        if media_type == 'image':
            self.saveThumbnailImage(fs, media_type, media_id, data, 'small', self.SMALL_THUMB_SIZE)
            self.saveThumbnailImage(fs, media_type, media_id, data, 'medium', self.MEDIUM_THUMB_SIZE)
            self.saveThumbnailImage(fs, media_type, media_id, data, 'large', self.LARGE_THUMB_SIZE)

        return file_info


    def saveThumbnailImage(self, fs, media_type, media_id, data, name, size):
        thumb = self.getThumbnailImageData(data, size)
        thumb_filename = mProject.getAttachmentThumbFileName(media_type, media_id, name)

        if thumb and fs.add(thumb, thumb_filename):
            log.info("Wrote %s thumbnail image to %s" % (name, thumb_filename))
        else:
            log.error("Failed to write %s thumbnail image to %s" % (name, small_filename))


    SMALL_THUMB_SIZE = (100,100)
    MEDIUM_THUMB_SIZE = (240,240)
    LARGE_THUMB_SIZE = (360,360)

    def getThumbnailImageData(self, data, size):
        """
        Creates a thumbnail of the given size from the given image data.
        Return the image data in a string.

        """
        from StringIO import StringIO

        # Try to open the image
        try:
            read_buffer = StringIO(data)
            img = Image.open(read_buffer)
            img_format = img.format
            write_buffer = StringIO()
        except IOError, e:
            log.error('*** Error while opening image data: %s' % e)
            return

        # Try to write the thumbnails
        try:
            img.thumbnail(size, Image.ANTIALIAS)
            img.save(write_buffer, img_format)
        except IOError, e:
            log.error('*** Error while saving thumbnail data: %s' %e)
            return

        return write_buffer.getvalue()


    def getFileMediaType(self, data):
        """
        Determine whether the file is an image or some other type of file.

        """
        try:
            # If we can open it with the PIL, it's an image.
            file_buffer = StringIO(data)
            img = Image.open(file_buffer)
            return 'image'

        except IOError:
            return 'file'


    def getThumbUrl(self, media_type, media_id, max_width=None, max_height=None):
        """
        Get the URL to an image representation of the media. For images, this
        may be used for getting a thumbnail. Specify max width and height in
        that case. Otherwise you'll probably just get a generic file image.

        """
        return mProject.getAttachmentThumbUrl(media_type, media_id, 'small')

