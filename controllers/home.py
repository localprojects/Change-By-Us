from framework.controller import *
import giveaminute.location as mLocation
import giveaminute.user as mUser

class Home(Controller):
    def GET(self, action=None):
        self.template_data['user'] = dict(object = self.json(mUser.getDummyDictionary()),
                                            is_admin = True,
                                            is_moderator = True,
                                            is_leader = True)
        if (action and action != 'home'):
            return self.render(action)
        else:
            locations = self.json(mLocation.getSimpleLocationDictionary(self.db))
            
            self.template_data['locations'] = locations
            
            return self.render('home',  {'locations':locations})