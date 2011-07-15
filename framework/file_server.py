import cStringIO
import framework.util as util
from framework.s3uploader import *
from framework.log import log
from framework.controller import *
from PIL import Image, ImageOps

class FileServer(Controller):
    
#    @classmethod
    def add(self, db, data, app, max_size=None, grayscale=False, mirror=True, thumb_max_size=None):
        """
        
        """
        # Create a new record for the file
        log.info("FileServer.add")
        id = self._addDbRecord(db, app) 
        
        if id is None:
            return None
        
        # Save the file to the system
        success = self._saveFile(id, data)
        
        if not success:
            self._removeDbRecord(id)
            return None
        
        # Return the id of the file
        return id
    
    def _addDbRecord(self, db, app):
        """
        Insert a new record for a file into the given database.
        
        Attributes:
        db -- A web.py database (`web.db`) object
        app -- The name of the app (`str`)
        """
        
        try:
            id = db.insert('files', app=app)
        except Exception, e:
            log.error(e)
            return None
        
        return id
    
    def _saveFile(self, fileid, data):
        """
        Save the data into a file.  Return True is file successfully saved,
        otherwise False.
        
        Override this method to save files in other places.
        
        Attributes:
        fileid -- The id from the database record that corresponds to this file
        data -- The data (string of bytes) contained in the file
        """
        
        log.info("*** config = %s, mirror = %s" % (Config.get('media')['isS3mirror'] , mirror))
        if (Config.get('media')['isS3mirror'] and mirror):
            try:
                result = S3Uploader.upload(path, path)
                log.info(result)
            except Exception, e:
                log.error(e)
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
