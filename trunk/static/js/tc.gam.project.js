if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }


tc.gam.project = function(options){
	
	this.options = tc.jQ.extend({
		
	},options);
	
	this.dom = this.options.dom;
	this.event_data = { project:this };
	this.widget = new tc.gam.widget(null,this);
	
	this.components = {
		infopane:new tc.gam.project_widgets.infopane(this,this.dom.find('.mission'),{widget:this.widget},{}),
		members:new tc.gam.project_widgets.members(this,this.dom.find('.box.members'),{widget:this.widget},{}),
		resources:new tc.gam.project_widgets.resources(this,this.dom.find('.members'),{widget:this.widget},{}),
		goals:new tc.gam.project_widgets.goals(this,this.dom.find('.goals'),{widget:this.widget},{}),
		goals_add:new tc.gam.project_widgets.goals_add(this,this.dom.find('.goals-add'),{widget:this.widget},{}),
		conversation:new tc.gam.project_widgets.conversation(this,this.dom.find('.conversation'),{widget:this.widget},{}),
		related_ideas:new tc.gam.project_widgets.fresh_ideas(this,this.dom.find('.fresh-ideas'),{widget:this.widget},{})
	}
	
	this.handlers = {
		members_button_clicked:function(e,d){
			tc.util.dump('project.members_button_clicked');
			e.data.project.components.members.show(true);
		},
		widget_show:function(e,d){
			tc.util.dump('project.widget_show');
			tc.util.dump(d.name);
			switch(d.name){
				case 'members':
					e.data.project.components.goals.hide(false);
					e.data.project.components.goals_add.hide(false);
					e.data.project.components.conversation.hide(false);
					break;
				case 'goals_add':
					e.data.project.components.goals.hide(false);
					e.data.project.components.members.hide(false);
					e.data.project.components.conversation.hide(false);
					break;
			}
		},
		widget_hide:function(e,d){
			tc.util.dump('project.widget_hide');
			switch(d.name){
				case 'members':
					e.data.project.components.goals.show(false);
					e.data.project.components.conversation.show(false);
					break;
				case 'goals_add':
					e.data.project.components.goals.show(false);
					e.data.project.components.conversation.show(false);
					break;
			}
		}
	}
	
	this.dom.find('.project-header .members a').bind('click',this.event_data,this.handlers.members_button_clicked);
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
	
}

tc.gam.project_widgets = {};

tc.gam.project_widgets.infopane = function(project,dom,deps,options){
  var widget;
  this.options = tc.jQ.extend({name:'infopane'},options);
  this.dom = dom;
  widget = tc.gam.widget(this,project);
  return {
    show:widget.show,
    hide:widget.hide
  }
}
tc.gam.project_widgets.members = function(project,dom,deps,options){
  var widget;
  this.options = tc.jQ.extend({name:'members'},options);
  this.dom = dom;
  widget = tc.gam.widget(this,project);
  this.handlers = {
    back:function(e,d){
      e.data.me.hide(true);
    }
  };
  this.dom.find('.actions.back').bind('click',{ project:project,me:this },this.handlers.back);
  return {
    show:widget.show,
    hide:widget.hide
  }
}
tc.gam.project_widgets.resources = function(project,dom,deps,options){
  var widget;
  this.options = tc.jQ.extend({name:'resources'},options);
  this.dom = dom;
  widget = tc.gam.widget(this,project);
  return {
    show:widget.show,
    hide:widget.hide
  }
}
tc.gam.project_widgets.goals = function(project,dom,deps,options){
  var widget;
  this.options = tc.jQ.extend({name:'goals'},options);
  this.dom = dom;
  widget = tc.gam.widget(this,project);
  this.handlers = {
    add_goal:function(e,d){
      e.data.project.components.goals_add.show();
    }
  };
  this.dom.find('.actions .add').bind('click',{ project:project,me:this },this.handlers.add_goal);
  return {
    show:widget.show,
    hide:widget.hide
  }
}
tc.gam.project_widgets.goals_add = function(project,dom,deps,options){
  var widget;
  this.options = tc.jQ.extend({name:'goals_add'},options);
  this.dom = dom;
  widget = tc.gam.widget(this,project);
  this.handlers = {
    back:function(e,d){
      e.data.project.components.goals_add.hide(true);
    }
  };
  this.dom.find('.actions.back a').bind('click',{ project:project,me:this },this.handlers.back);
  return {
    show:widget.show,
    hide:widget.hide
  }
}
tc.gam.project_widgets.conversation = function(project,dom,deps,options){
  var widget;
  this.options = tc.jQ.extend({name:'conversation'},options);
  this.dom = dom;
  widget = tc.gam.widget(this,project);
  return {
    show:widget.show,
    hide:widget.hide
  }
}
tc.gam.project_widgets.fresh_ideas = function(project,dom,deps,options){
  var widget;
  this.options = tc.jQ.extend({name:'infopane'},options);
  this.dom = dom;
  widget = tc.gam.widget(this,project);
  return {
    show:widget.show,
    hide:widget.hide
  }
}