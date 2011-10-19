var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.inkind_form = function(options) {
  tc.util.log('project.inkind_form');
  var dom = options.dom,
      $window = tc.jQ(window),
      cached_events = [],
      self = {};

  /**
   * Function: initMerlin
   * Initialize the merlin object for validation of the modal dialog.
   */
  var initMerlin = function(need) {
      var merlin;
      need = need || {}; //So we don't have to check for null all the time

      //We are using merlin only for the built-in validation in this case.
      merlin =  new tc.merlin(options.app, {
          name:'inkind_form',
          dom:tc.jQ('.add-need.merlin'),
          next_button:tc.jQ('a.need-submit'),
          first_step:'inkind_form',
          use_hashchange:false,
          data: {
            type:null,
            request:null,
            quantity:null,
            description:null,
            project_id:null,
            event_id:null
          },
          steps: {
              'inkind_form': {
                  selector: '.step.add-need-step',
                  next_step:'need-submit',
                  inputs: {
                      'subtype': {
                        selector: 'input[name="inkind-type-radio"]:checked'
                      },
                      'quantity': {
                          selector: '#inkind-quantity',
                          validators: ['required', 'numeric'],
                          hint:'Qty'
                      },
                      'request': {
                          selector: '#inkind-request',
                          validators: ['required', 'max-100'],
                          hint:'What you need - rakes, truck, etc'
                      },
                      'description': {
                        selector: '#inkind-desc',
                        validators: ['required', 'max-200'],
                        hint:'Write a brief description of why you need this',
                        counter:{
                          selector:'.charlimit.title',
                          limit:200
                        }
                      },
                      'event_link': {
                        selector: '#inkind-event-list',
                        validators: function(merlinInput, $element, step, onSubmit) {
                          //Always valid, but change the style to show selected vs default
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
                    if (need.id) {
                      tc.jQ.each(merlin.current_step.inputs, function(key, input) {
                        if (input.default_val) {
                          input.dom.val(input.default_val);
                        }
                      });
                      
                      //Special case for the radio button
                      if (need.subtype) {
                        tc.jQ('input[for="inkind-'+ need.subtype + '-check"]').click();
                      }

                      merlin.validate(true);
                    }
                  },
                  finish:function(merlin, dom) {
                    merlin.options.data = tc.jQ.extend(merlin.options.data,{
                      type:'inkind',
                      subtype:merlin.current_step.inputs.subtype.dom.val(),
                      request:merlin.current_step.inputs.request.dom.val(),
                      quantity:merlin.current_step.inputs.quantity.dom.val(),
                      description:merlin.current_step.inputs.description.dom.val(),
                      project_id:merlin.app.app_page.data.project.project_id,
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
                  
                  if (need.id === undefined) {
                    tc.gam.project_data.createNeed(need_data, success);
                  } else {
                    tc.gam.project_data.updateNeed(need.id, need_data, success);
                  }
                }
              }
          }
      });

      merlin.show_step('inkind_form');
  };

  var mergeTemplate = function(need_details) {
    var new_details = tc.jQ.extend(true, {
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
    $html = ich.inkind_form_tmpl(new_details);

    dom.find('.add-need-step').html($html);
  };

  var initForm = function(need_id, callback) {
    var project_id = options.app.app_page.data.project.project_id;

    tc.gam.project_data.getProjectEvents(project_id, function(events) {
      cached_events = events;
    
      if (need_id) {
      //We are editing an existing need
          tc.gam.project_data.getNeedDetails(need_id, function(need){
            mergeTemplate(need);
            if (callback) {
              callback();
            }
            initMerlin(need);
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
      
  tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
    if (options.name === widgetName) {
      tc.util.log('&&& showing ' + options.name);

      initForm(id, function(){
          dom.show();
          
          dom.find('input[type=radio]').prettyCheckboxes();
          tc.initDropDown('inkind-event-list', 'Link to an event');
      });

      if((dom.offset().top - $window.scrollTop()) < 0){
        $window.scrollTop(0);
      }
    } else {
      tc.util.log('&&& hiding ' + options.name);
      dom.hide();
    }
  });
  
  return self;
};