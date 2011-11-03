tc.gam.widgetVisibilityHandler = function(options) {
    var self = {
        currentHash: window.location.hash,
        previousHash: null
    };
    
    self._setHash = function(hash) {
        if (hash === self.currentHash) {
            tc.jQ(window).trigger('hashchange');
        } else {
            //This will trigger the 'hashchange' event because the hash is different
            window.location.hash = hash;
        }
    };
    
    self._getHash = function() {
        return window.location.hash.substring(1, window.location.hash.length);
    };
    
    self._goHome = function() {
        self._setHash('show,home');
    };
    
    self._triggerWidgetVisibilityEvent = function(action, widget, id) {
        tc.jQ(tc).trigger(action + '-project-widget', [widget, id]);
    };
    
    self._onHashChange = function(event) {
        var action, widget;
        self.previousHash = self.currentHash;
        self.currentHash = self._getHash();
            
        // For project-home hash, fire goHome.
        if (!self.currentHash || self.currentHash === 'project-home') {
            self._goHome();
        } else {
            action = self.currentHash.split(',')[0];
            widget = self.currentHash.split(',')[1];
            id = self.currentHash.split(',')[2];
        }
        
        tc.util.log('&&& hashchange: ' + action + ', ' + widget);
        self._triggerWidgetVisibilityEvent(action, widget, id);
    };
    
    var bindEvents = function() {
        tc.jQ(window).bind('hashchange', self._onHashChange);
    };
    
    var init = function() {
        bindEvents();
        
        if (self.currentHash) {
            self._setHash(self.currentHash);
        } else {
            self._goHome();
        }
    };

    init();
    return self;
};