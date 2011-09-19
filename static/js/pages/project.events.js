var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.events = function(options) {
    tc.util.log('project.events');
    var dom = options.dom,
        self = {};

    /**
     * Function: bindEvents
     * Bind events for this widget
     */
    var bindEvents = function() {
        tc.jQ(tc).bind('show-project-widget', function(event, widgetName, id) {
            if (options.name === widgetName) {
                tc.util.log('&&& showing ' + options.name);

                //We're going to show one need in detail, so go fetch
                //the details and setup the template
                if (id) {
                    self.need_id = id;
                    dom.show();
                } else {
                    dom.show();
                }
            } else {
                tc.util.log('&&& hiding ' + options.name);
                dom.hide();
            }
        });
    };

    bindEvents();

    return self;
};
