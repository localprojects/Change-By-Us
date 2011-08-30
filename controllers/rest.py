import inspect
import json

from lib import web

from framework.controller import Controller
from framework.log import log
from framework.util import safestr
from framework.util import safeuni

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

    def is_project_admin(self, user, project):
        return (user is not None) and ((user in project.members) or user.is_site_admin)

    def can_create(self, user, instance):
        return self.is_project_admin(user, instance.project)
    def can_update(self, user, instance):
        return self.is_project_admin(user, instance.project)
    def can_delete(self, user, instance):
        return self.is_project_admin(user, instance.project)


def _field_to_tuple(field):
    """
    Convert an item in the `fields` attribute into a 2-tuple.
    """
    if isinstance(field, (tuple, list)):
        return (field[0], field[1])
    return (field, None)

def _fields_to_list(fields):
    """
    Return a list of field names.
    """
    return [_field_to_tuple(field)[0] for field in fields or ()]

def _fields_to_dict(fields):
    """
    Return a `dict` of field name -> None, or tuple of fields, or Serializer class
    """
    return dict([_field_to_tuple(field) for field in fields or ()])


class Serializer(object):
    """
    Converts python objects into plain old native types suitable for
    serialization.  In particular it handles models and querysets.

    The output format is specified by setting a number of attributes
    on the class.

    You may also override any of the serialization methods, to provide
    for more flexible behavior.

    Valid output types include anything that may be directly rendered into
    json, xml etc...
    """

    fields = ()
    """
    Specify the fields to be serialized on a model or dict.
    Overrides `include` and `exclude`.
    """

    include = ()
    """
    Fields to add to the default set to be serialized on a model/dict.
    """

    exclude = ()
    """
    Fields to remove from the default set to be serialized on a model/dict.
    """

    rename = {}
    """
    A dict of key->name to use for the field keys.
    """

    related_serializer = None
    """
    The default serializer class to use for any related models.
    """

    depth = None
    """
    The maximum depth to serialize to, or `None`.
    """


    def __init__(self, depth=None, stack=[], **kwargs):
        self.depth = depth or self.depth
        self.stack = stack


    def get_fields(self, obj):
        """
        Return the set of field names/keys to use for a model instance/dict.
        """
        fields = self.fields

        # If `fields` is not set, we use the default fields and modify
        # them with `include` and `exclude`
        if not fields:
            default = self.get_default_fields(obj)
            include = self.include or ()
            exclude = self.exclude or ()
            fields = set(default + list(include)) - set(exclude)

        else:
            fields = _fields_to_list(self.fields)

        return fields


    def get_default_fields(self, obj):
        """
        Return the default list of field names/keys for a model instance/dict.
        These are used if `fields` is not given.
        """
