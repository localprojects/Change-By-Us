tc.gam.widgetVisibilityHandler = function(options) {
    var self = {};
        
    self._triggerWidgetVisibilityEvent = function(action, widget) {
        tc.jQ(tc).trigger(action + '-project-widget', [widget]);
    };
    
    self._onHashChange = function(event) {
        var hash = window.location.hash.substring(1, window.location.hash.length),
            action, widget;
            
        // For project-home hash, fire go_home.
        if (hash === 'project-home') {
            action = 'show';
            widget = 'home';
        } else {
            action = hash.split(',')[0];
            widget = hash.split(',')[1];
        }
            
        tc.util.log('&&& hashchange: ' + action + ', ' + widget);
        self._triggerWidgetVisibilityEvent(action, widget);
    };
    
    var bindEvents = function() {
        tc.jQ(window).bind('hashchange', self._onHashChange);
    };
    
    var init = function() {
        var initialHash = window.location.hash;
        
        bindEvents();
        
        window.location.hash = initialHash;
        tc.jQ(window).trigger('hashchange');
    };

    init();
    return self;
};