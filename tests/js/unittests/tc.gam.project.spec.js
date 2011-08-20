EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.base.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.util.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.validate.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.merlin.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.topbar.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.modal.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.carousel.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.tooltip.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.locationDropdown.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.inlineEditor.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.project2.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.invite.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.add_resource.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.user_handler.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.app.js');

EnvJasmine.load(EnvJasmine.jsDir + 'pages/project.resources.js');

describe('tc.gam.project2.js', function () {
    var project2 = tc.gam.project2({
        dom: tc.jQ('body'),
        app: {}
    });

    describe('onhashchange)', function () {
        it('triggers show-project-widget on testWidget', function() {
            var showListener = jasmine.createSpy();
            
            $(tc).bind('show-project-widget', showListener);
            
            project2._triggerWidgetVisibilityEvent('hide', 'showWidget');
            expect(showListener).not.toHaveBeenCalled();

            project2._triggerWidgetVisibilityEvent('show', 'showWidget');
            expect(showListener.mostRecentCall.args[1]).toEqual('showWidget');
            expect(showListener).toHaveBeenCalled();
        });

        it('triggers hide-project-widget on testWidget', function() {
            var hideListener = jasmine.createSpy();
            
            $(tc).bind('hide-project-widget', hideListener);
            
            project2._triggerWidgetVisibilityEvent('show', 'hideWidget');
            expect(hideListener).not.toHaveBeenCalled();

            project2._triggerWidgetVisibilityEvent('hide', 'hideWidget');
            expect(hideListener.mostRecentCall.args[1]).toEqual('hideWidget');
            expect(hideListener).toHaveBeenCalled();
        });
        
        
    });
});
