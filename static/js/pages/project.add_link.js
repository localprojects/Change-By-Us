
if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }
if(!tc.gam.project_widgets){ tc.gam.project_widgets = {}; }

tc.gam.project_widgets.add_link = function(project,dom,deps,options){
	var widget, me;
	tc.util.log("project.add_link");
	me = this;
	this.options = tc.jQ.extend({name:'add_link'},options);
	this.dom = dom; 
	widget = tc.gam.widget(this,project);
	this.handlers = {
		
	};
	
	this.elements = {
		window: tc.jQ(window)
	};
	
	this.components = {
		merlin:null
	};
	
	this.build_merlin = function(){
		if(this.components.merlin){
			return;
		}
		this.components.merlin = new tc.merlin(options.app,{
			name:'add-link',
			dom:dom.find('.merlin.add-link'),
			next_button:dom.find('a.submit'),
			first_step:'link-info',
			use_hashchange:false,
			data:{
				project_id:null,
				title:null,
				url:null,
				main_text:""
			},
			steps:{
				'link-info':{
					selector:'.step.add-link-step',
					next_step:'link-submit',
					inputs:{
						title:{
							selector:'input.link-title',
							validators:['min-3','max-50','required'],
							hint:'Title',
							counter:{
								selector:'.charlimit.title',
								limit:50
							}
						},
						url:{
							selector:'input.link-href',
							validators:['min-3','max-300','required','url'],
							hint:'URL'
						},
						main_text:{
							selector:'input.main_text',
							validators:['max-0']
						}
					},
					init:function(merlin,dom){
						merlin.current_step.inputs.title.dom.removeClass('has-been-focused').removeClass('has-attempted-submit').val('').triggerHandler('keyup');
						merlin.current_step.inputs.url.dom.removeClass('has-been-focused').removeClass('has-attempted-submit').val('').triggerHandler('keyup');
						
						merlin.current_step.inputs.title.dom.val('Title');
						merlin.current_step.inputs.url.dom.val('URL');
						
					},
					finish:function(merlin,dom){
						merlin.options.data = tc.jQ.extend(merlin.options.data,{
							project_id:merlin.app.app_page.data.project.project_id,
							title:merlin.current_step.inputs.title.dom.val(),
							url:merlin.current_step.inputs.url.dom.val(),
							main_text:merlin.current_step.inputs.main_text.dom.val()
						});
					}
				},
				'link-submit':{
					selector:'.step.submit-link-step',
					init:function(merlin,dom){
						tc.jQ.ajax({
							type:'POST',
							url:'/project/link/add',
							data:merlin.options.data,
							context:merlin,
							dataType:'text',
							success:function(data,ts,xhr){
								if(data == 'False'){
									return false;
								}
								project.dom.trigger('resources-refresh',{type:'link'});
								window.location.hash = 'project-home';
							}
						});
					}
				}
			}
		});
	};
	
	this.build_merlin();
	
	return {
		show:function(propagate){
			widget.show(propagate);
			if(me.components.merlin){
				me.components.merlin.show_step('link-info');
			}
			
			if((me.dom.offset().top - me.elements.window.scrollTop()) < 0){
				//me.elements.window.scrollTop(me.dom.offset());
				me.elements.window.scrollTop(0);
			}
		},
		hide:widget.hide
	};
};