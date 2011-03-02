import util as util
from framework.log import log
from framework.controller import *

class Monitor(Controller):

    def GET(self, id=None):
        log.info("Monitor")
        tasks = Tasks()
        info = {    'tasks': tasks.queue.stats() if tasks.queue is not None else [],
                    'cache': self.cache.get_stats()
                    }
        return self.json(info)