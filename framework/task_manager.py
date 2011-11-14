#!/usr/bin/env python

"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
import pickle, inspect, sys, os, traceback
sys.path.append(os.path.dirname(__file__) + "/../")
from framework.log import log
from framework.config import *
#import controllers.cards
try:
    from lib import beanstalkc
except ImportError:
    import beanstalkc

class Tasks():
    
    def __init__(self):
        try:
            self.queue = beanstalkc.Connection(host=Config.get('beanstalk')['address'], port=Config.get('beanstalk')['port'])
        except Exception, e:
            self.queue = None
        
    def add(self, tube=None, func=None, data=None, timeout=120):
        if self.queue is None:
            log.warning("Attempted to add task, but task queue is not running")
            return
        if tube is not None:
            self.queue.use(tube)
        #log.info("Tasks.add tube[%s] func[%s] data[%s]" % (self.queue.using(), func, data))
        log.info("Tasks.add tube[%s] func[%s]" % (self.queue.using(), func))
        self.queue.put(pickle.dumps(Task(func, data)), ttr=timeout)
    
    def process(self, handler=None, tube=None):  
        ## Don't call this within a web app
        if self.queue is None:
            error = "Attempted to process queue, but task queue is not running"
            log.error(error)
            print error
            return
        #if tubes is not None:
        #    for t in tubes:
        #        self.queue.watch(t)
        if tube is not None:
            self.queue.watch(tube)
        log.info("Starting Tasks.process [%s] ..." % self.queue.watching())
        while True:
            job = self.queue.reserve() # no timeout will block until a job is found. timeout=0 will fire it immediately and not block
            if job:
                log.info("Tasks.process: got job")
                task = pickle.loads(job.body)
                #log.info("--> func[%s] args[%s]" % (task.func, task.args))
                log.info("--> func[%s]" % task.func)
                if handler == None:
                    if task.execute():  # run the Task's internally pickled function
                        job.delete()
                        log.info("--> complete")
                    else:
                        job.bury()           
                        log.error("--> buried")
                else:
                    try:
                        if handler(task):   # use a handler to process the data
                            job.delete()
                            log.info("--> complete")                            
                        else:
                            job.bury()
                            log.info("--> buried")
                    except Exception, e:
                        traceback.print_exc()
                        log.error("--> task error: %s" % e)           
                        try:                            
                            job.bury()  # at this stage, beanstalk can fail, so it needs to be caught
                        except Exception, e:
                            pass
                        log.info("--> buried")                                         
            else:
                log.info("--> no jobs")
        

class Task():
    
    def __init__(self, func, args):
        self.func = func    # func doesnt have to be a function
        self.args = args
        
    def execute(self):
        try:
            if callable(self.func):
                self.func(self.args)
            else:
                log.info("--> (not callable)")
            return True
        except Exception, e:
            log.error("Task: %s" % e)
            return False        
        
                
# if __name__ == '__main__':      
#     tasks = Tasks()
#     tasks.process(tubes=["renderCards", "renderCity"])
