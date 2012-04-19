"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

# generally try not to import things up here
import re, base64, string, urlparse, datetime, json, jinja2
from framework.log import log

_TO_UNICODE_TYPES = (unicode, type(None))
def to_unicode(value):
    """Converts a string argument to a unicode string.

    If the argument is already a unicode string or None, it is returned
    unchanged.  Otherwise it must be a byte string and is decoded as utf8.
    """
    if isinstance(value, _TO_UNICODE_TYPES):
        return value
    assert isinstance(value, bytes)
    return value.decode("utf-8")

def recursive_unicode(obj):
    """Walks a simple data structure, converting byte strings to unicode.

    Supports lists, tuples, and dictionaries.
    """
    if isinstance(obj, dict):
        return dict((recursive_unicode(k), recursive_unicode(v)) for (k,v) in obj.iteritems())
    elif isinstance(obj, list):
        return list(recursive_unicode(i) for i in obj)
    elif isinstance(obj, tuple):
        return tuple(recursive_unicode(i) for i in obj)
    elif isinstance(obj, bytes):
        return to_unicode(obj)
    else:
        if isinstance(obj, unicode) or isinstance(obj, basestring):
            obj = jinja2.Markup(obj).unescape()
        return obj

class EscapingJSONEncoder(json.JSONEncoder):
    def encode(self, obj):
        return json.JSONEncoder.encode(self, recursive_unicode(obj))


def try_f(f, data, default=None):
    """
    Try to convert data to a new type using the f function. If the conversion
    fails, then return default.
    """
    try:
        return f(data)
    except Exception, e:
        return default

def dictsort(dict_list, sort_by_me):
    """
    Takes a list of dicts and returns that list sorted by the property given in
    the sort_by_me argument.
    """
    decorated = [(resolve_variable('var.' + sort_by_me, {'var' : item}), item) for item in dict_list]
    decorated.sort()
    return [item[1] for item in decorated]

def safeuni(s):
    """
    Tries to convert an object to a unicode string, handling common edge cases.
    """
    #if unicode
    if isinstance(s, unicode):
        return s

    #if not a string
    if not isinstance(s, basestring):
        #if can be converted to unicode, then go for it
        if hasattr(s, '__unicode__'):
            return unicode(s)
        else:
            return str(s).decode('utf-8')
    try:
        # assume a utf-8 string, then try to convert it
        # unicode() is expecting a utf-8 bytestring (unicode itself is not utf-8 or anything else)
        s = unicode(s, errors='strict', encoding='utf-8')
    except UnicodeDecodeError, e:
        log.warning(e)
        # dump anything that doesnt make sense in utf-8
        s = unicode(s, errors='ignore', encoding='utf-8')
    return s

def safestr(s):
    """
    Tries to convert an object to a string, handling common edge cases. Also
    supports iterators by converting all items to strings.
    """

    #return if this is a string already
    if isinstance(s, str):
        return s

    #if a unicode string, try to encode as utf-8
    if isinstance(s, unicode):
        try:
            s = s.encode('utf-8')
        except UnicodeEncodeError, e:
            log.error(e)
            return ""
        return s

    #if an iterater, then try to convert everything to a string
    if hasattr(s, 'next') and hasattr(s, '__iter__'): # iterator
        import itertools
        return itertools.imap(safestr, s)
    else:
        return str(s)

