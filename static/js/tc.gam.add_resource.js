/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }

tc.gam.add_resource = function(app, options) {
	
	var o = tc.jQ.extend({
		elements: null
	}, options);

	o.elements.bind('click',{
		app:app,
		source_element:tc.jQ('.modal-content.add-resource'),
		init:function(modal,event_target,callback){
			var modal_merlin;
			modal_merlin = new tc.merlin(app,{
				use_hashchange: false,
				name:'add-resource',
				dom:modal.options.element.find('.add-resource'),
				next_button: tc.jQ('a.submit'),
				first_step: 'add-resource-project-info',
				data:{
					project_id: null,
					project_resource_id: null
				},
				steps:{
					'add-resource-project-info':{
						selector:'.add-resource-project-info',
						next_step:'add-resource-submit',
						inputs:{
							project_radios:{
								selector:'.project-radio',
								vallidators:['required']
							}
						},
						init: function(merlin, dom) {
							var name;
						
							dom.find('input[type=checkbox],input[type=radio]').prettyCheckboxes();
						
							if(dom.find('.project-radio').length == 1){
								dom.find('.project-radio').first().attr('checked',true);
							}
					
						},
						finish: function(merlin, dom) {
							if(merlin.current_step.inputs.project_radios.dom.filter(":checked").length){
								merlin.options.data = tc.jQ.extend(merlin.options.data, {
									project_id: merlin.current_step.inputs.project_radios.dom.filter(":checked").attr("rel").split(",")[1],
									project_resource_id: event_target.hash.split(',')[1]
								});
							}
						}
					},
					'add-resource-submit':{
						selector:'.add-resource-submit',
						init: function(merlin, dom) {
						
						
							tc.jQ.ajax({
								type:"POST",
								url:"/project/resource/add",
								data:merlin.options.data,
								context:merlin,
								dataType:"text",
								success: function(data, ts, xhr) {
									//if (data == "False") {
									//	return false;
									//}
									//tc.jQ(event_target).addClass("disabled").text("Added");
									tc.jQ(event_target).parents('td').addClass('added');
									tc.timer(1000, function() {
										modal.hide();
									});
								}
							});
						}
					}
				}
			});
			if(tc.jQ.isFunction(callback)){
				callback(modal);
			}
		}
	},function(e,d){
		e.preventDefault();
		e.data.app.components.modal.show(e.data, e.target);
	});
};