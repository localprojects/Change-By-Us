	
	app_page.features.push(tc.user_handler({
		no_user_handler:function(app){
			app.components.modal.show({
				preventClose:true,
				source_element:tc.jQ('.modal-content.join-no-user')
			});
		}
	}));
	
	app_page.features.push(function(app){
		tc.util.log('Give A Minute: Create a Project');
		tc.jQ('.addphoto a').bind('click',{
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
		
		app.components.merlin = new tc.merlin(app,{
			dom:tc.jQ('form.merlin'),
			progress_element:tc.jQ('.merlin-progress'),
			next_button:tc.jQ('.ca-btn'),
			back_button:tc.jQ('.foothills .back'),
			error_indicator:tc.jQ('.oops'),
			title:tc.jQ('.headlands h1'),
			sub_title:tc.jQ('.headlands h2'),
			watch_keypress:true,
			first_step:'start',
			components:{
				organization_tooltip:null
			},
			data:{
				title:null,
				organization:null,
				text:null,
				keywords:null,
				location_id:null,
				links:null,
				resources:null,
				image:'-1',
				main_text:""
			},
			steps:{
				'start':{
					progress_selector:'.1',
					selector:'.step.start',
					prev_step:null,
					next_step:'location',
					title:'Turn ideas into solutions.',
					sub_title:'<strong>' + (app.app_page.data.user ? app.app_page.data.user.f_name : 'Hey') + ', </strong> let\'s get started. The first step is to create a project.',
					use_for_history:true,
					step_data:{
						timer:null
					},
					inputs:{
						title:{
							selector:'input.name',
							validators:['max-50','min-3','required'],
							hint:'e.g. More Trees in NYC',
							counter:{
								selector:'.charlimit.title',
								limit:50
							},
							handlers:{
								keyup:function(e){
									if(!e.data.me.current_step.step_data.loading){
										e.data.me.current_step.inputs.suggested_keywords.dom.prepend('<img class="loading" src="/static/images/loader16x16.gif" />');
										e.data.me.current_step.step_data.loading = true;
									}
									if(e.data.me.current_step.step_data.timer){
										clearTimeout(e.data.me.current_step.step_data.timer);
										e.data.me.current_step.step_data.timer = null;
									}
									e.data.me.current_step.step_data.timer = setTimeout(e.data.me.current_step.fn.stopped,500,[e.data.me]);
									//e.data.me.current_step.step_data.timer = setTimeout(function(){
									//	e.data.me.current_step.fn.stopped([e.data.me]);
									//},1000);
								}
							}
						},
						organization:{
							selector:'input.organization',
							hint:'Field Organization, Program, Community Group, etc.'
						},
						description:{
							selector:'textarea.describe',
							validators:['max-200','min-3','required'],
							hint:'Add a description',
							counter:{
								selector:'.charlimit.description',
								limit:200
							},
							handlers:{
								keyup:function(e){
									if(!e.data.me.current_step.step_data.loading){
										e.data.me.current_step.inputs.suggested_keywords.dom.prepend('<img class="loading" src="/static/images/loader16x16.gif" />');
										e.data.me.current_step.step_data.loading = true;
									}
									if(e.data.me.current_step.step_data.timer){
										clearTimeout(e.data.me.current_step.step_data.timer);
										e.data.me.current_step.step_data.timer = null;
									}
									e.data.me.current_step.step_data.timer = setTimeout(e.data.me.current_step.fn.stopped,500);
									//DOES NOT WORK IN IE
									//e.data.me.current_step.step_data.timer = setTimeout(e.data.me.current_step.fn.stopped,500,[e.data.me]);
									//e.data.me.current_step.step_data.timer = setTimeout(function(){
									//	e.data.me.current_step.fn.stopped([e.data.me]);
									//},1000);
								}
							}
						},
						keywords:{
							selector:'input.keywords',
							hint:'Separate keywords by commas'
						},
						suggested_keywords:{
							selector:'span.suggested-keywords',
							handlers:{
								click:function(e){
									var tempval;
									if(e.target.nodeName == 'A'){
										e.preventDefault();
										if(!e.data.me.current_step.inputs.keywords.dom.hasClass('has-been-focused')){
											e.data.me.current_step.inputs.keywords.dom.val(e.target.name).addClass('has-been-focused');
										} else {
											tempval = tc.jQ.trim(e.data.me.current_step.inputs.keywords.dom.val());
											if(tempval.substring(tempval.length-1,tempval.length) == ','){
												e.data.me.current_step.inputs.keywords.dom.val(tempval += ' '+e.target.name);
											} else {
												e.data.me.current_step.inputs.keywords.dom.val(tempval += ', '+e.target.name);
											}
										}
										e.target.innerHTML = "";
										e.target.name = '';
									}
								}
							}
						},
						main_text:{
							selector:'input.main_text',
							validators:['max-0']
						}
					},
					fn:{
						inputKeyup:function(e){
							
						},
						stopped:function(){
							var merlin;
							merlin = app.components.merlin;
							tc.jQ.ajax({
								url:'/create/keywords',
								data:{
									title:merlin.current_step.inputs.title.dom.val(),
									text:merlin.current_step.inputs.description.dom.val()
								},
								context:merlin,
								dataType:'json',
								success:function(data,ts,xhr){
									var i, existingtags, temphtml;
									existingtags = merlin.current_step.inputs.keywords.dom.val();
									temphtml = '';
									if(data.suggested_keywords.length){
										for(i in data.suggested_keywords){
											if(existingtags.indexOf(data.suggested_keywords[i]) == -1){
												temphtml += "<span><a href='#' name='"+data.suggested_keywords[i]+"'>"+data.suggested_keywords[i]+"</a></span>";
											}
										}
									}
									this.current_step.inputs.suggested_keywords.dom.html(temphtml);
									this.current_step.step_data.loading = false;
								}
							});
						}
					},
					init:function(merlin,dom){
						tc.jQ(document).unbind('create-image-uploaded').bind('create-image-uploaded',{merlin:merlin}, function(e, d){
							e.data.merlin.app.components.modal.hide();
							if(d.responseJSON.thumbnail_id){
								merlin.dom.find('img.proj').attr('src',app.app_page.media_root+'images/'+(d.responseJSON.thumbnail_id % 10)+'/'+d.responseJSON.thumbnail_id+'.png');
								merlin.options.data.image = d.responseJSON.thumbnail_id;
							}
						});
						tc.jQ('.foothills a.back').hide();
					},
					finish:function(merlin,dom){
						tc.jQ('.foothills a.back').show();
						
						tc.util.dump(merlin.current_step.inputs);
						
						function val_escape_hints($input) {
							if ($input.hasClass("has-been-focused")) {
								return $input.val();
							}
							return "";
						}
						
						merlin.options.data = tc.jQ.extend(merlin.options.data,{
							title: merlin.current_step.inputs.title.dom.val(),
							organization: val_escape_hints(merlin.current_step.inputs.organization.dom),
							text: merlin.current_step.inputs.description.dom.val(),
							keywords: val_escape_hints(merlin.current_step.inputs.keywords.dom),
							main_text:merlin.current_step.inputs.main_text.dom.val()
						});
					}
				},
				'location':{
					progress_selector:'.2',
					selector:'.step.location',
					prev_step:'start',
					next_step:'check-projects-process',
					title:'Turn ideas into solutions',
					sub_title:'We want to connect you with people<br />and resources in your area!',
					use_for_history:true,
					step_data:{},
					inputs:{
						location:{
							selector:'.location-group',
							validators:tc.locationDropdown.validator,
							hint:'Start typing neighborhood or borough...'
						}
					},
					init:function(merlin,dom){
						if(!merlin.current_step.step_data.locationDropdown){
							merlin.current_step.step_data.locationDropdown = new tc.locationDropdown({
								radios:dom.find('input[type=radio]'),
								input:dom.find('input.location-hood-enter'),
								list:dom.find('div.location-hood-list'),
								warning:dom.find('span.error'),
								locations:merlin.app.app_page.data.locations
							});
						}
					},
					finish:function(merlin,dom){
						merlin.options.data = tc.jQ.extend(merlin.options.data,{
							location_id:merlin.current_step.step_data.locationDropdown.getLocation()
						});
					}
				},
				'check-projects-process':{
					title:'Let&rsquo;s check for similar projects.',
					sub_title:'Starting something new is great, but there<br />may already be a project you\'d like to join. <br />Take a look at these others.',
					progress_selector:'.3',
					selector:'.step.check-projects-process',
					prev_step:'location',
					next_step:null,
					init:function(merlin,dom){
						tc.jQ.ajax({
							url:'/create/similar',
							data:merlin.options.data,
							context:merlin,
							dataType:'text',
							success:function(data,ts,xhr){
								var d;
								try{
									d = tc.jQ.parseJSON(data);
								}catch(e){
									window.location.hash = 'check-nosimilar';
									return;
								}
								if(d.projects.length){
									this.options.steps['check-projects'].step_data = d;
									window.location.hash = 'check-projects';
								} else {
									window.location.hash = 'check-nosimilar';
								}
							}
						});
					}
				},
				'check-projects':{
					title:'Let\'s check for similar projects.',
					sub_title:'Starting something new is great, but there<br />may already be a project you\'d like to join. <br />Take a look at these others.',
					progress_selector:'.3',
					selector:'.step.check',
					prev_step:'location',
					next_step:'add-resource-process',
					use_for_history:true,
					step_data:{},
					init:function(merlin,dom){
						var tbody;
						
						tbody = "<tbody>";
						tc.jQ.each(merlin.current_step.step_data.projects, function(i, project) {
							var temp, position, tempImgPath;
							temp = "";
							position = i % 3;
							if(position == 0){
								temp = "<tr>";
							}
							if (project.image_id > 0) {
								tempImgPath = app.app_page.media_root + 'images/'+(project.image_id % 10)+'/'+project.image_id+'.png'
							} else {
								tempImgPath = '/static/images/thumb_genAvatar50.png'
							}
							temp += "<td>";
							temp += '<div class="thumb">'+
										'<a href="/project/'+project.project_id+'"><img width="50" height="50" src="'+tempImgPath+'" alt="" class="proj"/></a>'+
										'<span class="overlay-tag"></span>'+
										'<span class="member-count">'+project.num_members+'</span>'+
									'</div>'+
									'<div class="project-info">'+
										'<span class="link"><a href="/project/'+project.project_id+'">'+tc.truncate(project.title,50)+'</a></span>'+
										'<span class="creator"><em>Created by </em> <a href="/useraccount/'+project.owner_user_id+'">'+project.owner_first_name+' '+project.owner_last_name+'</a></span>'+
										'<span class="description"><a href="/project/'+project.project_id+'">'+tc.truncate(project.description,65)+'</a></span>'+
									'</div>';
							temp += "</td>";
							if (position == 2) { temp += "</tr>"; }
							tbody += temp;
						});
						tbody += "</tbody>";
						tbody = tc.jQ(tbody);
						
						
						tc.util.dump('table');
						tc.util.dump(dom.find('table.projects-list'));
						dom.find('table.projects-list').children().remove();
						dom.find('table.projects-list').append(tbody);
					}
				},
				'check-nosimilar':{
					title:'Let\'s check for similar projects.',
					sub_title:'Starting something new is great, but there<br />may already be a project you\'d like to join. <br />Take a look at these others.',
					progress_selector:'.3',
					selector:'.step.check-nosimilar',
					prev_step:'location',
					next_step:'add-resource-process'
				},
				'add-resource-process':{
					title:'Add a resource.',
					sub_title:'When you add a resource, we\'ll send them a link <br />to your project page. If they\'re able to help, they\'ll <br />send you a message.',
					progress_selector:'.4',
					selector:'.step.add-resource-process',
					prev_step:'check',
					next_step:null,
					init:function(merlin,dom){
						tc.jQ.ajax({
							url:'/create/resources',
							data:merlin.options.data,
							context:merlin,
							dataType:'text',
							success:function(data,ts,xhr){
								var d;
								try{
									d = tc.jQ.parseJSON(data);
								}catch(e){
									window.location.hash = 'add-noresources';
									return;
								}
								if(d.resources.length){
									this.options.steps['add'].step_data = d;
									window.location.hash = 'add';
								} else {
									window.location.hash = 'add-noresources';
								}
							}
						});
					}
				},
				'add':{
					title:'Add a resource.',
					sub_title:'When you add a resource, we\'ll send them a link <br />to your project page. If they\'re able to help, they\'ll <br />send you a message.',
					progress_selector:'.4',
					selector:'.step.add',
					prev_step:'check',
					next_step:'finish',
					use_for_history:true,
					init:function(merlin,dom){
						var tbody;
						
						if(!merlin.options.components.organization_tooltip){
							merlin.options.components.organization_tooltip = tc.resource_tooltip({
								triggers: this.dom.find(".resources-list .tooltip_trigger"),
								trigger_class:'tooltip_trigger',
								markup_source_element:tc.jQ('#organization-markup-source'),
								get_url: "/project/resource/info"
							});
						} else {
							merlin.options.components.organization_tooltip.clear_triggers();
						}
						
						tbody = "<tbody>";
						tc.jQ.each(merlin.current_step.step_data.resources, function(i, resource) {
							var temp, position, tempImgPath;
							temp = "";
							position = i % 3;
							if(position == 0){
								temp = "<tr>";
							}
							if (resource.image_id > 0) {
								tempImgPath = app.app_page.media_root + 'images/'+(resource.image_id % 10)+'/'+resource.image_id+'.png'
							} else {
								tempImgPath = '/static/images/thumb_genAvatar50.png'
							}
							temp += "<td class='" + (resource.is_official ? "official-resource" : "") + "'>";
							temp += '<a href="#add,'+ resource.link_id +'" class="add-button rounded-button small">Add</a>'+
								'<span class="thumb">'+
								(app.app_page.data.user.is_admin ? '<a class="close" href="#removeOrganization,'+resource.link_id+'"><span>Close</span></a>' : '')+
								'<img width="35" src="'+tempImgPath+'" alt="" /></span>'+
								'<span class="resource-name" ><span>'+
								'<span class="organization-name tooltip_trigger" rel="#organization,'+ resource.link_id +'">'+ 
									resource.title +
								'</span></span></span>';
							// hidden added dialog
							temp += '<div class="added-dialog">'+
								'<span class="added-header">Added <em>to</em> your project</span><br />'+
								'<span class="added-text">We\'ve sent them a link to your project page.'+
								' </span></div>';
							temp += "</td>";
							if (position == 2) { temp += "</tr>"; }
							tbody += temp;
						});
						tbody += "</tbody>";
						tbody = tc.jQ(tbody);
						
						tbody.find('.add-button').bind('click',{merlin:merlin},function(e){
							e.preventDefault();
							var existing_orgs, $t;
							
							$t = tc.jQ(this);
							
							if($t.hasClass('added')){
								return;
							}
							
							$t.addClass('added');
							
							if(!e.data.merlin.options.data.resources){
								existing_orgs = [];
							} else {
								existing_orgs = e.data.merlin.options.data.resources.split(',');
							}
							
							if (tc.jQ.inArray(e.target.hash.split(',')[1], existing_orgs) == -1) {
								existing_orgs.push(e.target.hash.split(',')[1]);
							}
							
							e.data.merlin.current_step.dom.find('.resource-count').text(existing_orgs.length);
							e.data.merlin.options.data.resources = existing_orgs.join(',');
							$t.animate({
								opacity:0.0
							},400,'easeOutCirc',function(e){
								$t.parent().addClass('added');
							});
						});
						
						tbody.find('.close').unbind('click').bind('click', {merlin:merlin}, function(e){
							//e.data.project.options.app.components.modal.show({
							//	app:e.data.project.options.app,
							//	source_element:tc.jQ('.modal-content.remove-resource'),
							//	submit:function(){
							//		tc.jQ.ajax({
							//			type:'POST',
							//			url:'/admin/resource/delete',
							//			data:{
							//				resource_id: e.target.href.split(',')[1]
							//			},
							//			context:e,
							//			dataType:'text',
							//			success:function(data,ts,xhr){
							//				if(data == 'False'){
							//					return false;
							//				}
							//				tc.jQ(this.target).parent().parent().animate({
							//					'opacity':0.0
							//				},600,'easeOutCubic');
							//			}
							//		});
							//	}
							//});
						});
						
						
						merlin.options.components.organization_tooltip.add_trigger(tbody.find('.organization-name'));
						
						tc.util.dump('table');
						tc.util.dump(dom.find('table.resources-list'));
						dom.find('table.resources-list').children().remove();
						dom.find('table.resources-list').append(tbody);
						
						tc.addOfficialResourceTags(tc.jQ('table.resources-list'));
					}
				},
				'add-noresources':{
					title:'Add a resource.',
					sub_title:'When you add a resource, we\'ll send them a link <br />to your project page. If they\'re able to help, they\'ll <br />send you a message.',
					progress_selector:'.4',
					selector:'.step.add-noresources',
					prev_step:'check',
					next_step:'finish'
				},
				'finish':{
					title:'Thank you!',
					sub_title:'Thank you for adding a project.',
					progress_selector:'.4',
					selector:'step.finish',
					prev_step:null,
					next_step:null,
					init:function(merlin,dom){
						tc.jQ.ajax({
							type:'POST',
							url:'/create',
							data:merlin.options.data,
							context:merlin,
							dataType:'text',
							success:function(data,ts,xhr){
								if(data == 'False'){
									return false;
								}
								window.location = '/project/'+data;
							}
						});
					}
				}
			}
		});
		
		// turn location field autocomplete off
		tc.jQ('#location-hood-enter').attr('autocomplete', 'off');
		
	});
	