#        if isinstance(obj, models.Model):
#            opts = obj._meta
#            return [field.name for field in opts.fields + opts.many_to_many]
#        else:
        return obj.keys()


    def get_related_serializer(self, key):
        info = _fields_to_dict(self.fields).get(key, None)

        # If an element in `fields` is a 2-tuple of (str, tuple)
        # then the second element of the tuple is the fields to
        # set on the related serializer
        if isinstance(info, (list, tuple)):
            class OnTheFlySerializer(Serializer):
                fields = info
            return OnTheFlySerializer

        # If an element in `fields` is a 2-tuple of (str, Serializer)
        # then the second element of the tuple is the Serializer
        # class to use for that field.
        elif isinstance(info, type) and issubclass(info, Serializer):
            return info

        # If an element in `fields` is a 2-tuple of (str, str)
        # then the second element of the tuple is the name of the Serializer
        # class to use for that field.
        #
        # Black magic to deal with cyclical Serializer dependancies.
        # Similar to what Django does for cyclically related models.
        elif isinstance(info, str) and info in _serializers:
            return _serializers[info]

        # Otherwise use `related_serializer` or fall back to `Serializer`
        return getattr(self, 'related_serializer') or Serializer


    def serialize_key(self, key):
        """
        Keys serialize to their string value,
        unless they exist in the `rename` dict.
        """
        return self.rename.get(safestr(key), safestr(key))


    def serialize_val(self, key, obj):
        """
        Convert a model field or dict value into a serializable representation.
        """
        related_serializer = self.get_related_serializer(key)

        if self.depth is None:
            depth = None
        elif self.depth <= 0:
            return self.serialize_max_depth(obj)
        else:
            depth = self.depth - 1

        if any([obj is elem for elem in self.stack]):
            return self.serialize_recursion(obj)
        else:
            stack = self.stack[:]
            stack.append(obj)

        return related_serializer(depth=depth, stack=stack).serialize(obj)


    def serialize_max_depth(self, obj):
        """
        Determine how objects should be serialized once `depth` is exceeded.
        The default behavior is to ignore the field.
        """
        raise _SkipField


    def serialize_recursion(self, obj):
        """
        Determine how objects should be serialized if recursion occurs.
        The default behavior is to ignore the field.
        """
        raise _SkipField


    def serialize_model(self, instance):
        """
        Given a model instance or dict, serialize it to a dict..
        """
        data = {}

        fields = self.get_fields(instance)

        # serialize each required field
        for fname in fields:
            if hasattr(self, safestr(fname)):
                # check first for a method 'fname' on self first
                meth = getattr(self, fname)
                if inspect.ismethod(meth) and len(inspect.getargspec(meth)[0]) == 2:
                    obj = meth(instance)
            elif hasattr(instance, '__contains__') and fname in instance:
                # check for a key 'fname' on the instance
                obj = instance[fname]
            elif hasattr(instance, safestr(fname)):
                # finally check for an attribute 'fname' on the instance
                obj = getattr(instance, fname)
            else:
                continue

            key = self.serialize_key(fname)
            val = self.serialize_val(fname, obj)
            data[key] = val

        return data


    def serialize_iter(self, obj):
        """
        Convert iterables into a serializable representation.
        """
        return [self.serialize(item) for item in obj]


    def serialize_func(self, obj):
        """
        Convert no-arg methods and functions into a serializable representation.
        """
        return self.serialize(obj())


    def serialize_manager(self, obj):
        """
        Convert a model manager into a serializable representation.
        """
        return self.serialize_iter(obj.all())


    def serialize_fallback(self, obj):
        """
        Convert any unhandled object into a serializable representation.
        """
        return safeuni(obj)


    def serialize(self, obj):
        """
        Convert any object into a serializable representation.
        """

        if isinstance(obj, (dict, models.Base)):
            # Model instances & dictionaries
            return self.serialize_model(obj)
        elif isinstance(obj, (tuple, list, set)): # What are query types in sqlalchemy?
            # basic iterables
            return self.serialize_iter(obj)
        elif inspect.isfunction(obj) and not inspect.getargspec(obj)[0]:
            # function with no args
            return self.serialize_func(obj)
        elif inspect.ismethod(obj) and len(inspect.getargspec(obj)[0]) <= 1:
            # bound method
            return self.serialize_func(obj)

        # Protected types are passed through as is.
        # (i.e. Primitives like None, numbers, dates, and Decimals.)
        if isinstance(obj, (int, basestring, float)) or obj is None:
            return obj

        # All other values are converted to string.
        return self.serialize_fallback(obj)


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

    def get_serializer(self):
        return Serializer()

    def get_access_rules(self):
        if hasattr(self, 'access_rules'):
            return self.access_rules
        else:
            return DefaultAccess()

    def get_model(self):
        return self.model

    def instance_to_dict(self, row):
        if row is None: return None

        d = {}
        for columnName in row.__mapper__.columns.keys():
            d[columnName] = getattr(row, columnName)

        return d

    def replace_gam_user_with_sqla_user(self):
        if self.user:
            self.user = self.orm.query(models.User).get(self.user.id)

    def do_HTTP_verb(self, verb, *args, **kwargs):
        method_handler = getattr(self, verb)
        response_data = method_handler(*args, **kwargs)

        serializer = self.get_serializer()
        response_data = serializer.serialize_model(response_data)

        return response_data

    def _BASE_METHOD_HANDLER(self, allowed_verbs, *args, **kwargs):
        """
        Routes requests to the appropriate REST verb.  The allowed verbs are
        passed in as a list of strings corresponding to method names.

        Handles the following exceptions::

        - NotFoundError: return a 404 response
        """
        self.replace_gam_user_with_sqla_user()

        try:
            for verb in allowed_verbs:
                if hasattr(self, verb):
                    response_data = self.do_HTTP_verb(verb, *args, **kwargs)
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
        orm = self.orm

        query = orm.query(Model)

        all_kw_args = dict(web.input().items() + kwargs.items())
        if all_kw_args:
            query = query.filter_by(**all_kw_args)
        if hasattr(self, 'ordering'):
            query = query.order_by(self.ordering)

        return [self.instance_to_dict(instance) for instance in query
                if self.access_rules.can_read(self.user, instance)]


