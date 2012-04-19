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
            if (action == 'show'):
                return self.showCalendar(param0, param1)
            elif (action == 'get'):
                return self.getCalendar(param0, param1)    
            else:
                return self.not_found()
        else:
            return self.not_found()
        
    def showCalendar(self, unit, start):
        if (not unit or not start):
            unit = 'monthly'
            d = datetime.now()
            start = d.strftime('%Y-%m')
            
            return self.redirect("/calendar/show/%(unit)s/%(start)s" % {'unit': 'monthly',
                                                                   'start': start})
        elif (unit == 'monthly'):
            d = datetime.strptime(start, '%Y-%m')
            end = (d + timedelta(days = 32)).strftime('%Y-%m')
        
            self.template_data['calendar'] = {}
            self.template_data['calendar']['events'] = self.getEvents(start, end)
            self.template_data['calendar']['next_month'] = end
            self.template_data['calendar']['prev_month'] = (d + timedelta(days = -1)).strftime('%Y-%m')
            self.template_data['calendar']['is_active_month'] = self.isActiveMonth(d) 
        
            return self.render('calendar')
        else:
            return self.not_found()       
    
    def getCalendar(self, unit, start):
        if (unit == 'monthly'):
            return start
        else:
            return self.not_found() 
        
        
    def getEvents(self, start, end):
        events = self.orm.query(models.Event).filter(and_(models.Event.start_datetime > start, 
                                                          models.Event.start_datetime < end))                                                    
        return events
        
    def isActiveMonth(self, d):
        now = datetime.now()
        
        return (d.year >= now.year and d.month >= now.month)