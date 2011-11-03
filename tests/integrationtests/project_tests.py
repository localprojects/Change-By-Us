from unittest2 import TestCase
from nose.tools import *
from mixins import AppSetupMixin
from mock import Mock

#from giveaminute.project import Project as ProjectGam
from controllers.project import Project as ProjectController
from controllers.project import mProject

class Test_ProjectController_showProject (AppSetupMixin, TestCase):

    def setUp(self):
        super(Test_ProjectController_showProject, self).setUp()

        self.real_GamProject = mProject.Project

        def FakeProject(db, project_id):
            project = Mock()
            project.data = 'hello'
            project.getFullDictionary = lambda: {'hello':'world'}
            return project

        mProject.Project = FakeProject

    def tearDown(self):
        mProject.Project = self.real_GamProject
        super(Test_ProjectController_showProject, self).tearDown()


    @istest
    def sets_the_project_in_the_template_data_as_an_object_with_json_and_data(self):

        # TODO: This test expresses a necessary condition for now, but we should
        #       be moving away from dependece on the json and data keywords.
        #       The project's data should be on the project object itself, and
        #       we should have a separate place to put the json, or a filter
        #       that spits it out from the project object.

        controller = ProjectController()
        controller.render = Mock()
        controller.getProject = Mock(return_value=Mock())

        controller.showProject(1)

        assert hasattr(controller.template_data['project'], 'json')
        assert hasattr(controller.template_data['project'], 'data')

    @istest
    def sets_the_project_in_the_template_data_as_an_object_with_a_needs_iterable(self):
        controller = ProjectController()
        controller.render = Mock()
        project = Mock()
        project.needs = []
        controller.getProject = Mock(return_value=project)

        controller.showProject(1)

        assert hasattr(controller.template_data['project'], 'needs')
        try: iter(controller.template_data['project'].needs)
        except TypeError: ok_(False)

    @istest
    def has_access_to_an_active_orm_session(self):
        controller = ProjectController()
        controller.render = Mock()

        assert controller.orm.is_active