def validate_email(emailaddress):
    """
    Validate that the given string is an email address. Returns True when
    valid, False when invalid.
    """
    domains = ["aero", "asia", "biz", "cat", "com", "coop", \
        "edu", "gov", "info", "int", "jobs", "mil", "mobi", "museum", \
        "name", "net", "org", "pro", "tel", "travel", "fm", "ly", "uk", \
        "in", "us", "il", "de", "it", "fr"
        ]

    #validate length
    if len(emailaddress) < 6:
        # TODO: SR: Why? i@u.nu is valid!
        return False # Address too short.

    try:
        localpart, domainname = emailaddress.rsplit('@', 1)
        host, toplevel = domainname.rsplit('.', 1)
    except ValueError:
        return False # Address does not have enough parts.

    #if not a country code and not in the domain list
    if len(toplevel) != 2 and toplevel not in domains:
        return False # Not a domain name.

    #is there a username?
    if len(localpart) == 0:
        return False

    #NOTE: Why is this here? It doesn't do anything without the test below.
    for i in '-_.%.':
        # Keep in mind that google allows +: my+name@gmail.com
        localpart = localpart.replace(i, "")
    for i in '-_.':
        host = host.replace(i, "")

    # SR: The following test is generally incorrect, because:
    #   * domain can contain -, _
    #   * local can contain ., -, _
    # if localpart.isalnum() and host.isalnum():
    #    return True # Email address is fine.
    # else:
    #    return False # Email address has funny characters.

    return True

def validateUSPhone(phone):
    """
    Validates that the given string is a valid US phone number, a number
    that starts with 2-9 followed by 9 digits. ie. "2124800479"
    http://en.wikipedia.org/wiki/North_American_Numbering_Plan
    """
    return not (re.match("^[2-9]\d{9}$", phone) == None)

def cleanUSPhone(phone):
    """
    Clean up US phone numbers by stripping the leading 1 and any non-numerics.
    """
    if phone is None:
        return None

    phone = phone.strip()
    phone = re.sub("\D", "", phone)
    phone = re.sub("^1", "", phone)

    if (validateUSPhone(phone)):
        return phone
    else:
        return None

def parse_tags(tagstring):
    """
    Parses out a list of tags from the given delimited tag string.
    """
    #extract everything in quotes
    quotes = re.findall(r'".*?"', tagstring)
    for q in quotes:
        repaired = q.replace(',', '@@') # protect commas
        repaired = repaired.replace(' ', '$$') # protect spaces
        tagstring = tagstring.replace(q, repaired)

    tagstring = tagstring.replace(',',' ')
    tags = tagstring.split(' ')

    for tag in tags[:]:
        if len(tag.strip()) == 0:
            tags.remove(tag)
            continue
        t = tag.replace('@@', ',')
        tags[tags.index(tag)] = t.replace('$$', ' ')
    return tags

def list_to_str(tags):
    """
    Convert a list of tags into a delimited string.
    """
    return " ".join(safestr(iter(tags)))

def wordcount(s):
    """
    Counts all of the words in a string.
    """
    return len(s.split())

def filesizeformat(bytes):
    """
    Format the value like a 'human-readable' file size (i.e. 13 KB, 4.1 MB, 102
    bytes, etc).
    """
    try:
        bytes = float(bytes)
    except TypeError:
        return "0 bytes"
    if bytes < 1024:
        return "%d byte%s" % (bytes, bytes != 1 and 's' or '')
    if bytes < 1024 * 1024:
        return "%.1f KB" % (bytes / 1024)
    if bytes < 1024 * 1024 * 1024:
        return "%.1f MB" % (bytes / (1024 * 1024))
    return "%.1f GB" % (bytes / (1024 * 1024 * 1024))

def strip_html(s):
    """
    Remove anything between <angle brackets>.
    """
    p = re.compile(r'<.*?>')
    return p.sub('', s)

def singlespace(s):
    """
    Replace all groups of white space with a single space.
    """
    p = re.compile(r'\s+')
    return p.sub(' ', s)

def remove_linebreaks(s):
    """
    Collapse the given string into a single line, and replace all groups
    of white space with a single space.
    """
    s = s.splitlines()
    s = ' '.join(s)
    return singlespace(s).strip()

def depunctuate(s, exclude=None, replacement=''):
    """
    Strips out all of the punctuation of the given string, excluding any punctuation
    included in the exclude argument list. Punctuation is replaced by a blank string
    or the given replacement argument.
    """
    import string
    p = string.punctuation
    if exclude:
        for c in exclude:
            p = p.replace(c, '')
    regex = re.compile('[%s]' % re.escape(p))
    return regex.sub(replacement, s)

def nl2br(s):
    """
    Convert all newlines (\n) to <br /> tags.
    """
    return '<br />\n'.join(s.split('\n'))

