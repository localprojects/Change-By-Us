var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.needs = function(options) {
    tc.util.log('project.needs');
    var dom = options.dom, merlin;
    
    var makeMerlin = function() {
        return new tc.merlin(options.app, {
            name:'volunteer',
            dom:tc.jQ('#modal .user-volunteer-modal.merlin'),
            next_button:tc.jQ('#modal .user-volunteer-modal.merlin a.send'),
            first_step:'volunteer_agree',
            use_hashchange:false,
            steps: {
                //Step 1
                'volunteer_agree': {
                    selector:'.step.user-volunteer',
                    next_step:'volunteer_submit',
                    inputs:{
                        'volunteer_agree': {
                            selector:'.volunteer-agree-msg',
                            validators:['max-200'],
                            hint:'',
                            handlers:{
                                focus:function(event, data) {
                                    //elements.userprompt.hide();
                                    console.log('focussssssssssssssssss');
                                },
                                blur:function(event, data) {
                                    //setLabelVisibility();
                                    console.log('blurrrrrrrrrrrrrrrrr');
                                }
                            },
                            counter: {
                                // selector: jQuery selectory for element to fill with counter.
                                selector: '.charlimit.charlimit-volunteer-agree-msg',
                                // limit: Character limit for counter.  This should be in align
                                // with a validator of max-X.
                                limit: 200
                            }
                        }
                    },
                    init:function(merlin, dom) {
                        console.log('initingggggggggggggggggggggggggg');
                        //merlin.current_step.inputs.message.dom.val('').removeClass('has-been-focused has-attempted-submit');
                    },
                    finish:function(merlin, dom) {
                        
                        console.log('finishhhhhhhhhhhhhhhhhhhhh');
                        
                        merlin.options.data = {
                        };
                    }
                },
                //Step 2
                'volunteer_submit':{
                    selector:'.step.user-volunteer-submit',
                    init:function(merlin, dom){
                        
                        console.log('VOLUNTEERING AND SOME STUFF!!!!');
                        
                        /*
                        tc.jQ.ajax({
                            type:'POST',
                            url:'/project/message/add',
                            data:merlin.options.data,
                            context:merlin,
                            dataType:'text',
                            success:function(data,ts,xhr){
                                if(data == 'False'){
                                    //window.location.hash = 'project_conversation,message-submit-error';
                                    this.show_step('message-submit-error');
                                    return false;
                                }
                                tc.jQ(tc).trigger('add-new-message', this.options.data); //"this" is the merlin
                                //window.location.hash = 'project_conversation,message';

                                //We just posted the message, so let's reset everything
                                state.messages = {};
                                state.fileUploader = 'needsreset';
                                refreshUi();

                                //We're done, go back to step 1 so we can do it again!
                                this.show_step('message');
                            }
                        });
                        */
                    }
                },
                //Step Error
                'volunteer_submit_error':{
                    selector:'.step.volunteer-submit-error',
                    init:function(merlin,dom){
                        console.log('VOLUNTEER ERRORRRRRRRRRRRRRRR!');
                    }
                }
            }
        });
        
    };
    
    var getNeedDetails = function(need_id, callback) {
        tc.jQ.ajax({
            url:'/rest/v1/needs/' + need_id + '/',
            dataType:'json',
            success:function(need_details, ts, xhr) {
                if (callback) {
                    callback(need_details);
                }
            }
        });
    };
    
    var showModal = function(need) {
        var $needDetailsContent = tc.jQ('.modal-content .volunteer-agree-section label'),
            h = ich.add_vol_need_tmpl({ 
                need_request: need.request,
                need_datetime: need.datetime,
                need_reason: need.reason,
                has_reason: function() { if (need.reason) return true; else return false; },
                has_datetime: function() { if (need.datetime) return true; else return false; }
            });

        $needDetailsContent.html(h);
        
        options.app.components.modal.show({
            app:options.app,
            source_element:tc.jQ('.user-volunteer-modal')
        });
        
        merlin = makeMerlin();
        merlin.show_step('volunteer_agree');
    };
    
    var bindEvents = function() {        
        tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
            if (options.name === widgetName) {
                tc.util.log('&&& showing ' + options.name);
                dom.show();
            } else {
                tc.util.log('&&& hiding ' + options.name);
                dom.hide();
            }
        });
        
        tc.jQ('.help-link').click(function(event) {
            event.preventDefault();
            var need_id = tc.jQ(this).parents('li.need').attr('data-id');
            getNeedDetails(need_id, showModal);
        });
    };
    
    bindEvents();
};