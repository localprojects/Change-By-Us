import os, logging, __main__
import logging.handlers
from config import Config
try:
    from lib import web
except ImportError:
    pass

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
        keys = ['ip']
        keys.extend(self.__dict__.keys())
        return keys.__iter__()
        

formatter = logging.Formatter("%(asctime)s %(ip)s |%(levelname)s| %(message)s <%(filename)s:%(lineno)d>")        

name = os.path.basename(__main__.__file__).split('.')[0]    # log identifier/file will be the same as the file being run

log = logging.getLogger(name)
log.setLevel(logging.DEBUG)

logfile = Config.get('logfile') # %s/../logs/%s.log' % (os.path.dirname(os.path.realpath(__file__)), name)

fh = logging.handlers.TimedRotatingFileHandler(logfile, 'midnight')
fh.setLevel(logging.DEBUG)
fh.setFormatter(formatter)
log.addHandler(fh)

log = logging.LoggerAdapter(log, Info())