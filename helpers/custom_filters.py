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

def datetimeformat(value, format='%H:%M / %d-%m-%Y'):
    return value.strftime(format)

def neat_time(dt):
    """Return the time in dt as a neat string.

    Examples:

    >>> neat_time(time(7, 30))
    7:30AM
    >>> neat_time(time(14, 00))
    2PM

    """
    if dt.minute:
        timestring = dt.strftime('%I:%M%p')
    else:
        timestring = dt.strftime('%I%p')

    if timestring[0] == '0':
        timestring = timestring[1:]

    return timestring

filters = {
    'strslice': strslice,
    'urlencode': urlencode,
    'json': json_filter,
    'datetime': datetimeformat,
    'neattime': neat_time,
}
