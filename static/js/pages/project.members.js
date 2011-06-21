if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }
if(!tc.gam.project_widgets){ tc.gam.project_widgets = {}; }

tc.gam.project_widgets.members = function(project,dom,deps,options){
	var widget, me;
	tc.util.log("project.members");
	me = this;
	this.options = tc.jQ.extend({name:'members'},options);
	this.project = project;
	this.dom = dom;
	widget = tc.gam.widget(this,project);
	
	this.handlers = {
		remove_member:function(e){
			e.preventDefault();
			
			e.data.project.options.app.components.modal.show({
				app:e.data.project.options.app,
				source_element:tc.jQ('.modal-content.remove-member'),
				init: function(modal, callback) {
					var member_name;
					member_name = tc.jQ(e.target).prev().find("a").text();
					if (member_name) {
						modal.options.element.find(".person-name").text(member_name);
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
							project_id: e.data.me.options.app.app_page.data.project.project_id,
							user_id: e.target.href.split(',')[1]
						},
						context:e.data.me,
						dataType:'text',
						success:function(data,ts,xhr){
							var n_members;
							if(data == 'False'){
								return false;
							}
							
							this.dom.find('#member-'+e.target.href.split(',')[1]).remove();
							n_members = this.dom.find('.members-stack').children().length;
							this.project.dom.find('.members-counter').text(n_members);
						}
					});
				}
			});
		}
	};
	
	this.dom.find('a.close').unbind('click').bind('click', {project:project,me:this}, this.handlers.remove_member);
	
	this.components = {
		email_merlin:null,
		ideas_carousel:null,
		ideas_pagination: this.dom.find(".ideas-invite .pagination")
	};
	
	this.build_email_merlin = function(){
		if(this.components.email_merlin){
			return;
		}
		this.components.email_merlin = new tc.merlin(options.app,{
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
				'email-invite-message':{
					selector:'.step.email-invite-message',
					next_step:'email-invite-submit',
					inputs:{
						email_message:{
							selector:'.email-message',
							validators:['min-3','max-200','required'],
							hint:'Add a message'
						}
					},
					init:function(merlin,dom){
						merlin.current_step.inputs.email_message.dom.val('').removeClass('has-been-focused').removeClass('has-attempted-submit');
					},
					finish:function(merlin,dom){
						merlin.options.data = tc.jQ.extend(merlin.options.data,{
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
									//window.location.hash = 'email_invite,email-invite-error';
									this.show_step('email-invite-error');
									return false;
								}
								tc.timer(1000,function(){
									//window.location.hash = 'email_invite,email-invite-info';
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
	
	this.build_email_merlin();
	
	this.dom.find('a.flag-idea').bind('click', {project:project}, function(e){
		e.preventDefault();
		tc.jQ.ajax({
			type:"POST",
			url:'/idea/flag',
			data:{
				idea_id:e.target.hash.split(',')[1]
			},
			context:tc.jQ(e.target),
			dataType:"text",
			success: function(data, ts, xhr) {
				if (data == "False") {
					return false;
				}
				this.parent().text('Flagged');
			}
		});
	});
	
	this.components.ideas_carousel = new tc.carousel({
		element: this.dom.find(".ideas-invite .carousel"),
		pagination: {
			current: this.components.ideas_pagination.find(".cur-index"),
			total: this.components.ideas_pagination.find(".total")
		}
	});
	if (!this.components.ideas_carousel.is_rendered()) {
		this.components.ideas_pagination.hide();
	}
	
	dom.find('a.remove-idea').bind('click', {project:project, app:options.app}, function(e){
		e.preventDefault();
		
		e.data.app.components.modal.show({
			app:e.data.app,
			source_element:tc.jQ('.modal-content.remove-idea'),
			submit:function(){
				var id;
				id = e.target.hash.split(",")[1];
				tc.jQ.ajax({
					type:'POST',
					url:'/idea/remove',
					data:{
						idea_id: id
					},
					context: tc.jQ(e.target),
					dataType:'text',
					success:function(data,ts,xhr){
						if(data == 'False'){
							return false;
						}
						e.data.project.dom.trigger("project-idea-remove", { id: id });
					}
				});
			}
		});
	});

	return {
		show:function(propagate) {
			widget.show(propagate);
			if (me.components.ideas_carousel.has_items() && !me.components.ideas_carousel.is_rendered()) {
				me.components.ideas_carousel.render();
				me.components.ideas_pagination.show();
			}
			if(me.components.email_merlin){
				me.components.email_merlin.show_step('email-invite-info');
			}
		},
		hide:widget.hide,
		remove_idea: function(id) {
			if (me.components.ideas_carousel.carousel) {
				me.components.ideas_carousel.carousel.getRoot().find("li[rel='idea-"+ id +"']").remove();
				me.components.ideas_carousel.update_pagination().update_navigation();
			}
		}
	};
};