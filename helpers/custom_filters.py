import json

def strslice(s, length):
    if not isinstance(s, basestring):
        s = str(s)
    return s[:length]

def urlencode(s):
    if isinstance(s, unicode):
        s = s.encode('utf-8')
    import urllib
    return urllib.quote(s)

def json_filter(data):
    return json.dumps(data)

filters = {'strslice': strslice, 'urlencode': urlencode, 'json':json_filter }