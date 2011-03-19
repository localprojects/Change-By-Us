if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }


tc.gam.project = function(options){	
	var me;
	me = this;
	tc.util.log("tc.gam.project");
	
	this.options = tc.jQ.extend({
		
	},options);
	
	this.dom = this.options.dom;
	this.event_data = { project:this };
	this.data = this.options.data;
	this.widget = new tc.gam.widget(null,this);
	
	this.components = {
		infopane:new tc.gam.project_widgets.infopane(this,this.dom.find('.box.mission'),{widget:this.widget},{app:options.app}),
		resources:new tc.gam.project_widgets.resources(this,this.dom.find('.box.resources'),{widget:this.widget},{app:options.app}),
		related_ideas:new tc.gam.project_widgets.fresh_ideas(this,this.dom.find('.box.fresh-ideas'),{widget:this.widget},{app:options.app}),
		related_resources:new tc.gam.project_widgets.related_resources(this,this.dom.find('.box.related-resources'),{widget:this.widget},{app:options.app}),
		add_link:new tc.gam.project_widgets.add_link(this,this.dom.find('.box.add-link'),{widget:this.widget},{app:options.app}),
		goals_main:new tc.gam.project_widgets.goals_main(this,this.dom.find('.box.goals-main'),{widget:this.widget},{app:options.app}),
		goals_add:new tc.gam.project_widgets.goals_add(this,this.dom.find('.box.goals-add'),{widget:this.widget},{app:options.app}),
		goals_stack:new tc.gam.project_widgets.goals_stack(this,this.dom.find('.box.goals-stack-holder'),{widget:this.widget},{app:options.app}),
		conversation:new tc.gam.project_widgets.conversation(this,this.dom.find('.box.conversation'),{widget:this.widget},{app:options.app}),
		members:new tc.gam.project_widgets.members(this,this.dom.find('.box.members'),{widget:this.widget},{app:options.app})
	};
	
	tc.util.dump(options);
	if(options.app.app_page.user){
		
	}
	
	// return project page to initial state
	function go_home(e) {
		e.data.project.components.goals_main.show(false);
		e.data.project.components.conversation.show(false);
	}
	
	this.handlers = {
		widget_show:function(e,d){
			tc.util.dump('project.widget_show');
			tc.util.dump(d.name);
			switch(d.name){
				case 'members':
					e.data.project.components.goals_main.hide(false);
					e.data.project.components.goals_stack.hide(false);
					e.data.project.components.goals_add.hide(false);
					e.data.project.components.conversation.hide(false);
					e.data.project.components.add_link.hide(false);
					break;
				case 'goals_add':
					e.data.project.components.goals_main.hide(false);
					e.data.project.components.goals_stack.hide(false);
					e.data.project.components.members.hide(false);
					e.data.project.components.conversation.hide(false);
					break;
				case 'goals_stack':
					e.data.project.components.goals_main.hide(false);
					break;
				case 'related_resources':
					e.data.project.components.goals_main.hide(false);
					e.data.project.components.goals_stack.hide(false);
					e.data.project.components.members.hide(false);
					e.data.project.components.conversation.hide(false);
					e.data.project.components.add_link.hide(false);
					break;
				case 'add_link':
					e.data.project.components.goals_main.hide(false);
					e.data.project.components.goals_stack.hide(false);
					e.data.project.components.members.hide(false);
					e.data.project.components.conversation.hide(false);
					e.data.project.components.related_resources.hide(false);
					break;
			}
		},
		widget_hide:function(e,d){
			tc.util.dump('project.widget_hide');
			switch(d.name){
				case 'members':
				case 'goals_add':
				case 'goals_stack':
				case 'related_resources':
				case 'add_link':
					go_home(e);
					break;
			}
		},
		hashchanged:function(e){
			tc.util.log('tc.project.handlers.hashchange');
			var hash;
			hash = window.location.hash.substring(1,window.location.hash.length);
			switch(hash.split(',')[0]){
				case 'show':
					if(e.data.project.components[hash.split(',')[1]]){
						e.data.project.components[hash.split(',')[1]].show();
					}
					break;
				case 'hide':
					e.preventDefault();
					if(e.data.project.components[hash.split(',')[1]]){
						e.data.project.components[hash.split(',')[1]].hide();
					}
					break;
				default:
					break;
			}
		},
		link_clicked:function(e,d){
			var t;
			t = e.target;
			if(t.nodeName == 'SPAN'){
				if(t.parentNode.nodeName == 'A'){
					t = t.parentNode;
				} else if(t.parentNode.parentNode.nodeName == 'A'){
					t = t.parentNode.parentNode;
				} else {
					return;
				}
			}
			if(t.hash){
				switch(t.hash.substring(1,t.hash.length).split(',')[0]){
					case 'show':
						e.preventDefault();
						if(e.data.project.components[t.hash.substring(1,t.hash.length).split(',')[1]]){
							e.data.project.components[t.hash.substring(1,t.hash.length).split(',')[1]].show();
						}
						break;
					case 'hide':
						e.preventDefault();
						if(e.data.project.components[t.hash.substring(1,t.hash.length).split(',')[1]]){
							e.data.project.components[t.hash.substring(1,t.hash.length).split(',')[1]].hide();
						}
						break;
					default:
						break;
				}
			}
		}
	};
	
	//this.dom.find('a').bind('click',this.event_data,this.handlers.link_clicked);
	tc.jQ(window).bind('hashchange',this.event_data,this.handlers.hashchanged);
	this.dom.bind('project-widget-show',this.event_data,this.handlers.widget_show);
	this.dom.bind('project-widget-hide',this.event_data,this.handlers.widget_hide);
	
};


tc.gam.widget = function(inheritor,project){
	if(!inheritor){ return; }
	
	inheritor.show = function(propagate){
		if(inheritor.dom){ inheritor.dom.show(); }
		if(propagate !== false){
			project.dom.trigger('project-widget-show',{name:inheritor.options.name});
		}
	};
	
	inheritor.hide = function(propagate){
		if(inheritor.dom){ inheritor.dom.hide(); }
		if(propagate !== false){
			project.dom.trigger('project-widget-hide',{name:inheritor.options.name});
		}
	};
	
	return inheritor;
};

if(!tc.gam.project_widgets){
	tc.gam.project_widgets = {};
}

