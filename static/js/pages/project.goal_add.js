if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }
if(!tc.gam.project_widgets){ tc.gam.project_widgets = {}; }

tc.gam.project_widgets.goals_add = function(project,dom,deps,options){
	var widget, me;
	tc.util.log("project.goals_add");
	this.options = tc.jQ.extend({name:'goals_add'},options);
	this.project = project;
	this.dom = dom;
	widget = tc.gam.widget(this,project);
	me = this;
	this.handlers = {
		goals_refresh: function(e, d) {
			tc.util.dump('goals_add.goals-refresh');
			e.data.me.handle_goals(d);
		}
	};
	
	this.components = {
		merlin:null
	};
	
	this.build_merlin = function(){
		if(this.components.merlin){
			return;
		}
		this.components.merlin = new tc.merlin(options.app,{
			name:'goals_add',
			dom:dom.find('.merlin.add-goal'),
			next_button:dom.find('a.ca-btn'),
			//first_step:null,//'goal-info',
			data:{
				project_id:null,
				text:null,
				timeframe_n:null,
				timeframe_unit:null,
				user_id:null
			},
			use_hashchange:false,
			steps:{
				'goal-info':{
					selector:'.step.info',
					next_step:'goal-submit',
					inputs:{
						message:{
							selector:'textarea.message',
							validators:['min-3','max-140','required'],
							hint:''
						},
						duration:{
							selector:'select.duration',
							validators:['selected'],
							hint:''
						},
						point_person:{
							selector:'select.point_person',
							validators:['selected'],
							hint:''
						}
					},
					init:function(merlin,dom){
						merlin.current_step.inputs.message.dom.val('').removeClass('has-been-focused').removeClass('has-attempted-submit');
						merlin.current_step.inputs.duration.dom.val('-1').removeClass('has-been-focused').removeClass('has-attempted-submit');
						merlin.current_step.inputs.point_person.dom.val('-1').removeClass('has-been-focused').removeClass('has-attempted-submit');
					},
					finish:function(merlin,dom){
						merlin.options.data = tc.jQ.extend(merlin.options.data,{
							project_id:merlin.app.app_page.data.project.project_id,
							text:merlin.current_step.inputs.message.dom.val(),
							timeframe_n:merlin.current_step.inputs.duration.dom.text().split(',')[0],
							timeframe_unit:merlin.current_step.inputs.duration.dom.text().split(',')[1],
							user_id:merlin.current_step.inputs.point_person.dom.text()
						});
					}
				},
				'goal-submit':{
					selector:'.step.finish',
					next_step:'goal-info',
					init:function(merlin,dom){
						tc.jQ.ajax({
							type:'POST',
							url:'/project/goal/add',
							data:merlin.options.data,
							context:merlin,
							dataType:'text',
							success:function(data,ts,xhr){
								if(data == 'False'){
									return false;
								}
								project.update_goals();
								//window.location.hash = 'goals_add,goal-info';
								window.location.hash = 'project-home';
							}
						});
					}
				}
			}
		});
	};
	
	this.build_merlin();
	
	project.dom.unbind('goals-refresh', this.handlers.goals_refresh).bind('goals-refresh',{me:this},this.handlers.goals_refresh);
	
	this.handle_goals = function(data) {
		this.dom.find('.counter').text(data.length);
	};
	
	return {
		show:function(propagate){
			widget.show(propagate);
			if(me.components.merlin){
				me.components.merlin.show_step('goal-info');
			}
		},
		hide:widget.hide
	};
};