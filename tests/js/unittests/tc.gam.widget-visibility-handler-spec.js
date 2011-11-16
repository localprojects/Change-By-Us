/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

if (window.EnvJasmine) {
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.base.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.util.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.widget-visibility-handler.js');
}

describe('tc.gam.widget-visibility-handler.js', function () {
    var visHandler;

    beforeEach(function() {
        visHandler = tc.gam.widgetVisibilityHandler();
    });

    describe('_triggerWidgetVisibilityEvent)', function () {
        it('triggers show-project-widget for widget name and id', function() {
            var showListener = jasmine.createSpy();
            
            $(tc).bind('show-project-widget', showListener);
            
            visHandler._triggerWidgetVisibilityEvent('eat', 'widget');
            expect(showListener).not.toHaveBeenCalled();

            visHandler._triggerWidgetVisibilityEvent('show', 'widget', 'food');
            expect(showListener.mostRecentCall.args[1]).toEqual('widget');
            expect(showListener.mostRecentCall.args[2]).toEqual('food');
            expect(showListener).toHaveBeenCalled();
        });

        it('triggers show-project-widget for widget name and won\'t break without an id', function() {
            var showListener = jasmine.createSpy();
            
            $(tc).bind('show-project-widget', showListener);
            
            visHandler._triggerWidgetVisibilityEvent('show', 'widget');
            expect(showListener.mostRecentCall.args[1]).toEqual('widget');
            expect(showListener.mostRecentCall.args[2]).toEqual(undefined);
            expect(showListener).toHaveBeenCalled();
        });
    });
    
    describe('_setHash)', function () {
        it('changes the hash to the specified string', function() {
            visHandler._setHash('test');
            expect(window.location.hash.substring(1, window.location.hash.length)).toEqual('test');
        });
        
        it('can blank out the hash using ""', function() {
            visHandler._setHash('');
            expect(window.location.hash.substring(1, window.location.hash.length)).toEqual('');
        });
    });
    
    describe('_getHash)', function () {
        it('gets the hash', function() {
            window.location.hash = 'new-hash';
            expect(visHandler._getHash()).toEqual('new-hash');
        });
    });
    
    describe('_onHashChange)', function () {
        it('sets currentHash to the value of whatever the hash was just changed to', function() {
            window.location.hash = 'foo';
            visHandler._onHashChange();
            expect(visHandler.currentHash).toEqual('foo');

            window.location.hash = 'bar';
            visHandler._onHashChange();
            expect(visHandler.previousHash).toEqual('foo');
            expect(visHandler.currentHash).toEqual('bar');
        });

        it('redirects a falsey hash to "show,home"', function() {
            visHandler._setHash('');
            visHandler._onHashChange();
            expect(visHandler._getHash()).toEqual('show,home');
        });
    });
});
