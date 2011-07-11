if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }
if(!tc.gam.project_widgets){ tc.gam.project_widgets = {}; }

tc.gam.project_widgets.infopane = function(project,dom,deps,options){
	var widget, data, me;
	tc.util.log("project.infopane");
	me = this;
	this.options = tc.jQ.extend({name:'infopane'},options);
	data = this.options.app.app_page.data;
	this.data = data;
	this.dom = dom;
	this.is_editable = false;
	if(this.options.app.app_page.project_user.is_project_admin || (this.options.app.app_page.user && this.options.app.app_page.user.is_admin)){
		this.is_editable = true;
	}
	
	widget = tc.gam.widget(this,project);
	this.elements = {
		mission: {
			init: function(element) {
				if (me.is_editable) {
					element.addClass("mod-inline-edit");
					new tc.inlineEditor({
						dom: element,
						service: {
							url: "/project/description",
							param: "text",
							post_data: {
								project_id: me.options.app.app_page.data.project.project_id
							}
						},
						charlimit: 200
					});
				}
			}
		},
		endorsements: {
			
		},
		location_map: {
			map: null,
			init: function() {
				var coords, zoom, map;
				tc.util.log("project.infopane.location_map.init");
				
				coords = [data.project.info.location.position.lat, 
				          data.project.info.location.position.lng];
				zoom = 12;
				
				if(coords[0] == 'None' || coords[1] == 'None'){
					coords = [40.716667, -74];
					zoom = 9;
				}
				
				map = new google.maps.Map(document.getElementById("location-map"), {
					center: new google.maps.LatLng(coords[0], coords[1]),
					zoom: zoom,
					maxZoom: zoom,
					minZoom: zoom,
					disableDefaultUI: true,
					mapTypeControlOptions: {
					   mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'GAM']
					},
					draggable: false
				});
				
				map.mapTypes.set("GAM", new google.maps.StyledMapType(gamMapStyle, { name: "Give a Minite" }));
				map.setMapTypeId("GAM");
				
				me.elements.location_map.map = map;
			}
		},
		keywords: {
			add_keyword_btn: null,
			edit_controls: null,
			init: function(element) {
				me.elements.keywords.add_keyword_btn = element.find(".add-keyword");
				if (me.elements.keywords.add_keyword_btn.length) {
					me.elements.keywords.edit_controls = element.find(".inline-edit-controls");
					me.elements.keywords.add_keyword_btn.bind(
						"click", 
						{ project:project, me:me },
						me.handlers.add_keyword_clicked
					);
				}
			},
			add_keywords: function() {
				me.elements.keywords.add_keyword_btn.hide();
				me.elements.keywords.edit_controls.find("input[type=text]").val("");
				me.elements.keywords.edit_controls.show().find(".add-btn").unbind('click').bind(
					"click", 
					{project:project, me:me}, 
					me.handlers.add_keywords_submit
				);
			}
		}
	};
	this.handlers = {
		add_keyword_clicked: function(e, d) {
			e.preventDefault();
			e.data.me.elements.keywords.add_keywords();
		},
		add_keywords_submit: function(e, d) {
			var input, text;
			e.preventDefault();
			
			input = e.data.me.elements.keywords.edit_controls.find("input[type=text]");
			text = input.val();
			if (text) {
				tc.jQ.ajax({
					url: "/project/tag/add",
					data: {
						project_id: e.data.me.options.app.app_page.data.project.project_id,
						text: text
					},
					context: e.data.me,
					type: "POST",
					dataType: "text",
					success: function(data, ts, xhr) {
						var i, tags, temptag;
						if (data == "False") {
							return;
						}
						tags = this.dom.find("ul.tag-cloud");
						text = text.split(",");
						for (i in text) {
							temptag = tc.jQ("<li class='admin' id='keyword-"+ text[i] +"'>"+
								"<a href='/search?terms="+ text[i] +"'>"+ text[i] + "</a>"+
								"<a class='remove-btn keyword' href='#remove,"+ text[i] +"'>"+
									"<span>Remove</span></a>"+
							"</li>");
							temptag.find('a.remove-btn.keyword').bind('click', {project:project,me:this}, this.handlers.remove_keyword);
							tags.append(temptag);
						}
					}
				});
			}
			
			e.data.me.elements.keywords.edit_controls.hide();
			e.data.me.elements.keywords.add_keyword_btn.show();
		},
		remove_keyword:function(e){
			var t;
			e.preventDefault();
			e.stopPropagation();
			t = e.target;
			if(t.nodeName == 'SPAN'){
				t = t.parentNode;
			}
			e.data.project.options.app.components.modal.show({
				app:e.data.project.options.app,
				source_element:tc.jQ('.modal-content.remove-keyword'),
				submit:function(){
					tc.jQ.ajax({
						type:'POST',
						url:'/project/tag/remove',
						data:{
							project_id: e.data.me.options.app.app_page.data.project.project_id,
							text: t.href.split(',')[1]
						},
						context:e.data.me,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False'){
								return false;
							}
							this.dom.find('#keyword-'+t.href.split(',')[1]).remove();
						}
					});
				}
			});
		},
		endorse_project:function(e){
			e.preventDefault();
			
			e.data.project.options.app.components.modal.show({
				app:e.data.project.options.app,
				source_element:tc.jQ('.modal-content.endorse-project'),
				submit:function(){
					tc.jQ.ajax({
						type:'POST',
						url:'/project/endorse',
						data:{
							project_id: e.data.me.options.app.app_page.data.project.project_id,
							user_id: e.data.me.options.app.app_page.user.u_id
						},
						context:e.data.me,
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
		},
		remove_endorse:function(e){
			e.preventDefault();
			
			var t;
			t = e.target;
			if(t.nodeName == 'SPAN'){
				t = t.parentNode;
			}
			
			e.data.project.options.app.components.modal.show({
				app:e.data.project.options.app,
				source_element:tc.jQ('.modal-content.remove-endorse-project'),
				submit:function(){
					tc.jQ.ajax({
						type:'POST',
						url:'/project/endorse/remove',
						data:{
							project_id: t.href.split(',')[1],
							user_id: t.href.split(',')[2]
						},
						context:e.data.me,
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
	
	this.dom.find('a.remove-btn.keyword').unbind('click').bind('click', {project:project,me:this}, this.handlers.remove_keyword);
	this.dom.find('a.endorse-button').unbind('click').bind('click', {project:project,me:this}, this.handlers.endorse_project);
	this.dom.find('a.remove-endorse').unbind('click').bind('click', {project:project,me:this}, this.handlers.remove_endorse);
	
	this.elements.mission.init( this.dom.find(".our-mission") );
	this.elements.location_map.init();
	this.elements.keywords.init( this.dom.find(".keywords") );
	
	return {
		show:widget.show,
		hide:widget.hide
	};
};