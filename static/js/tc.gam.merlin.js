if(!tc){ var tc = {}; }

tc.merlin = makeClass();

tc.merlin.prototype.options = {
	selector:null
}

tc.merlin.prototype.init = function(app,options){
	tc.util.log('tc.merlin.init');
	this.options = tc.jQ.extend(this.options,options);
	this.dom = tc.jQ(options.selector);
	this.event_data = {app:app,me:this};
	this.handle_steps();
	this.handle_controls(options.controls);
	this.setup_events(app);
	if(this.options.first_step){
		this.show_step(this.options.first_step);
	}
}

tc.merlin.prototype.setup_events = function(app){
	tc.util.log('tc.merlin.setup_events');
	this.dom.find('a.step_link').bind('click',this.event_data,this.handlers.a_click);
	if(this.options.back_button){
		this.options.back_button.bind('click',this.event_data,this.handlers.last_step);
	}
	if(this.options.next_button){
		this.options.next_button.addClass('disabled');
		this.options.next_button.bind('click',this.event_data,this.handlers.next_step);
	}
	this.dom.bind('merlin-step-valid',this.event_data,this.handlers.valid);
	this.dom.bind('merlin-step-invalid',this.event_data,this.handlers.invalid);
}

tc.merlin.prototype.handle_controls = function(controls){
	tc.util.log('tc.merlin.handle_controls');
	
}

tc.merlin.prototype.handle_steps = function(){
	tc.util.log('tc.merlin.handle_steps');
	var i;
	for(i in this.options.steps){
		if(this.options.steps[i].selector){
			this.options.steps[i].dom = this.dom.find(this.options.steps[i].selector);
		}
	}
}

tc.merlin.prototype.show_step = function(step){
	tc.util.log('tc.merlin.show_step');
	if(this.current_step){
		this.current_step.dom.find('input').unbind('keyup change');
	}
	this.current_step = this.options.steps[step];
	this.options.next_button.removeClass('disabled');
	if(this.current_step.progress_selector){
		if(this.options.progress_element){
			this.options.progress_element.find(this.current_step.progress_selector).addClass('cur').siblings().removeClass('cur');
		}
	}
	if(tc.jQ.isFunction(this.current_step)){
		this.current_step(this);
		return;
	}
	this.current_step.dom.show().siblings().hide();
	this.current_step.dom.find('input')
		.one('focus',function(e){
			tc.jQ(e.target).addClass('has-been-focused').removeClass('valid invalid');
		}).bind('keyup change',this.event_data,this.handlers.keypress);
	if(tc.jQ.isFunction(this.current_step.init)){
		this.current_step.init(this,this.current_step.dom);
	}
	if(this.current_step.validators){
		this.validate(this.current_step.validators,false);
	}
}

tc.merlin.prototype.validate = function(validators,force_focus){
	tc.util.log('tc.merlin.validate');
	var i, valid, temp_valid, j;
	if(!this.current_step.dom){
		return;
	}
	valid = true; 
	if(!this.current_step.inputs){
		this.current_step.inputs = {};
		for(i in validators){
			this.current_step.inputs[i] = {
				element:this.current_step.dom.find(i),
				validators:validators[i]
			}
			if(force_focus){
				this.current_step.inputs[i].element.addClass('has-been-focused');
			}
		}
	}
	this.current_step.errors = [];
	for(i in this.current_step.inputs){
		if(tc.jQ.isFunction(this.current_step.inputs[i].validators)){
			temp_valid = this.current_step.inputs[i].validators(this,this.current_step.inputs[i].element,this.current_step).valid;
		} else {
			temp_valid = tc.validate(this.current_step.inputs[i].element,this.current_step.inputs[i].validators).valid;
		}
		if(!temp_valid){
			valid = false;
		}
	}
	if(valid){
		this.dom.trigger('merlin-step-valid',{
			step:this.current_step
		});
		return true;
	} else {
		this.dom.trigger('merlin-step-invalid',{
			step:this.current_step
		});
		return false;
	}
}

tc.merlin.prototype.handlers = {
	a_click:function(e,d){
		tc.util.log('tc.merlin.handlers.a_click');
		e.preventDefault();
		e.data.me.show_step(e.target.href.split('#')[1]);
	},
	last_step:function(e,d){
		tc.util.log('tc.merlin.handlers.last_step');
		e.preventDefault();
		if(e.data.me.current_step && e.data.me.current_step.prev_step){
			e.data.me.show_step(e.data.me.current_step.prev_step);
		}
	},
	next_step:function(e,d){
		tc.util.log('tc.merlin.handlers.next_step');
		var valid;
		e.preventDefault();
		valid = true;
		if(e.data.me.current_step.validators){
			valid = e.data.me.validate(e.data.me.current_step.validators,true);
		}
		if(!valid){
			return;
		}
		if(e.target.className.indexOf('disabled') > 0){
			return;
		}
		if(e.data.me.current_step && e.data.me.current_step.next_step){
			e.data.me.show_step(e.data.me.current_step.next_step);
		}
	},
	keypress:function(e,d){
		tc.util.log('tc.merlin.handlers.keypress');
		if(e.data.me.current_step.validators){
			e.data.me.validate(e.data.me.current_step.validators);
		}
	},
	valid:function(e,d){
		tc.util.log('tc.merlin.handlers.valid');
		if(e.data.me.options.next_button){
			e.data.me.options.next_button.removeClass('disabled').addClass('enabled');
		}
	},
	invalid:function(e,d){
		tc.util.log('tc.merlin.handlers.invalid');
		if(e.data.me.options.next_button){
			e.data.me.options.next_button.removeClass('enabled').addClass('disabled');
		}
		
	}
}

