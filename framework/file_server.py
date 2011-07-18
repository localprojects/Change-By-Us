import cStringIO
import traceback
import framework.util as util
from framework.s3uploader import S3Uploader
from framework.log import log
from framework.controller import Controller
from framework.config import Config
from PIL import Image, ImageOps

class FileServer(object):
    """
    A generic FileServer.
    
    """
    
    def add(self, db, data, app, max_size=None, grayscale=False, mirror=True, thumb_max_size=None):
        """
        Add a file to the fileserver.  If either adding the database record for 
        the file or saving the file fails, then add will return None, and no
        modification will be made.  Otherwise, the ID of the record in the 
        database will be returned.
        
        """
        # Create a new record for the file
        log.info("FileServer.add")
        id = self.addDbRecord(db, app)
        
        if id is None:
            return None
        
        # Save the file to the system
        success = self.saveFile(id, data, max_size=max_size, mirror=mirror)
        
        if not success:
            self.removeDbRecord(db, id)
            return None
        
        # Return the id of the file
        return id
    
    
    def addDbRecord(self, db, app):
        """
        Insert a new record for a file into the given database.
        
        Arguments:
        db -- A web.py database (`web.db`) object
        app -- The name of the app (`str`)
        
        """
        try:
            id = db.insert('files', app=app)
        except Exception, e:
            log.error(e)
            return None
        
        return id
    
    
    def removeDbRecord(self, db, id):
        try:
            db.query("DELETE FROM files WHERE id=$id", {'id': id})
            log.warning("--> removed id %s" % id)
            return True
        except Exception, e:
            log.error(e)
            return False
    
    
    def saveFile(self, fileid, data, **kwargs):
        """
        Save the data into a file.  Return True is file successfully saved,
        otherwise False.
        
        Override this method to save files in other places.
        
        Attributes:
        fileid -- The id from the database record that corresponds to this file
        data -- The data (string of bytes) contained in the file
        
        """
        raise NotImplementedError(("You must override the implementaion of "
                                   "saveFile for your file server.  For "
                                   "example, check out the S3FileServer."))


class S3FileServer(FileServer):
    """
    In order to use this FileServer, make sure that you have the aws section
    filled out in your conf.yaml file:
    
    aws:
        access_key_id: '<ACCESS_KEY>'
        secret_access_key: '<SECRET_KEY>'
        bucket: '<BUCKET_NAME>'
    
    """
    def getConfigVar(self, var_name):
        return Config.get(var_name)
    
    
    def getLocalPath(self, fileid):
        """
        Get the path to the file given by the fileid on the local file system.
        This is used only to temporarily save the file before uploading it to
        the S3 server.
        
        """
        return "data/files/%s" % fileid
    
    
    def getS3Path(self, fileid):
        """
        Get the path to the file given by the fileid on the S3 server.
        
        """
        return "data/files/%s" % fileid
    
    
    def saveTemporaryLocalFile(self, path, data):
        """
        Save the file on the local file system.
        This is used only to temporarily save the file before uploading it to
        the S3 server.
        
        """
        try:
            with open(path, "wb") as f:
                f.write(data)
        except Exception, e:
            log.error(e)
            return False
        
        return True
    
    
    def saveFile(self, fileid, data, mirror=True, **kwargs):
        """
        Save the data into a file.  Return True is file successfully saved,
        otherwise False.
        
        Attributes:
        fileid -- The id from the database record that corresponds to this file
        data -- The data (string of bytes) contained in the file
        
        """
        localpath = self.getLocalPath(fileid)
        localsaved = self.saveTemporaryLocalFile(localpath, data)
        if not localsaved:
            return False
        
        isS3mirror = self.getConfigVar('media')['isS3mirror']
        s3path = self.getS3Path(fileid)
        log.info("*** config = %s, mirror = %s" % (isS3mirror, mirror))
        if (isS3mirror and mirror):
            try:
                result = S3Uploader.upload(localpath, s3path)
                log.info(result)
            except Exception, e:
                tb = traceback.format_exc()
                log.error(tb)
                return False
        
        return True
        
    #
#    @classmethod
#    def cropToBox(cls, image):
#        if (image.size[0] > image.size[1]):
#            max_length = image.size[1]
#            top = 0
#            left = int(float(image.size[0] - max_length)/float(2))
#        else:
#            max_length = image.size[0]
#            top = int(float(image.size[1] - max_length)/float(2))
#            left = 0
#            
#        box = (left, top, left + max_length, top + max_length)
#        
#        return image.crop(box)
#         
#        
#    # old resize method    
#    @classmethod
#    def resizeToMax(cls, image, max_size):
#        ratio = float(max_size[0]) / float(image.size[0]) if image.size[0] > max_size[0] else float(max_size[1]) / float(image.size[1])
#        new_size = int(ratio * image.size[0]), int(ratio * image.size[1])
#        log.info("--> resizing to %sx%s" % new_size)
#        image = image.resize(new_size, Image.ANTIALIAS)     
#        return image

