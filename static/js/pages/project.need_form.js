var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.need_form = function(options) {
    tc.util.log('project.need_form');
    var dom = options.dom,
        cached_events = [],
        self = {};

    //Helper function to make the jqDropDown plugin more robust
    //since you can't set multiple classes at a time.
    //  id - the selector for the select element, also used to
    //       identify the generated markup
    //  defaultVal - Used to identify the unselectable default value
    var initDropDown = function(id, defaultVal, onChange) {
      //Apply jqDropDown to our select element
      var $container,
        $input = tc.jQ('#' + id);
      
      $input.jqDropDown({
        toggleBtnName:'ddSelect',
        optionListName:'ddSelectOptions',
        containerName:'dd-' + id,
        optionChanged: function() {
          if (onChange) {
            onChange($input);
          }
          
          //manually trigger the change event on the select element
          //so that Merlin validation will trigger properly
          $input.change();
        }
      }).data('default', defaultVal);

      $container = tc.jQ('.dd-' + id);

      //Add the default container css class (important, common styles on this guy)
      $container.addClass('ddSelectContainer');

      //There's no default value, something is always selected, so it's always valid
      if (!defaultVal) {
        $container.addClass('ddNoDefault');
        $container.find('.ddSelect').addClass('valid has-been-focused').removeClass('not-valid');
      }
    };
    
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
    
      if ($select.val() !== '' && $select.val() !== $select.data('default')) {
        //disable all of the custom date/place fields
        disableCustomEventInputs(true, merlin);
      } else {
        //enable all of the custom date/place fields
        disableCustomEventInputs(false, merlin);
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
            name:'need_form',
            dom:tc.jQ('.add-need.merlin'),
            next_button:tc.jQ('a.need-submit'),
            first_step:'need_form',
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
                'need_form': {
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
                          selector: '#event-list',
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
                      initDropDown('vol-month', 'Month');
                      initDropDown('event-list', 'Link to an event', function($select) {
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
                      var d = new Date();
                      var needDate = d.getFullYear()
                              + '-' + (parseInt(merlin.current_step.inputs.month.dom.val(), 10)+1)
                              + '-' + merlin.current_step.inputs.day.dom.val();
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
                      window.location.hash = 'show,needs';
                      window.location.reload();
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

        merlin.show_step('need_form');
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
                    if (cached_events[i].id === need_details.event_id) {
                      options += '<option value="'+cached_events[i].id+'" selected>'+cached_events[i].name+'</option>';
                    } else {
                      options += '<option value="'+cached_events[i].id+'">'+cached_events[i].name+'</option>';
                    }
                  }
                  return options;
                }
            }, need_details),
            $html = ich.need_form_tmpl(new_details);
        
        dom.find('.add-need-step').html($html);
    };

    var initForm = function(need_id, callback) {
      tc.gam.project_data.getEvents(function(events) {
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
