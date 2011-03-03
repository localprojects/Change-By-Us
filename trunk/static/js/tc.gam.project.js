if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }

tc.gam.project = makeClass();

tc.gam.project.prototype.options = {
	dom:null
}

tc.gam.project.prototype.init = function(options){
	
	this.options = tc.jQ.extend(this.options,options);
	this.dom = this.options.dom;
	this.event_data = { project:this };
	this.dom.find('.project-header .members a').bind('click',this.event_data,this.handlers.members_button_clicked);
	this.dom.bind('project-widget-show',this.event_data,this.handlers.widget_show);
	this.dom.bind('project-widget-hide',this.event_data,this.handlers.widget_hide);
	
	this.components = {
		info:new tc.gam.widgets.infopane(this,this.dom.find('.mission')),
		members:new tc.gam.widgets.members(this,this.dom.find('.box.members')),
		resources:new tc.gam.widgets.resources(this,this.dom.find('.members')),
		goals:new tc.gam.widgets.goals(this,this.dom.find('.goals')),
		goals_add:new tc.gam.widgets.goals_add(this,this.dom.find('.goals-add')),
		conversation:new tc.gam.widgets.conversation(this,this.dom.find('.conversation')),
		related_ideas:new tc.gam.widgets.fresh_ideas(this,this.dom.find('.fresh-ideas'))
	}
}

