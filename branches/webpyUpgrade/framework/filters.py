def strslice(s, length):
    if not isinstance(s, basestring):
        s = str(s)
    return s[:length]

filters = {'strslice': strslice}