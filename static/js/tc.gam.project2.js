tc.gam.project2 = function(options) {
    var self = {};
        
    self._triggerWidgetVisibilityEvent = function(action, widget) {
        tc.jQ(tc).trigger(action + '-project-widget', [widget]);
    };
    
    self._onHashChange = function(event) {
        var hash = window.location.hash.substring(1, window.location.hash.length),
            action = hash.split(',')[0],
            widget = hash.split(',')[1];
        
        tc.util.log('&&& hashchange', action, widget);
            
        self._triggerWidgetVisibilityEvent(action, widget);
    };
    
    var bindEvents = function() {
        tc.jQ(window).bind('hashchange', self._onHashChange);
    };
    
    var init = function() {
        self.widgets = {
            'resources': new tc.gam.project_widgets.resources(self, options.dom.find('.box.resources'),
                null, { app: options.app })/*,
            'infopane': new tc.gam.project_widgets.infopane(self, options.dom.find('.box.mission'),
                null, { app: options.app }),
            'related_resources': new tc.gam.project_widgets.related_resources(self, options.dom.find('.box.related-resources'),
                null, { app: options.app }),
            'add_link': new tc.gam.project_widgets.add_link(self, options.dom.find('.box.add-link'),
                null, { app: options.app }),
            'conversation': new tc.gam.project_widgets.conversation(self, options.dom.find('.box.conversation'),
                null, { app: options.app }),
            'members': new tc.gam.project_widgets.members(self, options.dom.find('.box.members'),
                null, { app: options.app })*/
        };

        bindEvents();
    };

    init();
    return self;
};