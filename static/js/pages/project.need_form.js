var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.need_form = function(options) {
    tc.util.log('project.needs');
    var dom = options.dom;

    /**
     * Function: initMerlin
     * Initialize the merlin object for validation of the modal dialog.
     */
    var initMerlin = function(need) {
        var merlin;

        //We are using merlin only for the built-in validation in this case.
        merlin =  new tc.merlin(options.app, {
            name:'need_form',
            dom:tc.jQ('.add-need.merlin'),
            next_button:tc.jQ('a.need-submit'),
            first_step:'need_form',
            use_hashchange:false,
            steps: {
                'need_form': {
                    selector: '.step.add-need-step',
                    inputs: {
                        'vol-quantity': {
                            selector: '#vol-quantity',
                            validators: ['required', 'numeric'],
                            hint:'Qty'
                        }
                    },
                    init:function(merlin, dom) {
                        merlin.options.next_button.click(function(event) {
                            console.log('next');
                        });
                    }
                }
            }
        });

        merlin.show_step('need_form');
    };


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
                initMerlin();
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
};
