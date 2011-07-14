app_page.features.push(function(app){
	tc.util.log('Give A Minute: Login');
		
	tc.jQ('a.login-facebook, a.login-twitter').bind('click', {buttons:tc.jQ('a.login-facebook, a.login-twitter')}, function(e){
		var $t;
		$t = tc.jQ(this);
		if($t.hasClass('has-been-clicked') || $t.hasClass('cannot-be-clicked')){
			e.preventDefault();
		}
		$t.addClass('has-been-clicked').siblings().addClass('cannot-be-clicked');
	})
	
	app.components.merlin = new tc.merlin(app,{
		dom:tc.jQ('.merlin.login'),
		next_button:tc.jQ('button.next-button'),
		first_step: (window.location.hash == '#forgot-password') ? 'forgot-password' : 'start',
		data:{
			email:null,
			password:null
		},
		steps:{
			'start':{
				selector:'.start',
				next_step:'login-process',
				inputs:{
					email:{
						selector:'input.email',
						validators:['min-3','max-100','required'],
						hint:''
					},
					password:{
						selector:'input.password',
						validators:['min-3','max-200','required'],
						hint:''
					}
				},
				finish:function(merlin,dom){
					merlin.options.data = tc.jQ.extend({},merlin.options.data,{
						email:merlin.current_step.inputs.email.dom.val(),
						password:merlin.current_step.inputs.password.dom.val()
					});
				}
			},
			'login-process':{
				selector:'.login-process',
				init:function(merlin,dom){
					tc.jQ.ajax({
						type:'POST',
						url:'/login',
						data:merlin.options.data,
						context:merlin,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False'){
								window.location.hash = 'login-failure';
								return;
							}
							if(merlin.app.app_page.data.redir_from){
								window.location = merlin.app.app_page.data.redir_from;
							} else {
								window.location = '/useraccount#user-account,account';
							}
						}
					});
				}
			},
			/* Step: facebook-login-preprocess  */
			'facebook-login-preprocess':{
				progress_selector:'.2',
				selector:'.facebook-login-preprocess',
				prev_step:'start',
				inputs:{},
				init:function(merlin,dom){},
				finish:function(merlin,dom){}
			},
			'login-failure':{
				selector:'.login-failure',
				init:function(merlin,dom){
					
				}
			},
			'forgot-password':{
				selector:'.forgot-password',
				next_step:'forgot-password-process',
				inputs:{
					email:{
						selector:'input.email',
						validators:['min-3','max-32','required'],
						hint:''
					}
				},
				finish:function(merlin,dom){
					merlin.options.data = tc.jQ.extend(merlin.options.data,{
						email:merlin.current_step.inputs.email.dom.val()
					});
				}
			},
			'forgot-password-process':{
				selector:'.forgot-password-process',
				init:function(merlin,dom){
					tc.jQ.ajax({
						type:"POST",
						url:"/login/forgot",
						data:merlin.options.data,
						context:merlin,
						dataType:"text",
						success: function(data, ts, xhr) {
							if (data == "False") {
								window.location.hash = "forgot-password-error";
								return;
							}
							window.location.hash = "forgot-password-finished";
						},
						error: function(xhr, ts, err) {
							window.location.hash = "forgot-password-error";
						}
					});
				}
			},
			'forgot-password-error':{
				selector:'.forgot-password-error',
				init:function(merlin,dom){
					
				}
			},
			'forgot-password-finished':{
				selector:'.forgot-password-finished',
				init:function(merlin,dom){
					
				}
			},
			"forget-password-error": {
				selector:".forgot-password-error",
				init: function(merlin, dom) {

				}
			}
		}
	});
});