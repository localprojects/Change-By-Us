/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

app_page.features.push(function(app){
	
	tc.jQ("select.duration").jqDropDown({ 
		direction: 'down',
		effect: 'fade',
		effectSpeed: 150,
		placeholder: '.duration'
	});
	
	tc.jQ("select.point_person").jqDropDown({ 
		direction: 'down',
		effect: 'fade',
		effectSpeed: 150,
		placeholder: '.point_person'
	});
	
	tc.jQ("select.message_filter_select").show().jqDropDown({ 
		direction: 'down',
		effect: 'fade',
		effectSpeed: 150,
		placeholder: '.message_filter_select'
	});
	
});
		
		
app_page.features.push(function(app){
		
		app.components.project = new tc.gam.project({
			app:app,
			data:app_page.data.project,
			project_user:app_page.project_user,
			dom:tc.jQ('.continent.project')
		});
		
		tc.jQ(document).unbind('create-image-uploaded').bind('create-image-uploaded', {app:app, project:app.components.project}, function(e, d){
			e.data.app.components.modal.hide();
			if(d.responseJSON.thumbnail_id){
				tc.jQ.ajax({
					type:'POST',
					url:'/project/photo',
					data:{
						project_id:e.data.project.data.project_id,
						image_id:d.responseJSON.thumbnail_id
					},
					dataType:'text',
					success:function(data,ts,xhr){
						tc.jQ('img.proj').attr('src',e.data.app.app_page.media_root+'images/'+(d.responseJSON.thumbnail_id % 10)+'/'+d.responseJSON.thumbnail_id+'.png');
					}
				});
			}
		});
		
		tc.jQ('a.change-image').bind('click',{
			app:app,
			source_element:tc.jQ('.modal-content.upload-image'),
			init:function(modal,callback){
				var uploader = new qq.FileUploader({
					element: modal.options.element.find('.file-uploader').get(0),
					action: '/create/photo',
					onComplete: function(id, fileName, responseJSON){
						
						tc.jQ(document).trigger('create-image-uploaded',{
							id:id,
							fileName:fileName,
							responseJSON:responseJSON
						});
						
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
		
		// Join
		tc.jQ('a.join-project').bind('click',{
			app:app,
			no_user:{
				source_element:tc.jQ('.modal-content.join-no-user'),
				init:function(modal,event_target,callback){
					
					if(tc.jQ.isFunction(callback)){
						callback(modal);
					}
				}
			},
			user:{
				source_element:tc.jQ('.modal-content.introduce-yourself'),
				init:function(modal,event_target,callback){
					var modal_merlin;
					modal_merlin = new tc.merlin(app,{
						dom:modal.options.element.find('.introduce-yourself'),
						first_step:'introduce-message-step',
						data:{
							project_id:app.app_page.data.project.project_id,
							message:null
						},
						use_hashchange:false,
						steps:{
							'introduce-message-step':{
								selector:'.introduce-message-step',
								inputs:{
									message:{
										selector:'textarea.introduce-message',
										validators:['max-200']
									}
								},
								init:function(merlin,dom){
									merlin.dom.mouseenter(function(){
										merlin.current_step.inputs.message.dom.focus();
									});
									dom.find('.submit').bind('click',{merlin:merlin,dom:dom},function(e,d){
										e.preventDefault();
										if(dom.hasClass('invalid')){
											return;
										}
										//window.location.hash = 'finish';
										e.data.merlin.show_step('finish');
									});
								},
								finish:function(merlin,dom){
									merlin.options.data.message = merlin.current_step.inputs.message.dom.val();
								}
							},
							'finish':{
								selector:'.finish',
								init:function(merlin,dom){
									tc.jQ.ajax({
										type:'POST',
										url:'/project/join',
										data:merlin.options.data,
										context:merlin,
										dataType:'text',
										success:function(data,ts,xhr){
											window.location.reload(true);
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
			}
		},function(e,d){
			if(!e.data.app.app_page.user){
				e.data.app.components.modal.show(e.data.no_user, e.target);
			} else {
				e.data.app.components.modal.show(e.data.user, e.target);
			}
		});
		
		// Leave project
		tc.jQ("a.leave-project").bind("click", {app:app}, function(e, d) {
			var t;
			t = tc.jQ(this);
			e.preventDefault();
			e.data.app.components.modal.show({
				app: app,
				source_element: tc.jQ(".modal-content.leave-project"),
				submit: function(modal, callback) {
					tc.jQ.ajax({
						type: "POST",
						url: "/project/leave",
						data: {
							project_id: t.attr("href").split(",")[1]
						},
						context: app,
						dataType: "text",
						success: function(data, ts, xhr) {
							if (data == "False") {
								return false;
							}
							//t.replaceWith("You have left <span class='uncaps'>this</span> project");
							window.location.reload(true);
						}
					});
				}
			});
		});
		
		tc.gam.ideas_invite(app, {
			elements: tc.jQ('a.invite'),
			ref_project_id: app.components.project.data.project_id
		});
		
		// random note-card backgrounds
		tc.randomNoteCardBg(tc.jQ('.ideas-invite .items'));
		
	});
