var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

/**
 * App Page Feature: Tab Navigation
 * Handle tab navigation.  The assumption is that the second class in the
 * "ul.project-tabs li a" corresponds to the ".project-sections div" class
 * that will be shown.
 */
tc.gam.project_widgets.project_tabs = function(options) {
    // Handle tab links.
    tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
        tc.jQ('ul.project-tabs li a').each(function(i){
            var $this_tab = tc.jQ(this);
            
            if ($this_tab.hasClass(widgetName)) {
                $this_tab.addClass('current');
            } else {
                $this_tab.removeClass('current');
            }
        });
    });
};