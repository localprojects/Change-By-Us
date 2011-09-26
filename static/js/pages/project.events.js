var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.events = function(options) {
    tc.util.log('project.events');
    var dom = options.dom,
        self = {};

    self._getDetailTemplateData = function(event_details) {
        var month_names = [ "January", "February", "March", "April", "May",
            "June", "July", "August", "September", "October", "November",
            "December" ];

        var new_details = tc.jQ.extend(true, {
                day: function() { return this.start_day; },
                mon: function() { return month_names[this.start_month-1].substr(0, 3); },
                year: function() { return this.start_year; },
                hour: function() { return (this.start_hour-1) % 12 + 1; },
                minute: function() { return this.start_minute; },
                meridiem: function() { return (this.start_hour < 12 ? 'AM' : 'PM'); },
                starttime: function() { return '' + this.hour() + (this.minute() > 0 ? (':' + this.minute()) : '') + this.meridiem(); },

                has_need: function() { return this.needs.length > 0; },
                need_id: function() { return this.needs[0].id; },
                need_quantity: function() { return this.needs[0].quantity; },
                need_request: function() { return this.needs[0].request; }

            }, event_details);

        return new_details;
    };

    var mergeDetailTemplate = function(event_details) {
        var new_details = self._getDetailTemplateData(event_details),
            $html = ich.event_detail_tmpl(new_details);

        dom.find('.event-stack').html($html);
//        updateEvent(event_details);
    };

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
                    self.event_id = id;
                    tc.gam.project_data.getEventDetails(self.event_id, function(event_details) {
                        mergeDetailTemplate(event_details);
                        dom.show();
                    });
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
