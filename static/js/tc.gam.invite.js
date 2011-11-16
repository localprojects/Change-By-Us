/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }

tc.gam.ideas_invite = function(app, options) {
	
	var o = tc.jQ.extend({
		elements: null,
		ref_project_id: null
	}, options);

	// Invite
	o.elements.bind('click',{
		app:app,
		source_element:tc.jQ('.modal-content.invite-user'),
		init:function(modal,event_target,callback){
			var modal_merlin;
			modal_merlin = new tc.merlin(app,{
				use_hashchange: false,
				name:'ideas_invite',
				dom:modal.options.element.find('.invite-user'),
				next_button: tc.jQ('a.submit'),
				first_step: o.ref_project_id ? 'invite-message-info' : 'invite-message-project-info',
				data:{
					project_id: o.ref_project_id ? o.ref_project_id : null,
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
								merlin.show_step("invite-message-info");
								return;
							}
							
							name = tc.jQ(event_target).attr("href").split(",")[2];
							if (name) {
								dom.find(".no-name").hide();
								dom.find(".name").text(name);
							} else {
								dom.find(".has-name").hide();
							}
							
							dom.find('input[type=checkbox],input[type=radio]').prettyCheckboxes();
							
						},
						finish: function(merlin, dom) {
							if(!merlin.current_step.inputs.project_radios.dom.filter(":checked").length){
								merlin.options.data.project_id = null;
								return false;
							}
							merlin.options.data = tc.jQ.extend(merlin.options.data, {
								project_id: merlin.current_step.inputs.project_radios.dom.filter(":checked").attr("rel").split(",")[1]
							});
							
							return true;
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
							
							if (!merlin.options.data.project_id) {
								merlin.show_step("invite-message-project-info");
								return;
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
										merlin.show_step("invite-message-error");
										return false;
									}
									tc.jQ(event_target).addClass("disabled").text("Invited").unbind("click").bind("click", function(e) {
										e.preventDefault();
									});
									tc.timer(1000, function() {
										modal.hide();
									});
								}
							});
						}
					},
					"invite-message-error": {
						selector:".invite-message-error",
						init: function(merlin, dom) {
							tc.timer(1000, function() {
								modal.hide();
							});
						}
					}
				}
			});
			
			modal.cleanup = function() {
				modal_merlin.deallocate_magic();
			};
			
			if(tc.jQ.isFunction(callback)){
				callback(modal);
			}
		}
	},function(e,d){
		e.preventDefault();
		e.data.app.components.modal.show(e.data, e.target);
	});
};