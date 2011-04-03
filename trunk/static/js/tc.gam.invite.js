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
				next_button: tc.jQ('a.submit'),
				first_step: 'invite-message-project-info',
				data:{
					project_id: null,
					idea_id: null,
					message: null
				},
				steps:{
					'invite-message-project-info':{
						selector:'.invite-message-project-info',
						next_step:'invite-message-info',
						inputs:{
							project_radios:{
								selector:'.project-radio'
							}
						},
						init: function(merlin, dom) {
							var name;
							
							if(dom.find('.project-radio').length == 1){
								dom.find('.project-radio').first().attr('checked',true);
								window.location.hash = 'ideas_invite,invite-message-info';
							}
							
							name = tc.jQ(event_target).attr("href").split(",")[2];
							if (name) {
								dom.find(".no-name").hide();
								dom.find(".name").text(name);
							} else {
								dom.find(".has-name").hide();
							}
							
						},
						finish: function(merlin, dom) {
							merlin.options.data = tc.jQ.extend(merlin.options.data, {
								project_id: merlin.current_step.inputs.project_radios.dom.filter(":checked").attr("rel").split(",")[1]
							});
						}
					},
					'invite-message-info':{
						selector:'.invite-message-info',
						next_step:'invite-message-submit',
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
							var name;
							
							name = tc.jQ(event_target).attr("href").split(",")[2];
							if (name) {
								dom.find(".no-name").hide();
								dom.find(".name").text(name);
							} else {
								dom.find(".has-name").hide();
							}
							
						},
						finish: function(merlin, dom) {
							
							merlin.options.data = tc.jQ.extend(merlin.options.data, {
								idea_id: tc.jQ(event_target).attr("href").split(",")[1],
								message: merlin.current_step.inputs.invite_message.dom.val()
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
									tc.jQ(event_target).addClass("disabled").text("Invited");
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
		e.preventDefault();
		e.data.app.components.modal.show(e.data, e.target);
	});
};