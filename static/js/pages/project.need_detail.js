var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.need_detail = function(options) {
    tc.util.log('project.need_detail');
    var dom = options.dom;

    var mergeTemplate = function(need_details) {
        var new_details = tc.jQ.extend(true, {
                day: function() { return this.date ? (new Date(this.date).getUTCDate()) : ''; },
                month: function() { return this.date ? (new Date(this.date).getUTCMonth()+1) : ''; },
                avatar: function() {return this.avatar_path ? ('/static/images/' + this.avatar_path) : '/static/images/thumb_genAvatar.jpg'; }
            }, need_details),
            $html = ich.need_detail_tmpl(new_details);
            
        dom.find('.need-stack').html($html);
    };

    var initDetailTmpl = function(need_id, callback) {
      tc.gam.project_data.getNeedDetails(need_id, function(data){
        mergeTemplate(data);
        if (callback) {
          callback();
        }
      });
    };

    /**
     * Function: bindEvents
     * Bind events for this widget
     */
    var bindEvents = function() {
        tc.jQ(tc).bind('show-project-widget', function(event, widgetName, id) {
            if (options.name === widgetName) {
                tc.util.log('&&& showing ' + options.name);
                initDetailTmpl(id, function(){
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
