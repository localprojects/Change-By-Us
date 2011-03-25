if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }

tc.gam.ideas_invite = function(app) {
	// Invite
	tc.jQ('a.invite').bind('click',{
		app:app,
		source_element:tc.jQ('.modal-content.invite-user'),
		init:function(modal,event_target,callback){
			var modal_merlin;
			modal_merlin = new tc.merlin(app,{
				name:'ideas_invite',
				dom:modal.options.element.find('.invite-user'),
				first_step: 'invite-message-info',
				data:{
					project_id: null,
					idea_id: null,
					message: ""
				},
				steps:{
					'invite-message-info':{
						selector:'.invite-message-info',
						inputs:{
							invite_message:{
								selector:'textarea.invite-message',
								validators:['max-200'],
								counter:{
									selector:'.charlimit.invite-message',
									limit:200
								}
							}
						},
						init:function(merlin,dom){
							dom.find(".name").text( tc.jQ(event_target).attr("href").split(",")[2] );
								
							dom.find('a.submit').bind('click',{merlin:merlin,dom:dom},function(e,d){
								e.preventDefault();
								if(dom.hasClass('invalid')){
									return;
								}
								if (merlin.app.app_page.data.project) {
									e.data.merlin.options.data.project_id = merlin.app.app_page.data.project.project_id;
									window.location.hash = "ideas_invite,invite-message-submit";
								} else {
									window.location.hash = "ideas_invite,invite-message-project-info";
								}
							});
						},
						finish: function(merlin, dom) {
							var message;
							message = merlin.current_step.inputs.invite_message.dom.val();
							
							merlin.options.data = tc.jQ.extend(merlin.options.data, {
								idea_id: tc.jQ(event_target).attr("href").split(",")[1],
								message: message
							});
						}
					},
					'invite-message-project-info':{
						selector:'.invite-message-project-info',
						inputs:{
							//
						},
						init: function(merlin, dom) {
							dom.find(".name").text( tc.jQ(event_target).attr("href").split(",")[2] );
							
							dom.find('a.submit').bind('click',{merlin:merlin,dom:dom},function(e,d){
								e.preventDefault();
								if(dom.hasClass('invalid')){
									return;
								}								
								window.location.hash = "ideas_invite,invite-message-submit";
							});
						},
						finish: function(merlin, dom) {
							var selected_project;
							selected_project = dom.find(".project-radio:checked");
							
							merlin.options.data = tc.jQ.extend(merlin.options.data, {
								project_id: selected_project.attr("rel").split(",")[1]
							});
						}
					},
					'invite-message-submit':{
						selector:'.invite-message-submit',
						init: function(merlin, dom) {
							tc.jQ.ajax({
								type:"POST",
								url:"/project/invite",
								data:merlin.options.data,
								context:merlin,
								dataType:"text",
								success: function(data, ts, xhr) {
									if (data == "False") {
										return false;
									}
									tc.jQ(event_target).addClass("invited").text("Invited");
									tc.timer(1000, function() {
										modal.hide();
									});
								}
							});
						}
					}
				}
			});
			if(tc.jQ.isFunction(callback)){
				callback(modal);
			}
		}
	},function(e,d){
		e.data.app.components.modal.show(e.data, e.target);
	});
};