def br2nl(s):
    """
    Convert all <br /> tags to newlines (\n).
    """
    return '\n'.join(re.split('<br ?\/?>', s))

def prefix(delim, s):
    """
    Get the prefix of the given string, split on the given delimiter.
    """
    return s.split(delim)[0]

def suffix(delim, s):
    """
    Get the suffix of the given string, split on the given delimiter.
    """
    return s.split(delim)[-1]

def urlencode(s):
    """
    Quotes the path section of the URL, using urllib.
    """
    if s is None: return ""
    if isinstance(s, unicode):
        s = s.encode('utf-8')
    import urllib
    return urllib.quote(s)

def add_leading_slash(s):
    """
    Prefix the given string with a leading forward slash if it does not
    already exist.
    """
    if not s:
        return None
    if s[0] is not '/':
        s = '/' + s
    return s

def titlecase(value):
    """
    Converts a string into titlecase.
    """
    return re.sub("([a-z])'([A-Z])", lambda m: m.group(0).lower(), value.title())


def location_cap(location):
    """
    Appropriately set the caplitalization of the the location.
    ie. forT collins, co, usa becomes Fort Collins, CO, USA
    """
    if not location:
        return None

    #Split on comma - Fort Collins, CO, USA
    tokens = location.split(',')
    for token in tokens:
        #Split on spaces so we can case every word
        #If the word len > 2 (ie, not a state prefix) and not USA
            #Titlecase the string
        #Else uppercase the string
        t = [i.title() if len(i) > 2 and i.upper() != "USA" else i.upper() for i in token.split(' ')]
        tokens[tokens.index(token)] = ' '.join(t)
    return ','.join(tokens)

def pluralize(value, arg='s'):
    """
    Returns a plural suffix if the value is not 1, for '1 vote' vs. '2 votes'
    By default, 's' is used as a suffix; if an argument is provided, that string
    is used instead. If the provided argument contains a comma, the text before
    the comma is used for the singular case.
    """
    if not ',' in arg:
        arg = ',' + arg
    bits = arg.split(',')
    if len(bits) > 2:
        return ''
    singular_suffix, plural_suffix = bits[:2]
    try:
        if int(value) != 1:
            return plural_suffix
    except ValueError: # invalid string that's not a number
        pass
    except TypeError: # value isn't a string or a number; maybe it's a list?
        try:
            if len(value) != 1:
                return plural_suffix
        except TypeError: # len() of unsized object
            pass
    return singular_suffix

def slugify(value):
    """
    Converts to lowercase, removes non-alpha chars and converts spaces to hyphens.
    """
    value = re.sub('[^\w\s-]', '', value).strip().lower()
    return re.sub('[-\s]+', '-', value)

def short_decimal(value):
    """
    Floors the float value to two decimal places.
    """
    value = float(value) * 100.0
    value = int(value)
    value = float(value) / 100.0
    return value

def zeropad(value):
    """
    Zero pad the given single digit number.
    """
    value = int(value)
    if value < 10:
        return "0" + str(value)
    else:
        return str(value)

def random_string(length):
    """
    Returns a random string, including upper and lower case characters and digits,
    of the specified length.
    """
    import random
    return ''.join(random.sample("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", length))

