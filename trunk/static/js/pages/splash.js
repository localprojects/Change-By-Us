app_page.features.push(function(app){	
	app.components.merlin = new tc.merlin(app,{
		dom:tc.jQ('.merlin'),
		next_button:tc.jQ('#submit'),
		first_step:'start',
		data:{
			email: null,
			text:''
		},
		steps:{
			'start':{
				selector:'.email-start',
				next_step:'finish',
				inputs:{
					email:{
						selector:'input.email',
						validators:['min-6','max-254','required','email'],
						hint:'Your email address'
					}
				},
				init:function(merlin,dom){
				},
				finish:function(merlin,dom){
					merlin.options.data = tc.jQ.extend(merlin.options.data,{
						email:merlin.current_step.inputs.email.dom.val(),
						text:''
					});
					dom.hide();
				}
			},
			'finish':{
				selector:'.email-finish',
				init:function(merlin,dom){
					tc.jQ.ajax({
						type:'POST',
						url:'/beta/submit',
						data:merlin.options.data,
						context:merlin,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False'){
								return;
							}
						}
					});
				}
			}
		}
	});
});