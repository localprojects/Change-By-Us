var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.members = function(options){
    tc.util.log('project.members');
    var dom = options.dom;
    
    var handlers = {
        remove_member:function(e){
            e.preventDefault();
            
            options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.modal-content.remove-member'),
                init: function(modal, callback) {
                    var member_name;
                    member_name = tc.jQ(e.target).prev().find('a').text();
                    if (member_name) {
                        modal.options.element.find('.person-name').text(member_name);
                    }
                    if (tc.jQ.isFunction(callback)) {
                        callback(modal);
                    }
                },
                submit:function(){
                    tc.jQ.ajax({
                        type:'POST',
                        url:'/project/user/remove',
                        data:{
                            project_id: options.project_data.project_id,
                            user_id: e.target.href.split(',')[1]
                        },
                        dataType:'text',
                        success:function(data,ts,xhr){
                            var n_members;
                            if(data == 'False'){
                                return false;
                            }
                            
                            dom.find('#member-'+e.target.href.split(',')[1]).remove();
                            n_members = dom.find('.members-stack').children().length;
                            dom.find('.members-counter').text(n_members);
                        }
                    });
                }
            });
        }
    };
    
    dom.find('a.close').unbind('click').bind('click', handlers.remove_member);
    
    var components = {
        email_merlin:null,
        ideas_carousel:null,
        ideas_pagination: dom.find('.ideas-invite .pagination')
    };
    
    var build_email_merlin = function(){
        if(components.email_merlin){
            return;
        }
        components.email_merlin = new tc.merlin(options.app,{
            name:'email_invite',
            dom:tc.jQ('.email-invite'),
            next_button:tc.jQ('input.email-invite-submit-button'),
            first_step:null,//'email-invite-info',
            data:{
                email_list:null,
                project_id:null
            },
            use_hashchange:false,
            steps:{
                'email-invite-info':{
                    selector:'.step.email-invite-info',
                    next_step:'email-invite-submit',
                    inputs:{
                        email_list:{
                            selector:'.email-list',
                            validators:['min-3','max-200','required','csv-email'],
                            hint:'Add emails separated by commas'
                        },
                        email_message:{
                            selector:'.email-message',
                            validators:['min-3','max-200','required'],
                            hint:'Add a message'
                        }
                    },
                    init:function(merlin,dom){
                        merlin.current_step.inputs.email_list.dom.removeClass('has-been-focused').removeClass('has-attempted-submit');
                        merlin.current_step.inputs.email_message.dom.removeClass('has-been-focused').removeClass('has-attempted-submit');
                    },
                    finish:function(merlin,dom){
                        merlin.options.data = tc.jQ.extend(merlin.options.data,{
                            project_id:merlin.app.app_page.data.project.project_id,
                            email_list:merlin.current_step.inputs.email_list.dom.val(),
                            message:merlin.current_step.inputs.email_message.dom.val()
                        });
                    }
                },
                'email-invite-submit':{
                    selector:'.step.email-invite-submit',
                    next_step:'email-invite-info',
                    init:function(merlin,dom){
                        tc.jQ.ajax({
                            type:'POST',
                            url:'/project/invite',
                            data:merlin.options.data,
                            context:merlin,
                            dataType:'text',
                            success:function(data,ts,xhr){
                                var _merlin = this;
                                if(data == 'False'){
                                    this.show_step('email-invite-error');
                                    return false;
                                }
                                tc.timer(1000,function(){
                                    merlin.options.steps['email-invite-info'].inputs.email_list.dom.val('');
                                    merlin.options.steps['email-invite-info'].inputs.email_message.dom.val('');
                                    _merlin.show_step('email-invite-info');
                                });
                            }
                        });
                    }
                },
                'email-invite-error':{
                    selector:'.step.email-invite-error'
                }
            }
        });
    };
    
    build_email_merlin();
    
    dom.find('a.flag-idea').bind('click', function(e){
        e.preventDefault();
        tc.jQ.ajax({
            type:'POST',
            url:'/idea/flag',
            data:{
                idea_id:e.target.hash.split(',')[1]
            },
            dataType:'text',
            success: function(data, ts, xhr) {
                if (data == 'False') {
                    return false;
                }
                tc.jQ(e.target).parent().text('Flagged');
            }
        });
    });
    
    components.ideas_carousel = new tc.carousel({
        element: dom.find('.ideas-invite .carousel'),
        pagination: {
            current: components.ideas_pagination.find('.cur-index'),
            total: components.ideas_pagination.find('.total')
        }
    });
    if (!components.ideas_carousel.is_rendered()) {
        components.ideas_pagination.hide();
    }
    
    dom.find('a.remove-idea').bind('click', function(e){
        e.preventDefault();
        
        options.app.components.modal.show({
            app:options.app,
            source_element:tc.jQ('.modal-content.remove-idea'),
            submit:function(){
                var id;
                id = e.target.hash.split(',')[1];
                tc.jQ.ajax({
                    type:'POST',
                    url:'/idea/remove',
                    data:{
                        idea_id: id
                    },
                    dataType:'text',
                    success:function(data,ts,xhr){
                        if(data == 'False'){
                            return false;
                        }
                        tc.jQ(tc).trigger('project-idea-remove', { id: id });
                    }
                });
            }
        });
    });

    tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
        if (options.name === widgetName) {
            tc.util.log('&&& showing ' + options.name);
            dom.show();

            if (components.ideas_carousel.has_items() && !components.ideas_carousel.is_rendered()) {
                components.ideas_carousel.render();
                components.ideas_pagination.show();
            }
            
            if(components.email_merlin){
                components.email_merlin.show_step('email-invite-info');
            }
        } else {
            tc.util.log('&&& hiding ' + options.name);
            dom.hide();
        }
    });
    
    tc.jQ(tc).bind('project-idea-remove', function(event, id) {
        if (components.ideas_carousel.carousel) {
            components.ideas_carousel.carousel.getRoot().find("li[rel='idea-"+ id +"']").remove();
            components.ideas_carousel.update_pagination().update_navigation();
        }
    });
};