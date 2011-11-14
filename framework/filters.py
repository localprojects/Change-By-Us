"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
def strslice(s, length):
    if not isinstance(s, basestring):
        s = str(s)
    return s[:length]

filters = {'strslice': strslice}