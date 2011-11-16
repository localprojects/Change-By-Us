"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

#!/usr/bin/env python

"""
Module to handle queue for tasks using beasnstalkd.

"""
import pickle
import inspect
import sys
import os
import traceback

sys.path.append(os.path.dirname(__file__) + "/../")
from framework.log import log
from framework.config import *

# Attempt to read beanstalk from lib.
try:
    from lib import beanstalkc
except ImportError:
    import beanstalkc


class Tasks():
    """
    Class to manage tasks.
    
    """
    def __init__(self):
        """
        Constructor to define beanstalkd queue.
        
        """
        try:
            self.queue = beanstalkc.Connection(host=Config.get('beanstalk')['address'], port=Config.get('beanstalk')['port'])
        except Exception, e:
            log.warning("Could not create queue.")
            self.queue = None

    def add(self, tube=None, func=None, data=None, timeout=120):
        """
        Add a task to queue and use specific tube if provided.
        
        """
        if self.queue is None:
            log.warning("Attempted to add task, but task queue is not running.")
            return
            
        if tube is not None:
            self.queue.use(tube)
            
        log.info("Tasks.add tube[%s] func[%s]" % (self.queue.using(), func))
        self.queue.put(pickle.dumps(Task(func, data)), ttr=timeout)

    def process(self, handler=None, tube=None): 
        """
        Process queue.  This should not be called from within a web app.
        
        """
        if self.queue is None:
            error = "Attempted to process queue, but task queue is not running"
            log.error(error)
            print error
            return

        # Watch specific queue is provided.
        if tube is not None:
            self.queue.watch(tube)
            
        log.info("Starting Tasks.process [%s] ..." % self.queue.watching())
        
        # Loop indefinitely.  Not really sure how this breaks.
        while True:
            # Get the next reserved job.  No timeout will block until a job is found. 
            # timeout=0 will fire it immediately and not block
            job = self.queue.reserve()
            
            if job:
                log.info("Tasks.process: got job")
                
                # Load up the job body
                task = pickle.loads(job.body)
                log.info("--> func[%s]" % task.func)
                
                # Check for handler.  If not found, run the Task's internally 
                # pickled function, otherwise use the defined handler.
                if handler == None:
                    if task.execute():
                        job.delete()
                        log.info("--> complete")
                    else:
                        job.bury()           
                        log.error("--> buried")
                else:
                    try:
                        if handler(task):
                            job.delete()
                            log.info("--> complete")                            
                        else:
                            job.bury()
                            log.info("--> buried")
                    except Exception, e:
                        traceback.print_exc()
                        log.error("--> task error: %s" % e)    
                        
                        # At this stage, beanstalk can fail, so it needs to be caught.    
                        try:                            
                            job.bury()  
                        except Exception, e:
                            pass
                        log.info("--> buried")                                         
            else:
                log.info("--> no jobs")
        

class Task():
    """
    Class to contain a single task.
    
    """
    
    def __init__(self, func, args):
        """
        Constructor to define properties.  Note that `func` doesn't 
        have to be a function
        
        """
        self.func = func    
        self.args = args
        
    def execute(self):
        """
        Execute task.
        
        """
        try:
            if callable(self.func):
                self.func(self.args)
            else:
                log.info("--> (not callable)")

            return True
        except Exception, e:
            log.error("Task: %s" % e)
            return False        
