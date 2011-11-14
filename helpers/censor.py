"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
import os
import framework.util as util
from framework.log import log
from framework.controller import *

def badwords(db, text):

    try:
        badwords = db.query("SELECT * FROM badwords where id = 1 LIMIT 1")[0]
        kill_words = badwords['kill_words']
        warn_words = badwords['warn_words']        
    except Exception, e:
        log.error(e)
        return False

    text = util.depunctuate(text, replacement=" ")
    words = text.split()

    kills_found = [word for word in words if word.lower() in kill_words.split()]    
    if len(kills_found):
        log.info("--> contains kills: %s" % kills_found)   
        return 2        

    warns_found = [word for word in words if word.lower() in warn_words.split()]
    if len(warns_found):
        log.info("--> contains warns: %s" % warns_found)
        return 1
            
    return 0        


def badtags(text):

    text = util.depunctuate(text, replacement=" ")
    tags = text.split()
    
    f = open(os.path.dirname(__file__) + "/../assets/bad_tags.txt")
    badtags = []
    for line in f:
        if line[0] == "#":
            continue
        badtags.append(line.strip().lower())
    tags = [tag for tag in tags if tag.lower() not in badtags]    
    return tags
    
    