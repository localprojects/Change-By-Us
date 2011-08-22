if (window.EnvJasmine) {
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.base.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.util.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.widget-visibility-handler.js');
}

describe('tc.gam.widget-visibility-handler.js', function () {
    var visHandler = tc.gam.widgetVisibilityHandler();

    describe('onhashchange)', function () {
        it('triggers show-project-widget on testWidget', function() {
            var showListener = jasmine.createSpy();
            
            $(tc).bind('show-project-widget', showListener);
            
            visHandler._triggerWidgetVisibilityEvent('hide', 'showWidget');
            expect(showListener).not.toHaveBeenCalled();

            visHandler._triggerWidgetVisibilityEvent('show', 'showWidget');
            expect(showListener.mostRecentCall.args[1]).toEqual('showWidget');
            expect(showListener).toHaveBeenCalled();
        });

        it('triggers hide-project-widget on testWidget', function() {
            var hideListener = jasmine.createSpy();
            
            $(tc).bind('hide-project-widget', hideListener);
            
            visHandler._triggerWidgetVisibilityEvent('show', 'hideWidget');
            expect(hideListener).not.toHaveBeenCalled();

            visHandler._triggerWidgetVisibilityEvent('hide', 'hideWidget');
            expect(hideListener.mostRecentCall.args[1]).toEqual('hideWidget');
            expect(hideListener).toHaveBeenCalled();
        });
    });
});
