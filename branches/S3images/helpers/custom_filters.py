def strslice(s, length):
    if not isinstance(s, basestring):
        s = str(s)
    return s[:length]
    
def urlencode(s):
    if isinstance(s, unicode):
        s = s.encode('utf-8')   
    import urllib    
    return urllib.quote(s)

filters = {'strslice': strslice, 'urlencode': urlencode}