class ReadInstanceMixin (object):
    """
    Derive from this class to add READ functionality to a REST controller.

    """
    def REST_READ(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.orm

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

        return self.instance_to_dict(instance)


class CreateInstanceMixin (object):
    """
    Derive from this class to add READ functionality to a REST controller.

    """
    def REST_CREATE(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.orm

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

        # HACK: This is a hack.  We kept getting a test file name being passed
        # in as one of the query parameters.  Wierd.
        for kw in all_kw_args:
            if kw.endswith('.py'):
                del all_kw_args[kw]
                break

        instance = Model(**all_kw_args)
        orm.add(instance)
        orm.flush()

        if not self.access_rules.can_create(self.user, instance):
            orm.rollback()
            raise ForbiddenError("User cannot store the resource")

        orm.add(instance)
        orm.commit()

        return self.instance_to_dict(instance)


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
        orm = self.orm

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
        return self.instance_to_dict(instance)


class DeleteInstanceMixin(object):
    """
    Derive from this class to add DELETE functionality to a REST controller.

    """
    def REST_DELETE(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.orm

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


class NonProjectMemberReadOnly (ResourceAccessRules):
    def can_read(self, user, instance):
        return True

    def is_member(self, user, project):
        return user is not None and project.id in [member.project_id for member in user.memberships]

    def can_create(self, user, instance):
        return self.is_member(user, instance.need.project)
    def can_update(self, user, instance):
        return False
    def can_delete(self, user, instance):
        return False


class NeedsList (ListInstancesMixin, CreateInstanceMixin, RestController):
    model = models.Need
    ordering = models.Need.id
    access_rules = NonProjectAdminReadOnly()


class NeedInstance (ReadInstanceMixin, UpdateInstanceMixin, DeleteInstanceMixin, RestController):
    model = models.Need
    access_rules = NonProjectAdminReadOnly()

    def user2dict(self, user):
        user_dict = super(NeedInstance, self).instance_to_dict(user)

        # Add in some of that non-orm goodness
        user_dict['avatar_path'] = user.avatar_path

        # Remove sensitive information
        del user_dict['password']
        del user_dict['salt']

        return user_dict

    def instance_to_dict(self, need):
        need_dict = super(NeedInstance, self).instance_to_dict(need)
        need_dict['volunteers'] = [
            self.user2dict(volunteer)
            for volunteer in need.volunteers]

        return need_dict


class NeedVolunteerList (CreateInstanceMixin, RestController):
    model = models.Volunteer
    access_rules = NonProjectMemberReadOnly()

    def REST_CREATE(self, *args, **kwargs):
        kwargs['need'] = self.orm.query(models.Need).get(args[0])
        response = super(NeedVolunteerList, self).REST_CREATE(**kwargs)

        return response
