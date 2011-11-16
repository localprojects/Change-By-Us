/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

app_page.features.push(function(app){
	tc.util.log('Give A Minute: Content');
	
	app.components.merlin = new tc.merlin(app,{
		name:'admin-content',
		dom:tc.jQ('.merlin'),
		first_step:'featuredprojects',
		steps:{
			'featuredprojects':{
				selector:'#featured-projects',
				init:function(merlin,dom){
					tc.jQ('.headlands .tabs li.featured-projects').addClass('active').siblings().removeClass('active');
					dom.find(".featured-projects-table a.delete").bind("click", {
						merlin:merlin,
						dom:dom
					},
					function(e, d) {
						var row;
						row = tc.jQ(e.target).parents("tr").eq(0);
						e.preventDefault();
						e.data.merlin.app.components.modal.show({
							app: e.data.merlin.app,
							source_element: tc.jQ('.template-content.unfeature-project'),
							submit: function() {
								tc.jQ.ajax({
									type:'POST',
									url:'/admin/project/feature/delete',
									data:{
										project_id: e.target.href.split(",")[1]
									},
									context: e.data.merlin,
									dataType:'text',
									success:function(data,ts,xhr){
										var table, ordinal;
										if(data == '-1'){
											return false;
										}
										ordinal = data;
										table = row.parent().parent();
										row.remove();
										table.find("tbody").find("tr").removeClass("alt").filter(":even").addClass("alt");
									}
								});
							}
						});
					});
				}
			},
			'warninglist':{
				selector:'#warning-list',
				init:function(merlin,dom){
					tc.jQ('.headlands .tabs li.warning-list').addClass('active').siblings().removeClass('active');
					populate_content_counts();
					build_warning_carousel(merlin.app);
					window.location.hash = 'warning-content,ideas';
				}
			},
			'pendingresources':{
				selector:'#pending-resources',
				init:function(merlin,dom){
					tc.jQ('.headlands .tabs li.pending-resources').addClass('active').siblings().removeClass('active');
					build_resources_carousel(merlin.app);
				}
			},
			'sitemetrics':{
				selector:'#metrics',
				init:function(merlin,dom){
					tc.jQ('.headlands .tabs li.metrics').addClass('active').siblings().removeClass('active');
					tc.jQ.ajax({
						type:"GET",
						url:"/admin/metrics",
						context:merlin,
						dataType:"text",
						success: function(data, ts, xhr) {
							var d, i;
							try{
								d = tc.jQ.parseJSON(data);
							}catch(e){
								tc.util.dump(e);
								return;
							}
							tc.util.dump(d);
							tc.util.dump(this.current_step.dom.find('.counter.n_users'));
							this.current_step.dom.find('.counter.n-users').text(d.overall.num_users);
							this.current_step.dom.find('.counter.n-projects').text(d.overall.num_projects);
							this.current_step.dom.find('.counter.n-ideas').text(d.overall.num_ideas);
							this.current_step.dom.find('.counter.n-resources').text(d.overall.num_resources);
							
							this.current_step.dom.find('.counter.avg-project-users').text(d.overall.num_avg_users_per_project);
							this.current_step.dom.find('.counter.avg-daily-ideas').text(d.overall.num_avg_ideas_per_day);
							
							this.current_step.dom.find('.counter.total-tags').text(d.tags.num_total+' TOTAL');
							
							this.current_step.dom.find('.keyword-list').children().remove();
							for(i in d.tags.top){
								this.current_step.dom.find('.keyword-list').append('<li>\
									<span class="stats">\
										<span><span class="counter">'+d.tags.top[i].num_projects+'</span> Projects</span>\
										<span><span class="counter">'+d.tags.top[i].num_resources+'</span> Resources</span>\
									</span>\
									<h3 title="'+d.tags.top[i].word+'"><span class="serif">'+d.tags.top[i].word+'</span> <span class="counter">'+(d.tags.top[i].num_projects+d.tags.top[i].num_resources)+'</span></h3>\
								</li>');
							}
							
						}
					});
				}
			}
		}
	});
	
	app.components.warning_content_merlin = new tc.merlin(app,{
		name:'warning-content',
		steps:{
			'ideas':{
				init:function(merlin,dom){
					tc.jQ('.sidebar-item.ideas').addClass('active').siblings().removeClass('active');
					if(merlin.app.components.warning_pagination){
						merlin.app.components.warning_pagination.setContentType('idea');
					};
				}
			},
			'projects':{
				init:function(merlin,dom){
					tc.jQ('.sidebar-item.projects').addClass('active').siblings().removeClass('active');
					if(merlin.app.components.warning_pagination){
						merlin.app.components.warning_pagination.setContentType('project');
					}
				}
			},
			'project-posts':{
				init:function(merlin,dom){
					tc.jQ('.sidebar-item.project-posts').addClass('active').siblings().removeClass('active');
					if(merlin.app.components.warning_pagination){
						merlin.app.components.warning_pagination.setContentType('message');
					}
				}
			},
			'links':{
				init:function(merlin,dom){
					tc.jQ('.sidebar-item.links').addClass('active').siblings().removeClass('active');
					if(merlin.app.components.warning_pagination){
						merlin.app.components.warning_pagination.setContentType('link');
					}
				}
			}
		}
	});
	
	app.components.content_functions = {
		mark_content_ok:function(e){
			var type;
			e.preventDefault();
			type = e.target.hash.split('-')[1].split(',')[0];
			
			//TODO - simplify this switch statement with the code below,
			//after doing a security check.
			//id = type + '_id',
			//data = {};
			//data[id] = e.target.hash.split(',')[1];
			
			switch(type){
				case 'idea':
					data = {
						idea_id:    e.target.hash.split(',')[1]
					};
					break;
				case 'project':
					data = {
						project_id: e.target.hash.split(',')[1]
					};
					break;
				case 'message':
					data = {
						message_id: e.target.hash.split(',')[1]
					};
					break;
				case 'link':
					data = {
						link_id:    e.target.hash.split(',')[1]
					};
					break;
				case 'resource':
					data = {
						resource_id: e.target.hash.split(',')[1]
					};
					break;
			}
			
			data.is_official = tc.jQ(e.target).parents('.item-box').find('input.mark-official-checkbox').attr('checked');
			
			if(!data.is_official){
				data.is_official = 0;
			} else {
				data.is_official = 1;
			}
			
			tc.jQ.ajax({
				type:"POST",
				url:"/admin/"+type+"/approve",
				data:data,
				context:e,
				dataType:"text",
				success: function(data, ts, xhr) {
					if(data == 'False'){
						return;
					}
					tc.jQ(this.target).parents('.item-box').addClass('approved').slideUp();
					populate_content_counts();
					if(type == 'resource'){
						this.data.app.components.resources_pagination.data.offset--;
					} else {
						this.data.app.components.warning_pagination.data.offset--;
					}
				}
			});
			
		},
		delete_content:function(e){
			var type, modal_values, data;
			e.preventDefault();
			type = e.target.hash.split('-')[1].split(',')[0];
			
			switch(type){
				case 'idea':
					data = {
						idea_id:e.target.hash.split(',')[1]
					};
					modal_values = {
						item_type_name:'Idea'
					};
					break;
				case 'project':
					data = {
						project_id:e.target.hash.split(',')[1]
					};
					modal_values = {
						item_type_name:'Project'
					};
					break;
				case 'message':
					data = {
						message_id:e.target.hash.split(',')[1]
					};
					modal_values = {
						item_type_name:'Message'
					};
					break;
				case 'link':
					data = {
						link_id:e.target.hash.split(',')[1]
					};
					modal_values = {
						item_type_name:'Link'
					};
					break;
				case 'resource':
					data = {
						resource_id:e.target.hash.split(',')[1]
					};
					modal_values = {
						item_type_name:'Resource'
					};
					break;	
			}
			
			
			e.data.app.components.modal.show({
				app:e.data.app,
				source_element:tc.jQ('.modal-content.content-delete').first(),
				init:function(modal,callback){
					modal.options.element.find('.item-type-name').text(modal_values.item_type_name);
					if(tc.jQ.isFunction(callback)){
						callback(modal);
					}
				},
				submit:function(modal){
					tc.jQ.ajax({
						type:"POST",
						url:"/admin/"+type+"/delete",
						data:data,
						context:e,
						dataType:"text",
						success: function(data, ts, xhr) {
							if(data == 'False'){
								return;
							}
							tc.jQ(this.target).parents('.item-box').addClass('deleted').slideUp();
							populate_content_counts();
							if(type == 'resource'){
								this.data.app.components.resources_pagination.data.offset--;
							} else {
								this.data.app.components.warning_pagination.data.offset--;
							}
						}
					});
				}
			});
			
		}
	};
	

	function populate_content_counts(){
		tc.jQ.ajax({
			type:"GET",
			url:"/admin/all/getflagged/counts",
			context:this,
			dataType:"json",
			success: function(data, ts, xhr) {
				if(data == 'False'){
					return;
				}
				if(data.flagged_items){
					if(data.flagged_items.ideas || data.flagged_items.ideas === 0){
						tc.jQ('.sidebar-item.ideas span.count').text(data.flagged_items.ideas);
					}
					if(data.flagged_items.links || data.flagged_items.links === 0){
						tc.jQ('.sidebar-item.links span.count').text(data.flagged_items.links);
					}
					if(data.flagged_items.messages || data.flagged_items.messages === 0){
						tc.jQ('.sidebar-item.project-posts span.count').text(data.flagged_items.messages);
					}
					if(data.flagged_items.projects || data.flagged_items.projects === 0){
						tc.jQ('.sidebar-item.projects span.count').text(data.flagged_items.projects);
					}
					
				}
			}
		});
	}
	
	function build_resources_carousel(app){
		var data, fn;
		
		if(app.components.resources_pagination){
			return;
		}
			
		app.components.resources_pagination = new tc.carousel({
			element: tc.jQ(".resources.carousel"),
			next_button: tc.jQ('.resources-carousel-next'),
			prev_button: tc.jQ('.resources-carousel-prev'),
			scrollable: {
				items: ".items",
				speed: 300,
				circular: false
			}
		});
		
		app.components.resources_pagination.data = {
			current_page:null,
			n_to_fetch: 10,
			offset:0,
			temp_item_source:tc.jQ('.template-content.resource-box'),
			next_button: tc.jQ('.resources-carousel-next'),
			prev_button: tc.jQ('.resources-carousel-prev')
		};
		
		
		function resourceCarouselSeekHandler(e,d){
			e.data.app.components.resources_pagination.data.current_page = e.data.app.components.resources_pagination.carousel.getItems().eq(e.data.app.components.resources_pagination.carousel.getIndex());
			if(e.data.app.components.resources_pagination.data.current_page.hasClass('loaded')){
				resourceCarouselResizePage();
				handleResourcePaginationControls();
			} else {
				e.data.app.components.resources_pagination.data.current_page.addClass('loaded');
				tc.jQ.ajax({
					type:"GET",
					url:"/admin/resource/getunreviewed",
					data:{
						n_limit: (e.data.app.components.resources_pagination.data.n_to_fetch + 1),
						offset: e.data.app.components.resources_pagination.data.offset
					},
					context:e.data.app,
					dataType:"text",
					success: function(data, ts, xhr) {
						var d, temptbody, tempitem;
						try {
							d = tc.jQ.parseJSON(data);
						} catch(e) {
							tc.util.log("/admin/resource/getunreviewed: json parsing error", "warn");
							return;
						}
						this.components.resources_pagination.data.current_page.children('ul').addClass('pending-resources-stack').children().remove();
						
						
						if(!d.length && this.components.resources_pagination.data.offset > 0){
							//no items, and we are on page > 0
							this.components.resources_pagination.data.current_page.remove();
						} else if(!d.length && this.components.resources_pagination.data.offset == 0){
							//no items, and we are on page 0
							this.components.resources_pagination.data.current_page.children('ul').append('<li><p>No Pending Resources.</p></li>');
						} else if(d.length == (this.components.resources_pagination.data.n_to_fetch+1)) {
							//full of items, and more. we DO have another page.
							
							//lets pop off the extra one.
							d.pop();
							
							this.components.resources_pagination.carousel.addItem('\
								<li class="flagged-content-carousel-item clearfix spinner-message">\
									<ul class="items warning-list-stack">\
										<li><p>Loading...</p></li>\
									</ul>\
								</li>');
						}
						
						handleResourcePaginationControls();
						
						for(i in d){
							tempitem = this.components.resources_pagination.data.temp_item_source.clone().removeClass('template-content').show();
							tempitem.find('h3.resource-name').text(d[i].title);
							tempitem.find('a.resource-link').attr('href',d[i].url).text(d[i].url);
							tempitem.find('p.description').text(d[i].description);
							tempitem.find('a.control-ok').attr('href','#ok-resource,'+d[i].project_resource_id);
							tempitem.find('a.control-delete').attr('href','#remove-resource,'+d[i].project_resource_id);
							if(d[i].image_id != -1 && d[i].image_id != 'null' && d[i].image_id){
								tempitem.find('div.west').prepend('<img src="'+this.app_page.media_root+'images/'+ d[i].image_id % 10 +'/'+ d[i].image_id +'.png"></img>');
							}
							
							//Only show the checkbox if official resources are supported
							if (e.data.app.app_page.data.supported_features.is_official_supported) {
						    	tempitem.find('div.west').append('<input type="checkbox" name="mark-official-checkbox-'+(this.components.resources_pagination.data.offset+i)+'" class="mark-official-checkbox" id="mark-official-checkbox-'+(this.components.resources_pagination.data.offset+i)+'" />');
    							tempitem.find('div.west').append('<label for="mark-official-checkbox-'+(this.components.resources_pagination.data.offset+i)+'">Official</label>');
    						}
							
							if(d[i].contact_name && d[i].contact_name.length) {  
								tempitem.find('div.west').append('<p><strong>Name:</strong> '+d[i].contact_name+'</p>');
							}
							if(d[i].twitter_url && d[i].twitter_url.length){
								tempitem.find('div.west').append('<p><a href="'+d[i].twitter_url+'" target="_blank">Twitter</a></p>');
							}
							if(d[i].facebook_url && d[i].facebook_url.length){
								tempitem.find('div.west').append('<p><a href="'+d[i].facebook_url+'" target="_blank">Facebook</a></p>');
							}
							if(d[i].url && d[i].url.length){
								tempitem.find('div.mission').append('<h4>URL</h4>');
								tempitem.find('div.mission').append("<span class='serif'><p><a href='"+d[i].url+"' target='_blank'>"+tc.truncate(d[i].url,24)+"</a></p></span>");
							}
							tempitem.find('div.mission').append('<h4>Email</h4>');
							tempitem.find('div.mission').append("<span class='serif'><p><a href='mailto:"+d[i].contact_email+"'>"+tc.truncate(d[i].contact_email, 24)+"</a></p></span>");
							
							tempitem.find('div.mission').append("<div class='box half'><h4>Physical Address</h4><span class='serif'><p>"+d[i].physical_address+"<br /><strong>"+d[i].location_name+"</strong></p></span></div>");
							if(d[i].keywords){
								tempitem.find('div.mission').append("<div class='box half'><h4>Keywords</h4><span class='serif'><p>"+d[i].keywords.replace(/,/g,', ')+"</p></span></div>");
							}
							
							this.components.resources_pagination.data.offset++;
							this.components.resources_pagination.data.current_page.children('ul').append(tempitem);
						}
						
						resourceCarouselResizePage();
						
						this.components.resources_pagination.data.current_page.find('a.control-ok').bind('click', {app:this}, this.components.content_functions.mark_content_ok);
						this.components.resources_pagination.data.current_page.find('a.control-delete').unbind('click').bind('click', {app:this}, this.components.content_functions.delete_content);
						this.components.resources_pagination.data.current_page.find('input[type=checkbox],input[type=radio]').not('.has-prettycheckbox').prettyCheckboxes();
					}
				});
			}
		}
		
		function resourceCarouselResizePage(){
			var itemsheight;
			itemsheight = 0;
			app.components.resources_pagination.data.current_page.find('li').each(function(i,j){
				itemsheight += (tc.jQ(j).height() + 30);
			});
			
			app.components.resources_pagination.data.current_page.parent().parent().css('height',(itemsheight+200)+'px');
		}
		
		function handleResourcePaginationControls(){
			if(app.components.resources_pagination.carousel.getIndex() == 0){
				//on first page, remove previous button.
				app.components.resources_pagination.data.prev_button.hide();
			} else {
				app.components.resources_pagination.data.prev_button.show();
			}
			
			if(app.components.resources_pagination.carousel.getIndex() == (app.components.resources_pagination.carousel.getItems().length - 1)) {
				//not on first page, lets show the previous button.
				app.components.resources_pagination.data.next_button.hide();
			} else {
				app.components.resources_pagination.data.next_button.show();
			}
		}
		
		if(app.components.resources_pagination){
			app.components.resources_pagination.carousel.getRoot()
				.unbind('onSeek', {app:app}, resourceCarouselSeekHandler)
				.bind('onSeek', {app:app}, resourceCarouselSeekHandler);
			app.components.resources_pagination.carousel.seekTo(0,0);
		}
		
	}
		
		
		
	function build_warning_carousel(app){
		var data, fn;
		
		if(app.components.warning_pagination){
			return;
		}
			
		app.components.warning_pagination = new tc.carousel({
			element: tc.jQ(".warning.carousel"),
			next_button: tc.jQ('.warning-carousel-next'),
			prev_button: tc.jQ('.warning-carousel-prev'),
			scrollable: {
				items: ".items",
				speed: 300,
				circular: false
			}
		});
		
		app.components.warning_pagination.data = {
			current_section:null,
			current_page:null,
			n_to_fetch: 10,
			offset:0,
			temp_item_source:tc.jQ('.template-content.item-box-warning-list'),
			next_button: tc.jQ('.warning-carousel-next'),
			prev_button: tc.jQ('.warning-carousel-prev')
		};
		
		app.components.warning_pagination.setContentType = function(content_type){
			this.data.current_section = content_type;
			this.data.offset = 0;
			this.carousel.getItems().removeClass('loaded').filter(':gt(0)').remove();
			this.carousel.seekTo(0,0);
		};
		
		function warningCarouselSeekHandler(e,d){
			e.data.app.components.warning_pagination.data.current_page = e.data.app.components.warning_pagination.carousel.getItems().eq(e.data.app.components.warning_pagination.carousel.getIndex());
			
			if(e.data.app.components.warning_pagination.data.current_page.hasClass('loaded')){
				handleWarningPaginationControls();
			} else {
				e.data.app.components.warning_pagination.data.current_page.addClass('loaded');
				tc.jQ.ajax({
					type:"GET",
					url:"/admin/"+e.data.app.components.warning_pagination.data.current_section+"/getflagged",
					data:{
						n_limit: (e.data.app.components.warning_pagination.data.n_to_fetch+1),
						offset: e.data.app.components.warning_pagination.data.offset
					},
					context:e.data.app,
					dataType:"text",
					success: function(data, ts, xhr) {
						var d, temptbody, tempitem;
						try {
							d = tc.jQ.parseJSON(data);
						} catch(e) {
							tc.util.log("/admin/all/getflagged: json parsing error", "warn");
							return;
						}
						this.components.warning_pagination.data.current_page.children('ul').children().remove();
						
						if(!d.length && this.components.warning_pagination.data.offset > 0){
							//no items, and we are on page > 0
							
							this.components.warning_pagination.data.current_page.remove();
							//we should probably go back to the previous page.
						} else if(!d.length && this.components.warning_pagination.data.offset == 0){
							//no items, and we are on page 0
							
							this.components.warning_pagination.data.current_page.children('ul').append('<li><p>No Flagged Content.</p></li>');
						} else if(d.length == (this.components.warning_pagination.data.n_to_fetch+1)) {
							//full of items, and more. we DO have another page.
							
							//lets pop off the extra one.
							d.pop();
							
							this.components.warning_pagination.carousel.addItem('\
								<li class="flagged-content-carousel-item clearfix spinner-message">\
									<ul class="items warning-list-stack">\
										<li><p>Loading...</p></li>\
									</ul>\
								</li>');
						}
						
						handleWarningPaginationControls();
						
						for(i in d){
							tempitem = this.components.warning_pagination.data.temp_item_source.clone().removeClass('template-content');
							if(d[i].owner_first_name && d[i].owner_last_name){
								tempitem.find('span.name').text(d[i].owner_first_name + ' ' + d[i].owner_last_name);
							}
							tempitem.find('span.title').text(d[i].project_title);
							tempitem.find('span.time').text(d[i].item_created_datetime);
							tempitem.find('p.description').text(d[i].item_description);
							tempitem.find('a.control-ok').attr('href','#ok-'+this.components.warning_pagination.data.current_section+','+d[i].item_id);
							tempitem.find('a.control-delete').attr('href','#remove-'+this.components.warning_pagination.data.current_section+','+d[i].item_id);
							this.components.warning_pagination.data.offset++;
							this.components.warning_pagination.data.current_page.children('ul').append(tempitem);
						}
						
						this.components.warning_pagination.data.current_page.find('a.control-ok').bind('click', {app:this}, this.components.content_functions.mark_content_ok);
						this.components.warning_pagination.data.current_page.find('a.control-delete').unbind('click').bind('click', {app:this}, this.components.content_functions.delete_content);
					}
				});
			}
		}
		
		function handleWarningPaginationControls(){
			if(app.components.warning_pagination.carousel.getIndex() == 0){
				//on first page, remove previous button.
				app.components.warning_pagination.data.prev_button.hide();
			} else {
				app.components.warning_pagination.data.prev_button.show();
			}
			
			if(app.components.warning_pagination.carousel.getIndex() == (app.components.warning_pagination.carousel.getItems().length - 1)) {
				//not on first page, lets show the previous button.
				app.components.warning_pagination.data.next_button.hide();
			} else {
				app.components.warning_pagination.data.next_button.show();
			}
		}
			
		if(app.components.warning_pagination){
			app.components.warning_pagination.carousel.getRoot()
				.unbind('onSeek', {app:app}, warningCarouselSeekHandler)
				.bind('onSeek', {app:app}, warningCarouselSeekHandler);
		}
		
		app.components.warning_pagination.carousel.begin();
	}
	
	tc.jQ('.adminbar li.content').addClass('active');
	
});