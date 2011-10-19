var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.vol_form = function(options) {
    tc.util.log('project.vol_form');
    var dom = options.dom,
        cached_events = [],
        self = {};

    var disableCustomEventInputs = function(disable, merlin) {
      var inputs = [merlin.current_step.inputs.month,
          merlin.current_step.inputs.day,
          merlin.current_step.inputs.time,
          merlin.current_step.inputs.address];

        tc.jQ.each(inputs, function(i, input) {
          if (input.dom.is('select')) {
            if (disable) {
              input.dom.next('.ddSelectContainer').find('.ddSelect').addClass('disabled');
            } else {
              input.dom.next('.ddSelectContainer').find('.ddSelect').removeClass('disabled');
            }
          }

          if (disable) {
            input.dom.addClass('disabled');
          } else {
            input.dom.removeClass('disabled');
          }
        });
    };


    var initEventInputs = function(merlin) {
      var $select = merlin.current_step.inputs.event_link.dom;

      //If not a blank val and val does not equal the default
      if ($select.val() !== '' && $select.val() !== $select.data('default')) {
        //disable all of the custom date/place fields
        disableCustomEventInputs(true, merlin);
      } else {
        //enable all of the custom date/place fields
        disableCustomEventInputs(false, merlin);
      }
    };

    /**
     * Function: _getNextDateString
     * Get the string representation of the next date for a given month and day.
     */
    self._getNextDateString = function(month, day, now) {
        var thisYear = now.getFullYear(),
            nextYear = thisYear + 1,
            dateThisYear = new Date(thisYear, month, day);

        if (dateThisYear >= now) {
            return thisYear + '-' + month + '-' + day;
        } else {
            return nextYear + '-' + month + '-' + day;
        }
    };

    /**
     * Function: initMerlin
     * Initialize the merlin object for validation of the modal dialog.
     */
    var initMerlin = function(need_id) {
        var merlin;

        //We are using merlin only for the built-in validation in this case.
        merlin =  new tc.merlin(options.app, {
            name:'vol_form',
            dom:tc.jQ('.add-need.merlin'),
            next_button:tc.jQ('a.need-submit'),
            first_step:'vol_form',
            use_hashchange:false,
            data: {
              type:'volunteer',
              request:null,
              quantity:null,
              description:null,
              date:null,
              time:null,
              duration:null,
              project_id:null,
              address:null
            },
            steps: {
                'vol_form': {
                    selector: '.step.add-need-step',
                    next_step:'need-submit',
                    inputs: {
                        'quantity': {
                            selector: '#vol-quantity',
                            validators: ['required', 'numeric'],
                            hint:'Qty'
                        },
                        'request': {
                            selector: '#vol-job',
                            validators: ['required', 'max-100'],
                            hint:'Job Title - DJ, Cashier, etc'
                        },
                        'description': {
                          selector: '#vol-desc',
                          validators: ['required', 'max-200'],
                          hint:'Write a brief description of the volunteer tasks and skills.',
                          counter:{
                            selector:'.charlimit.title',
                            limit:200
                          }
                        },
                        'duration': {
                          selector: '#vol-hours',
                          validators: ['required', 'numeric'],
                          hint:''
                        },
                        'address': {
                          selector: '#vol-street',
                          validators: function(merlinInput, $element, step, onSubmit) {
                            if ($element.is('.disabled')) {
                              return {valid:true};
                            } else {
                              return tc.validate($element, ['required']);
                            }
                          },
                          hint:'Address'
                        },
                        'month': {
                          selector: '#vol-month',
                          validators: function(merlinInput, $element, step, onSubmit) {
                            var $ddSelectContainer = $element.next('.ddSelectContainer'),
                                $ddSelect = $ddSelectContainer.find('.ddSelect');

                            $ddSelect.removeClass('valid');

                            if ($element.is('.disabled')
                              || $ddSelectContainer.hasClass('ddNoDefault')
                              || ($element.val() !== '' && $element.val() !== $element.data('default'))) {
                              $ddSelect.addClass('has-been-focused valid');
                              return {valid:true};
                            } else {
                              return {valid:false, errors: ['Must select a month.']};
                            }
                          },
                          hint:'Month'
                        },
                        'day': {
                          selector: '#vol-day',
                          validators: function(merlinInput, $element, step, onSubmit) {
                            if ($element.is('.disabled')) {
                              return {valid:true};
                            } else {
                              return tc.validate($element, ['required', 'numeric']);
                            }
                          },
                          hint:'Day'
                        },
                        'time': {
                          selector: '#vol-time',
                          validators: function(merlinInput, $element, step, onSubmit) {
                            if ($element.is('.disabled')) {
                              return {valid:true};
                            } else {
                              return tc.validate($element, ['required']);
                            }
                          },
                          hint:'Time'
                        },
                        'event_link': {
                          selector: '#vol-event-list',
                          validators: function(merlinInput, $element, step, onSubmit) {
                            var $ddSelectContainer = $element.next('.ddSelectContainer'),
                                $ddSelect = $ddSelectContainer.find('.ddSelect');

                            $ddSelect.removeClass('valid');

                            if ($ddSelectContainer.hasClass('ddNoDefault')
                              || ($element.val() !== '' && $element.val() !== $element.data('default'))) {
                              $ddSelect.addClass('has-been-focused valid');
                            }
                            return { valid: true };
                          }
                        }
                    },
                    init:function(merlin, dom) {
                      // Set up the fancy jqDropDown for month
                      tc.initDropDown('vol-month', 'Month');
                      tc.initDropDown('vol-event-list', 'Link to an event', function($select) {
                        initEventInputs(merlin);
                      });


                      if (need_id) {
                        tc.jQ.each(merlin.current_step.inputs, function(key, input) {
                          if (input.default_val) {
                            input.dom.val(input.default_val);
                          }
                        });

                        initEventInputs(merlin);

                        merlin.validate(true);
                      }
                    },
                    finish:function(merlin, dom) {
                      var now = new Date(),
                          month = parseInt(merlin.current_step.inputs.month.dom.val(), 10) + 1,
                          day = parseInt(merlin.current_step.inputs.day.dom.val(), 10),
                          needDate = self._getNextDateString(month, day, now);

                      merlin.options.data = tc.jQ.extend(merlin.options.data,{
                        type:'volunteer',
                        request:merlin.current_step.inputs.request.dom.val(),
                        quantity:merlin.current_step.inputs.quantity.dom.val(),
                        description:merlin.current_step.inputs.description.dom.val(),
                        date:needDate,
                        time:merlin.current_step.inputs.time.dom.val(),
                        duration:merlin.current_step.inputs.duration.dom.val(),
                        project_id:merlin.app.app_page.data.project.project_id,
                        address:merlin.current_step.inputs.address.dom.val(),
                        event_id:merlin.current_step.inputs.event_link.dom.val()
                      });
                    }
                },
                'need-submit':{
                  selector:'.step.submit-need-step',
                  init:function(merlin,dom){
                    var need_data = merlin.options.data;

                    var success = function(data,tx,xhr){
                      if(data == 'False'){
                        return false;
                      }
                      
                      tc.reloadProjectHash('show,needs');
                    };
                    if (need_id === undefined) {
                      tc.gam.project_data.createNeed(need_data, success);
                    } else {
                      tc.gam.project_data.updateNeed(need_id, need_data, success);
                    }
                  }
                }
            }
        });

        merlin.show_step('vol_form');
    };


    var mergeTemplate = function(need_details) {
        var new_details = tc.jQ.extend(true, {
                day: function() { return this.date ? (new Date(this.date).getUTCDate()) : ''; },
                monthOpts: function() {
                  var needDate = this.date ? (new Date(this.date).getUTCMonth()) : '';
                  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                  var options = '';
                  for (var i = 0; i < months.length; i++) {
                    if (i === needDate) {
                      options += '<option value="' + i + '" selected>' + months[i] + '</option>';
                    } else {
                      options += '<option value="' + i + '">' + months[i] + '</option>';
                    }
                  }
                  return options;
                },
                eventOpts: function() {
                  var options = '';

                  for (var i = 0; i < cached_events.length; i++) {
                    if (need_details && cached_events[i].id === need_details.event_id) {
                      options += '<option value="'+cached_events[i].id+'" selected>'+cached_events[i].name+'</option>';
                    } else {
                      options += '<option value="'+cached_events[i].id+'">'+cached_events[i].name+'</option>';
                    }
                  }
                  return options;
                }
            }, need_details),
            $html = ich.vol_form_tmpl(new_details);

        dom.find('.add-need-step').html($html);
    };

    var initForm = function(need_id, callback) {
      var project_id = options.app.app_page.data.project.project_id;

      tc.gam.project_data.getProjectEvents(project_id, function(events) {
        cached_events = events;

        if (need_id) {
            tc.gam.project_data.getNeedDetails(need_id, function(data){
                mergeTemplate(data);
                if (callback) {
                    callback();
                }
                initMerlin(need_id);
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
    return self;
};
