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
    if isinstance(s, str) or isinstance(s, unicode): s = re.split(r'[,\s+]', s)
    if not isinstance(s, list):
        log.error("getKeywords requested for a non-string, non-list value: %s. Cannot process!" % s)
    else:
        words = list(db.query("select keyword from keyword where keyword in $lookfor", vars=dict(lookfor=s)))

    return words


