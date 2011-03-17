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
	this.widget = new tc.gam.widget(null,this);
	
	this.components = {
		infopane:new tc.gam.project_widgets.infopane(this,this.dom.find('.box.mission'),{widget:this.widget},{}),
		resources:new tc.gam.project_widgets.resources(this,this.dom.find('.box.resources'),{widget:this.widget},{}),
		related_ideas:new tc.gam.project_widgets.fresh_ideas(this,this.dom.find('.box.fresh-ideas'),{widget:this.widget},{}),
		related_resources:new tc.gam.project_widgets.related_resources(this,this.dom.find('.box.related-resources'),{widget:this.widget},{}),
		goals_main:new tc.gam.project_widgets.goals_main(this,this.dom.find('.box.goals-main'),{widget:this.widget},{}),
		goals_add:new tc.gam.project_widgets.goals_add(this,this.dom.find('.box.goals-add'),{widget:this.widget},{}),
		goals_stack:new tc.gam.project_widgets.goals_stack(this,this.dom.find('.box.goals-stack-holder'),{widget:this.widget},{}),
		conversation:new tc.gam.project_widgets.conversation(this,this.dom.find('.box.conversation'),{widget:this.widget},{}),
		members:new tc.gam.project_widgets.members(this,this.dom.find('.box.members'),{widget:this.widget},{})
	};
	
	function go_home(e) {
		e.data.project.components.goals_main.show(false);
		e.data.project.components.conversation.show(false);
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
					e.data.project.components.goals_main.hide(false);
					e.data.project.components.goals_stack.hide(false);
					e.data.project.components.goals_add.hide(false);
					e.data.project.components.conversation.hide(false);
					break;
				case 'goals_add':
					e.data.project.components.goals_main.hide(false);
					e.data.project.components.goals_stack.hide(false);
					e.data.project.components.members.hide(false);
					e.data.project.components.conversation.hide(false);
					break;
				case 'related_resources':
					e.data.project.components.goals_main.hide(false);
					e.data.project.components.goals_stack.hide(false);
					e.data.project.components.members.hide(false);
					e.data.project.components.conversation.hide(false);
					break;
			}
		},
		widget_hide:function(e,d){
			tc.util.dump('project.widget_hide');
			switch(d.name){
				case 'members':
					go_home(e);
					break;
				case 'goals_add':
					go_home(e);
					break;
				case 'related_resources':
					go_home(e);
					break;
			}
		}
	};
	
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
};

tc.gam.project_widgets = {};

tc.gam.project_widgets.infopane = function(project,dom,deps,options){
	var widget;
	this.options = tc.jQ.extend({name:'infopane'},options);
	this.dom = dom;
	widget = tc.gam.widget(this,project);
	return {
		show:widget.show,
		hide:widget.hide
	};
};

tc.gam.project_widgets.resources = function(project,dom,deps,options){
	var widget;
	this.options = tc.jQ.extend({name:'resources'},options);
	this.dom = dom; 
	widget = tc.gam.widget(this,project);
	this.handlers = {
		add_resource: function(e, d) {
			e.preventDefault();
			e.data.project.components.related_resources.show(true);
		}
	};
	this.dom.find("a.add-resource").bind('click',{ project:project,me:this },this.handlers.add_resource);
	return {
		show:widget.show,
		hide:widget.hide
	};
};

tc.gam.project_widgets.fresh_ideas = function(project,dom,deps,options){
	var widget;
	this.options = tc.jQ.extend({name:'infopane'},options);
	this.dom = dom;
	widget = tc.gam.widget(this,project);
	
	this.carousel = new tc.carousel({
		element: this.dom.find(".carousel"),
		pagination: {
			current: this.dom.find(".pagination .cur-index"),
			total: this.dom.find(".pagination .total")
		}
	}).carousel;
	
	return {
		show:widget.show,
		hide:widget.hide
	};
};

tc.gam.project_widgets.related_resources = function(project,dom,deps,options){
	var widget;
	this.options = tc.jQ.extend({name:'related_resources'},options);
	this.dom = dom; 
	widget = tc.gam.widget(this,project);
	this.handlers = {
		back:function(e,d){
			e.preventDefault();
			e.data.project.components.related_resources.hide(true);
		}
	};
	this.dom.find('.actions a.back').bind('click',{ project:project,me:this },this.handlers.back);
	return {
		show:widget.show,
		hide:widget.hide
	};
};

