import json

from lib import web

from framework.controller import Controller
from framework.log import log

from giveaminute import models

from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound


class NotFoundError (Exception):
    pass
class NoMethodError (Exception):
    pass
class ForbiddenError (Exception):
    pass


class ResourceAccessRules(object):
    """
    A class used to determine whether a given user can take actions on given
    objects.
    
    """
    def can_read(self, user, instance):
        raise NotImplementedError()
    
    def can_create(self, user, instance):
        raise NotImplementedError()
    
    def can_update(self, user, instance):
        raise NotImplementedError()
    
    def can_delete(self, user, instance):
        raise NotImplementedError()


class DefaultAccess (ResourceAccessRules):
    """Read-only access by default"""
    def can_read(self, user, instance):
        return True
    def can_create(self, user, instance):
        return False
    def can_update(self, user, instance):
        return False
    def can_delete(self, user, instance):
        return False


class NonAdminReadOnly (ResourceAccessRules):
    def can_read(self, user, instance):
        return True
    
    def is_admin(self, user):
        return user is not None and user.isAdmin
    
    def can_create(self, user, instance):
        return self.is_admin(user)
    def can_update(self, user, instance):
        return self.is_admin(user)
    def can_delete(self, user, instance):
        return self.is_admin(user)


class NonProjectAdminReadOnly (ResourceAccessRules):
    def can_read(self, user, instance):
        return True
    
    def is_project_admin(self, user, project_id):
        return user is not None and (user.isProjectAdmin(project_id) or user.isAdmin)
    
    def can_create(self, user, instance):
        return self.is_project_admin(user, instance.project_id)
    def can_update(self, user, instance):
        return self.is_project_admin(user, instance.project_id)
    def can_delete(self, user, instance):
        return self.is_project_admin(user, instance.project_id)


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
    
    def get_access_rules(self):
        if hasattr(self, 'access_rules'):
            return self.access_rules
        else:
            return DefaultAccess()
    
    def get_model(self):
        return self.model
    
    def get_orm(self):
        return models.get_orm()
    
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
        
        except NotFoundError, e:
            data = json.dumps({'error': str(e)})
            return self.not_found(data)
        
        except ForbiddenError, e:
            headers = {'Content-Type': 'application/json'}
            data = json.dumps({'error': str(e)})
            return self.forbidden(data, headers)
        
    
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
    """
    Derive from this class to add INDEX functionality to a REST controller.
    
    """
    def REST_INDEX(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.get_orm()
        
        query = orm.query(Model)
        
        all_kw_args = dict(web.input().items() + kwargs.items())
        if all_kw_args:
            query = query.filter_by(**all_kw_args)
        if hasattr(self, 'ordering'):
            query = query.order_by(self.ordering)
        
        return [self.row2dict(instance) for instance in query 
                if self.access_rules.can_read(self.user, instance)]
        

class ReadInstanceMixin (object):
    """
    Derive from this class to add READ functionality to a REST controller.
    
    """
    def REST_READ(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.get_orm()
        
        query = orm.query(Model)
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
        
        if not self.access_rules.can_read(self.user, instance):
            raise ForbiddenError("User cannot retrieve the resource")
        
        return self.row2dict(instance)
        

class CreateInstanceMixin (object):
    """
    Derive from this class to add READ functionality to a REST controller.
    
    """
    def REST_CREATE(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.get_orm()
        
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

        if not self.access_rules.can_create(self.user, instance):
            orm.rollback()
            raise ForbiddenError("User cannot store the resource")
        
        orm.add(instance)
        orm.commit()
        
        return self.row2dict(instance)
        

class UpdateInstanceMixin (object):
    """
    Derive from this class to add UPDATE functionality to a REST controller.
    
    """
    def current_user_can_update(self, instance):
        """
        Returns True if the currently authenticated user (or the anonymous user
        as the case may be) can modify the given model instance object.
        """
        return True
        
    def REST_UPDATE(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.get_orm()
        
        query = orm.query(Model)
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
        
        if not current_user_can_update(instance):
            raise ForbiddenError("Current user cannot modify the resource")
        
        for (key, val) in self.parameters().iteritems():
            setattr(instance, key, val)

        orm.commit()
        return self.row2dict(instance)


class DeleteInstanceMixin(object):
    """
    Derive from this class to add DELETE functionality to a REST controller.
    
    """
    def REST_DELETE(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.get_orm()

        query = orm.query(Model)
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
        
        if not self.access_rules.can_delete(self.user, instance):
            raise ForbiddenError("User cannot delete the resource")
        
        orm.delete(instance)
        orm.commit()
        return


class NeedsList (ListInstancesMixin, CreateInstanceMixin, RestController):
    model = models.Need
    ordering = models.Need.id
    access_rules = NonProjectAdminReadOnly()


class NeedInstance (ReadInstanceMixin, UpdateInstanceMixin, DeleteInstanceMixin, RestController):
    model = models.Need
    access_rules = NonProjectAdminReadOnly()

