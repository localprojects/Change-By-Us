app_page.features.push(function(app){
		tc.util.log('Give A Minute: Search');
		
		function changeListCat(theCat) {
			tc.jQ('.results-box').removeClass('single');
			tc.jQ('ul.tabs .tab-map').removeClass('active');
			tc.jQ('ul.tabs .tab-list').addClass('active');
			tc.jQ('.sidebar').children('.sidebar-item').removeClass('active');
			tc.jQ('.sidebar').children('.'+theCat).addClass('active');
			tc.jQ('#list-view').removeClass('all projects resources ideas').addClass(theCat);
			tc.jQ('.results-'+theCat).addClass('single').find('.carousel').trigger('make-single');
			tc.jQ('.results-box').not('.single').find('.carousel').trigger('make-multiple');
		};
		
		tc.jQ('.search-terms-container a.clear-field').bind('click',{input:tc.jQ('input.search-terms')},function(e){
			e.preventDefault();
			e.data.input.val('').trigger('change');
		});
		
		tc.jQ('.search-hood-container a.clear-field').bind('click',{input:tc.jQ('input.location-hood-enter')},function(e){
			e.preventDefault();
			e.data.input.attr('location_id','-1').val('All neighborhoods').trigger('change');
		});
		
		tc.jQ('input.search-terms, input.search-location').bind('change', {}, function(e){
			if(e.target.value.length == 0 || (e.target.className.indexOf('search-location') != -1 && e.target.value == 'All neighborhoods')){
				tc.jQ(this).siblings('a.clear-field').hide();
			} else {
				tc.jQ(this).siblings('a.clear-field').show();
			}
		}).trigger('change');
		
		
		tc.jQ('input.search-submit').bind('click',{terms:tc.jQ('input.search-terms'),location:tc.jQ('input.location-hood-enter')},function(e){
			e.preventDefault();
			//if(e.data.terms.val().length){
				if(e.data.location.attr('location_id')){
					window.location = '/search?terms='+e.data.terms.val()+'&location_id='+e.data.location.attr('location_id');
				} else {
					window.location = '/search?terms='+e.data.terms.val();
				}
			//}
		});
		
		new tc.locationDropdown({
			input:tc.jQ('input.location-hood-enter'),
			list:tc.jQ('div.location-hood-list'),
			locations:app.app_page.data.locations
		});
		
		function build_carousel(app,name,data){
			var mycarousel, data, fn;
			
			mycarousel = app.components[name+'_carousel'];
			
			if(mycarousel && mycarousel.carousel){
				return;
			}
				
			app.components[name+'_carousel'] = new tc.carousel({
				element: tc.jQ("."+name+".carousel"),
				next_button: tc.jQ('.'+name+'-carousel-next'),
				prev_button: tc.jQ('.'+name+'-carousel-prev'),
				scrollable: {
					items: ".items",
					speed: 300,
					circular: false
				}
			});
			
			mycarousel = app.components[name+'_carousel'];
			
			if(!mycarousel.carousel){
				tc.jQ("."+name+".carousel").one('make-single make-multiple',{app:app},function(e){
					build_carousel(e.data.app);
				});
				app.components[name+'_carousel'] = null;
				mycarousel = null;
			} else {
				
				app.components[name+'_carousel'].data = data;
				
				tc.jQ("."+name+".carousel").bind('make-single make-multiple',{app:app, carousel:mycarousel},function(e){
					var target_height;
					target_height = tc.jQ(e.data.carousel.carousel.getItems()[e.data.carousel.carousel.getIndex()]).height()+'px';
					e.data.carousel.get_element().css('height',target_height).children('.scrollable').css('height',target_height);
				});
				
				mycarousel.carousel.getRoot().unbind('onSeek').bind('onSeek', {app:app, carousel:mycarousel}, function(e,d){
					e.data.carousel.data.current_page = e.data.carousel.carousel.getItems().eq(e.data.carousel.carousel.getIndex());
					e.data.carousel.get_element().parent().parent().find('.current_page_number').text(e.data.carousel.carousel.getIndex()+1);
					
					if(e.data.carousel.data.current_page.hasClass('loaded')){
						
						var target_height;
						switch(name){
							case 'idea':
								if(e.data.carousel.data.current_page.find('.none-found-message').length){
									target_height = '30';
								} else {
									target_height = '625';
								}
								
								break;
							default:
								target_height = tc.jQ(e.data.carousel.carousel.getItems()[e.data.carousel.carousel.getIndex()]).height()+'px';
								break;
						}
						e.data.carousel.get_element().css('height',target_height).children('.scrollable').css('height',target_height);
						
					} else {
						e.data.carousel.data.current_page.addClass('loaded');
						tc.jQ.ajax({
							type:"GET",
							url:"/search/"+name+"s",
							data:{ 
								location_id: e.data.carousel.data.location_input.attr('location_id'),
								terms: e.data.carousel.data.terms_input.val(),
								n: e.data.carousel.data.n_to_fetch,
								offset: e.data.carousel.data.offset
							},
							context:e.data.app,
							dataType:"text",
							success: function(data, ts, xhr) {
								var d, target_height, dom;
								try {
									d = tc.jQ.parseJSON(data);
								} catch(e) {
									tc.util.log("/search/"+name+"s: json parsing error", "warn");
									return;
								}
								
								e.data.carousel.data.current_page.removeClass('spinner-message').children().remove();
								
								tc.util.log(d.results);
								
								if(!d.results.length && e.data.carousel.data.offset > 0){
									e.data.carousel.data.current_page.remove();
									return;
								}
								
								e.data.carousel.data.offset += d.results.length;
								
								if(d.results.length == e.data.carousel.data.n_to_fetch){
									e.data.carousel.carousel.addItem('\
										<li class="project-carousel-item clearfix spinner-message">\
											<div class="spinner-container"></div>\
										</li>');
								}
								
								dom = e.data.carousel.data.page_generator(d);
								e.data.carousel.data.current_page.append(dom);
								if(tc.jQ.isFunction(e.data.carousel.data.appended)){
									e.data.carousel.data.appended(dom);
								}
								switch(name){
									case 'idea':
										target_height = '625';
										break;
									default:
										target_height = tc.jQ(e.data.carousel.carousel.getItems()[e.data.carousel.carousel.getIndex()]).height()+'px';
										break;
								}
								e.data.carousel.get_element().css('height',target_height).children('.scrollable').css('height',target_height);
							}
						});
					}
					
				});
				
				mycarousel.carousel.begin();
			}
			
		};
		
		build_carousel(app, 'project', {
			current_section:null,
			current_page:null,
			n_to_fetch: 6,
			offset:6,
			location_input:tc.jQ('#location-hood-enter'),
			terms_input:tc.jQ('input.search-terms'),
			page_generator:function(d){
				var out, i, temprow, tempcell;
				
				out = tc.jQ('<table class="projects-list doublewide clearfix">\
					<tbody></tbody>\
				</table>');
				
				for(i = 0; i < d.results.length; i++){
					if(i%2==0){
						temprow = tc.jQ('<tr></tr>');
					}
					tempcell = tc.jQ('<td></td>').append(tc.jQ('.template-content.project-cell').html());
					tempcell.find('.delete-project').attr('href','#removeProject,'+d.results[i].project_id);
					if(d.results[i].image_id){
						tempcell.find('img').attr('src','/images/'+d.results[i].image_id%10+'/'+d.results[i].image_id+'.png');
					} else {
						tempcell.find('img').attr('src','/static/images/thumb_genAvatar50.png');
					}
					tempcell.find('.member-count').text(d.results[i].num_members);
					tempcell.find('.link').children('a').attr('href','/project/'+d.results[i].project_id).text(d.results[i].title);
					tempcell.find('.creator').children('a').attr('href','/useraccount/'+d.results[i].owner.u_id).text(d.results[i].owner.name);
					tempcell.find('.description').children('a').attr('href','/project/'+d.results[i].project_id).text(d.results[i].description);
					temprow.append(tempcell);
					if(i%2==1){
						out.children('tbody').append(temprow);
					}
				}
				
				out.find('a.delete-project').bind('click',{app:app},app.components.handlers.delete_project_handler);
				
				return out;
			}
		});
		
		build_carousel(app, 'resource', {
			current_section:null,
			current_page:null,
			n_to_fetch: 6,
			offset:6,
			location_input:tc.jQ('#location-hood-enter'),
			terms_input:tc.jQ('input.search-terms'),
			page_generator:function(d){
				var out, i, temprow, tempcell;
				out = tc.jQ('<table class="resources-list triplewide clearfix">\
					<tbody></tbody>\
				</table>');
				
				for(i = 0; i < d.results.length; i++){
					if(i%3==0){
						temprow = tc.jQ('<tr></tr>');
					}
					tempcell = tc.jQ('<td class="' + (d.results[i].is_official ? "official-resource" : "") + '"></td>').append(tc.jQ('.template-content.resource-cell').html());
					tempcell.find('.add-button').attr('href','#addProject,'+d.results[i].link_id);
					if(d.results[i].image_id){
						tempcell.find('img').attr('src','/images/'+(d.results[i].image_id%10)+'/'+d.results[i].image_id+'.png')
					}
					tempcell.find('.resource-tooltip_trigger').attr('rel','#organization,'+d.results[i].link_id);
					tempcell.find('a.resource_link').attr('href',d.results[i].url).children('span').text(tc.truncate(d.results[i].title,28,'...'));
					
					temprow.append(tempcell);
					if(i%3==1){
						out.children('tbody').append(temprow);
					}
				}
				
				out.find('a.add-resource').bind('click',app.components.handlers.add_resource_data,app.components.handlers.add_resource_hander);
				out.find('a.delete-resource').bind('click', {app:app}, app.components.handlers.delete_resource_handler);
				app.components.tooltips.add_trigger(out.find('.resource-tooltip_trigger'));
				return out;
			},
			appended:function(dom){
				tc.addOfficialResourceTags(dom);
			}
		});
		
		build_carousel(app, 'idea', {
			current_section:null,
			current_page:null,
			n_to_fetch: 6,
			offset:6,
			location_input:tc.jQ('#location-hood-enter'),
			terms_input:tc.jQ('input.search-terms'),
			page_generator:function(d){
				var out, i, temprow, tempcell;
				out = tc.jQ('<ul class="ideas-list clearfix" style="width:805px;"></ul>');
				
				for(i = 0; i < d.results.length; i++){
					tempcell = tc.jQ('<li></li>').append(tc.jQ('.template-content.idea-cell').html());
					
					if(d.results[i].owner){
						tempcell.find('.invite').attr('href','#invite,'+d.results[i].idea_id+','+d.results[i].owner.u_id);
						tempcell.find('.user-link').attr('href','/useraccount/'+d.results[i].owner.u_id).text(d.results[i].owner.name);
					} else {
						tempcell.find('cite.note-meta-hd').remove();
						tempcell.find('blockquote').prepend('<span class="topright-spacer"></span>');
					}
					tempcell.find('.flag-idea').attr('href','#flagIdea,'+d.results[i].idea_id);
					tempcell.find('.remove-idea').attr('href','#removeIdea,'+d.results[i].idea_id);
					
					tempcell.find('.idea-text').text(d.results[i].message);
					tempcell.find('.time-since').text(d.results[i].created);
					tempcell.find('.sub-type').text(d.results[i].submssion_type);
					
					out.append(tempcell);
				}
				
				out.find('a.flag-idea').bind('click', {app:app}, app.components.handlers.flag_idea_handler);
				out.find('a.remove-idea').bind('click', {app:app}, app.components.handlers.remove_idea_handler);
				tc.gam.ideas_invite(app, out.find('a.invite'));
				
				return out;
			}
		});
		
		
		app.components.merlin = new tc.merlin(app,{
			dom:tc.jQ('.merlin'),
			first_step:'all',
			allow_hash_override_onload:true,
			steps:{
				'all':{
					selector:'#list-view',
					init:function(merlin,dom){
						changeListCat('all')
					}
				},
				'projects':{
					selector:'#list-view',
					init:function(merlin,dom){
						changeListCat('projects');
					}
				},
				'resources':{
					selector:'#list-view',
					init:function(merlin,dom){
						changeListCat('resources');
					}
				},
				'ideas':{
					selector:'#list-view',
					init:function(merlin,dom){
						changeListCat('ideas');
					}
				},
				'map':{
					selector:'#map-view',
					init:function(merlin,dom){
						google.maps.event.trigger(map, 'resize');
						map.setCenter(brooklyn);
						tc.jQ('ul.tabs .tab-list').removeClass('active');
						tc.jQ('ul.tabs .tab-map').addClass('active');
					}
				}
			}
		});
		
		app.components.tooltips = tc.resource_tooltip({
			triggers: tc.jQ(".resource-tooltip_trigger"),
			trigger_class:'resource-tooltip_trigger',
			markup_source_element: tc.jQ('#organization-markup-source'),
			get_url: "/project/resource/info"
		});
		
		tc.gam.ideas_invite( app, tc.jQ('a.invite'));
		
		
		app.components.handlers = {
			add_resource_data:{
				app:app,
				source_element:tc.jQ('.modal-content.add-resource'),
				init:function(modal,event_target,callback){
					var modal_merlin;
					modal_merlin = new tc.merlin(app,{
						name:'add-resource',
						dom:modal.options.element.find('.add-resource'),
						next_button: tc.jQ('a.submit'),
						first_step: 'add-resource-project-info',
						data:{
							project_id: null,
							project_resource_id: null
						},
						steps:{
							'add-resource-project-info':{
								selector:'.add-resource-project-info',
								next_step:'add-resource-submit',
								inputs:{
									project_radios:{
										selector:'.project-radio',
										vallidators:['required']
									}
								},
								init: function(merlin, dom) {
									var name;
								
									dom.find('input[type=checkbox],input[type=radio]').prettyCheckboxes();
								
									if(dom.find('.project-radio').length == 1){
										dom.find('.project-radio').first().attr('checked',true);
										//window.location.hash = 'add-resource,add-resource-submit';
									}
							
								},
								finish: function(merlin, dom) {
									if(merlin.current_step.inputs.project_radios.dom.filter(":checked").length){
										merlin.options.data = tc.jQ.extend(merlin.options.data, {
											project_id: merlin.current_step.inputs.project_radios.dom.filter(":checked").attr("rel").split(",")[1],
											project_resource_id: event_target.hash.split(',')[1]
										});
									}
								}
							},
							'add-resource-submit':{
								selector:'.add-resource-submit',
								init: function(merlin, dom) {
								
								
									tc.jQ.ajax({
										type:"POST",
										url:"/project/resource/add",
										data:merlin.options.data,
										context:merlin,
										dataType:"text",
										success: function(data, ts, xhr) {
											//if (data == "False") {
											//	return false;
											//}
											//tc.jQ(event_target).addClass("disabled").text("Added");
											tc.jQ(event_target).parents('td').addClass('added');
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
			},
			add_resource_hander:function(e,d){
				e.preventDefault();
				e.data.app.components.modal.show(e.data, e.target);
			},
			flag_idea_handler:function(e){
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
			},
			remove_idea_handler:function(e){
				e.preventDefault();
				var $t;
				$t = tc.jQ(e.target);
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
							context:$t,
							dataType:'text',
							success:function(data,ts,xhr){
								if(data == 'False'){
									return false;
								}
								this.parents('.results-ideas').find('.counter.active').text((Number(this.parents('.results-ideas').find('.counter.active').text()) - 1));
								this.parent().parent().parent().animate({
									width:0
								}, 400, 'easeOutCubic', function(e,d){
									tc.jQ(this).hide();
								}).remove();
								tc.jQ('ul.ideas-list li').removeClass('every-third').filter(function(index) {
									return index % 3 == 2;
								}).addClass('every-third');
							}
						});
					}
				});
			},
			delete_resource_handler:function(e){
				e.preventDefault();
				var $t;
				$t = tc.jQ(e.target);
				e.data.app.components.modal.show({
						app:e.data.app,
						source_element:tc.jQ('.modal-content.remove-resource'),
						submit:function(){
							tc.jQ.ajax({
								type:'POST',
								url:'/admin/resource/delete',
								data:{
									resource_id: e.target.hash.split(',')[1]
								},
								context:$t,
								dataType:'text',
								success:function(data,ts,xhr){
									location.reload(true);
								}
							});
						}
					});
			},
			delete_project_handler:function(e,d){
				var t;
				e.preventDefault();
				t = e.target;
				if(t.nodeName == 'SPAN'){
					t = t.parentNode;
				}
				e.data.app.components.modal.show({
					app:app,
					source_element:tc.jQ('.modal-content.project-delete'),
					submit:function(modal,callback){
						tc.jQ.ajax({
							type:'POST',
							url:'/admin/project/delete',
							data:{
								project_id:t.hash.split(',')[1]
							},
							context:app,
							dataType:'text',
							success:function(data,ts,xhr){
								location.reload(true);
							}
						});
					}
				});
			}
		};
		
		tc.jQ('a.add-resource').bind('click',app.components.handlers.add_resource_data,app.components.handlers.add_resource_hander);
		tc.jQ('a.flag-idea').bind('click', {app:app}, app.components.handlers.flag_idea_handler);
		tc.jQ('a.remove-idea').bind('click', {app:app}, app.components.handlers.remove_idea_handler);
		tc.jQ('a.delete-resource').bind('click', {app:app}, app.components.handlers.delete_resource_handler);
		tc.jQ('a.delete-project').bind('click',{app:app},app.components.handlers.delete_project_handler);
		
		// turn location field autocomplete off
		tc.jQ('#location-hood-enter').attr('autocomplete', 'off');
		
		// random note-card backgrounds
		var ideasList = tc.jQ('.ideas-list li');
		for (i=0; i < ideasList.length; i++) {
			ideasList.eq(i).children('.note-card').addClass('card' + (Math.floor(Math.random()*4) + 1));
		}
		
		tc.addOfficialResourceTags(tc.jQ('table.resources-list'));
		
	});