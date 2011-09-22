var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.event_form = function(options) {
    tc.util.log('project.event_form');
    var dom = options.dom,
        self = {};

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
                        'month': {
                          selector: '#event-month',
                          validators: function(input, element, step, submit) {

                            if (submit) {
                              $('.ddSelect').addClass('not-valid has-been-focused has-attempted-submit').removeClass('valid');
                            }

                            if ($(element).val() === 'Month') {
                              $('.ddSelect').addClass('not-valid').removeClass('valid');
                              return {
                                valid: false,
                                errors: ['Must select a month.']
                              };
                            } else {
                              $('.ddSelect').addClass('valid').removeClass('not-valid');
                              return {valid: true};
                            };
                          },
                          hint:'Month'
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
                          selector: '#event-meridiem'
                        },
                        'location': {
                          selector: '#event-street',
                          validators: ['required'],
                          hint:'Street Address'
                        }
                    },
                    init:function(merlin, dom) {
                      // Set up the fancy jqDropDown for month
                      tc.jQ('#event-month').jqDropDown({
                        toggleBtnName:'ddSelect',
                        optionListName:'ddSelectOptions',
                        containerName:'ddSelectContainer',
                        optionChanged: function() {
                          if ($('#vol-month').val() === 'Month') {
                            $('.ddSelect').addClass('not-valid has-been-focused').removeClass('valid');
                          } else {
                            $('.ddSelect').addClass('valid has-been-focused').removeClass('not-valid');
                          }
                        }
                      });

                      tc.jQ('#event-year').jqDropDown({
                        toggleBtnName:'ddSelect',
                        optionListName:'ddSelectOptions',
                        containerName:'ddSelectContainer'
                      });
                      
                      tc.jQ('#event-meridiem').jqDropDown({
                        toggleBtnName:'ddSelect',
                        optionListName:'ddSelectOptions',
                        containerName:'ddSelectContainer'
                      });

                      tc.jQ('#event-needs').jqDropDown({
                        toggleBtnName:'ddSelect',
                        optionListName:'ddSelectOptions',
                        containerName:'ddSelectContainer'
                      });

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
                      var eventDate = d.getFullYear()
                              + '-' + (parseInt(merlin.current_step.inputs.month.dom.val(), 10)+1)
                              + '-' + merlin.current_step.inputs.day.dom.val();
                      merlin.options.data = tc.jQ.extend(merlin.options.data,{
                        type:'volunteer',
                        request:merlin.current_step.inputs.request.dom.val(),
                        quantity:merlin.current_step.inputs.quantity.dom.val(),
                        description:merlin.current_step.inputs.description.dom.val(),
                        date:eventDate,
                        time:merlin.current_step.inputs.time.dom.val(),
                        duration:merlin.current_step.inputs.duration.dom.val(),
                        project_id:merlin.app.app_page.data.project.project_id,
                        address:merlin.current_step.inputs.address.dom.val()
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
                      window.location.hash = 'show,events';
                      window.location.reload();
                    };
                    if (event_id === undefined) {
                      tc.gam.project_data.createNeed(event_data, success);
                    } else {
                      tc.gam.project_data.updateNeed(event_id, event_data, success);
                    }
                  }
                }
            }
        });

        merlin.show_step('event_form');
    };


    var mergeTemplate = function(event_details) {
        var new_details = tc.jQ.extend(true, {
                day: function() { return this.date ? (new Date(this.date).getUTCDate()) : ''; },
                monthOpts: function() { 
                  var eventDate = this.date ? (new Date(this.date).getUTCMonth()) : '';
                  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                  var options = '';
                  for (var i = 0; i < months.length; i++) {
                    if (i === eventDate) {
                      options += '<option value="' + i + '" selected>' + months[i] + '</option>';
                    } else {
                      options += '<option value="' + i + '">' + months[i] + '</option>';
                    }
                  }
                  return options;
                },
                yearOpts: function() {
                    var eventYear = this.date ? (new Date(this.date).getUTCYear()) : '',
                        year = (new Date()).getUTCFullYear(),
                        years = [year, year+1, year+2, year+3],
                        options = '';
                        
                    for (var i = 0; i < years.length; i++) {
                      if (years[i] === eventYear) {
                        options += '<option value="' + i + '" selected>' + years[i] + '</option>';
                      } else {
                        options += '<option value="' + i + '">' + years[i] + '</option>';
                      }
                    }
                    return options;
                },
                meridiemOpts: function() {
                    var isPM = this.date ? (new Date(this.date).getUTCHours()) >= 11 : false,
                        options = '';
                        
                    options += '<option value="AM" ' + (isPM ? '' : 'selected') + '>AM</option>';
                    options += '<option value="PM" ' + (!isPM ? '' : 'selected') + '>PM</option>';

                    return options;
                },
                needOpts: function() {
                  var options = '<option value="">Volunteer needs</option>';
                  
                  return options;
                }

            }, event_details),
            $html = ich.event_form_tmpl(new_details);
            
        dom.find('.add-event-step').html($html);
    };

    var initForm = function(event_id, callback) {
        if (event_id) {
            tc.gam.project_data.getNeedDetails(event_id, function(data){
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
