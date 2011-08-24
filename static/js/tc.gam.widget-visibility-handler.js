tc.gam.widgetVisibilityHandler = function(options) {
    var self = {},
        currentHash = window.location.hash,
        previousHash;
    
    self._goHome = function() {
        window.location.hash = 'show,home';
    };
    
    self._triggerWidgetVisibilityEvent = function(action, widget) {
        tc.jQ(tc).trigger(action + '-project-widget', [widget]);
    };
    
    self._onHashChange = function(event) {
        var action, widget;
        previousHash = currentHash;
        currentHash = window.location.hash.substring(1, window.location.hash.length);
            
        // For project-home hash, fire go_home.
        tc.util.log('&&& hashchange: ' + currentHash);
        if (!currentHash || currentHash === 'project-home') {
            self._goHome();
        } else {
            action = currentHash.split(',')[0];
            widget = currentHash.split(',')[1];
        }
        
        tc.util.log('&&& hashchange: ' + action + ', ' + widget);
        self._triggerWidgetVisibilityEvent(action, widget);
    };
    
    var bindEvents = function() {
        tc.jQ(window).bind('hashchange', self._onHashChange);
    };
    
    var init = function() {
        bindEvents();
        
        if (currentHash) {
            window.location.hash = currentHash;
        } else {
            self._goHome();
        }
    };

    init();
    return self;
};