	
	app_page.features.push(function(app){
		tc.util.log('Give A Minute: User Account oAuth');
		
		if(app.app_page.data.facebook_connected){
			$(".connect-facebook").closest(".social-networking").addClass("facebook-connected");
			$(".disconnect-facebook").click(function(event){
				event.preventDefault();
				$.getJSON("/disconnect_facebook", function(data){     
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
				$.getJSON("/disconnect_twitter", function(data){
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
			offset = app.app_page.data.user_activity.messages.length - 1;
		}
		
		app.components.user_page_merlin = new tc.merlin(app,{
			name: "user-account",
			dom:tc.jQ('.midlands.merlin'),
			first_step:'activity',
			steps:{
				'activity':{
					selector:'.activity-view',
					init:function(merlin,dom){
						tc.jQ('ul.tabs li').removeClass('active').filter(".activity").addClass("active");
						tc.jQ('.addphoto').hide();
						
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
						tc.addOfficialResourceTags(tc.jQ('table.resources-list'));
					}
				},
				'messages':{
					selector:'.messages-view',
					current_offset: offset,
					n_to_fetch:5,
					has_run_init: false,
					init:function(merlin,dom){
						tc.jQ('ul.tabs li').removeClass('active').filter(".messages").addClass("active");
						tc.jQ('.addphoto').hide();
						
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
									var d, dom_stack;
									$t.parent().removeClass("loading");
									try {
										d = tc.jQ.parseJSON(data);
									} catch(e) {
										tc.util.log("/useraccount/messages: json parsing error", "warn");
										return;
									}
									if (!d.length) {
										$t.hide();
										return;
									}
									dom_stack = e.data.dom.find("ol.message-stack");
									tc.jQ.each(d, function(i, message) {
										var template;
										switch (message.message_type) {
											case "member_comment":
												template = tc.jQ(".template-content.message-item.member-comment").clone().removeClass("template-content");
												if (message.owner.image_id) {
													template.find(".thumb img").attr("src", "/images/"+ message.owner.image_id % 10 +"/"+ message.owner.image_id +".png").attr("alt", message.owner.name);
												} else {
													template.find(".thumb img").attr("src", "/static/images/thumb_genAvatar50.png").attr("alt", message.owner.name);
												}
												template.find(".sender").html("<a href='/useraccount/"+ message.owner.u_id +"'>"+ message.owner.name+ "</a>").next().text(message.created).time_since();
												template.find(".excerpt p").text(message.body);
												break;
											case "join":
												template = tc.jQ(".template-content.message-item.join-notification").clone().removeClass("template-content");
												template.find(".title").text(message.body);
												template.find(".controls > a").attr("href", "/project/"+ message.project_id +"#show,members");
												break;
											case "invite":
												template = tc.jQ(".template-content.message-item.user-notification").clone().removeClass("template-content");
												template.find(".title").text(message.body);
												template.find(".controls > a").attr("href", ("/project/"+ message.project_id + ""));
												break;
											default:
												break;
										}
										if (template) {
											dom_stack.append(template);
										}
									});
									this.current_step.current_offset += d.length;
								}
							});
						});
					}
				},
				'account':{
					selector:'.account-view',
					init:function(merlin,dom){
						tc.jQ('ul.tabs li').removeClass('active').filter(".account").addClass("active");
						window.location.hash = "account-info,edit-account-details";
						tc.jQ('.addphoto').show();
					}
				},
				'resources':{
					selector:'.resources-view',
					init:function(merlin,dom){
						tc.jQ('ul.tabs li').removeClass('active').filter(".resources").addClass("active");
						window.location.hash = "resources-info";
						tc.jQ('.addphoto').hide();
					}
				}
			}
		});
		
		//commented out because it is breaking the page.
		//tc.gam.ideas_invite(app);
		
		// random note-card backgrounds
		var ideasList = tc.jQ('.idea-cards li');
		for (i=0; i < ideasList.length; i++) {
			ideasList.eq(i).children('.note-card').addClass('card' + (Math.floor(Math.random()*4) + 1));
		}
		
	});
	
