from framework.controller import *
import giveaminute.location as mLocation

class Home(Controller):
    def GET(self, action=None):
        if (action and action != 'home'):
            return self.render(action)
        else:
            locations = self.json(mLocation.getSimpleLocationDictionary(self.db))
        
            return self.render('home',  {'locations':locations})