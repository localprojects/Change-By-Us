from framework.controller import *
import giveaminute.location as mLocation
import giveaminute.user as mUser
import giveaminute.project as mProject

class Home(Controller):
    def GET(self, action=None, page=None):
        self.template_data['project_user'] = dict(is_member = True,
                                                is_project_admin = True)          
                                          
        if (not action or action == 'home'):
            return self.showHome()
        elif (action == 'project'):
            return self.showProject(page)                                        
        else:
            return self.render(action)
            
            
    def POST(self, action=None):
        if (action == 'login'):
             return self.login()
        elif (action == 'logout'):
            return self.logout()
        else:
            return self.not_found()
            
            
    def showHome(self):
        #temp fix
        locations = dict(data = mLocation.getSimpleLocationDictionary(self.db), json = self.json(mLocation.getSimpleLocationDictionary(self.db)))
        allIdeas = dict(data = self.getAllProjectIdeas(), json = self.json(self.getAllProjectIdeas()))
        
        self.template_data['locations'] = locations
        self.template_data['all_ideas'] = allIdeas
        
        return self.render('home', {'locations':locations, 'all_ideas':allIdeas})
        
    def showProject(self, projectId):
        if (not projectId or projectId == -1):
            projDictionary = mProject.getTestData()
        else:
            project = mProject.Project(self.db, project_id)
            
            projDictionary = project.getFullDictionary()
        
        self.template_data['project'] = dict(json = self.json(projDictionary), data = projDictionary)
        return self.render('project')
    
    def login(self):
        email = self.request("email")
        password = self.request("password")
        
        if (email and password):
            userId = mUser.authenticateUser(self.db, email, password)
                
            if (userId):        
                self.session.user_id = userId
                self.session.invalidate()
                
                return userId
            else:
                return False    
        else:
            log.warning("Missing email or password")                        
            return False
            
    def logout(self):
        self.session.kill()

        return True    
        
    def getAllProjectIdeas(self):
        data = []
        
        data.append(self.getProjectIdeas(1, 50))
        data.append(self.getProjectIdeas(2, 30))
        data.append(self.getProjectIdeas(3, 30))
        data.append(self.getProjectIdeas(4, 30))
        data.append(self.getProjectIdeas(5, 15))
        
        return data
        
    def getProjectIdeas(self, index, num):
        data = dict(title = '',ideas = [])
        
        if index == 1:
          data['title'] = 'More Trees in NYC'
          for i in range(num):
            data['ideas'].append(dict(text = "More Trees in New York City would be awesome and it would totally help to make it way more green! Let's plant some!",
                            f_name = "John",
                            l_name = "Smith",
                            submitted_by = "web"))
        elif index == 2:
          data['title'] = 'Outta There'
          for i in range(num):
            data['ideas'].append(dict(text = "Phew, this Austin place is way nicer anyways.",
                            f_name = "Ethan",
                            l_name = "Holda",
                            submitted_by = "web"))
        elif index == 3:
          data['title'] = 'Continuous Climbing'
          for i in range(num):
            data['ideas'].append(dict(text = "There arent enough opportunities to climb in this city. Lets turn the whole place into a gym by selling tower climbing permits.",
                            f_name = "Zeke",
                            l_name = "Shore",
                            submitted_by = "web"))
        elif index == 4:
          data['title'] = 'French'
          for i in range(num):
            data['ideas'].append(dict(text = "This place needs more culture, more joie de vivre. Lets import some culture experts from Paris.",
                            f_name = "Lev",
                            l_name = "Kanter",
                            submitted_by = "web"))
        elif index == 5:
          data['title'] = 'Clean Up Canal'
          for i in range(num):
            data['ideas'].append(dict(text = "The bag-sellers outside my apartment are terrible. Out with the bags, in with the schwarma.",
                            f_name = "Ian",
                            l_name = "Lord",
                            submitted_by = "web"))
            
        return data
