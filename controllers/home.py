from framework.controller import *

class Home(Controller):
    def GET(self, action=None):
        if action:
            return self.render(action)
        else:
            return self.render('home')