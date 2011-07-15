#!/usr/bin/env python

<<<<<<< HEAD
import pickle, inspect, sys, os, traceback
sys.path.append(os.path.dirname(__file__) + "/../")
from framework.log import log
from framework.config import *
#import controllers.cards
=======
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
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
try:
    from lib import beanstalkc
except ImportError:
    import beanstalkc

<<<<<<< HEAD
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
=======

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
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
        if self.queue is None:
            error = "Attempted to process queue, but task queue is not running"
            log.error(error)
            print error
            return
<<<<<<< HEAD
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
=======

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
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
                        job.delete()
                        log.info("--> complete")
                    else:
                        job.bury()           
                        log.error("--> buried")
                else:
                    try:
<<<<<<< HEAD
                        if handler(task):   # use a handler to process the data
=======
                        if handler(task):
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
                            job.delete()
                            log.info("--> complete")                            
                        else:
                            job.bury()
                            log.info("--> buried")
                    except Exception, e:
                        traceback.print_exc()
<<<<<<< HEAD
                        log.error("--> task error: %s" % e)           
                        try:                            
                            job.bury()  # at this stage, beanstalk can fail, so it needs to be caught
=======
                        log.error("--> task error: %s" % e)    
                        
                        # At this stage, beanstalk can fail, so it needs to be caught.    
                        try:                            
                            job.bury()  
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
                        except Exception, e:
                            pass
                        log.info("--> buried")                                         
            else:
                log.info("--> no jobs")
        

class Task():
<<<<<<< HEAD
    
    def __init__(self, func, args):
        self.func = func    # func doesnt have to be a function
        self.args = args
        
    def execute(self):
=======
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
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
        try:
            if callable(self.func):
                self.func(self.args)
            else:
                log.info("--> (not callable)")
<<<<<<< HEAD
=======
                
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
            return True
        except Exception, e:
            log.error("Task: %s" % e)
            return False        
<<<<<<< HEAD
        
                
# if __name__ == '__main__':      
#     tasks = Tasks()
#     tasks.process(tubes=["renderCards", "renderCity"])
=======
>>>>>>> 91209450f14da99bae2edfc57c224cd0bd4e8f0b
