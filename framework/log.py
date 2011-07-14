"""
Extend the standard log module to enable some more detailed debug information.
"""
import os
import logging
import __main__
import logging.handlers

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
name = os.path.basename(__main__.__file__).split('.')[0]
log = logging.getLogger(name)

# Set log level to Debug (TODO: This should be pulled from config file)
log.setLevel(logging.DEBUG)

# Create new log handler and set logs to rotate out at midnight
logfile = '%s/../logs/%s.log' % (os.path.dirname(os.path.realpath(__file__)), name)
fh = logging.handlers.TimedRotatingFileHandler(logfile, 'midnight')
fh.setLevel(logging.DEBUG)
fh.setFormatter(formatter)
log.addHandler(fh)

# Extend log module with Info class defined above.
log = logging.LoggerAdapter(log, Info())
