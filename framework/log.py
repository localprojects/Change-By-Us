"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

"""
Extend the standard log module to enable some more detailed debug information.
"""
import os
import logging
import __main__
import logging.handlers
from config import Config

# Attempt to import lib from web, but not necessary
try:
    from lib import web
except ImportError:
    pass


class Info():
    """
    Class to help extend logging functionality
    """
            
    def __getitem__(self, name):
        """
        Override get item to format IP addresses better, specifically add padding.
        """
        if name == 'ip':
            try:
                ip = web.ctx.ip
                if ip is None:
                    ip = "No IP Address"
            except (AttributeError, NameError):
                ip = "X.X.X.X"
                     
            ip = "%s%s" % (ip, ''.join(' ' for i in range(15 - len(ip))))
            return ip
            
        return self.__dict__.get(name, "?")
        
    def __iter__(self):
        """
        Override iter method to add the ip attribute
        """
        keys = ['ip']
        keys.extend(self.__dict__.keys())
        return keys.__iter__()
        

# Set formatter for logging
formatter = logging.Formatter("%(asctime)s %(ip)s |%(levelname)s| %(message)s <%(filename)s:%(lineno)d>")        

# Log identifier/file will be the same as the file being run
try:
    name = os.path.basename(__main__.__file__).split('.')[0]
except AttributeError, e:
    name = 'main'
    
log = logging.getLogger(name)

# Set log level to Debug (TODO: This should be pulled from config file)
loglevel = None
try:
    loglevel = Config.get("loglevel")
    log.setLevel(logging.__getattribute__(loglevel))
except:
    print "Unable to set loglevel to %s. Defaulting to DEBUG" % loglevel
    loglevel = "debug"
    log.setLevel(logging.__getattribute__(loglevel))

logfile = Config.get('logfile') # %s/../logs/%s.log' % (os.path.dirname(os.path.realpath(__file__)), name)

fh = logging.handlers.TimedRotatingFileHandler(logfile, 'midnight')
fh.setLevel(logging.__getattribute__(loglevel))
fh.setFormatter(formatter)
log.addHandler(fh)

# Set the orm logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.__getattribute__(loglevel))

# Extend log module with Info class defined above.
log = logging.LoggerAdapter(log, Info())
print "LogLevel has been set to %s." % loglevel
