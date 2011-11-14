"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
def strslice(s, length):
    if not isinstance(s, basestring):
        s = str(s)
    return s[:length]
    
def urlencode(s):
    if isinstance(s, unicode):
        s = s.encode('utf-8')   
    import urllib    
    return urllib.quote(s)

def truncate_external_link_title(s, max_length):
    # Kind of an edge case, but if a user enters the URL for a project
    # resource as the title, the table they are displayed in will not
    # format properly. Here we check if the first word in the link title
    # looks to be a link and we truncate it to the specified amount of 
    # characters
    first_word = s.split()[0]
    if len(first_word) > max_length + 1:
        first_word = first_word.replace('https://', '').replace('http://', '')
        return "%s..." % first_word[:max_length]
    else:   
        return s

filters = {'strslice': strslice, 'urlencode': urlencode, 'truncate_external_link_title': truncate_external_link_title}