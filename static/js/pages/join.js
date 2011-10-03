app_page.features.push(tc.user_handler({
	user_handler:function(){
		window.location = '/useraccount';
	}
}));

app_page.features.push(function(app){
	tc.util.log('Give A Minute: Register');
	
	tc.jQ('a.login-facebook, a.login-twitter').bind('click', {buttons:tc.jQ('a.login-facebook, a.login-twitter')}, function(e){
		var $t;
		$t = tc.jQ(this);
		if($t.hasClass('has-been-clicked') || $t.hasClass('cannot-be-clicked')){
			e.preventDefault();
		}
		$t.addClass('has-been-clicked').siblings().addClass('cannot-be-clicked');
	});
	
	app.components.merlin = new tc.merlin(app,{
		dom:tc.jQ('form.merlin'),
		progress_element:tc.jQ('.merlin-progress'),
		next_button:tc.jQ('.ca-btn'),
		back_button:tc.jQ('.foothills .back'),
		error_indicator:tc.jQ('.oops'),
		watch_keypress:true,
		magic:false,
		first_step:app.app_page.data.first_join_step,
		data:{
			f_name:null,
			l_name:null,
			email:null,
			password:null,
			sms_phone:'-1',
			beta_code:null,
			main_text:""
		},
		steps:{
			/* Step: Start  */
			'start':{
				progress_selector:'.1',
				selector:'.start',
				prev_step:null,
				next_step:'user-info',
				use_for_history:true,
				init:function(merlin,dom){
					tc.jQ('.foothills a.back').hide();
				},
				finish:function(merlin,dom){
					tc.jQ('.foothills a.back').show();
				}
			},
			/* Step: user-info  */
			'user-info':{
				progress_selector:'.2',
				selector:'.user-info',
				prev_step:'start',
				next_step:'email-lookup',
				use_for_history:true,
				inputs:{
					f_name:{
						selector:'input.f_name',
						validators:['max-128','min-2','required'],
						hint:'First name'
					},
					l_name:{
						selector:'input.l_name',
						validators:['max-128','min-2','required'],
						hint:'Last name'
					},
					email:{
						selector:'input.email',
						validators:['max-128','min-3','email','required'],
						hint:''
					},
					password:{
						selector:'input.password',
						validators:['password-35','required'],
						hint:''
					},
					main_text:{
						selector:'input.main_text',
						validators:['max-0']
					},
					tos_user_info:{
						selector:'input.tos-user-info',
						validators:['required']
					},
					invite:{
						selector:'input.invite-code',
						validators:function(merlin,dom,current_step){
							if(merlin.app.app_page.data.app_mode == 'beta'){
								return tc.validate(dom,['max-10','min-10','required']);
							}
							return tc.validate(dom,['max-10','min-10']);
						},
						hint:''
					}
				},
				init:function(merlin,dom){
					if(merlin.app.app_page.data.app_mode == 'beta'){
						tc.jQ('.merlin-progress a.indicator.1').hide();
						tc.jQ('.merlin-progress a.indicator.2 .num').html('1');
						tc.jQ('.merlin-progress a.indicator.3 .num').html('2');
						tc.jQ('.foothills a.back').hide();
					}
				},
				finish:function(merlin,dom){
					merlin.options.data = tc.jQ.extend(merlin.options.data,{
						f_name:merlin.current_step.inputs.f_name.dom.val(),
						l_name:merlin.current_step.inputs.l_name.dom.val(),
						email:merlin.current_step.inputs.email.dom.val(),
						main_text:merlin.current_step.inputs.main_text.dom.val(),
						password:merlin.current_step.inputs.password.dom.val(),
						beta_code:merlin.current_step.inputs.invite.dom.val()
					});
					
					if(merlin.app.app_page.data.app_mode == 'beta'){
						tc.jQ('.foothills a.back').show();
					}
					
				}
			},
			/* Step: twitter-login  */
			'twitter-login':{
				progress_selector:'.2',
				selector:'.twitter-step',
				prev_step:'start',
				next_step:'email-lookup',
				use_for_history:true,
				inputs:{
					f_name:{
						selector:'input.f_name',
						validators:['max-128','min-3','required'],
						hint:'First name'
					},
					l_name:{
						selector:'input.l_name',
						validators:['max-128','min-3','required'],
						hint:'Last name'
					},
					email:{
						selector:'input.email',
						validators:['max-32','min-3','email','required'],
						hint:''
					},
					tos_email:{
						selector:'input.tos-user-info',
						validators:['required'],
						hint:''
					}
				},
				finish:function(merlin,dom){
					merlin.options.data = tc.jQ.extend(merlin.options.data,{
						f_name:merlin.current_step.inputs.f_name.dom.val(),
						l_name:merlin.current_step.inputs.l_name.dom.val(),
						email:merlin.current_step.inputs.email.dom.val()
					});
					merlin.options.steps['email-lookup'].data.last_step = 'twitter-login';
				}
			},
			/* Step: facebook-login-preprocess  */
			'facebook-login-preprocess':{
				supress_hash:true,
				progress_selector:'.2',
				selector:'.facebook-login-preprocess',
				prev_step:'start',
				inputs:{},
				init:function(merlin,dom){},
				finish:function(merlin,dom){}
			},
			/* Step: facebook-login  */
			'facebook-login':{
				progress_selector:'.2',
				selector:'.email-step',
				prev_step:'user-info',
				next_step:'email-lookup',
				use_for_history:true,
				inputs:{
					tos_email:{
						selector:'input.tos-email',
						validators:['required'],
						hint:''
					}
				},
				finish:function(merlin,dom){
					merlin.options.steps['email-lookup'].data.last_step = 'facebook-login_twitter_create';
				}
			},
			/* Step: email-lookup  */
			'email-lookup':{
				supress_hash:true,
				progress_selector:null,
				selector:'.email-lookup',
				prev_step:'user-info',
				next_step:'sms-lookup',
				data:{
					last_step:null
				},
				init:function(merlin,dom){
					tc.jQ.ajax({
						url:'/join/users',
						data: {
							email: merlin.options.data.email
						},
						context:merlin,
						dataType:'json',
						success:function(data,ts,xhr){
							if(data.n_users){
								merlin.options.steps['user-info'].inputs['email'].validators.push('not-'+merlin.options.data.email);
								merlin.options.steps['twitter-login'].inputs['email'].validators.push('not-'+merlin.options.data.email);
								if(merlin.options.error_indicator){
									merlin.options.error_indicator.html('<span>Oops! We found someone with that name and email address in our system. <a href="/login#forgot-password" class="oops-forgot">Forgot your password?</a></span>').show();
								}
								if(this.current_step.data.last_step){
									this.show_step(this.current_step.data.last_step);
									return;
								}
								this.show_step('user-info');
							} else {
								this.show_step('sms-lookup');
							}
						}
					});
				}
			},
			/* Step: email-step  */
			'email-step':{
				progress_selector:'.2',
				selector:'.email-step',
				prev_step:'user-info',
				next_step:'email-lookup',
				use_for_history:true,
				inputs:{
					email:{
						selector:'input.email-alt',
						validators:['min-3','max-32','email'],
						hint:''
					},
					tos_email:{
						selector:'input.tos-email',
						validators:function(merlin,element,step){
							if(step.dom.find('input.email').val().length){
								return tc.validate(element,['required']);
							} else {
								return {
									valid:true
								}
							}
						},
						hint:''
					}
				}
			},
			/* Step: sms-lookup  */
			'sms-lookup':{
				progress_selector:'.3',
				selector:'.sms-lookup',
				prev_step:'email-step',
				//next_step:'finish',
				next_step:app.app_page.data.sms_next_step,
				use_for_history:true,
				inputs:{
					phone_1:{
						selector:'input.phone_1',
						validators:['min-3','max-3','numeric'],
						hint:'',
						handlers:{
							keyup:function(e,d){
								if(e.target.value.length == 3 && e.target.className.indexOf('not-valid') == -1){
									e.data.me.current_step.inputs.phone_2.dom.focus();
								}
							}
						}
					},
					phone_2:{
						selector:'input.phone_2',
						validators:['min-3','max-3','numeric'],
						hint:'',
						handlers:{
							keyup:function(e,d){
								if(e.target.value.length == 3 && e.target.className.indexOf('not-valid') == -1){
									e.data.me.current_step.inputs.phone_3.dom.focus();
								} else if(e.target.value.length == 0 && e.which == 8){
									e.data.me.current_step.inputs.phone_1.dom.focus();
								}
							}
						}
					},
					phone_3:{
						selector:'input.phone_3',
						validators:['min-4','max-4','numeric'],
						hint:'',
						handlers:{
							keyup:function(e,d){
								if(e.keyCode == 13){
									e.data.me.current_step.inputs.submit.dom.click();
								} else if(e.target.value.length == 0 && e.which == 8){
									e.data.me.current_step.inputs.phone_2.dom.focus();
								}
							}
						}
					},
					submit:{
						selector:'.submit-sms-query',
						handlers:{
							click:function(e,d){
								var i;
								for(i in e.data.me.current_step.inputs){
									if((i != 'submit' && i != 'no_sms') && !e.data.me.current_step.inputs[i].dom.hasClass('valid')){
										return false;
									}
								}
								e.data.me.options.data.sms_phone = e.data.me.current_step.inputs.phone_1.dom.val()+e.data.me.current_step.inputs.phone_2.dom.val()+e.data.me.current_step.inputs.phone_3.dom.val();
								//window.location.hash = 'sms-process';
								e.data.me.show_step('sms-process');
							}
						}
					},
					no_sms:{
						selector:'input.no_sms',
						validators:['required']
					}
				}
			},
			/* Step: sms-process  */
			'sms-process':{
				supress_hash:true,
				progress_selector:'.3',
				selector:'.sms-process',
				prev_step:'sms-lookup',
				next_step:null,
				init:function(merlin,dom){
					tc.jQ.ajax({
						url:'/join/ideas',
						data:merlin.options.data,
						context:merlin,
						dataType:'json',
						success:function(data,ts,xhr){
							if(data.sms_number_already_used){
								//window.location.hash = 'sms-already-used';
								this.show_step('sms-already-used');
							}else if(data.n_ideas){
								this.options.steps['sms-results'].data = data;
								//window.location.hash = 'sms-results';
								this.show_step('sms-results');
							} else {
								//window.location.hash = 'sms-no-results';
								this.show_step('sms-no-results');
							}
						}
					});
				}
			},
			/* Step: sms-results  */
			'sms-results':{
				progress_selector:'.3',
				selector:'.sms-results',
				prev_step:'sms-lookup',
				next_step:app.app_page.data.sms_next_step,
				data:{
					n_ideas:null
				},
				init:function(merlin,dom){
					dom.find('span.n_ideas').text(merlin.current_step.data.n_ideas);
					dom.find('p.phone-num').html('('+merlin.options.data.sms_phone.substring(0,3)+') '+merlin.options.data.sms_phone.substring(3,6)+'-'+merlin.options.data.sms_phone.substring(6,10));
				}
			},
			/* Step: sms-no-results  */
			'sms-no-results':{
				progress_selector:'.3, .2',
				selector:'.sms-no-results',
				prev_step:'sms-lookup',
				next_step:app.app_page.data.sms_next_step,
				init:function(merlin,dom){
					dom.find('p.phone-num').html('('+merlin.options.data.sms_phone.substring(0,3)+') '+merlin.options.data.sms_phone.substring(3,6)+'-'+merlin.options.data.sms_phone.substring(6,10));
				}
			},
			
			/* Step: sms-already-used  */
			'sms-already-used':{
				progress_selector:'.3, .2',
				selector:'.sms-already-used',
				prev_step:'sms-lookup',
				next_step:app.app_page.data.sms_next_step,
				init:function(merlin,dom){
					dom.find('p.phone-num').html('('+merlin.options.data.sms_phone.substring(0,3)+') '+merlin.options.data.sms_phone.substring(3,6)+'-'+merlin.options.data.sms_phone.substring(6,10));
					merlin.options.data.sms_phone = '-1';
				}
			},
			
			/* Step: email-authentication-process  */
			'email-authentication-process':{
				supress_hash:true,
				progress_selector:'.3, .2',
				selector:'.email-authentication-process',
				prev_step:null,
				next_step:null,
				init:function(merlin,dom){
					dom.find('strong.email').text(merlin.options.data.email);
					tc.jQ.ajax({
						type:'POST',
						url:merlin.app.app_page.data.account_create_url,
						data:merlin.options.data,
						context:merlin,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False' || data == 'None'){
								this.show_step('email-authentication-email-send-error');
								return;
							}
							this.show_step('email-authentication-email-send-success');
						}
					});
				}
			},
			/* Step: email-authentication-email-send-success  */
			'email-authentication-email-send-success':{
				progress_selector:'.3, .2',
				selector:'.email-authentication-email-send-success',
				prev_step:null,
				next_step:null,
				init:function(merlin,dom){
					dom.find('.email').html(merlin.options.data.email);
				}
			},
			/* Step: email-authentication-email-send-error  */
			'email-authentication-email-send-error':{
				progress_selector:'.3, .2',
				selector:'.email-authentication-email-send-error',
				prev_step:null,
				next_step:null,
				init:function(merlin,dom){
					
				}
			},
			/* Step: email-authentication-confirm  */
			'email-authentication-success':{
				progress_selector:'.3',
				selector:'.email-authentication-success',
				prev_step:null,
				next_step:null,
				init:function(merlin,dom){
					tc.timer(2500, function() {
						window.location = '/';
					});
				}
			},
			/* Step: email-authentication-error  */
			'email-authentication-error':{
				progress_selector:'.3',
				selector:'.email-authentication-error',
				prev_step:null,
				next_step:null,
				init:function(merlin,dom){
					
				}
			},
			/* Step: finish  */
			'finish':{
				progress_selector:'.3',
				selector:'.finish',
				prev_step:null,
				next_step:null,
				init:function(merlin,dom){
					var url, method;
					tc.jQ.ajax({
						type:'POST',
						url:merlin.app.app_page.data.account_create_url,
						data:merlin.options.data,
						context:merlin,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False' || data == 'None'){
								//window.location.hash = 'error';
								this.show_step('error');
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
			'error':{
				selector:'.step.error'
			}
		}
	});
});