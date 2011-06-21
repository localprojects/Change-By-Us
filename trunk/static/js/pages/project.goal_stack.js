if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }
if(!tc.gam.project_widgets){ tc.gam.project_widgets = {}; }

tc.gam.project_widgets.goals_stack = function(project,dom,deps,options){
	var widget, me;
	tc.util.log("project.goals_stack");
	me = this;
	this.project = project;
	this.options = tc.jQ.extend({name:'goals_stack'},options);
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
							project_id:e.data.me.options.app.app_page.data.project.project_id,
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
			tc.util.dump('goals_stack.goals-refresh');
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
	
	project.dom.unbind("goals-refresh", this.handlers.goals_refresh).bind('goals-refresh',{me:this},this.handlers.goals_refresh);
	
	function setup_events() {
		tc.util.log("project.goals_stack.setup_events");
		me.dom.find(".make-this-active a").unbind('click').bind("click", { project:project, me:me }, me.handlers.make_goal_active);
		me.dom.find(".control-accomplished a").unbind("click").bind("click", { project:project, me:me }, me.handlers.mark_goal_accomplished);
		me.dom.find('a.close').unbind('click').bind('click', { project:project, me:me }, me.handlers.remove_goal);
	}
	
	this.generate_markup = function(data){
		var temphtml;
		//temphtml = tc.jQ('.template-content.goal-stack-item').clone().removeClass('template-content');
		temphtml = tc.jQ('<li class="goal-stack-item"></li>').append(tc.jQ('.template-content.goal-stack-item').clone().children());
		temphtml.find('.goal-title').text(data.text);
		if(data.active){
			temphtml.find('.make-this-active').remove();
		} else {
			temphtml.find('.make-this-active a').attr('href','#makeActive,'+data.goal_id);
		}
		if (data.accomplished) {
			temphtml.find(".control-accomplished").remove();
		} else {
			temphtml.find(".label-accomplished").remove();
			temphtml.find('.control-accomplished a').attr("href", "#markAccomplished,"+data.goal_id);
		}
		
		temphtml.find('a.close').attr('href','#remove,'+data.goal_id);
		temphtml.find('.timeframe').text(data.timeframe);
		temphtml.find('.owner-name').html("<a href='/useraccount/"+data.owner.u_id+"'>"+tc.truncate(data.owner.name,15)+"</a>");
		temphtml.find(".timestamp .datetime").text(data.created_datetime);
		
		return temphtml;
	};
	
	this.handle_goals = function(data){
		var i, list, temphtml;
		list = this.dom.find('.goals-stack');
		list.empty();
		
		if (data.length === 0) {
			this.dom.find('.counter').text("0");
			return;
		}
		this.dom.find('.counter').text(data.length);
		for(i in data){
			if(data[i].active){
				list.append(this.generate_markup(data[i]));
				delete data[i];
				break;
			}
		}
		for(i in data){
			list.append(this.generate_markup(data[i]));
		}
		setup_events();
	};
	
	setup_events();
	
	return {
		show:widget.show,
		hide:widget.hide
	};
};