tc.gam.project_widgets.goals_main = function(project,dom,deps,options){
	var widget;
	this.options = tc.jQ.extend({name:'goals_main'},options);
	this.dom = dom;
	widget = tc.gam.widget(this,project);
	this.handlers = {
		see_all:function(e,d) {
			e.preventDefault();
			e.data.project.components.goals_stack.show();
		},
		add_goal:function(e,d){
			e.preventDefault();
			e.data.project.components.goals_add.show();
		},
		carousel_scrolled: function(e, index) {
			
		}
	};
	
	this.carousel = new tc.carousel({
		element: this.dom.find(".carousel")
	}).carousel;
	this.carousel.onSeek(this.handlers.carousel_scrolled);
	
	this.dom.find('.actions .see-all').bind('click',{ project:project,me:this },this.handlers.see_all);
	this.dom.find('.actions .add').bind('click',{ project:project,me:this },this.handlers.add_goal);
	return {
		show:widget.show,
		hide:widget.hide
	};
};

tc.gam.project_widgets.goals_add = function(project,dom,deps,options){
	var widget; 
	this.options = tc.jQ.extend({name:'goals_add'},options);
	this.dom = dom;
	widget = tc.gam.widget(this,project); 
	this.handlers = {
		back:function(e,d){
			e.preventDefault();
			e.data.project.components.goals_add.hide(true);
		}
	};
	this.dom.find('.actions a.back').bind('click',{ project:project,me:this },this.handlers.back);
	return {
		show:widget.show,
		hide:widget.hide
	};
};

tc.gam.project_widgets.goals_stack = function(project,dom,deps,options){
	var widget; 
	this.options = tc.jQ.extend({name:'goals_stack'},options);
	this.dom = dom;
	widget = tc.gam.widget(this,project); 
	this.handlers = {

	};
	return {
		show:widget.show,
		hide:widget.hide
	};
};

tc.gam.project_widgets.conversation = function(project,dom,deps,options){
	var widget;
	this.options = tc.jQ.extend({name:'conversation'},options);
	this.dom = dom;
	widget = tc.gam.widget(this,project);
	this.elements = {
		userprompt: this.dom.find(".conversation-input label"),
		textpane: this.dom.find(".conversation-input textarea"),
		post_btn: this.dom.find(".conversation-controls .primary-action .ca-btn"),
		load_more_btn: this.dom.find(".load-more > a")
	};
	this.handlers = {
		userprompt_click: function(e, d) {
			e.data.me.elements.textpane.focus();
		},
		textpane_focus: function(e, d) {
			if (tc.validator_utils.isEmpty(tc.jQ(this).val())) {
				e.data.me.elements.userprompt.hide();
			}
		},
		textpane_blur: function(e, d) {
			if (tc.validator_utils.isEmpty(tc.jQ(this).val())) {
				e.data.me.elements.userprompt.show();
			}
		},
		post_click: function(e, d) {
			e.preventDefault();
		},
		load_more_click: function(e, d) {
			e.preventDefault();
		}
	};
	this.elements.userprompt.bind("click", { project:project,me:this },this.handlers.userprompt_click);
	this.elements.textpane.bind("focus", { project:project,me:this },this.handlers.textpane_focus);
	this.elements.textpane.bind("blur", { project:project,me:this },this.handlers.textpane_blur);
	this.elements.post_btn.bind("click", { project:project,me:this },this.handlers.post_click);
	this.elements.load_more_btn.bind("click", { project:project,me:this },this.handlers.load_more_click);
	return { 
		show:widget.show,
		hide:widget.hide
	};
};

tc.gam.project_widgets.members = function(project,dom,deps,options){
	var widget, me;
	me = this;
	this.options = tc.jQ.extend({name:'members'},options);
	this.dom = dom;
	widget = tc.gam.widget(this,project);
	this.elements = {
		ideas_invite: {
			elements: {
				carousel: null
			}
		}
	};
	this.handlers = {
		back:function(e,d){
			e.preventDefault();
			e.data.me.hide(true);
		}
	};
	
	// initialize carousels the first time
	// this widget is rendered
	function init_carousels() {
		me.elements.ideas_invite.elements.carousel = new tc.carousel({
			element: me.dom.find(".ideas-invite .carousel"),
			pagination: {
				current: me.dom.find(".ideas-invite .pagination .cur-index"),
				total: me.dom.find(".ideas-invite .pagination .total")
			}
		}).carousel;
	}
	
	this.dom.find('.actions a.back').bind('click',{ project:project,me:this },this.handlers.back);
	return {
		show:function(propagate) {
			widget.show(propagate);
			if (!me.elements.ideas_invite.elements.carousel) {
				init_carousels();
			}
		},
		hide:widget.hide
	};
};
