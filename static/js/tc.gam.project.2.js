if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }


tc.gam.project = function(options){
	
	this.options = tc.jQ.extend({
		
	},options);
	
	this.dom = this.options.dom;
	this.event_data = { project:this };
	
	this.components = {
		info:new tc.gam.widgets.infopane(this,this.dom.find('.mission'),{widget:this.widget}),
		members:new tc.gam.widgets.members(this,this.dom.find('.box.members'),{widget:this.widget}),
		resources:new tc.gam.widgets.resources(this,this.dom.find('.members'),{widget:this.widget}),
		goals:new tc.gam.widgets.goals(this,this.dom.find('.goals'),{widget:this.widget}),
		goals_add:new tc.gam.widgets.goals_add(this,this.dom.find('.goals-add'),{widget:this.widget}),
		conversation:new tc.gam.widgets.conversation(this,this.dom.find('.conversation'),{widget:this.widget}),
		related_ideas:new tc.gam.widgets.fresh_ideas(this,this.dom.find('.fresh-ideas'),{widget:this.widget})
	}
	
	this.handlers = {
		members_button_clicked:function(e,d){
			tc.util.dump('project.members_button_clicked');
			e.data.project.components.members.show();
		},
		widget_show:function(e,d){
			tc.util.dump('project.widget_show');
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


tc.gam.widget = function(){
	
	function show(){
		if(this.dom){ this.dom.show(); }
		this.project.dom.trigger('project-widget-show',{name:this.options.name});
	}
	
	function hide(){
		if(this.dom){ this.dom.hide(); }
		this.project.dom.trigger('project-widget-hide',{name:this.options.name});
	}
	
	return {
		show:show,
		hide:hide
	}
	
}