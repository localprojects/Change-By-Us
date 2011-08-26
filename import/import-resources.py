"""
This file aims to import data from the import_project_resources table to
the project_resources table.  It will also use image files that correspond
to the external_id field in the directory like: 

import/data/import-resoureces-images/%s.jpg
"""

#!/usr/bin/env python

import os
import sys
import main
from framework.log import log
from framework.config import Config
from giveaminute.projectResource import ProjectResource
from framework.image_server import ImageServer

if __name__ == "__main__":
    """
    Main execution for import script.
    """
    db = main.sessionDB()
    sql = 'select * from import_project_resource'
    import_data = list(db.query(sql))
    for row in import_data:
        image_id = None
            
        # Create image.
        try:
            image_path = './import/data/import-resources-images/%s.jpg' % row.external_id
            if os.path.exists(image_path):
                # Open file
                source = open('./import/data/import-resources-images/%s.jpg' % row.external_id, 'rb')
                # Save file (does not work)
                image_id = ImageServer.add(db, source.read(), 'giveaminute', max_size=None, grayscale=False, mirror=True, thumb_max_size=None)
                # Close file
                source.close()
                
                print image_id
            else:
                print 'Not Exists: %s' % image_path
            
        except Exception, e:
            print e
        

        # Determine location
        
        
        # Create project resource.
        if (image_id):
            try:
                resource_id = db.insert('project_resource', 
                    title = row.title,
                    description = row.description,
                    physical_address = row.physical_address,
                    location_id = row.location_id,
                    url = row.url,
                    facebook_url = row.facebook_url,
                    twitter_url = row.twitter_url,
                    keywords = row.keywords,
                    contact_name = row.contact_name,
                    contact_email = row.contact_email,
                    created_datetime = None,
                    image_id = str(image_id)
                )
                print 'Imported: %s' % resource_id
            
            except Exception, e:
                ImageServer.remove(db, 'giveaminute', image_id)
                print e
    
    
    
    print 'end'