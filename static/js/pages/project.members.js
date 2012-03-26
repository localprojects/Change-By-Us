/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.members = function(options){
    tc.util.log('project.members');
    var dom = options.dom,
        self = {};

    var handlers = {
    	toggle_admin: function(e) {
    		var uid = tc.jQ(e.currentTarget).attr('for').replace('toggle-admin-', '');
    		var action = (tc.jQ(e.currentTarget).hasClass('checked')) 
    			? 'add'
    			: 'remove';
    			
    		tc.jQ.ajax({
    			type: 'POST',
    			url: '/project/user/admin/' + action,
    			data: {
    				project_id: options.project_data.project_id,
    				user_id: uid
    			},
    			dataType: 'text',
    			success: function(data, ts, xhr) {
    				//window.location.reload(true);
    			}
    		});
    	},
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
    dom.find('label.toggle-admin').bind('click', handlers.toggle_admin);

    var components = {
        email_merlin:null,
        ideas_carousel:null,
        ideas_pagination: dom.find('.ideas-invite .pagination'),
        members_carousel:null,
        members_pagination: dom.find('.members .current_page_number')
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

    components.members_carousel = new tc.carousel({
        element: dom.find('#members-stack-carousel'),
        scrollable: {
            items: '#members-stack-list',
            speed: 300,
            circular: true,
            initialIndex: 0,

            onBeforeSeek: function(event, page_idx) {
                // Get the lists of <li>'s in the first and current members
                // stacks.
                var $first_list_items = dom.find('li:not(.cloned) > #members-stack-0 > li'),
                    $current_list_items = dom.find('li:not(.cloned) > #members-stack-' + page_idx + ' > li'),

                // The length of the first members stack is going to be as
                // large as the stacks will ever get.
                    max_members_in_list = $first_list_items.length,
                    num_members_in_list = $current_list_items.length,

                    start_member_idx = (page_idx * max_members_in_list) + 1,
                    end_member_idx = start_member_idx + num_members_in_list - 1,

                    member_range;

                // If we have 0 members in the current list, then we have gone
                // past the last page.  This will happen if the carousel wraps
                // around.  No big deal, just ignore it.
                if (num_members_in_list > 0) {
                    if (start_member_idx === end_member_idx) {
                        member_range = start_member_idx
                    } else {
                        member_range = start_member_idx + ' - ' + end_member_idx
                    }

                    components.members_pagination.text(member_range);
                }
            }
        }
    });

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
            tc.showProjectWidget(dom);

            if (components.ideas_carousel.has_items() && !components.ideas_carousel.is_rendered()) {
                components.ideas_carousel.render();
                components.ideas_pagination.show();
            }

            if (components.members_carousel.has_items() && !components.members_carousel.is_rendered()) {
                components.members_carousel.render();
                components.members_pagination.show();
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

    return self;
};
