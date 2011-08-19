tc.gam.project2 = function(options) {
    var self = {};
    
    self._triggerWidgetVisibilityEvent = function(action, widget) {
        $(tc).trigger(action + '-project-widget', [widget]);
    };
    
    self._onHashChange = function(event) {
        var hash = window.location.hash.substring(1, window.location.hash.length),
            action = hash.split(',')[0],
            widget = hash.split(',')[1];
            
        self._triggerWidgetVisibilityEvent(action, widget);
    };
    
    var bindEvents = function() {
        tc.jQ(tc).bind('hashchange', self._onHashChange);
    };

    bindEvents();
    return self;
};