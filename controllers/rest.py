"""
    :copyright: (c) 2011 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import inspect
import json
from helpers.Counter import Counter

from lib import web

from framework.controller import Controller
from framework.log import log
from framework.util import safestr
from framework.util import safeuni

from giveaminute import models

from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound

import jinja2

class NotFoundError (Exception):
    pass


class NoMethodError (Exception):
    pass


class ForbiddenError (Exception):
    pass


class BadRequest (Exception):
    pass


class ResourceAccessRules(object):
    """
    A class used to determine whether a given user can take actions on given
    objects.

    """
    def can_read(self, user, instance):
        raise NotImplementedError()

    def can_create(self, user, instance, orm=None):
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

    def can_create(self, user, instance, orm=None):
        return self.is_admin(user)

    def can_update(self, user, instance):
        return self.is_admin(user)

    def can_delete(self, user, instance):
        return self.is_admin(user)


class ProjectBasedAccessRulesMixin (object):
    def get_project(self, instance, orm=None):
        project = instance.project
        if project is None and orm is not None:
            project = orm.query(models.Project).get(instance.project_id)
        if project is None:
            raise BadRequest('Project with ID %r not found' %
                             instance.project_id)
        return project


class NonProjectAdminReadOnly (ProjectBasedAccessRulesMixin, ResourceAccessRules):
    def can_read(self, user, instance):
        return True

    def is_project_admin(self, user, project):
        return (user is not None) and (user in project.admins
                                       or user.is_site_admin)

    def can_create(self, user, instance, orm=None):
        project = self.get_project(instance, orm)
        return self.is_project_admin(user, project)

    def can_update(self, user, instance):
        project = self.get_project(instance)
        return self.is_project_admin(user, project)

    def can_delete(self, user, instance):
        project = self.get_project(instance)
        return self.is_project_admin(user, project)


class NonProjectMemberReadOnly (ProjectBasedAccessRulesMixin, ResourceAccessRules):
    def can_read(self, user, instance):
        return True

    def is_member(self, user, project):
        return user is not None and \
               project.id in [member.project_id for member in user.memberships]

    def can_create(self, user, instance, orm=None):
        project = self.get_project(instance, orm)
        return self.is_member(user, project)

    def can_update(self, user, instance):
        return False

    def can_delete(self, user, instance):
        return False


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
        elif isinstance(obj, (tuple, list, set)):
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
        if row is None:
            return None

        d = {}
        for columnName in row.__mapper__.columns.keys():
            d[columnName] = getattr(row, columnName)
            try:
                col = row.__mapper__.columns.get('name')
                if col and str(col.type).startswith('VARCHAR'):
                    d[columnName] = jinja2.Markup(d[columnName]).unescape()                
            except Exception, e:
                log.debug("Exception decoding field %s: %s" % (columnName, e))
                
        return d

    def query_to_list(self, query):
        return [self.instance_to_dict(instance) for instance in query
                if self.access_rules.can_read(self.user, instance)]

    def dict_to_instance(self, data, instance=None):
        if instance is None:
            Model = self.get_model()
            instance = Model()
        for (key, val) in data.iteritems():
            if key.startswith('_'):
                continue
            
            # All non-ascii (ond special) characters should be escaped with char-ref
            try:
                if key in Model.__table__.c.keys() and str(Model.__table__.c.get(key).type).startswith('VARCHAR'):
                    val = jinja2.escape(val).encode('ascii','xmlcharrefreplace')
                    if len(val) > 0: val = safeuni(val)
            except Exception, e:
                log.debug("Exception encoding field %s: %s" % (key, e))
                pass
                
            setattr(instance, key, val)

        return instance

    def replace_gam_user_with_sqla_user(self):
        if self.user:
            self.user = self.orm.query(models.User).get(self.user.id)

    def get_model_params(self, **kwargs):
        all_kwargs = {}

        # Get rid of things that start with underscore (_).  Things like jQuery
        # will use this prefix for special variables.  You shouldn't.
        for key, val in kwargs.items():
            if not key.startswith('_'):
                all_kwargs[key] = val

        return all_kwargs

    def do_HTTP_verb(self, verb, *args, **kwargs):
        method_handler = getattr(self, verb)

        response_data = method_handler(*args, **kwargs)

        serializer = self.get_serializer()
        response_data = serializer.serialize(response_data)

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

        except BadRequest, e:
            headers = {'Content-Type': 'application/json'}
            data = json.dumps({'error': str(e)})
            return self.error(data, headers)

    def GET(self, *args, **kwargs):
        # NOTE: As they're handled here, the READ and INDEX cases are mutually
        #       exclusive; an endpoint should have only one behavior anyway.
        return self._BASE_METHOD_HANDLER(
            ['REST_INDEX', 'REST_READ'], *args, **kwargs)

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

        params = self.parameters() or {}
        model_params = self.get_model_params(**dict(kwargs.items() +
                                                    params.items()))
        if model_params:
            query = query.filter_by(**model_params)
        if hasattr(self, 'ordering'):
            query = query.order_by(self.ordering)

        return self.query_to_list(query)


class ReadInstanceMixin (object):
    """
    Derive from this class to add READ functionality to a REST controller.

    """
    def REST_READ(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.orm

        query = orm.query(Model)
        model_params = self.get_model_params(**kwargs)
        if model_params:
            query = query.filter_by(**model_params)

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

        params = self.parameters() or {}
        model_params = self.get_model_params(**dict(kwargs.items() +
                                                    params.items()))
        instance = self.dict_to_instance(model_params)

        if not self.access_rules.can_create(self.user, instance, orm=orm):
            raise ForbiddenError("User cannot store the resource")

        orm.add(instance)
        orm.commit()
        return self.instance_to_dict(instance)


class UpdateInstanceMixin (object):
    """
    Derive from this class to add UPDATE functionality to a REST controller.

    """
    def REST_UPDATE(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.orm

        model_search_params = self.get_model_params(**kwargs)
        query = orm.query(Model)
        if model_search_params:
            query = query.filter_by(**model_search_params)

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

        if not self.access_rules.can_update(self.user, instance):
            raise ForbiddenError("Current user cannot modify the resource")

        params = self.parameters() or {}
        model_params = self.get_model_params(**dict(kwargs.items() +
                                                    params.items()))
        instance = self.dict_to_instance(model_params, instance)

        orm.commit()
        return self.instance_to_dict(instance)


class DeleteInstanceMixin(object):
    """
    Derive from this class to add DELETE functionality to a REST controller.

    """
    def REST_DELETE(self, *args, **kwargs):
        Model = self.get_model()
        orm = self.orm

        model_params = self.get_model_params(**kwargs)
        query = orm.query(Model)
        if model_params:
            query = query.filter_by(**model_params)

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


#
# Needs
#

class NeedModelRestController (RestController):
    """Base RestController class for Need-model endpoints"""

    model = models.Need
    ordering = models.Need.id
    access_rules = NonProjectAdminReadOnly()

    def user_to_dict(self, user):
        """Convert a user instance in the context of being a need volunteer to
           a dictionary"""

        from giveaminute.project import userNameDisplay
        from giveaminute.project import isFullLastName

        user_dict = super(NeedModelRestController, self).instance_to_dict(user)

        # Add in some of that non-orm goodness
        user_dict['avatar_path'] = user.avatar_path
        user_dict['display_name'] = userNameDisplay(
            user.first_name, user.last_name, user.affiliation,
            isFullLastName(user.group_membership_bitmask))

        # Remove sensitive information
        del user_dict['password']
        del user_dict['salt']

        return user_dict

    def volunteer_to_dict(self, volunteer):
        """As a model, a volunteer is actually an intermediary between a user
           and a need, but for this purpose, it looks a lot like a user."""

        volunteer_dict = super(NeedModelRestController, self).instance_to_dict(volunteer)

        del volunteer_dict['member_id']

        volunteer_dict.update(self.user_to_dict(volunteer.member))
        return volunteer_dict

    def event_to_dict(self, event):
        """Convert an event instance in the context of being linked with a need
           to a dictionary"""

        event_dict = super(NeedModelRestController, self).instance_to_dict(event)

        if event:
            event_dict['start_year'] = event.start_year
            event_dict['start_month'] = event.start_month
            event_dict['start_day'] = event.start_day
            event_dict['start_hour'] = event.start_hour
            event_dict['start_minute'] = event.start_minute
            event_dict['start_displaydate'] = event.start_displaydate

        return event_dict

    def instance_to_dict(self, need):
        """Convert a need instance to a dictionary"""

        need_dict = super(NeedModelRestController, self).instance_to_dict(need)

        # Use the interbediary model (Volunteer) to get at the volunteering
        # members so that we have access to other properties of the intermediary
        # (like quantity).
        need_dict['volunteers'] = [
            self.volunteer_to_dict(need_volunteer)
            for need_volunteer in need.need_volunteers]

        need_dict['event'] = self.event_to_dict(need.event)

        ddate = need.display_date
        if ddate:
            need_dict['display_date'] = ddate
        need_dict['display_address'] = need.display_address
        need_dict['quantity_committed'] = need.quantity_committed

        return need_dict

    def dict_to_instance(self, data, need=None):
        if 'event_id' in data:
            try:
                int(data['event_id'])
            except ValueError:
                log.debug('Getting rid of an invalid event id: %r' % (data['event_id'],))
                del data['event_id']

        need = super(NeedModelRestController, self).dict_to_instance(data, need)
        return need


class NeedsList (ListInstancesMixin, CreateInstanceMixin, NeedModelRestController):
    pass


class NeedInstance (ReadInstanceMixin, UpdateInstanceMixin, DeleteInstanceMixin, NeedModelRestController):
    pass


#
# Volunteer-based endpoints
#

class NonProjectMemberReadOnly_ForNeedVolunteer (NonProjectMemberReadOnly):
    def get_project(self, volunteer, orm):
        """
        We need a custom get_project for the need-volunteer access rules
        because a ``volunteer`` doesn't have a ``project`` property; instead
        we have to reach through the need.  So why not add one to the model?
        Well, then we'd have to enforce that the volunteer instance be fully
        loaded before it's passed in to here, which has been a headache and
        is unnecessary.

        """
        need = volunteer.need
        if need is None:
            need_id = volunteer.need_id
            need = orm.query(models.Need).get(need_id)
        if need is None:
            raise BadRequest('Need with ID %r not found' %
                             volunteer.need_id)

        return need.project


class NeedVolunteerList (CreateInstanceMixin, RestController):
    model = models.Volunteer
    access_rules = NonProjectMemberReadOnly_ForNeedVolunteer()

    def REST_CREATE(self, *args, **kwargs):
        # The need id is going to be passed in as a positional argument, so we
        # have to intercept it and convert it to a keyword.
        kwargs['need_id'] = args[0]
        response = super(NeedVolunteerList, self).REST_CREATE(**kwargs)

        return response


#
# Keyword-based endpoints
#

class PopularKeywordList (ListInstancesMixin, RestController):
    model = models.Project
    access_rules = DefaultAccess()

    def query_to_list(self, query):
        project_list = super(PopularKeywordList, self).query_to_list(query)

        keyword_counter = Counter()
        for project_dict in project_list:
            keywords = project_dict['keywords'].strip().split()
            keyword_counter.update(keywords)

        keyword_counter = [{'name':key, 'count':value}
                           for key, value in keyword_counter.most_common(10)]

        return keyword_counter


#
# Event-based endpoints
#

class EventModelRestController (RestController):
    model = models.Event
    access_rules = NonProjectAdminReadOnly()

    def user_to_dict(self, user):
        """Convert a user instance in the context of being a need volunteer to
           a dictionary"""

        from giveaminute.project import userNameDisplay
        from giveaminute.project import isFullLastName

        user_dict = super(EventModelRestController, self).instance_to_dict(user)

        # Add in some of that non-orm goodness
        user_dict['avatar_path'] = user.avatar_path
        user_dict['display_name'] = userNameDisplay(
            user.first_name, user.last_name, user.affiliation,
            isFullLastName(user.group_membership_bitmask))

        # Remove sensitive information
        del user_dict['password']
        del user_dict['salt']

        return user_dict

    def need_to_dict(self, need):
        """Convert a need instance to a dictionary"""

        need_dict = super(EventModelRestController, self).instance_to_dict(need)

        need_dict['volunteers'] = [
            self.user_to_dict(volunteer)
            for volunteer in need.volunteers]

        raw_date = need_dict['date']
        if raw_date:
            need_dict['display_date'] = need.display_date
        need_dict['display_address'] = need.display_address

        return need_dict

    def instance_to_dict(self, event):
        """Convert an event instance to a dictionary"""

        event_dict = super(EventModelRestController, self).instance_to_dict(event)

        event_dict['rsvp_service_name'] = event.rsvp_service_name

        event_dict['needs'] = [
            self.need_to_dict(need)
            for need in event.needs]

        event_dict['start_year'] = event.start_year
        event_dict['start_month'] = event.start_month
        event_dict['start_day'] = event.start_day
        event_dict['start_hour'] = event.start_hour
        event_dict['start_minute'] = event.start_minute

        return event_dict

    def dict_to_instance(self, data, event=None):
        need_ids = []
        if 'need_ids' in data:
            need_ids = data.pop('need_ids').split(',')
            data['needs'] = []

        event = super(EventModelRestController, self).dict_to_instance(data, event)

        for need_id in need_ids:
            need = self.orm.query(models.Need).get(need_id)
            event.needs.append(need)

        return event


class EventList (ListInstancesMixin, CreateInstanceMixin, EventModelRestController):
    pass


class EventInstance (ReadInstanceMixin, UpdateInstanceMixin, DeleteInstanceMixin, EventModelRestController):
    pass