def obfuscate(id, length=12):
    """
    Appends alpha characters to the given integer id until it is the specified
    character length (defaults to 12), then base 64 encodes the string and returns it.
    """
    id = str(id)
    padding = "".join(["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[(i + int(id)) % 52] for i in range(length - len(id))])
    return base64.b64encode(id + padding)

def deobfuscate(token):
    """
    Base 64 decodes the given string and returns the leading digits of the decoded string.
    """
    try:
        token = base64.b64decode(token)
    except Exception, e:
        log.warning("Deobfuscate failed!")
        return None
    numbers = []
    for i in xrange(len(token)):
        if token[i].isdigit():
            numbers.append(token[i])
    return "".join(numbers)

def total_seconds(timedelta):
    """
    Return the total number of seconds in a datetime.timedelta object. This is a
    reimplementation of timedelta.total_seconds(), which is new in Python 2.7.
    This version is not as accurate as it disregards microseconds (they're
    unnecessary in this context).
    """
    seconds = timedelta.seconds + (timedelta.days * 24 * 60 * 60)
    return seconds

def local_utcoffset(localtime=datetime.datetime.now(),
                    utctime=datetime.datetime.utcnow()):
    """
    Returns the utcoffset between the localtime and utctime parameters. If the
    default parameters are left alone, the result will be the utcoffset of the
    computer's time zone.
    """
    seconds = total_seconds(localtime - utctime)
    hours = int(round(float(seconds) / 60 / 60))
    return hours

def format_time(seconds):
    """
    Converts the given seconds into a human readable string.
    """
    minutes = seconds // 60
    seconds = seconds - (minutes * 60)
    hours = minutes // 60
    minutes = minutes - (hours * 60)
    days = hours // 24
    hours = hours - (days * 24)
    time = []
    if days:
        time.append("%s:" % days)
    if hours or days:
        time.append("%s:" % zeropad(hours))
    if minutes or hours or days:
        time.append("%s:" % zeropad(minutes))
    if seconds or minutes or hours or days:
        time.append("%s" % zeropad(seconds))
    time = "".join(time)

    return time

def good_decimal(num):
    """
    Rounds a number to the nearest two decimal places.
    """
    from decimal import Decimal
    return str(Decimal(str(num)).quantize(Decimal('.01')))

def normalize(num, min, max):
    """
    Normalize the given num argument for the given max and min.
    """
    return (float(num) - float(min)) / (float(max) - float(min))

def confirm_pid(run_folder):
    """
    TBD
    """
    import sys, os, signal, __main__
    name = prefix('.', os.path.basename(__main__.__file__))
    log.info("Attempting to launch daemon %s..." % name)
    pid = str(os.getpid())
    pidfile = "%s%s.pid" % (run_folder, name)
    if os.path.isfile(pidfile):
        old_pid = open(pidfile).read()
        log.warning("--> pidfile already exists for %s, attempting to kill process..." % old_pid)
        try:
            result = os.kill(int(old_pid), signal.SIGKILL)
        except OSError, e:
            if e.args[0] == 3:
                log.warning("--> no process with pid %s" % old_pid)
            else:
                log.error(e)
                exit()
        else:
            log.info("--> killed process %s" % old_pid)

        try:
            os.unlink(pidfile)
        except OSError, e:
            log.error("--> could not remove pidfile, %s" % pidfile)
            exit()
    open(pidfile, 'w').write(pid)
    log.info("--> launched with pid %s" % pid)

""" web.py specific """
def get_flash_upload(web):
    """
    Reformat data coming in from Flash FileReference
    FileReference has silly boundary problems that create bad timeout errors
    As standard multipart form data is present, this also works fine with standard HTML forms
    http://www.mail-archive.com/webpy@googlegroups.com/msg04505.html
    """
    import os
    tmpfile = os.tmpfile()
    contentLength = int(web.ctx.env['CONTENT_LENGTH'])
    if contentLength <= 0:
        raise AssertionError("Invalid content length")
    wsgiInput = web.ctx.env['wsgi.input']
    while contentLength > 0:
        chunk = 1024
        if contentLength < chunk:
            chunk = contentLength
        contentLength -= chunk
        tmpfile.write(wsgiInput.read(chunk))
    tmpfile.seek(0)
    web.ctx.env['wsgi.input'] = tmpfile
    input = web.input()
    tmpfile.close()
    return input

def get_post_data(web):
    """
    Get either web.input['file'] (HTML multipart form) or web.data() (octet upload)
    This is useful when a controller needs to accept data from both an HTML and a Flash post (URLLoader, not FileReference)
    """
    try:
        data = web.input()['file']
    except KeyError, e1:
        try:
            data = web.data()
        except Error, e2:
            log.error("--> bad post data web.input[%s] web.data[%s]" %s (e1, e2))
    return data

def get_fake_session(controller):
    """
    Get the session manually (like from a request variable) instead of a cookie.
    Flash cant consistently get cookie data.
    """
    import os, base64, pickle
    session_id = controller.request('session_id')
    path = "sessions/%s" % session_id
    if not os.path.exists(path):
        log.warning("--> get_fake_session: key path (%s) doesnt exist" % path)
        return {}
    try:
        raw = open(path).read()
        pickled = base64.decodestring(raw)
        fake_session = pickle.loads(pickled)
    except Exception, e:
        log.error("--> get_fake_session error: %s" % e)
        return {}

    log.info("FAKE SESSION: %s" % fake_session)
    return fake_session

def save_fake_session(data):
    """
        Save the session manually from a dict
    """
    import os, base64, pickle
    try:
        path = "sessions/%s" % data['session_id']
        pickled = pickle.dumps(data)
        raw = base64.encodestring(pickled)
    except Exception, e:
        log.error("--> save_fake_session formatting error: %s" % e)
        return
    try:
        f = open(path, 'w')
        try:
            log.info("--> saving fake session")
            f.write(raw)
        finally:
            f.close()
    except IOError:
        pass

def check_bad_words(data):
    """
        Check input against a bad words list
    """
    data = str(data).lower()
    badwords = "anal anus arse ballsack balls bitch blowjob boner boob bugger butt buttplug clit clitoris cock coon cunt dick dildo dyke fag fellate fellatio felch felching fuck fucker fucken fucking fudgepacker homo jizz knobend labia muff nigger penis piss poop prick pube pussy scrotum slut smegma spunk tit turd twat vagina wank whore kike shit nigga sex ass"
    bw = string.split(badwords, " ")
    mods = ['', 's', 'es']
    for w in bw:
        for mod in mods:
            w = w + mod
            if data == w:
                return True
            if data.startswith(w+" "):
                return True
            if data.endswith(" "+w):
                return True
            if " "+w+" " in data:
                return True
    return False

def strNullOrEmpty(s):
    """
    Is the None, empty, or only stripable white space?
    """
    return not s or len(s.strip()) == 0

def makeUrlAbsolute(url):
    """
    NOTE: The use case is unclear to me.
    """
    scheme, netloc, path, params, query, fragment = urlparse.urlparse(url)

    if not scheme:
        if not netloc:
            netloc, path = path, ''
        fixed = urlparse.urlunparse(('http', netloc, path, params, query, fragment))
        return fixed
    elif re.match('http', scheme) is None:
        fixed = "http://" + url
        return fixed
    else:
        return url

def uniqify(seq):
    """
    Make a list unique.
    """
    keys = {}
    for e in seq:
        keys[e] = 1
    return keys.keys()

def flatten(l, ltypes=(list, tuple)):
    '''
    Flatten a list of lists into a single list. Not as cool as ruby's flatten, but it works
    Thanks to: http://rightfootin.blogspot.com/2006/09/more-on-python-flatten.html
    '''

    ltype = type(l)
    l = list(l)
    i = 0
    while i < len(l):
        while isinstance(l[i], ltypes):
            if not l[i]:
                l.pop(i)
                i -= 1
                break
            else:
                l[i:i + 1] = l[i]
        i += 1
    return ltype(l)

def getBit(i, index):
    return ((i & (1 << index)) != 0)

def setBit(i, index):
    mask = 1 << index
    return(i | mask)

def make_pretty_date(raw_date):
    """Returns dates that end in '1st' or '22nd' and the like."""
    display_date = raw_date.strftime('%B %d')

    # Get rid of the 0 in single-digit days (e.g. "May 02" -> "May 2")
    if display_date[-2] == '0':
        display_date = display_date[:-2] + display_date[-1]

    # Add on the suffix
    if display_date[-2] == '1':
        display_date += 'th'
    elif display_date[-1] == '1':
        display_date += 'st'
    elif display_date[-1] == '2':
        display_date += 'nd'
    elif display_date[-1] == '3':
        display_date += 'rd'
    else:
        display_date += 'th'

    return display_date
