var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.event_form = function(options) {
    tc.util.log('project.event_form');
    var dom = options.dom,
        cached_needs = [],
        event_id = -1,
        self = {};

    //Convert a "date config" into a string that the server knows how to parse
    self._makeDateString = function(c) {
      var hour = (parseInt(c.hour, 10) % 12) + (c.meridiem === 'PM' ? 12 : 0);
      return [c.year, '-', c.month, '-', c.day, ' ', hour, ':', c.minute].join('');
    };

    /**
     * Function: initMerlin
     * Initialize the merlin object for validation of the modal dialog.
     */
    var initMerlin = function(event_id) {
        var merlin;

        //We are using merlin only for the built-in validation in this case.
        merlin =  new tc.merlin(options.app, {
            name:'event_form',
            dom:tc.jQ('.add-event.merlin'),
            next_button:tc.jQ('a.event-submit'),
            first_step:'event_form',
            use_hashchange:false,
            data: {},
            steps: {
                'event_form': {
                    selector: '.step.add-event-step',
                    next_step:'event-submit',
                    inputs: {
                        'name': {
                            selector: '#event-name',
                            validators: ['required', 'max-100']
                        },
                        'details': {
                          selector: '#event-desc',
                          validators: ['required', 'max-200'],
                          counter:{
                            selector:'.charlimit.title',
                            limit:200
                          }
                        },
                        'rsvp_url': {
                            selector: '#event-url',
                            validators: ['url']
                        },
                        'month': {
                          selector: '#event-month'
                        },
                        'day': {
                          selector: '#event-day',
                          validators: ['required', 'numeric'],
                          hint:'Day'
                        },
                        'year': {
                          selector: '#event-year'
                        },
                        'hour': {
                          selector: '#event-hour',
                          validators: ['required', 'numeric'],
                          hint:'Hour'
                        },
                        'minute': {
                          selector: '#event-minute',
                          validators: ['required', 'numeric'],
                          hint:'Minute'
                        },
                        'meridiem': {
                          selector: '#event-meridiem',
                          validators: function(input, element, step, submit) {
                            return {valid: true};
                          }
                        },
                        'address': {
                          selector: '#event-street',
                          validators: ['required'],
                          hint:'Street Address'
                        },
                        'need_list': {
                          selector: '.linked-needs-list'
                        }
                    },
                    init:function(merlin, dom) {
                      // Set up the fancy jqDropDown for month
                      tc.initDropDown('event-month');
                      tc.initDropDown('event-year');
                      tc.initDropDown('event-meridiem');
                      tc.initDropDown('event-needs', 'Volunteer Needs');
                      
                      if (event_id) {
                        tc.jQ.each(merlin.current_step.inputs, function(key, input) {
                          if (input.default_val) {
                            input.dom.val(input.default_val);
                          }
                        });
                        merlin.validate(true);
                      }
                    },
                    finish:function(merlin, dom) {
                      var d = new Date();
                      var dateConfig = {
                        year: merlin.current_step.inputs.year.dom.val(),
                        month: (parseInt(merlin.current_step.inputs.month.dom.val(), 10)+1),
                        day: merlin.current_step.inputs.day.dom.val(),
                        hour: merlin.current_step.inputs.hour.dom.val(),
                        minute: merlin.current_step.inputs.minute.dom.val(),
                        meridiem: merlin.current_step.inputs.meridiem.dom.val()
                      };
                      
                      merlin.options.data = tc.jQ.extend(merlin.options.data,{
                        name:merlin.current_step.inputs.name.dom.val(),
                        details:merlin.current_step.inputs.details.dom.val(),
                        rsvp_url:merlin.current_step.inputs.rsvp_url.dom.val(),
                        start_datetime:self._makeDateString(dateConfig),
                        address:merlin.current_step.inputs.address.dom.val(),
                        project_id:merlin.app.app_page.data.project.project_id,
                        need_ids: tc.jQ.map(merlin.current_step.inputs.need_list.dom.find('li'), function(li, i) {
                          return tc.jQ(li).attr('data-id');
                        }).join(',')
                      });
                    }
                },
                'event-submit':{
                  selector:'.step.submit-event-step',
                  init:function(merlin,dom){
                    var event_data = merlin.options.data;

                    var success = function(data,tx,xhr){
                      if(data == 'False'){
                        return false;
                      }
                      
                      tc.reloadHash('show,events');
                    };
                    if (event_id === undefined) {
                      tc.gam.project_data.createEvent(event_data, success);
                    } else {
                      tc.gam.project_data.updateEvent(event_id, event_data, success);
                    }
                  }
                }
            }
        });

        merlin.show_step('event_form');
    };

    //Update the list of linked needs for this event based on the given
    //list of needs.
    var updateLinkedNeeds = function($target, needs, event_id) {
      var linked_needs = tc.jQ.map(needs, function(obj, i) {
          if (parseInt(obj.event_id, 10) === parseInt(event_id, 10)) {
            return {name: obj.request, quantity: obj.quantity, id: obj.id };
          }
        }),
        $need_list = ich.linked_event_needs_tmpl({ linked_needs:linked_needs });
        
      $target.find('.linked-needs-list').html($need_list);
    };

    //Update the select box of needs to those that are or can be linked
    //to this event.
    var updateUnlinkedNeeds = function($target, needs, event_id) {
      var unlinked_needs = tc.jQ.map(needs, function(obj, i) {
          if (!obj.event_id || (parseInt(obj.event_id, 10) === parseInt(event_id, 10))) {
            return {name: obj.request, id: obj.id };
          }
        }),
        $need_list = ich.unlinked_event_needs_tmpl({ unlinked_needs: unlinked_needs });
        
      $target.find('#event-needs').html($need_list);
    };

    //Merge the need form template to include default values, if any.
    var mergeTemplate = function(event_details) {
      var new_details = tc.jQ.extend(true, {
        twelve_hour: function() {
          return this.start_hour % 12;
        },
        monthOpts: function() { 
          var months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
              options = '';
          
          for (var i = 0; i < months.length; i++) {
            if (i === this.start_month) {
              options += '<option value="' + i + '" selected>' + months[i] + '</option>';
            } else {
              options += '<option value="' + i + '">' + months[i] + '</option>';
            }
          }
          return options;
        },
        yearOpts: function() {
            var year = (new Date()).getUTCFullYear(),
                years = [year, year+1, year+2, year+3],
                options = '';
                
            for (var i = 0; i < years.length; i++) {
              if (years[i] === this.start_year) {
                options += '<option value="' + years[i] + '" selected>' + years[i] + '</option>';
              } else {
                options += '<option value="' + years[i] + '">' + years[i] + '</option>';
              }
            }
            return options;
        },
        meridiemOpts: function() {
            var isPM = this.start_hour >= 12,
                options = '';
                
            options += '<option value="AM" ' + (isPM ? '' : 'selected') + '>AM</option>';
            options += '<option value="PM" ' + (!isPM ? '' : 'selected') + '>PM</option>';

            return options;
        },
        needOpts: function() {
          var options = '';
          
          return options;
        }}, event_details),
        $html = ich.event_form_tmpl(new_details);

      updateLinkedNeeds($html, cached_needs, event_id);
      updateUnlinkedNeeds($html, cached_needs, event_id);
      dom.find('.add-event-step').html($html);
    };
    
    //Get the array index of the given need_id
    self._getNeedIndex = function(need_id, needs) {
      var i;
      need_id = parseInt(need_id, 10);
      
      for(i=0; i<needs.length; i++) {
        if (parseInt(needs[i].id, 10) === need_id) {
          return i;
        }
      }
      
      return -1;
    };
    
    //Link a need to the event. This does not update the UI.
    self._linkNeed = function(need_id, event_id, needs) {
      var i = self._getNeedIndex(need_id, needs);
      
      if (!needs[i].event_id) {
        needs[i].event_id = event_id;
      }
    };
    
    //Unlink a need from the event. This does not update the UI.
    self._unlinkNeed = function(need_id, event_id, needs) {
      var i = self._getNeedIndex(need_id, needs);
      event_id = parseInt(event_id, 10);
      
      if (parseInt(needs[i].event_id, 10) === event_id) {
        needs[i].event_id = null;
      }
    };

    //Init the form 
    var initForm = function(event_id, callback) {
      tc.gam.project_data.getProjectNeeds(options.app.app_page.data.project.project_id, function(needs) {
        cached_needs = needs;
        
        if (event_id) {
            tc.gam.project_data.getEventDetails(event_id, function(data){
                mergeTemplate(data);
                if (callback) {
                    callback();
                }
                initMerlin(event_id);
            });
        } else {
            mergeTemplate();
            if (callback) {
                callback();
            }
            initMerlin();
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
                
                if (id) {
                  event_id = id;
                }
                
                initForm(id, function(){
                    dom.show();
                });
                
            } else {
                tc.util.log('&&& hiding ' + options.name);
                dom.hide();
            }
        });
        
        //Bind the event to link a need
        tc.jQ('.attach-need').live('click', function() {
          var need_id = tc.jQ('#event-needs').val();
          
          if (need_id) {
            self._linkNeed(need_id, event_id, cached_needs);
            updateLinkedNeeds(tc.jQ('form.event-form'), cached_needs, event_id);
          }
        });
        
        //Bind the event to unlink a need
        tc.jQ('.unlink-need').live('click', function(e) {
          e.preventDefault();
          self._unlinkNeed(tc.jQ(this).parent('li').attr('data-id'), event_id, cached_needs);
          updateLinkedNeeds(tc.jQ('form.event-form'), cached_needs, event_id);
        });
        
    };

    bindEvents();
    return self;
};
