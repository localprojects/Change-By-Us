"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from framework.controller import log
import re

# find keywords in a string
def getKeywords(db, s):
    """Get all matches for passed in string in keyword tables
    
    :param db: database handle
    :param s:  string to look for
    :returns   list of matching keywords
    """
    words = []
    try:
        words = list(db.query("select keyword from keyword where locate(keyword, $lookin)>0", vars=dict(lookin=s)))
    except Exception, e:
        log.error("Exception getting keyword matches for %s: %s" % (s, e))

    return words


