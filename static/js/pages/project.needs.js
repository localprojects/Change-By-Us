var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.needs = function(options) {
    tc.util.log('project.needs');
    var dom = options.dom;
    
    var bindEvents = function() {
        tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
            if (options.name === widgetName) {
                tc.util.log('&&& showing ' + options.name);
                dom.show();
            } else {
                tc.util.log('&&& hiding ' + options.name);
                dom.hide();
            }
        });
        
        tc.jQ('.help-link').click(function(event) {
            event.preventDefault();
            var $modalContent = tc.jQ('.modal-content.add-volunteer-need');
            
            //TODO ajax call to get info for the need id (where does it come from?)
            var need_reason = '',
                need_datetime = 'October 28',
                need_request =  'drinkers'
            
            $modalContent.html(ich.add_vol_need_tmpl({ 
                need_request: need_request,
                need_datetime: need_datetime,
                need_reason: need_reason,
                has_reason: function() { if (need_reason) return true; else return false; },
                has_datetime: function() { if (need_datetime) return true; else return false; }
            }));
            
            options.app.components.modal.show({
                app:options.app,
                source_element:$modalContent
            });
        });
    };
    
    bindEvents();
};