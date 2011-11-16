/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.home = function(options) {
    tc.util.log('project.home');
    var dom = options.dom,
        self = {};
    
    tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
        if (options.name === widgetName) {
            tc.util.log('&&& showing ' + options.name);
            tc.showProjectWidget(dom);
        } else {
            tc.util.log('&&& hiding ' + options.name);
            dom.hide();
        }
    });
    
    return self;
};