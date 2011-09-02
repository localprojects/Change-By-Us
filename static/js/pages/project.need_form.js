var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.need_form = function(options) {
    tc.util.log('project.need_form');
    var dom = options.dom,
        self = {};

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
                          validators: ['required'],
                          hint:'Address'
                        },
                        'month': {
                          selector: '#vol-month',
                          validators: ['required'],
                          hint:'Month'
                        },
                        'day': {
                          selector: '#vol-day',
                          validators: ['required'],
                          hint:'Day'
                        },
                        'time': {
                          selector: '#vol-time',
                          validators: ['required'],
                          hint:'Time'
                        }
                    },
                    init:function(merlin, dom) {
                        if (need_id) {
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
                      var needDate = d.getFullYear()
                              + '-' + merlin.current_step.inputs.month.dom.val()
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
                        address:merlin.current_step.inputs.address.dom.val()
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
                month: function() { return this.date ? (new Date(this.date).getUTCMonth()+1) : ''; }
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
                initMerlin(need_id);
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
