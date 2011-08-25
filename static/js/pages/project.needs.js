var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.needs = function(options) {
    tc.util.log('project.needs');
    var dom = options.dom;
    
    tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
        if (options.name === widgetName) {
            tc.util.log('&&& showing ' + options.name);
            dom.show();
        } else {
            tc.util.log('&&& hiding ' + options.name);
            dom.hide();
        }
    });
};