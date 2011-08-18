import web

from framework.controller import Controller
from framework.log import log

from giveaminute import models


class RestController (Controller):
    
    def get_model(self):
        return self.model
    
    def get_session(self):
        return models.get_session()
    
    def row2dict(self, row):
        d = {}
        for columnName in row.__table__.columns.keys():
            d[columnName] = getattr(row, columnName)

        return d
    
    def respond_with_405(self):
        # TODO: Return a 405 (Method not Allowed)
        return
    
    def GET(self, *args, **kwargs):
        if hasattr(self, 'INDEX'):
            response_data = self.INDEX(*args, **kwargs)
        elif hasattr(self, 'READ'):
            response_data = self.READ(*args, **kwargs)
        else:
            return self.respond_with_405()
        
        return self.json(response_data)
    
    def POST(self, *args, **kwargs):
        # Check if something other than POST was desired.
        try:
            real_method = self.request('_method').toUpper()
        except KeyError:
            real_method = 'POST'
        
        if real_method == 'PUT':
            return self.PUT(*args, **kwargs)
        elif real_method == 'DELETE':
            return self.DELETE(*args, **kwargs)
        
        # Actually handle the POST.
        if hasattr(self, 'CREATE'):
            response_data = self.CREATE(*args, **kwargs)
        else:
            return self.respond_with_405()
        
        return self.json(response_data)
    
    def PUT(self, *args, **kwargs):
        if hasattr(self, 'UPDATE'):
            response_data = self.UPDATE(*args, **kwargs)
        else:
            return self.respond_with_405()
        
        return self.json(response_data)
    
    def DELETE(self, *args, **kwargs):
        if hasattr(self, 'DELETE'):
            response_data = self.DELETE(*args, **kwargs)
        else:
            return self.respond_with_405()
        
        return self.json(response_data)
    

class ListInstancesMixin (object):

    def INDEX(self, *args, **kwargs):
        Model = self.get_model()
        session = self.get_session()
        
        try:
            query = session.query(Model)
            if hasattr(self, 'ordering'):
                query = query.order_by(self.ordering)
        except:
            query = []
        
        return [self.row2dict(row) for row in query]
        


class NeedsList (ListInstancesMixin, RestController):
    
    model = models.Need


class NeedInstance (Controller):

    def GET(self, id):
        pass
    
    def POST(self, id):
        pass
    

