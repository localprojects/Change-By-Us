"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

#!/usr/bin/env python

import mimetypes
import os.path
import sys
sys.path.append(os.path.dirname(__file__) + "/../")
from framework.config import *
from framework.log import log
import lib.S3 as S3

class S3Uploader():

    @classmethod
    def upload(cls, source, destination):
        aws_config = Config.get('aws')
        conn = S3.AWSAuthConnection(aws_config['access_key_id'], aws_config['secret_access_key'])
        print source
        if source == '.' or not os.path.isfile(source):
            log.error("file not found (%s)" % source)
            return False
        filedata = open(source, 'rb').read()
        content_type = mimetypes.guess_type(source)[0]
        if not content_type:
            content_type = 'text/plain'
        log.info("Uploading %s to %s/%s" % (source, aws_config['bucket'], destination))
        response = conn.put(aws_config['bucket'], destination, S3.S3Object(filedata), {'x-amz-acl': 'public-read', 'Content-Type': content_type})
        log.info("--> %s" % response.message)
        return response.message

if __name__ == "__main__":
    try:
        source = sys.argv[1]
        destination = sys.argv[2]
    except IndexError, e:
        print "[SOURCE] [DESTINATION]"
    else:
        print S3Uploader.upload(source, destination)