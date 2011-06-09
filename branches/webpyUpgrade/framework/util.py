# generally try not to import things up here
import re, base64, string, urlparse
from framework.log import log

def try_f(f, data, default=None):
    try:
        return f(data)
    except Exception, e:
        return default

def dictsort(value, arg):
    """
        Takes a list of dicts, returns that list sorted by the property given in
        the argument.

    """
    decorated = [(resolve_variable('var.' + arg, {'var' : item}), item) for item in value]
    decorated.sort()
    return [item[1] for item in decorated]

def safeuni(s):
    if isinstance(s, unicode):
        return s
    if not isinstance(s, basestring):
        if hasattr(obj, '__unicode__'):
            return unicode(s)
        else:
            return str(s).decode('utf-8')
    try:
        s = unicode(s, errors='strict', encoding='utf-8')   # unicode() is expecting a utf-8 bytestring (unicode itself is not utf-8 or anything else)
    except UnicodeDecodeError, e:
        log.warning(e)
        s = unicode(s, errors='ignore', encoding='utf-8')   # dump anything that doesnt make sense in utf-8
    return s

def safestr(s):
    if isinstance(s, str):
        return s
    if isinstance(s, unicode):
        try:
            s = s.encode('utf-8')   
        except UnicodeEncodeError, e:
            log.error(e)
            return ""
        return s
    if hasattr(obj, 'next') and hasattr(obj, '__iter__'): # iterator
        import itertools
        return itertools.imap(safestr, obj)
    else:
        return str(obj)

def validate_email(emailaddress):
    domains = ["aero", "asia", "biz", "cat", "com", "coop", \
        "edu", "gov", "info", "int", "jobs", "mil", "mobi", "museum", \
        "name", "net", "org", "pro", "tel", "travel", "fm", "ly", "uk", \
        "in", "us", "il", "de", "it", "fr"
        ]
    if len(emailaddress) < 7:
        # TODO: SR: Why? i@u.nu is valid!
        return False # Address too short.
    try:
        localpart, domainname = emailaddress.rsplit('@', 1)
        host, toplevel = domainname.rsplit('.', 1)
    except ValueError:
        return False # Address does not have enough parts.
    if len(toplevel) != 2 and toplevel not in domains:
        return False # Not a domain name.
    for i in '-_.%.':
        # Keep in mind that google allows +: my+name@gmail.com
        localpart = localpart.replace(i, "")
    for i in '-_.':
        host = host.replace(i, "")
    if localpart.isalnum() and host.isalnum():
        return True # Email address is fine.
    else:
        return False # Email address has funny characters.
        
def validateUSPhone(phone):
    return not (re.match("^[1-9]\d{9}$", phone) == None)
    
#strip leading 1 and any non-numerics
def cleanUSPhone(phone):
    phone = phone.strip()
    
    phone = re.sub("\D", "", phone)
    phone = re.sub("^1", "", phone)
    
    if (validateUSPhone(phone)):
        return phone
    else:
        return None
                
def parse_tags(tagstring):
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
    tagstring = ""
    for tag in tags:
        tagstring += safestr(tag) + ' '
    return tagstring
    
def wordcount(s):
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
    p = re.compile(r'<.*?>')
    return p.sub('', s) 
    
def singlespace(s): 
    p = re.compile(r'\s+')
    return p.sub(' ', s)    
    
def remove_linebreaks(s):
    s = s.splitlines()
    s = ' '.join(s)
    return singlespace(s).strip()
    
def depunctuate(s, exclude=None, replacement=''):
    import string
    p = string.punctuation
    if exclude:
        for c in exclude:
            p = p.replace(c, '')    
    regex = re.compile('[%s]' % re.escape(p))
    return regex.sub(replacement, s) 

def nl2br(s):
    return '<br />\n'.join(s.split('\n'))       

def br2nl(s):
    return '\n'.join(s.split('<br />'))     
    
def prefix(delim, s):
    return s.split(delim)[0]
    
def suffix(delim, s):
    return s.split(delim)[-1]
        
def urlencode(s):
    if s is None: return ""
    if isinstance(s, unicode):
        s = s.encode('utf-8')   
    import urllib    
    return urllib.quote(s)
        
def add_leading_slash(s):
    if not s:
        return None
    if s[0] is not '/':
        s = '/' + s
    return s
    
def titlecase(value):
    """
        Converts a string into titlecase

    """
    return re.sub("([a-z])'([A-Z])", lambda m: m.group(0).lower(), value.title())   
    
def location_cap(location):
    if not location:
        return None
    tokens = location.split(',')
    for token in tokens:    
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
        Converts to lowercase, removes non-alpha chars and converts spaces to hyphens
        
    """
    value = re.sub('[^\w\s-]', '', value).strip().lower()
    return re.sub('[-\s]+', '-', value)

def short_decimal(value):
    value = float(value) * 100.0
    value = int(value)
    value = float(value) / 100.0
    return value
    
def zeropad(value):
    value = int(value)
    if value < 10:
        return "0" + str(value)
    else:
        return str(value)
        
def random_string(length):
    import random
    return ''.join(random.sample("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", length))
    
def obfuscate(id, length=12):
    id = str(id)
    padding = "".join(["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[(i + int(id)) % 52] for i in range(length - len(id))])
    return base64.b64encode(id + padding)
    
def deobfuscate(token):
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
            
def format_time(seconds):
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
    from decimal import Decimal
    return str(Decimal(str(num)).quantize(Decimal('.01')))    
        
def normalize(num, min, max):
    return (float(num) - float(min)) / (float(max) - float(min))
    
def confirm_pid(run_folder):
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
    return not s or len(s.strip()) == 0

def makeUrlAbsolute(url):
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
