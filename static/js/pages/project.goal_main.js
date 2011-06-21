if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }
if(!tc.gam.project_widgets){ tc.gam.project_widgets = {}; }

tc.gam.project_widgets.goals_main = function(project,dom,deps,options){
	var widget, me;
	me = this;
	tc.util.log("project.goals_main");
	this.project = project;
	this.options = tc.jQ.extend({name:'goals_main'},options);
	this.dom = dom;
	widget = tc.gam.widget(this,project);
	this.handlers = {
		make_goal_active: function(e, d) {
			var t, goal_id;
			
			e.preventDefault();
			t = e.target;
			if(t.nodeName == 'SPAN'){
				t = t.parentNode;
			}
			goal_id = t.href.split(",")[1];
			
			tc.jQ.ajax({
				type:'POST',
				url:'/project/goal/active',
				data:{
					project_id: e.data.me.options.app.app_page.data.project.project_id,
					goal_id: goal_id
				},
				context:e.data.me,
				dataType:'text',
				success:function(data,ts,xhr){
					if(data == 'False'){
						return false;
					}
					this.project.dom.trigger('goals-refresh');
				}
			});
		},
		mark_goal_accomplished: function(e, d) {
			var t, goal_id;
			
			e.preventDefault();
			t = e.target;
			if(t.nodeName == 'SPAN'){
				t = t.parentNode;
			}
			goal_id = t.href.split(",")[1];
			
			tc.jQ.ajax({
				type:'POST',
				url:'/project/goal/accomplish',
				data:{
					project_id: e.data.me.options.app.app_page.data.project.project_id,
					goal_id: goal_id
				},
				context:e.data.me,
				dataType:'text',
				success:function(data,ts,xhr){
					if(data == 'False'){
						return false;
					}
					this.project.dom.trigger('goals-refresh');
				}
			});
		},
		remove_goal: function(e, d) {
			e.preventDefault();
			
			e.data.project.options.app.components.modal.show({
				app:e.data.project.options.app,
				source_element:tc.jQ('.modal-content.remove-goal'),
				submit:function(){
					tc.jQ.ajax({
						type:'POST',
						url:'/project/goal/remove',
						data:{
							project_id:e.data.project.project_id,
							goal_id:e.target.href.split(',')[1]
						},
						context:this,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False'){
								return false;
							}
							project.dom.trigger('goals-refresh');
						}
					});
				}
			});
		},
		goals_refresh:function(e){
			tc.util.dump('goals_main.goals-refresh');
			tc.jQ.ajax({
				type:'GET',
				url:'/project/goals',
				data:{
					project_id:e.data.me.project.data.project_id
				},
				context:e.data.me,
				dataType:'text',
				success:function(data,ts,xhr){
					var d;
					try{
						d = tc.jQ.parseJSON(data);
					}catch(e){
						return;
					}
					this.handle_goals(d);
				}
			});
		}
	};
	
	function init_carousel() {
		if (me.carousel) {
			me.carousel.destroy();
		}
		me.carousel = new tc.carousel({
			element: me.dom.find(".carousel")
		});
	}
	
	function setup_events() {
		tc.util.log("project.goals_main.setup_events");
		me.dom.find('a.close').unbind('click').bind('click', { project:project, me:me }, me.handlers.remove_goal);
		me.dom.find(".control-accomplished a").unbind("click").bind("click", { project:project, me:me }, me.handlers.mark_goal_accomplished);
		me.dom.find(".make-this-active a").unbind('click').bind("click", { project:project, me:me }, me.handlers.make_goal_active);
		if (me.carousel.carousel){
			me.carousel.carousel.getRoot().unbind('onSeek').bind('onSeek', { project:project, me:me }, me.handle_carousel_seek);
		}
	}
	
	this.elements = {
		state_empty:dom.find('.goals-empty'),
		state_not_empty:dom.find('.goals-display')
	};
	
	project.dom.unbind('goals-refresh', this.handlers.goals_refresh).bind('goals-refresh',{me:this},this.handlers.goals_refresh);
			
	this.generate_goal = function(data){
		var temphtml;
		temphtml = tc.jQ('<li class="goal"></li>').append(tc.jQ('.template-content.goal').clone().children());
		
		temphtml.attr('rel',data.goal_id+','+data.active).css('width','512px');
		temphtml.find('a.close').attr('href','#removeGoal,'+data.goal_id);
		
		
		tc.util.dump('----');
		tc.util.dump(data.text);
		tc.util.dump(data.active);
		tc.util.dump(temphtml);
		tc.util.dump(temphtml.find('.make-this-active'));
		if(data.active == true){
			temphtml.find('.make-this-active').remove();
		} else {
			temphtml.find('.make-this-active a').attr('href','#makeActive,'+data.goal_id);
		}
		
		//tc.util.dump(data.accomplished);
		//tc.util.dump(temphtml.find(".control-accomplished"));
		if (data.accomplished == true) {
			
			temphtml.find(".control-accomplished").remove();
		} else {
			temphtml.find(".label-accomplished").remove();
			temphtml.find('.control-accomplished a').attr("href", "#markAccomplished,"+data.goal_id);
		}
		
		temphtml.find('.goal-title').text(data.text);
		temphtml.find('.timeframe').text(data.timeframe);
		temphtml.find('.owner-name').html("<a href='/useraccount/"+data.owner.u_id+"'>"+tc.truncate(data.owner.name,15)+"</a>");
		temphtml.find(".timestamp .datetime").text(data.created_datetime);
		
		return temphtml;
	};
	
	this.handle_carousel_seek = function(e){
		var active;
		active = e.data.me.carousel.carousel.getItems().eq(e.data.me.carousel.carousel.getIndex()).attr('rel').split(',')[1];
		if(active == 'True' || active == 'true' || active == true){
			e.data.project.dom.find('.active-goal-indicator').stop().animate({
				'opacity':1.0
			},600,'easeOutCubic');
		} else {
			e.data.project.dom.find('.active-goal-indicator').stop().animate({
				'opacity':0.0
			},600,'easeOutCubic');
		}
	};
	
	this.handle_goals = function(data){
		var i, list, temphtml, n_goals;
		
		list = this.dom.find('ul.items');
		
		if (data.length === 0) {
			this.elements.state_not_empty.hide();
			this.elements.state_empty.show();
			this.dom.find(".counter").text("0");
			list.empty();
			init_carousel();
			return;
		}
		
		this.elements.state_empty.hide();
		this.elements.state_not_empty.show();
		this.dom.find('.counter').text(data.length);
		
		n_goals = list.children().length;
		if (!this.carousel.is_rendered()) {

			for(i in data){
				if(data[i].active){
					list.append(this.generate_goal(data[i]));
					delete data[i];
					break;
				}
			}
			for(i in data){
				list.append(this.generate_goal(data[i]));
			}
			this.carousel.render();
			
		} else {
			this.carousel.carousel.getItems().remove();
			for(i in data){
				if(data[i].active){
					this.carousel.carousel.addItem(this.generate_goal(data[i]));
					delete data[i];
					break;
				}
			}
			for(i in data){
				this.carousel.carousel.addItem(this.generate_goal(data[i]));
			}
			if(list.children().length > n_goals){
				this.carousel.carousel.end();
			} else {
				this.carousel.carousel.begin();
			}
		}
		
		setup_events();
	};
	
	
	init_carousel();
	setup_events();
	
	if (this.carousel.carousel) {
		this.carousel.carousel.getRoot().trigger('onSeek');
	}
	
	return {
		show:function(propagate){
			var has_items;
			has_items = me.carousel.has_items();
			if (has_items) {
				me.elements.state_empty.hide();
				me.elements.state_not_empty.show();
			}
			widget.show(propagate);
			if (has_items && !me.carousel.is_rendered()) {
				me.carousel.render();
			}
		},
		hide:widget.hide
	};
};