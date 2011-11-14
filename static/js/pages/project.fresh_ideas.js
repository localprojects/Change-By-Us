/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/
if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }
if(!tc.gam.project_widgets){ tc.gam.project_widgets = {}; }

tc.gam.project_widgets.fresh_ideas = function(project,dom,deps,options){
	var widget, carousel;
	tc.util.log("project.fresh_ideas");
	this.options = tc.jQ.extend({name:'fresh_ideas'},options);
	this.dom = dom;
	widget = tc.gam.widget(this,project);

	carousel = new tc.carousel({
		element: this.dom.find(".carousel"),
		pagination: {
			current: this.dom.find(".pagination .cur-index"),
			total: this.dom.find(".pagination .total, .hd h2 .counter")
		}
	});
	if (!carousel.is_rendered()) {
		
	}
	
	
	dom.find('a.flag-idea').bind('click', {project:project}, function(e){
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
	});
	
	dom.find('a.remove-idea').bind('click', {project:project, app:options.app}, function(e){
		e.preventDefault();
		
		e.data.app.components.modal.show({
			app:e.data.app,
			source_element:tc.jQ('.modal-content.remove-idea'),
			submit:function(){
				var id;
				id = e.target.hash.split(",")[1];
				tc.jQ.ajax({
					type:'POST',
					url:'/idea/remove',
					data:{
						idea_id: id
					},
					context: tc.jQ(e.target),
					dataType:'text',
					success:function(data,ts,xhr){
						if(data == 'False'){
							return false;
						}
						e.data.project.dom.trigger("project-idea-remove", { id: id });
					}
				});
			}
		});
	});
		
	return {
		show:widget.show,
		hide:widget.hide,
		remove_idea: function(id) {
			carousel.carousel.getRoot().find("li[rel='idea-"+ id +"']").remove();
			carousel.update_pagination().update_navigation();
		}
	};
};