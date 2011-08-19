EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.base.js');
EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.project2.js');

describe('tc.gam.project2.js', function () {
    var project2 = tc.gam.project2();

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
