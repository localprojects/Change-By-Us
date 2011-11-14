/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

	app_page.features.push(function(app){
		tc.util.log('Give A Minute: User Account Editable');
		
		
		app.components.account_merlin = new tc.merlin(app,{
			name: "account-info",
			dom: tc.jQ(".account-view.merlin"),
			first_step: "edit-account-details",
			data: {
				f_name: app.app_page.user.f_name,
				l_name: app.app_page.user.l_name,
				email: app.app_page.user.email,
				image_id: app.app_page.user.image_id || null,
				location_id: app.app_page.user.location_id || null
			},
			use_hashchange:false,
			steps: {
				"edit-account-details":{
					selector: ".step.edit-account-details",
					inputs: {
						first_name:{
							selector:'.row-first-name input',
							validators:["required"]
						},
						last_name:{
							selector:".row-last-name input",
							validators:["required"]
						},
						email:{
							selector:".row-email input",
							validators:["required"]
						},
						location: {
							selector: ".row-hood .location-group",/*
							validators: tc.locationDropdown.validator*/
							validators: function(merlin, elements) {
								return {
									valid: true,
									errors: []
								};
							}
						}
					},
					locationDropdown: null,
					init: function(merlin, dom) {
						dom.find('.info-save-button').bind('click',{merlin:merlin,dom:dom},function(e,d){
							e.preventDefault();
							if(e.data.dom.hasClass('invalid')){
								return;
							}
							merlin.show_step('submit-account-details');
							//window.location.hash = 'account-info,submit-account-details';
						});
						
						tc.jQ(document).unbind('create-image-uploaded').bind('create-image-uploaded',{merlin:merlin}, function(e, d){
							e.data.merlin.app.components.modal.hide();
							if(d.responseJSON.thumbnail_id){
								merlin.dom.find('.user-pic img').attr('src',app.app_page.media_root + 'images/'+(d.responseJSON.thumbnail_id % 10)+'/'+d.responseJSON.thumbnail_id+'.png');
								tc.jQ(".user-account-nav img.avatar").attr('src',app.app_page.media_root + 'images/'+(d.responseJSON.thumbnail_id % 10)+'/'+d.responseJSON.thumbnail_id+'.png');
								merlin.options.data.image_id = d.responseJSON.thumbnail_id;
							}
						});
						
						if (!merlin.current_step.locationDropdown) {
							merlin.current_step.locationDropdown = new tc.locationDropdown({
								input: dom.find('input.location-hood-enter'),
								list: dom.find('div.location-hood-list'),
								locations: merlin.app.app_page.data.locations
							});
						}
						
					},
					finish: function(merlin, dom) {
						var location_id;
						location_id = merlin.current_step.locationDropdown.getLocation();
						if (!location_id) {
							location_id = "-1";
						}
						merlin.options.data = tc.jQ.extend(merlin.options.data, {
							f_name: merlin.current_step.inputs.first_name.dom.val(),
							l_name: merlin.current_step.inputs.last_name.dom.val(),
							email: merlin.current_step.inputs.email.dom.val(),
							location_id: location_id
						});
					}
				},
				"submit-account-details":{
					selector:".step.submit-account-details",
					init: function(merlin, dom) {
						tc.jQ.ajax({
							type:"POST",
							url:"/useraccount/edit",
							data:merlin.options.data,
							context:merlin,
							dataType:"text",
							success: function(data, ts, xhr) {
								if (data == "False") {
									this.show_step('account-details-error');
									//window.location.hash = "account-info,account-details-error";
									return false;
								}
								
								tc.timer(2000, function() {
									//window.location.assign("/useraccount#account-info,edit-account-details");
									window.location.reload(true);
								});
							}
						});
					}
				},
				"account-details-submitted":{
					selector:".step.account-details-submitted",
					init: function(merlin, dom) {
						tc.timer(1000, function() {
							window.location.hash = "user-account,account";
						});
					}
				},
				"account-details-error":{
					selector:".step.account-details-error",
					init: function(merlin, dom) {
						
					}
				}
			}
		});
		
		
			
		app.components.change_pass_merlin = new tc.merlin(app,{
			name: "change-password",
			dom: tc.jQ(".password-info.merlin"),
			next_button: tc.jQ(".password-save-button"),
			first_step: "hidden",
			data: {
				old_password: null,
				new_password: null
			},
			use_hashchange:false,
			steps: {
				"hidden":{
					selector:".step.hidden"
				},
				"edit-password-details":{
					selector:".step.edit-password-details",
					next_step:"submit-password-details",
					inputs: {
						old_password: {
							selector: ".old-password",
							validators:["required"]
						},
						new_password: {
							selector: ".new-password",
							validators:["password-35", "required"]
						},
						confirm_new_password: {
							selector: ".confirm-new-password",
							validators:["required"]
						}
					},
					finish: function(merlin, dom) {
						merlin.options.data = tc.jQ.extend(merlin.options.data, {
							old_password: merlin.current_step.inputs.old_password.dom.val(),
							new_password: merlin.current_step.inputs.new_password.dom.val()
						});
					}
				},
				"submit-password-details":{
					selector:".step.submit-password-details",
					init: function(merlin, dom) {
						tc.jQ.ajax({
							type:"POST",
							url:"/useraccount/password",
							data:merlin.options.data,
							context:merlin,
							dataType:"text",
							success: function(data, ts, xhr) {
								var me;
								me = this;
								if (data == "False") {
									this.show_step('password-details-error');
									//window.location.hash = "change-password,password-details-error";
									return false;
								}
								tc.timer(2000, function() {
									me.show_step('password-details-submitted');
									//window.location.hash = "change-password,password-details-submitted";
								});
							}
						});
					}
				},
				"password-details-submitted":{
					selector:".step.password-details-submitted",
					init: function(merlin, dom) {
						tc.timer(1000, function() {
							window.location.hash = "user-account,account";
						});
					}
				},
				"password-details-error":{
					selector:".step.password-details-error",
					init: function(merlin, dom) {
						
					}
				}
			}
		});
			
			
		
		tc.jQ('a.change-profile-image').bind('click',{
			app:app,
			source_element:tc.jQ('.modal-content.upload-image'),
			init:function(modal,callback){
				var uploader = new qq.FileUploader({
					element: modal.options.element.find('.file-uploader').get(0),
					action: '/create/photo',
					onComplete: function(id, fileName, responseJSON){
						modal.hide();
						if (responseJSON.thumbnail_id) {
							tc.jQ.ajax({
								type:"POST",
								url:"/useraccount/edit",
								data: {
									f_name: app.app_page.user.f_name,
									l_name: app.app_page.user.l_name,
									email: app.app_page.user.email,
									image_id: responseJSON.thumbnail_id,
									location_id: app.app_page.user.location_id || null
								},
								dataType:"text",
								success: function(data, ts, xhr) {
									if (data == "False") {
										return false;
									}
									
									tc.jQ(".user-account-nav img.avatar").attr('src',app.app_page.media_root + 'images/'+(responseJSON.thumbnail_id % 10)+'/'+responseJSON.thumbnail_id+'.png');	
									//window.location.reload(true);
								}
							});
						}
						
						return true;
					}
				});
				if(tc.jQ.isFunction(callback)){
					callback(modal);
				}
			}
		},function(e,d){
			e.preventDefault();
			e.data.app.components.modal.show(e.data);
		});
		
		
		
		// user description
		new tc.inlineEditor({
			dom: tc.jQ(".user-info .description"),
			service: {
				url: "/useraccount/editdescription",
				param: "description"
			},
			empty_text: "Click here to add something about yourself."
		});



		function editableResource($r) {
			
			var post_data = { 
				resource_id: $r.attr("id")
			};
			
			// photo
			$r.find("a.change-image").bind("click", {
				app: app,
				source_element:tc.jQ('.modal-content.upload-resource-image'),
				init: function(modal, callback) {
					var uploader = new qq.FileUploader({
						element: modal.options.element.find('.file-uploader')[0],
						action: "/create/photo",
						onComplete: function(id, fileName, responseJSON){
							modal.hide();
							
							if (responseJSON.thumbnail_id) {
								tc.jQ.ajax({
									type: "POST",
									dataType: "text",
									url: "/resource/edit/image",
									data: {
										resource_id: post_data.resource_id,
										image_id: responseJSON.thumbnail_id
									},
									success: function(data, ts, xhr) {
										if (data === "False") {
											//TODO handle error?
											return false;
										}
										$r.find(".thumb img").attr('src', app.app_page.media_root + 'images/'+(responseJSON.thumbnail_id % 10)+'/'+responseJSON.thumbnail_id+'.png');
									}
								});
							}
							
							return true;
						}
					});
					if (tc.jQ.isFunction(callback)) {
						callback(modal);
					}
				}
			}, function(e, d) {
				e.preventDefault();
				e.data.app.components.modal.show(e.data);
			});
			
			//location
			new tc.inlineLocationEditor({
				dom: $r.find(".box.res-location"),
				locations: app.app_page.data.locations,
				service: {
					url: "/resource/edit/location",
					param: "location_id",
					post_data: post_data
				}
			});
			
			// mission
			new tc.inlineEditor({
				dom: $r.find(".box.res-description"),
				service: {
					url: "/resource/edit/description",
					param: "description",
					post_data: post_data
				},
				charlimit: 400
			});
			
			//url
			new tc.inlineEditor({
				dom: $r.find(".box.res-url"),
				service: {
					url: "/resource/edit/url",
					param: "url",
					post_data: post_data
				},
				validators: ["url"]
			});
			
			//email
			new tc.inlineEditor({
				dom: $r.find(".box.res-email"),
				service: {
					url: "/resource/edit/contactemail",
					param: "contactemail",
					post_data: post_data
				},
				validators: ["email"]
			});
			
			//physical address
			new tc.inlineEditor({
				dom: $r.find(".box.res-addr"),
				service: {
					url: "/resource/edit/address",
					param: "address",
					post_data: post_data
				}
			});
			
			//keywords
			new tc.inlineEditor({
				dom: $r.find(".box.res-keywords"),
				service: {
					url: "/resource/edit/keywords",
					param: "keywords",
					post_data: post_data
				}
			});
			
		}
		
		tc.jQ(".resources-view ul.my-res > li").each(function() {
			editableResource( tc.jQ(this) );
		});
		
		
	});
	