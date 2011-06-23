if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }
if(!tc.gam.project_widgets){ tc.gam.project_widgets = {}; }

tc.gam.project_widgets.related_resources = function(project,dom,deps,options){
	var widget, data, me;
	tc.util.log("project.related_resources");
	me = this;
	this.options = tc.jQ.extend({name:'related_resources'},options);
	this.dom = dom;
	data = this.options.app.app_page.data;
	widget = tc.gam.widget(this,project);
	this.elements = {
		window: tc.jQ(window),
		resource_counter: this.dom.find(".counter"),
		resources_table: this.dom.find("table.resources-list"),
		empty_box: this.dom.find(".empty-state-box")
	};
	this.handlers = {
		resources_loaded: function(data, ts, xhr) {
			var d;
			try {
				d = tc.jQ.parseJSON(data);
			} catch(err) {
				no_resources();
				return;
			}
			if (d.resources.length) {
				populate(d);
			} else {
				no_resources();
			}
		},
		add_resource_click: function(e, d) {
			var add_btn, my_id;
			e.preventDefault();
			
			add_btn = tc.jQ(e.target);
			my_id = add_btn.attr("href").split(",")[1];
			
			tc.jQ.ajax({
				url: "/project/resource/add",
				type: "POST",
				dataType: "text",
				data: {
					project_id: e.data.project.data.project_id,
					project_resource_id: my_id
				},
				context: e.data.me,
				success: function(data, ts, xhr) {
					if(data == 'False'){
						tc.util.log("resource add failed");
						return false;
					}
					tc.util.log("resource add success");
					project.dom.trigger('resources-refresh',{ type:'organization' });
					add_btn.parent().addClass("added");
				}
			});
		}
	};
	
	function get() {
		tc.jQ.ajax({
			type: 'GET',
			url: '/project/resources/related',
			data: {
				project_id: project.data.project_id
			},
			context: me,
			dataType:'text',
			success: me.handlers.resources_loaded
		});
	}
	
	function populate(d) {
		var tbody;
		
		tbody = "<tbody>";
		tc.jQ.each(d.resources, function(i, resource) {
			var temp, even;
			
			temp = "";
			even = (i % 2 === 0);
			
			if (even) { temp = "<tr>"; }
			temp += "<td class='" + (resource.is_official ? "official-resource" : "") + "'>";
			
			temp += '<a href="#add,'+ resource.link_id +'" class="add-button rounded-button small">Add</a>';

			if (resource.image_id > 0) {
				temp += '<span class="thumb">';
				if (me.options.app.app_page.user && me.options.app.app_page.user.is_admin) {
					temp += '<a class="close" href="#removeOrganization,'+resource.project_resource_id+'"><span>Close</span></a>'
				}
				temp += '<img src="{{d.template_data.media_root}}images/'+(resource.image_id % 10)+'/'+resource.image_id+'.png" width="30" height="30" alt="" /></span>'
			} else {			
				temp += '<span class="thumb">';
				if (me.options.app.app_page.user && me.options.app.app_page.user.is_admin) {
					temp += '<a class="close" href="#removeOrganization,'+resource.project_resource_id+'"><span>Close</span></a>'
				}
				temp += '<img src="/static/images/thumb_genAvatar30.png" width="30" height="30" alt="" /></span>'
			};

			temp += '<span class="resource-name" ><span>'+
			            '<span class="organization-name tooltip_trigger" rel="#organization,'+ resource.link_id +'">'+ 
			                resource.title +
			            '</span></span></span>';
			
			// hidden added dialog
			temp += '<div class="added-dialog">'+
			            '<span class="added-header">Added <em>to</em> your project</span><br />'+
			            '<span class="added-text">We\'ve sent them a link to your project page.'+
			            ' </span></div>';
			
			temp += "</td>";
			if (!even) { temp += "</tr>"; }
			
			tbody += temp;
		});
		tbody += "</tbody>";
		tbody = tc.jQ(tbody);
		
		tbody.find("a.add-button").bind("click", {project:project, me:me}, me.handlers.add_resource_click);
		
		me.elements.resources_table.empty().append(tbody);
		me.elements.empty_box.hide();
		me.elements.resource_counter.text(d.resources.length);
		
		tc.resource_tooltip({
			triggers: me.elements.resources_table.find(".tooltip_trigger"),
			trigger_class:'tooltip_trigger',
			markup_source_element:tc.jQ('#organization-markup-source'),
			get_url: "/project/resource/info"
		});
		
		me.elements.resources_table.find('.close').unbind('click').bind('click', {project:project, me:me}, function(e){
			e.data.project.options.app.components.modal.show({
				app:e.data.project.options.app,
				source_element:tc.jQ('.modal-content.remove-resource'),
				submit:function(){
					tc.jQ.ajax({
						type:'POST',
						url:'/admin/resource/delete',
						data:{
							resource_id: e.target.href.split(',')[1]
						},
						context:e,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False'){
								return false;
							}
							tc.jQ(this.target).parent().parent().animate({
								'opacity':0.0
							},600,'easeOutCubic');
						}
					});
				}
			});
		});
		
		tc.addOfficialResourceTags(tc.jQ('.related-resources .resources-list'));
	}
	
	function no_resources() {
		me.elements.resources_table.hide();
		me.elements.empty_box.show();
		me.elements.resource_counter.text("0");
	}
	
	get();
	
	return {
		show:function(){
			widget.show();
			if((me.dom.offset().top - me.elements.window.scrollTop()) < 0){
				//me.elements.window.scrollTop(me.dom.offset());
				me.elements.window.scrollTop(0);
			}
		},
		hide:widget.hide
	};
};