tc.gam.project.prototype.handlers = {
	members_button_clicked:function(e,d){
		e.data.project.components.members.show();
	},
	widget_show:function(e,d){
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

/*   widgets.base   */
tc.gam.widgets = {};
tc.gam.widgets.base = makeClass();
tc.gam.widgets.base.prototype.init = function(project){}
//tc.gam.widgets.base.prototype.show = function(){
//	if(this.dom){ this.dom.show(); }
//	this.project.dom.trigger('project-widget-show',{name:this.options.name});
//}
//tc.gam.widgets.base.prototype.hide = function(){
//	if(this.dom){ this.dom.hide(); }
//	this.project.dom.trigger('project-widget-hide',{name:this.options.name});
//}

/*   widgets.info   */
tc.gam.widgets.infopane = makeClass();
//tc.gam.widgets.infopane.prototype = tc.gam.widgets.base.prototype;
tc.gam.widgets.infopane.prototype.init = function(project,dom){
	tc.util.log('tc.gam.widgets.infopane.init');
	tc.util.dump(project);
	tc.util.dump(dom);
	this.options = {
		name:'infopane'
	};
	this.project = project;
	this.dom = dom;
}
tc.gam.widgets.infopane.prototype.show = function(){
	if(this.dom){ this.dom.show(); }
	this.project.dom.trigger('project-widget-show',{name:this.options.name});
}
tc.gam.widgets.infopane.prototype.hide = function(){
	if(this.dom){ this.dom.hide(); }
	this.project.dom.trigger('project-widget-hide',{name:this.options.name});
}
tc.gam.widgets.infopane.prototype.handlers = {

}

/*   widgets.members   */
tc.gam.widgets.members = makeClass();
//tc.gam.widgets.members.prototype = tc.gam.widgets.base.prototype;
tc.gam.widgets.members.prototype.init = function(project,dom){
	tc.util.log('tc.gam.widgets.members.init');
	tc.util.dump(project);
	tc.util.dump(dom);
	this.options = {
		name:'members'
	};
	this.project = project;
	this.dom = dom;
	this.dom.find('.actions.back').bind('click',{ project:project,me:this },this.handlers.back);
}
tc.gam.widgets.members.prototype.show = function(){
	if(this.dom){ this.dom.show(); }
	this.project.dom.trigger('project-widget-show',{name:this.options.name});
}
tc.gam.widgets.members.prototype.hide = function(){
	if(this.dom){ this.dom.hide(); }
	this.project.dom.trigger('project-widget-hide',{name:this.options.name});
}
tc.gam.widgets.members.prototype.handlers = {
	back:function(e,d){
		e.data.me.hide(true);
	}
}

/*   widgets.resources   */
tc.gam.widgets.resources = makeClass();
//tc.gam.widgets.resources.prototype = tc.gam.widgets.base.prototype;
tc.gam.widgets.resources.prototype.init = function(project,dom){
	tc.util.log('tc.gam.widgets.resources.init');
	tc.util.dump(project);
	tc.util.dump(dom);
	this.options = {
		name:'resources'
	};
	this.project = project;
	this.dom = dom;
}
tc.gam.widgets.resources.prototype.show = function(){
	if(this.dom){ this.dom.show(); }
	this.project.dom.trigger('project-widget-show',{name:this.options.name});
}
tc.gam.widgets.resources.prototype.hide = function(){
	if(this.dom){ this.dom.hide(); }
	this.project.dom.trigger('project-widget-hide',{name:this.options.name});
}
tc.gam.widgets.resources.prototype.handlers = {
	
}

/*   widgets.goals   */
tc.gam.widgets.goals = makeClass();
//tc.gam.widgets.goals.prototype = tc.gam.widgets.base.prototype;
tc.gam.widgets.goals.prototype.init = function(project,dom){
	tc.util.log('tc.gam.widgets.goals.init');
	tc.util.dump(project);
	tc.util.dump(dom);
	this.options = {
		name:'goals'
	};
	this.project = project;
	this.dom = dom;
	this.dom.find('.actions .add').bind('click',{ project:project,me:this },this.handlers.add_goal);
}
tc.gam.widgets.goals.prototype.show = function(){
	if(this.dom){ this.dom.show(); }
	this.project.dom.trigger('project-widget-show',{name:this.options.name});
}
tc.gam.widgets.goals.prototype.hide = function(){
	if(this.dom){ this.dom.hide(); }
	this.project.dom.trigger('project-widget-hide',{name:this.options.name});
}
tc.gam.widgets.goals.prototype.handlers = {
	add_goal:function(e,d){
		e.data.project.components.goals_add.show();
	}
}

/*   widgets.goals_add   */
tc.gam.widgets.goals_add = makeClass();
//tc.gam.widgets.goals.prototype = tc.gam.widgets.base.prototype;
tc.gam.widgets.goals_add.prototype.init = function(project,dom){
	tc.util.log('tc.gam.widgets.goals_add.init');
	tc.util.dump(project);
	tc.util.dump(dom);
	this.options = {
		name:'goals_add'
	};
	this.project = project;
	this.dom = dom;
	this.dom.find('.actions.back a').bind('click',{ project:project,me:this },this.handlers.back);
}
tc.gam.widgets.goals_add.prototype.show = function(){
	if(this.dom){ this.dom.show(); }
	this.project.dom.trigger('project-widget-show',{name:this.options.name});
}
tc.gam.widgets.goals_add.prototype.hide = function(){
	if(this.dom){ this.dom.hide(); }
	this.project.dom.trigger('project-widget-hide',{name:this.options.name});
}
tc.gam.widgets.goals_add.prototype.handlers = {
	back:function(e,d){
		e.data.project.components.goals_add.hide(true);
	}
}

/*   widgets.conversation   */
tc.gam.widgets.conversation = makeClass();
//tc.gam.widgets.conversation.prototype = tc.gam.widgets.base.prototype;
tc.gam.widgets.conversation.prototype.init = function(project,dom){
	tc.util.log('tc.gam.widgets.goals.init');
	tc.util.dump(project);
	tc.util.dump(dom);
	this.options = {
		name:'conversation'
	};
	this.project = project;
	this.dom = dom;
}
tc.gam.widgets.conversation.prototype.show = function(){
	if(this.dom){ this.dom.show(); }
	this.project.dom.trigger('project-widget-show',{name:this.options.name});
}
tc.gam.widgets.conversation.prototype.hide = function(){
	tc.util.log('conversation.hide');
	if(this.dom){ this.dom.hide(); }
	tc.util.dump(this.project);
	this.project.dom.trigger('project-widget-hide',{name:this.options.name});
}
tc.gam.widgets.conversation.prototype.handlers = {
	
}

/*   widgets.fresh_ideas   */
tc.gam.widgets.fresh_ideas = makeClass();
//tc.gam.widgets.fresh_ideas.prototype = tc.gam.widgets.base.prototype;
tc.gam.widgets.fresh_ideas.prototype.init = function(project,dom){
	tc.util.log('tc.gam.widgets.fresh_ideas.init');
	tc.util.dump(project);
	tc.util.dump(dom);
	tc.util.dump(this);
	this.options = {
		name:'fresh_ideas'
	};
	this.project = project;
	this.dom = dom;
}
tc.gam.widgets.fresh_ideas.prototype.show = function(){
	if(this.dom){ this.dom.show(); }
	this.project.dom.trigger('project-widget-show',{name:this.options.name});
}
tc.gam.widgets.fresh_ideas.prototype.hide = function(){
	if(this.dom){ this.dom.hide(); }
	this.project.dom.trigger('project-widget-hide',{name:this.options.name});
}
tc.gam.widgets.fresh_ideas.prototype.handlers = {
	
}

