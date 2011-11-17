/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

	
	app_page.features.push(function(app){
		tc.util.log('Give A Minute: User Account oAuth');
		
		if(app.app_page.data.facebook_connected){
			$(".connect-facebook").closest(".social-networking").addClass("facebook-connected");
			$(".disconnect-facebook").click(function(event){
				event.preventDefault();
				$.getJSON("/facebook/disconnect", function(data){     
					if(data.success) {
						$(".connect-facebook").closest(".social-networking").removeClass("facebook-connected");
					}
				});
			});
		} else {
			$(".connect-facebook").click(function(event){
				event.preventDefault();
				F.connect();
			});
		}
		
		if(app.app_page.data.twitter_connected){
			$(".connect-twitter").closest(".social-networking").addClass("twitter-connected");
			$(".disconnect-twitter").click(function(event){
				event.preventDefault();
				$.getJSON("/twitter/disconnect", function(data){
					if(data.success) {
						$(".connect-twitter").closest(".social-networking").removeClass("twitter-connected");
					}
				});
			});
		}
			
	});
	
	
	app_page.features.push(function(app){
		tc.util.log('Give A Minute: User Account');
		var offset;
		
		offset = 0;
		if(app.app_page.data.user_activity && app.app_page.data.user_activity.messages){
			offset = app.app_page.data.user_activity.messages.length;
		}
		
		if(window.location.hash == ''){
			window.location.hash = 'user-account,activity';
		} else if(window.location.hash == '#user-account,password'){
			window.location.hash = 'user-account,account';
		}
		
		app.components.user_page_merlin = new tc.merlin(app,{
			name: "user-account",
			dom:tc.jQ('.midlands.merlin'),
			allow_hash_override_onload:true,
			first_step:'activity',
			steps:{
				'activity':{
					selector:'.activity-view',
					init:function(merlin,dom){
						tc.jQ('ul.tabs li').removeClass('active').filter(".activity").addClass("active");
						
						dom.find('a.remove-idea').unbind("click").bind('click', {app:app}, function(e){
							e.preventDefault();
							e.data.app.components.modal.show({
								app:e.data.app,
								source_element:tc.jQ('.modal-content.remove-idea'),
								submit:function(){
									tc.jQ.ajax({
										type:'POST',
										url:'/idea/remove',
										data:{
											idea_id: e.target.hash.split(',')[1]
										},
										context: tc.jQ(e.target),
										dataType:'text',
										success:function(data,ts,xhr){
											var item;
											if(data == 'False'){
												return false;
											}
											item = this.parents("li").eq(0);
											
											(function(counter, n) {
												counter.text(n);
											}(this.parents(".box").eq(0).children(".hd").find(".counter"), item.siblings().length));
																																
											item.remove();
											
											tc.jQ('ul.idea-cards > li').removeClass('every-third').filter(function(index) {
									 			return index % 3 == 2;
											}).addClass('every-third');
										}
									});
								}
							});
						});
						// add official resource tags
						//tc.addOfficialResourceTags(tc.jQ('table.resources-list'));
					}
				},
				'messages':{
					selector:'.messages-view',
					current_offset: offset,
					n_to_fetch:5,
					has_run_init: false,
					init:function(merlin,dom){
						
						function generate_notification(message, templateClass) {
							var template;
							
							template = tc.jQ("<li class='message-item user-notification "+ templateClass +" '></li>").append( tc.jQ(".template-content.message-item."+ templateClass).children().clone() );
							template.find(".title").html(message.body);
							template.find(".sender").html("<a href='/useraccount/"+ message.owner.u_id +"'>"+ message.owner.name+ "</a>");
							template.find(".project a").attr('href','/project/' + message.project_id + '#show,members').text(message.project_title);
							template.find(".time-since").text(message.created).time_since();
							
							return template;
						}
						
						tc.jQ('ul.tabs li').removeClass('active').filter(".messages").addClass("active");
						
						if (!merlin.current_step.has_run_init) {
							(function() {
								var checklist, pref; 
								checklist = tc.jQ(".messages-view .preferences .checklist");
								pref = app.app_page.user.email_notification;
								switch (pref) {
									case "digest":
										checklist.find("label[for='pref-emails-daily']").click();
										break;
									case "none":
										checklist.find("label[for='pref-no-emails']").click();
								}
							}());
							merlin.current_step.has_run_init = true;
						}
						
						//Click event to handle "prettyCheckbox" custom check boxes
						//This event is namespaced to avoid collisions with the click events bound by $.fn.prettyCheckboxes()
						dom.find(".preferences .checklist .prettyCheckbox.radio").unbind("click.message_prefs")
						   .bind("click.message_prefs", {merlin:merlin}, function(e, d) {
								var pref;
								switch (tc.jQ(this).attr("for")) {
									case "pref-emails-daily":
										pref = "digest";
										break;
									case "pref-no-emails":
										pref = "none";
										break;
								}
								if (!pref) {
									tc.util.log("error parsing email pref", "warn");
									return false;
								}
								tc.jQ.ajax({
									type:"POST",
									url:"/useraccount/messageprefs",
									data:{
										pref: pref
									},
									context:e.data.merlin,
									dataType:"text",
									success: function(data, ts, xhr) {
										if (data == "False") {
											return false;
										}
									}
								});
							});
						
						dom.find(".load-more a").unbind("click").bind("click", {merlin:merlin, dom:dom}, function(e, d) {
							var $t;
							$t = tc.jQ(e.target);
							$t.parent().addClass("loading");
							e.preventDefault();
							tc.jQ.ajax({
								type:"POST",
								url:"/useraccount/messages",
								data:{
									n_messages: e.data.merlin.current_step.n_to_fetch,
									offset: e.data.merlin.current_step.current_offset
								},
								context:merlin,
								dataType:"text",
								success: function(data, ts, xhr) {
									var me = this, d, dom_stack;
									$t.parent().removeClass("loading");
									
									try {
										d = tc.jQ.parseJSON(data);
									} catch(err) {
										tc.util.log("/useraccount/messages: json parsing error", "warn");
										return;
									}
									
									if (!d.length) {
										$t.parent().hide();
										return;
									}
									
									dom_stack = e.data.dom.find("ol.message-stack");
									
									tc.jQ.each(d, function(i, message) {
										var template;
										switch (message.message_type) {
											case "member_comment":
												template = tc.jQ("<li class='message-item member-comment'></li>").append( tc.jQ(".template-content.message-item.member-comment").children().clone() );
												if (message.owner.image_id) {
													template.find(".thumb img").attr("src", app.app_page.media_root + "images/"+ message.owner.image_id % 10 +"/"+ message.owner.image_id +".png").attr("alt", message.owner.name);
												} else {
													template.find(".thumb img").attr("src", "/static/images/thumb_genAvatar50.png").attr("alt", message.owner.name);
												}
												template.find(".sender").html("<a href='/useraccount/"+ message.owner.u_id +"'>"+ message.owner.name+ "</a>");
												template.find(".project a").attr('href','/project/' + message.project_id).text(message.project_title);
												template.find(".excerpt p").html(message.body);
												template.find(".time-since").text(message.created).time_since();
												break;
												
											case "join":
												template = generate_notification(message, "join-notification");
												break;
												
											case "endorsement":
												template = generate_notification(message, "endorsement-notification");
												break;
												
											case "invite":
												template = tc.jQ("<li class='message-item user-notification invite-notification'></li>").append( tc.jQ(".template-content.message-item.invite-notification").children().clone() );
												template.find(".title").html(message.body);
												template.find(".controls > a").attr("href", ("/project/"+ message.project_id + ""));
												break;
												
											default:
												break;
										}
										if (template) {
											dom_stack.append(template);
											me.current_step.current_offset += 1;
										} else {
											tc.util.log("no template for message", "warn");
										}
									});
								}
							});
						});
					}
				},
				'account':{
					selector:'.account-view',
					init:function(merlin,dom){
						tc.jQ('ul.tabs li').removeClass('active').filter(".account").addClass("active");
						if(merlin.app.components.account_merlin){
							merlin.app.components.account_merlin.show_step('edit-account-details');
						}
					}
				},
				'password':{
					selector:'.password-view',
					init:function(merlin,dom){
						tc.jQ('ul.tabs li').removeClass('active').filter(".account").addClass("active");
						if(merlin.app.components.change_pass_merlin){
							merlin.app.components.change_pass_merlin.show_step('edit-password-details');
						}
						if(merlin.app.components.account_merlin){
							merlin.app.components.account_merlin.show_step('edit-account-details');
						}
						
					}
				},
				'resources':{
					selector:'.resources-view',
					init:function(merlin,dom){
						tc.jQ('ul.tabs li').removeClass('active').filter(".resources").addClass("active");
						window.location.hash = "resources-info";
					}
				}
			}
		});
		
		tc.gam.add_resource(app, {elements: tc.jQ("a.add-resource")});
		tc.gam.ideas_invite(app, {elements: tc.jQ("a.invite")});
		
		// random note-card backgrounds
		tc.randomNoteCardBg(tc.jQ('.idea-cards'));
		
	});
	