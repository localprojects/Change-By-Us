from lib import web

from framework.controller import Controller
from framework.log import log

from giveaminute import models

from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound


class NotFoundError (Exception):
    pass
class NoMethodError (Exception):
    pass


class RestController (Controller):
    """
    Base controller for REST endpoints.
    
    In classes that derive from ``RestController``, use the routing functions::
    
    - ``REST_INDEX``, 
    - ``REST_CREATE``, 
    - ``REST_READ``, 
    - ``REST_UPDATE``, and 
    - ``REST_DELETE
    
    """
    def get_model(self):
        return self.model
    
    def get_session(self):
        return models.get_session()
    
    def row2dict(self, row):
        d = {}
        for columnName in row.__table__.columns.keys():
            d[columnName] = getattr(row, columnName)

        return d
    
    def _BASE_METHOD_HANDLER(self, allowed_verbs, *args, **kwargs):
        """
        Routes requests to the appropriate REST verb.  The allowed verbs are
        passed in as a list of strings corresponding to method names.
        
        Handles the following exceptions::
        
        - NotFoundError: return a 404 response
        """
        try:
            for verb in allowed_verbs:
                if hasattr(self, verb):
                    method_handler = getattr(self, verb)
                    response_data = method_handler(*args, **kwargs)
                    return self.json(response_data)
            
            return self.no_method()
        
        except NotFoundError:
            return self.not_found()
        
    
    def GET(self, *args, **kwargs):
        # NOTE: As they're handled here, the READ and INDEX cases are mutually
        #       exclusive; an endpoint should have only one behavior anyway.
        return self._BASE_METHOD_HANDLER(['REST_INDEX','REST_READ'], *args, **kwargs)
    
    def POST(self, *args, **kwargs):
        # Check if something other than POST was desired.
        try:
            real_method = self.request('_method') or 'POST'
        except KeyError:
            real_method = 'POST'
        real_method = real_method.upper()
        
        if real_method == 'PUT':
            return self.PUT(*args, **kwargs)
        elif real_method == 'DELETE':
            return self.DELETE(*args, **kwargs)
        
        # Actually handle the POST.
        return self._BASE_METHOD_HANDLER(['REST_CREATE'], *args, **kwargs)
    
    def PUT(self, *args, **kwargs):
        return self._BASE_METHOD_HANDLER(['REST_UPDATE'], *args, **kwargs)
    
    def DELETE(self, *args, **kwargs):
        return self._BASE_METHOD_HANDLER(['REST_DELETE'], *args, **kwargs)
    

class ListInstancesMixin (object):

    def REST_INDEX(self, *args, **kwargs):
        Model = self.get_model()
        session = self.get_session()
        
        query = session.query(Model)
        
        all_kw_args = dict(web.input().items() + kwargs.items())
        if all_kw_args:
            query = query.filter_by(**all_kw_args)
        if hasattr(self, 'ordering'):
            query = query.order_by(self.ordering)
        
        return [self.row2dict(row) for row in query]
        

class ReadInstanceMixin (object):
    """
    Derive from this class to add READ functionality to a REST controller.
    
    """
    def REST_READ(self, *args, **kwargs):
        Model = self.get_model()
        session = self.get_session()
        
        query = session.query(Model)
        if kwargs:
            query = query.filter(**kwargs)
        
        if args:
            # If we have any none kwargs then assume the last represents the primrary key
            instance = query.get(args[-1])
            if instance is None:
                raise NotFoundError("No results found")
            
        else:
            # Otherwise assume the kwargs uniquely identify the model
            try:
                instance = query.one()
            except NoResultFound:
                raise NotFoundError("No results found")
            except MultipleResultsFound:
                raise NotFoundError("Multiple results found; no single match")
        
        return self.row2dict(instance)
        

class CreateInstanceMixin (object):
    """
    Derive from this class to add READ functionality to a REST controller.
    
    """
    def REST_CREATE(self, *args, **kwargs):
        Model = self.get_model()
        session = self.get_session()
        
        # TODO: We want to be able to refer to related objects by their name as
        #       opposed to by name_id (e.g., ``project=2`` instead of 
        #       ``project_id=2``), but we have to figure out how to do that in
        #       SQLAlchemy.
        #
        #       The following is the Django version of what I'm talking about,
        #       for reference.  This comes from djangorestframework.
        #
#        # translated 'related_field' kwargs into 'related_field_id'
#        for related_name in [field.name for field in model._meta.fields if isinstance(field, RelatedField)]:
#            if kwargs.has_key(related_name):
#                kwargs[related_name + '_id'] = kwargs[related_name]
#                del kwargs[related_name]
        
        all_kw_args = dict(web.input().items() + kwargs.items())
        instance = Model(**all_kw_args)
        session.add(instance)
        session.commit()
        
        # TODO: set status to 201
        return self.row2dict(instance)
        

class UpdateInstanceMixin (object):
    """
    Derive from this class to add UPDATE functionality to a REST controller.
    
    """
    def REST_UPDATE(self, *args, **kwargs):
        Model = self.get_model()
        session = self.get_session()
        
        query = session.query(Model)
        if kwargs:
            query = query.filter(**kwargs)
        
        if args:
            # If we have any args then assume the last represents the primrary key
            instance = query.get(args[-1])
            if instance is None:
                raise NotFoundError("No results found")
                
        else:
            # Otherwise assume the kwargs uniquely identify the model
            try:
                instance = query.one()
            except NoResultFound:
                raise NotFoundError("No results found")
            except MultipleResultsFound:
                raise NotFoundError("Multiple results found; no single match")

        for (key, val) in self.parameters().iteritems():
            setattr(instance, key, val)

        session.commit()
        return self.row2dict(instance)


class DeleteInstanceMixin(object):
    """
    Derive from this class to add DELETE functionality to a REST controller.
    
    """
    def REST_DELETE(self, *args, **kwargs):
        Model = self.get_model()
        session = self.get_session()

        query = session.query(Model)
        if kwargs:
            query = query.filter(**kwargs)
        
        if args:
            # If we have any args then assume the last represents the primrary key
            instance = query.get(args[-1])
            if instance is None:
                raise NotFoundError("No results found")
                
        else:
            # Otherwise assume the kwargs uniquely identify the model
            try:
                instance = query.one()
            except NoResultFound:
                raise NotFoundError("No results found")
            except MultipleResultsFound:
                raise NotFoundError("Multiple results found; no single match")
        
        session.delete(instance)
        session.commit()
        return {}


class NeedsList (ListInstancesMixin, CreateInstanceMixin, RestController):
    model = models.Need
    ordering = models.Need.id


class NeedInstance (ReadInstanceMixin, UpdateInstanceMixin, DeleteInstanceMixin, RestController):
    model = models.Need

