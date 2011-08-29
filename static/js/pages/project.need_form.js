var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.need_form = function(options) {
    tc.util.log('project.needs');
    var dom = options.dom;

    var mergeTemplate = function(need_details) {
        var new_details = tc.jQ.extend(true, {
                day: function() { return this.date ? (new Date(this.date).getDate()) : ''; },
                month: function() { return this.date ? (new Date(this.date).getMonth()+1) : ''; }
            }, need_details),
            $html = ich.need_form_tmpl(new_details);
            
        dom.find('.add-need-step').html($html);
    };

    var initForm = function(need_id, callback) {
        if (need_id) {
            tc.gam.project_data.getNeedDetails(need_id, function(data){
                mergeTemplate(data);
                if (callback) {
                    callback();
                }
            });
        } else {
            mergeTemplate();
            if (callback) {
                callback();
            }
        }
    };

    /**
     * Function: bindEvents
     * Bind events for this widget
     */
    var bindEvents = function() {
        tc.jQ(tc).bind('show-project-widget', function(event, widgetName, id) {
            if (options.name === widgetName) {
                tc.util.log('&&& showing ' + options.name);
                
                initForm(id, function(){
                    dom.show();
                });
                
            } else {
                tc.util.log('&&& hiding ' + options.name);
                dom.hide();
            }
        });
    };

    bindEvents();
};
