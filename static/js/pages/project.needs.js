var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.needs = function(options) {
    tc.util.log('project.needs');
    var dom = options.dom;
    
    var getNeedDetails = function(need_id, callback) {
        tc.jQ.ajax({
            url:'/rest/v1/needs/' + need_id,
            dataType:'json',
            success:function(need_details, ts, xhr) {
                need_details = {
                    reason: 'Oktoberfest',
                    datetime: 'October 28',
                    request:  'drinkers'
                };

                if (callback) {
                    callback(need_details);
                }
            }
        });
    };
    
    var showModal = function(need) {
        var $modalContent = tc.jQ('.modal-content.add-volunteer-need');

        $modalContent.html(ich.add_vol_need_tmpl({ 
            need_request: need.request,
            need_datetime: need.datetime,
            need_reason: need.reason,
            has_reason: function() { if (need.reason) return true; else return false; },
            has_datetime: function() { if (need.datetime) return true; else return false; }
        }));
        
        options.app.components.modal.show({
            app:options.app,
            source_element:$modalContent
        });
    };
    
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
            var need_id = tc.jQ(this).parents('li.need').attr('data-id');
            getNeedDetails(need_id, showModal);
        });
    };
    
    bindEvents();
};