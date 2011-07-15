<<<<<<< HEAD
import os, logging, __main__
import logging.handlers
=======
"""
Extend the standard log module to enable some more detailed debug information.
"""
import os
import logging
import __main__
import logging.handlers

# Attempt to import lib from web, but not necessary
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
try:
    from lib import web
except ImportError:
    pass

<<<<<<< HEAD
class Info():
        
    def __getitem__(self, name):
        if name == 'ip':
            try:
                ip = web.ctx.ip
            except (AttributeError, NameError):
                ip = "X.X.X.X"            
            ip = "%s%s" % (ip, ''.join(' ' for i in range(15 - len(ip))))
            return ip
        return self.__dict__.get(name, "?")
        
    def __iter__(self):
=======

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
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
        keys = ['ip']
        keys.extend(self.__dict__.keys())
        return keys.__iter__()
        

<<<<<<< HEAD
formatter = logging.Formatter("%(asctime)s %(ip)s |%(levelname)s| %(message)s <%(filename)s:%(lineno)d>")        

name = os.path.basename(__main__.__file__).split('.')[0]    # log identifier/file will be the same as the file being run

log = logging.getLogger(name)
log.setLevel(logging.DEBUG)

logfile = '%s/../logs/%s.log' % (os.path.dirname(os.path.realpath(__file__)), name)

=======
# Set formatter for logging
formatter = logging.Formatter("%(asctime)s %(ip)s |%(levelname)s| %(message)s <%(filename)s:%(lineno)d>")        

# Log identifier/file will be the same as the file being run
name = os.path.basename(__main__.__file__).split('.')[0]
log = logging.getLogger(name)

# Set log level to Debug (TODO: This should be pulled from config file)
log.setLevel(logging.DEBUG)

# Create new log handler and set logs to rotate out at midnight
logfile = '%s/../logs/%s.log' % (os.path.dirname(os.path.realpath(__file__)), name)
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
fh = logging.handlers.TimedRotatingFileHandler(logfile, 'midnight')
fh.setLevel(logging.DEBUG)
fh.setFormatter(formatter)
log.addHandler(fh)

<<<<<<< HEAD
log = logging.LoggerAdapter(log, Info())
=======
# Extend log module with Info class defined above.
log = logging.LoggerAdapter(log, Info())
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