#    # new resize method, eholda 2011-02-12
#    @classmethod
#    def resizeToFit(cls, image, box):
#        if (image.size[0] > box[0] or image.size[1] > box[1]):
#            xratio = float(box[0]) / float(image.size[0])
#            yratio = float(box[1]) / float(image.size[1])
#        
#            ratio = xratio if xratio < yratio else yratio
#            
#            #print "--> xratio = %s, yratio = %s, ratio = %s" % (xratio, yratio, ratio)
#            
#            newsize = [int(ratio * image.size[0]), int(ratio * image.size[1])]
#        
#            log.info("*** RESIZING from %s to %s" % ([image.size[0], image.size[1]], newsize))
#            
#            return image.resize(newsize, Image.ANTIALIAS)
#        else:
#            print "--> no resize"
#            return image     

#    @classmethod
#    def remove(cls, db, app, id):
#        log.info("ImageServer.remove %s %s" % (app, id))
#        path = ImageServer.path(app, id)
#        try:
#            db.query("DELETE FROM images WHERE id=$id", {'id': id})
#            os.remove(path)
#        except Exception, e:
#            log.error(e)
#        else:
#            log.info("--> removed id %s" % id)        
#       
#    @classmethod
#    def path(cls, app, id):
#        path = "data/%s/images/%s/%s.png" % (app, str(id)[-1], id)
#        return path
#    
#    def GET(self, app=None, mode=None, target_width=None, target_height=None, id=None):
#        log.info("ImageServer.get app[%s] mode[%s] width[%s] height[%s] id[%s]" % (app, mode, target_width, target_height, id))       
#        key = "%s_%s_%s_%s_%s" % (app, mode, target_width, target_height, id)
#        image = self.cache.get(str(key))
#        if image is not None:
#            log.info("--> image [%s] is cached! yay!" % key)
#            return self.image(image)
#        image = None
#        if mode != 'bounded' and mode != 'exact':
#            return self.error("Mode not available")          
#        try:
#            record = list(Controller.get_db().query("SELECT id FROM images WHERE id=$id", {'id': id}))[0]
#        except Exception, e:
#            log.error("No image found with that ID (%s)" % e)
#        else:
#            try:
#                path = ImageServer.path(app, id)
#                log.info("--> %s" % path)
#                image = Image.open(path)                
#                found = True
#            except Exception, e:
#                log.error(e)
#        if not image:   
#            cache_image = False
#            log.info("--> showing image placeholder")
#            image = Image.open("static/img/image_placeholder.png", 'r')                
#        else:
#            cache_image = True
#        source_width = image.size[0]
#        source_height = image.size[1]                                
#        try:
#            target_width = int(target_width)
#            if target_width < 1: raise Error
#        except Exception:
#            target_width = source_width
#        try:
#            target_height = int(target_height)
#            if target_height < 1: raise Error            
#        except Exception:
#            target_height = source_height
#        source_ratio = float(source_width) / float(source_height)
#        target_ratio = float(target_width) / float(target_height)            
#        log.info("--> source %sx%s (%s)" % (source_width, source_height, source_ratio))
#        log.info("--> target %sx%s (%s)" % (target_width, target_height, target_ratio))

#        if not target_width and not target_height:
#            log.info("--> no target dimensions, showing at source dimensions")
#        elif target_width == source_width and target_height == source_height:
#            log.info("--> target matches source dimensions")
#        else:
#            if mode == 'exact':
#                if source_ratio < target_ratio:
#                    res = int(target_width), int(target_width / source_ratio)
#                    image = image.resize(res, Image.ANTIALIAS)
#                    cropoff = (image.size[1] - target_height) / 2
#                    crop = 0, cropoff, image.size[0], image.size[1] - cropoff
#                    image = image.crop(crop)
#                else:
#                    res = int(target_height * source_ratio), int(target_height)
#                    image = image.resize(res, Image.ANTIALIAS)
#                    cropoff = (image.size[0] - target_width) / 2
#                    crop = cropoff, 0, image.size[0] - cropoff, image.size[1]
#                    image = image.crop(crop)
#            else:
#                if source_ratio < target_ratio:
#                    res = int(target_height * source_ratio), int(target_height)
#                else:
#                    res = int(target_width), int(target_width / source_ratio)
#                image = image.resize(res, Image.ANTIALIAS)
#        log.info("--> result %sx%s (%s)" % (image.size[0], image.size[1], mode))
#        image = self._image_string(image)
#        if cache_image:
#            try:
#                if self.cache.add(str(key), image): # cache forever
#                    log.info("--> image cached")
#                else:
#                    log.warning("--> memcache set failed [no error]: %s" % key)
#            except Exception, e:
#                log.warning("--> memcache set failed [%s]: %s" % (e, key))
#            return self.image(image)
#        else:
#            log.info("--> placeholder image, not caching")
#            return self.temp_image(image)
#            
#    def _image_string(self, image):
#        f = cStringIO.StringIO()
#        image.save(f, "PNG")
#        f.seek(0)                    
#        return f.read()
