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

                starttime: function() {
                    var hour, minute, meridiem, time;

                    // Collect the pieces, converting the hour from the 0-23
                    // range to the 1-12 range
                    hour = (this.start_hour - 1) % 12 + 1;
                    minute = this.start_minute;
                    meridiem = this.start_hour < 12 ? 'AM' : 'PM';

                    // Start with the hour
                    time = '' + hour

                    // Add the minutes, if they're not 0
                    time += (minute > 0 ? (':' + minute) : '');

                    // Finally, the meridiem
                    time += meridiem;

                    return time;
                },

                has_need: function() { return this.needs.length > 0; },
                need_id: function() { return this.needs[0].id; },
                need_quantity: function() { return this.needs[0].quantity; },
                need_request: function() { return this.needs[0].request; }

            }, event_details);

        return new_details;
    };

    var mergeDetailTemplate = function(event_details) {
        var new_details = self._getDetailTemplateData(event_details),
            $html;
        
        if (options.name === 'event-needs') {
            $html = ich.event_needs_header_tmpl(new_details);
        } else {
            $html = ich.event_detail_tmpl(new_details);
        }

        dom.find('.event-stack').html($html);
//        updateEvent(event_details);
    };
    
    self._getNeedListTemplateData = function(need_list) {
        var i,
            new_list = [],
            new_need;
        
        for (i in need_list) {
            new_need = tc.jQ.extend(true, {
                volunteer_count: need_list[i].volunteers.length,
                volunteers: need_list[i].volunteers.slice(0,5),
                truncated_description: function() { return this.description.substr(0,130); },
                more_to_read: function() { return this.description.length > 130; },
                progress_amount: function() { return 150 * this.volunteers.length / this.quantity }
            }, need_list[i]);
            new_list.push(new_need);
        }
        return new_list;
    }
    
    var mergeNeedsListTemplate = function(need_list) {
        var new_list = self._getNeedListTemplateData(need_list),
            $html;
        
        tc.util.log('binding help link behavior');
        options.app.components.project_widgets.needs.bindNeedHelpLinks();
        
        tc.util.log('binding delete link behavior');
        options.app.components.project_widgets.needs.bindNeedDeleteLinks();
        
        tc.util.log('populating the template with data ' + new_list);
        $html = ich.need_list_tmpl( {needs: new_list} );
        
        console.log($html);
        dom.find('.need-stack').html($html);
    };

    /**
     * Function: bindEvents
     * Bind events for this widget
     */
    var bindEvents = function() {
        tc.jQ(tc).bind('show-project-widget', function(event, widgetName, id) {
            if (options.name === widgetName) {
                tc.util.log('&&& showing ' + options.name);

                //We're going to show one event in detail, so go fetch
                //the details and setup the template
                if (id) {
                    self.event_id = id;
                    tc.gam.project_data.getEventDetails(self.event_id, function(event_details) {
                        mergeDetailTemplate(event_details);
                        tc.showProjectWidget(dom);
                    });
                    if (options.name === 'event-needs') {
                        tc.gam.project_data.getEventNeeds(self.event_id, function(event_needs) {
                            tc.util.log('event-needs: ' + event_needs);
                            mergeNeedsListTemplate(event_needs);
                        });
                    }
                    
                } else {
                    tc.showProjectWidget(dom);
                }
            } else {
                tc.util.log('&&& hiding ' + options.name);
                dom.hide();
            }
        });

        tc.jQ('a.event-delete').die('click').live('click', function(event) {
            event.preventDefault();
            options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.modal-content.remove-event'),
                submit: function(){
                    tc.gam.project_data.deleteEvent(event.target.href.split(',')[1],
                     function(data, status, xhr) {
                         if(data == 'False'){return false;}
                         
                         tc.reloadProjectHash('show,events');
                     });
                }
            });
        });
    };

    bindEvents();

    return self;
};
