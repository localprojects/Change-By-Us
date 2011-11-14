/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/
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
			switch(theCat){
				case 'resources':
					if(app.components['resource_carousel']){
						app.components['resource_carousel'].carousel.seekTo(0);
					}
					break;
				case 'projects':
					if(app.components['project_carousel']){
						app.components['project_carousel'].carousel.seekTo(0);
					}
					break;
				case 'ideas':
					if(app.components['idea_carousel']){
						app.components['idea_carousel'].carousel.seekTo(0);
					}
					break;
			}
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
						
						
						single_page = false;
						switch(name){
							case 'project':
							case 'resource':
								if(e.data.carousel.data.current_page.find('td').length < e.data.carousel.data.n_to_fetch){
									single_page = true;
								}
								break;
							case 'idea':
								if(e.data.carousel.data.current_page.find('li').length < e.data.carousel.data.n_to_fetch){
									single_page = true;
								}
								break;
						}
						if(single_page){
							e.data.carousel.data.current_page.next().remove();
							if(e.data.carousel.carousel.getItems().length == 1){
								//uncomment to hide pagniation controls.
								//e.data.carousel.get_element().parent().parent().find('.pagination-controls.'+name).hide();
							}
						}
						
					} else {
						e.data.carousel.data.current_page.addClass('loaded');
						tc.jQ.ajax({
							type:"GET",
							url:"/search/"+name+"s",
							data:{ 
								location_id: e.data.carousel.data.location_input.attr('location_id'),
								terms: e.data.carousel.data.terms_input.val(),
								n: (e.data.carousel.data.n_to_fetch + 1),
								offset: e.data.carousel.data.offset
							},
							context:e.data.carousel,
							dataType:"text",
							success: function(data, ts, xhr) {
								var d, target_height, dom;
								try {
									d = tc.jQ.parseJSON(data);
								} catch(e) {
									tc.util.log("/search/"+name+"s: json parsing error", "warn");
									return;
								}
								
								if(!d.results.length && this.data.offset > 0){
									//no items, and we are on page > 0
									this.data.current_page.remove();
								} else if(!d.results.length && this.data.offset == 0){
									//no items, and we are on page 0
									this.data.current_page.children('ul').append('<li><p>No Results.</p></li>');
								} else if(d.results.length == (this.data.n_to_fetch + 1)) {
									//full of items, and more. we DO have another page.
							
									//lets pop off the extra one.
									d.results.pop();
							
									this.carousel.addItem('\
										<li class="project-carousel-item clearfix spinner-message">\
											<div class="spinner-container"></div>\
										</li>');
								}
								
								
								this.data.current_page.removeClass('spinner-message').children().remove();
								this.data.offset += d.results.length;
								dom = this.data.page_generator(d);
								this.data.current_page.append(dom);
								
								if(tc.jQ.isFunction(this.data.appended)){
									this.data.appended(dom);
								}
								
								switch(name){
									case 'idea':
										target_height = '625';
										break;
									default:
										target_height = tc.jQ(this.carousel.getItems()[this.carousel.getIndex()]).height()+'px';
										break;
								}
								this.get_element().css('height',target_height).children('.scrollable').css('height',target_height);
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
				
				out = tc.jQ('<table style="' + ( isMsie8orBelow ? 'width:763px;' : '' ) + '" class="projects-list doublewide clearfix">\
					<tbody></tbody>\
				</table>');
				
				for(i = 0; i < d.results.length; i++){
					if(i%2==0){
						temprow = tc.jQ('<tr style="width:763px;"></tr>');
					}
					tempcell = tc.jQ('<td style="width:361px;"></td>').append(tc.jQ('.template-content.project-cell').html());
					tempcell.find('.delete-project').attr('href','#removeProject,'+d.results[i].project_id);
					if(d.results[i].image_id > -1){
						tempcell.find('img').attr('src',app.app_page.media_root + 'images/'+d.results[i].image_id%10+'/'+d.results[i].image_id+'.png');
					} else {
						tempcell.find('img').attr('src','/static/images/thumb_genAvatar50.png');
					}
					tempcell.find('.member-count').text(d.results[i].num_members);
					tempcell.find('.link').children('a').attr('href','/project/'+d.results[i].project_id).text( tc.truncate(d.results[i].title, 50, "...") );
					tempcell.find('.creator').children('a').attr('href','/useraccount/'+d.results[i].owner.u_id).text(d.results[i].owner.name);
					tempcell.find('.description').children('a').attr('href','/project/'+d.results[i].project_id).text( tc.truncate(d.results[i].description, 70, "...") );
					temprow.append(tempcell);
					if(i%2==1){
						out.children('tbody').append(temprow);
					}
				}
				
				out.find('a.delete-project').bind('click',{app:app},app.components.handlers.delete_project_handler);
				
				tempcell.find('tr:last').addClass('last-row');
				
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
				out = tc.jQ('<table style="' + ( isMsie8orBelow ? 'width:763px;' : '' ) + '" class="resources-list triplewide clearfix">\
					<tbody></tbody>\
				</table>');
				
				for(i = 0; i < d.results.length; i++){
					if(i%3==0){
						temprow = tc.jQ('<tr style="width:763px;" ></tr>');
					}
					tempcell = tc.jQ('<td  style="width:227px;" class="' + (d.results[i].is_official ? "official-resource" : "") + '"></td>').append(tc.jQ('.template-content.resource-cell').html());
					tempcell.find('.add-button').attr('href','#addProject,'+d.results[i].link_id);
					if(d.results[i].image_id){
						tempcell.find('img').attr('src',app.app_page.media_root + 'images/'+(d.results[i].image_id%10)+'/'+d.results[i].image_id+'.png')
					}
					tempcell.find('.resource-tooltip_trigger').attr('rel','#organization,'+d.results[i].link_id);
					tempcell.find('.delete-resource').attr('href','#removeResource,'+d.results[i].link_id);
					tempcell.find('a.resource_link').attr('href',d.results[i].url).children('span').text(tc.truncate(d.results[i].title,25,'...'));
					
					if (d.results[i].is_official == 1) {
						tempcell.find('.official-resource-alt').attr('style','display:block');
					};
										
					temprow.append(tempcell);
					if(i%3==1){
						out.children('tbody').append(temprow);
					}
				}
				
				//out.find('a.add-button').bind('click', app.components.handlers.add_resource_data, app.components.handlers.add_resource_hander);
				tc.gam.add_resource(app, {elements: out.find("a.add-resource")});
				
				out.find('a.delete-resource').bind('click', {app:app}, app.components.handlers.delete_resource_handler);
				app.components.tooltips.add_trigger(out.find('.resource-tooltip_trigger'));
				
				tempcell.find('tr:last').addClass('last-row');
				
				return out;
			},
			appended:function(dom){
				//tc.addOfficialResourceTags(dom);
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
						if (app.user && app.user.u_id === d.results[i].owner.u_id) {
							tempcell.find('.invite').remove();
						} else { 
							tempcell.find('.invite').attr('href','#invite,'+d.results[i].idea_id+','+d.results[i].owner.name);
						}
						tempcell.find('.user-link').attr('href','/useraccount/'+d.results[i].owner.u_id).text(tc.truncate(d.results[i].owner.name, 18, "..."));
					} else {
						tempcell.find('.invite').attr('href','#invite,'+d.results[i].idea_id);	
						tempcell.find('cite.note-meta-hd').remove();
						tempcell.find('blockquote').prepend('<span class="topright-spacer"></span>');
					}
					tempcell.find('.flag-idea').attr('href','#flagIdea,'+d.results[i].idea_id);
					tempcell.find('.remove-idea').attr('href','#removeIdea,'+d.results[i].idea_id);
					
					tempcell.find('.idea-text').text( tc.truncate(d.results[i].message, 165, "...") );
					tempcell.find('.time-since').text(d.results[i].created);
					tempcell.find('.sub-type').text(d.results[i].submission_type);
					
					tempcell.find('.note-card').addClass('card' + (Math.floor(Math.random()*4) + 1));
					
					out.append(tempcell);
				}
				
				out.find('a.flag-idea').bind('click', {app:app}, app.components.handlers.flag_idea_handler);
				out.find('a.remove-idea').bind('click', {app:app}, app.components.handlers.remove_idea_handler);
				tc.gam.ideas_invite(app, {elements: out.find('a.invite')});
				
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
		
		tc.gam.ideas_invite(app, {elements: tc.jQ('a.invite')});
		
		
		app.components.handlers = {
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
								var newcount;
								if(data == 'False'){
									return false;
								}
								newcount = (Number(this.parents('.results-ideas').find('.counter.active').text()) - 1);
								this.parents('.results-ideas').find('.counter.active').text(newcount);
								tc.jQ('.sidebar-item.ideas .counter').text(newcount);
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
				$t = tc.jQ(this);
				e.data.app.components.modal.show({
					app:e.data.app,
					source_element:tc.jQ('.modal-content.remove-resource'),
					submit:function(){
						tc.jQ.ajax({
							type:'POST',
							url:'/admin/resource/delete',
							data:{
								resource_id: $t.attr("href").split(',')[1]
							},
							context:$t,
							dataType:'text',
							success:function(data,ts,xhr){
								if(data == 'False'){
									return false;
								}
								window.location.reload(true);
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
								if(data == 'False'){
									return false;
								}
								location.reload(true);
							}
						});
					}
				});
			}
		};
		
		tc.jQ('a.flag-idea').bind('click', {app:app}, app.components.handlers.flag_idea_handler);
		tc.jQ('a.remove-idea').bind('click', {app:app}, app.components.handlers.remove_idea_handler);
		tc.jQ('a.delete-resource').bind('click', {app:app}, app.components.handlers.delete_resource_handler);
		tc.jQ('a.delete-project').bind('click',{app:app},app.components.handlers.delete_project_handler);
		tc.gam.add_resource(app, {elements: tc.jQ("a.add-resource")});
		
		// turn location field autocomplete off
		tc.jQ('#location-hood-enter').attr('autocomplete', 'off');
		
		// random note-card backgrounds
		tc.randomNoteCardBg(tc.jQ('.ideas-list'));
		
	});