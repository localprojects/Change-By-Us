"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from datetime import datetime, timedelta
from framework.controller import *
from framework.config import Config
from sqlalchemy import and_

class Calendar(Controller):
    def GET(self, action=None, param0=None, param1=None, param2=None):
        if (Config.get('features').get('is_calendar_enabled')):
            if (action == 'show' or action == 'get'):
                if (not param0 or not param1):
                    year, month = self.getCurrentYearMonth()
                else:
                    year, month = (param0, param1)

                d = datetime(int(year), int(month), 1)
                start = "%s-%s" % (year, month)
                end = (d + timedelta(days = 32)).strftime('%Y-%m')    
                events = self.getEvents(start, end)
                
                if (action == 'show'):
                    return self.showCalendar(events, start, end, d)
                elif (action == 'get'):
                    return self.getCalendar(events)
            
            else:
                return self.not_found()
        else:
            return self.not_found()
        
    def showCalendar(self, events, start, end, d):
        self.template_data['calendar'] = {}
        self.template_data['calendar']['events'] = events
        self.template_data['calendar']['next_month'] = end
        self.template_data['calendar']['prev_month'] = (d + timedelta(days = -1)).strftime('%Y-%m')
        self.template_data['calendar']['is_active_month'] = self.isActiveMonth(d) 
    
        return self.render('calendar')
    
    def getCalendar(self, year, month):
        return self.json({'events': events}) 
        
    def getEvents(self, start, end):
        events = self.orm.query(models.Event).filter(and_(models.Event.start_datetime > start, 
                                                          models.Event.start_datetime < end))                                                    
        return events
        
    def getCurrentYearMonth(self):
        now = datetime.now()
        year = now.year
        month = now.strftime('%m')
            
        return (year, month)   
        
    def isActiveMonth(self, d):
        now = datetime.now()
        
        return (d.year >= now.year and d.month >= now.month)