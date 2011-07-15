import os
import framework.util as util
from framework.log import log
<<<<<<< HEAD
from framework.controller import *

def badwords(db, text):

    try:
        badwords = db.query("SELECT * FROM badwords where id = 1 LIMIT 1")[0]
        kill_words = badwords['kill_words']
        warn_words = badwords['warn_words']        
=======

def has_words(text, words_list):
    """
    Returns True if the given text contains and words in the given word list,
    otherwise returns False.
    """
    words = util.depunctuate(text, replacement=" ").split()
    words_list = [] if words_list is None else words_list
    num_found = [word for word in words if word.lower() in words_list]
    return len(num_found) != 0

def badwords(db, text):
    """
    Checks if the given text contains any "kill" or "warning" words. Returns
    2 on kill words, 1 on warning words, otherwise 0.
    """
    try:
        badwords = db.query("SELECT * FROM badwords LIMIT 1")[0]
        kill_words = badwords['kill_words'] or ""
        warn_words = badwords['warn_words'] or ""
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
    except Exception, e:
        log.error(e)
        return False

<<<<<<< HEAD
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
    
    
=======
    if has_words(text, kill_words.split()):
        return 2

    if has_words(text, warn_words.split()):
        return 1

    return 0
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
