if(!tc){ var tc = {}; }

tc.merlin = makeClass();

tc.merlin.prototype.options = {
	name:null,
	dom:null,
	progress_element:null,
	next_button:null,
	back_button:null,
	watch_keypress:true,
	first_step:'start',
	allow_hash_override_onload:false,
	steps:{
		'start':{
			progress_selector:'.1',
			selector:'.start',
			prev_step:null,
			next_step:null
		}
	}
}

tc.merlin.prototype.init = function(app,options){
	tc.util.log('tc.merlin.init');
	this.options = tc.jQ.extend({},this.options,options);
	this.app = app;
	if(this.options.dom instanceof String){
		this.options.dom = tc.jQ(options.dom);
	}
	this.dom = this.options.dom;
	this.magic = null;
	this.event_data = {app:app,me:this};
	this.handle_steps();
	this.handle_controls(options.controls);
	this.setup_events(app);
	tc.util.dump(this.options);
	if(this.options.allow_hash_override_onload){
		this.handlers.handle_hash(this,window.location.hash.substring(1,window.location.hash.length));
	} else {
		if(this.options.first_step){
			this.show_step(this.options.first_step);
			//if(this.options.name){
			//	window.location.hash = this.options.name+','+this.options.first_step;
			//} else {
			//	window.location.hash = this.options.first_step;
			//}
		}
	}
	
	this.current_hash = null;
}

tc.merlin.prototype.setup_events = function(app){
	tc.util.log('tc.merlin.setup_events');
	tc.jQ(window)
		.unbind('hashchange',this.event_data,this.handlers.hashchange)
		.bind('hashchange',this.event_data,this.handlers.hashchange);
	if(this.dom){
		this.dom.find('a.step_link').unbind('click').bind('click',this.event_data,this.handlers.a_click);
		this.dom.bind('merlin-step-valid',this.event_data,this.handlers.valid);
		this.dom.bind('merlin-step-invalid',this.event_data,this.handlers.invalid);
	}
	if(this.options.back_button){
		this.options.back_button.unbind('click').bind('click',this.event_data,this.handlers.last_step);
	}
	if(this.options.next_button){
		this.options.next_button.addClass('disabled');
		this.options.next_button.unbind('click').bind('click',this.event_data,this.handlers.next_step);
	}
};

tc.merlin.prototype.handle_controls = function(controls){
	tc.util.log('tc.merlin.handle_controls');
	if(this.options.progress_element){
		this.options.progress_element.find('a.indicator').bind('click',this.event_data,this.handlers.indicator_click);
	}
	if(this.options.error_indicator){
		this.options.error_indicator.html('<span></span>');
	}
};

tc.merlin.prototype.handle_steps = function(){
	tc.util.log('tc.merlin.handle_steps');
	if(this.options.magic){
		this.magic = this.magic_spell();
	}
	var i;
	for(i in this.options.steps){
		if(this.options.steps[i].selector && this.dom){
			this.options.steps[i].dom = this.dom.find(this.options.steps[i].selector);
		}
	}
};
/*         Magic!!
      __________________
    .-'  \ _.-''-._ /  '-.
  .-/\   .'.      .'.   /\-.
 _'/  \.'   '.  .'   './  \'_
:======:======::======:======:  
 '. '.  \     ''     /  .' .'
   '. .  \   :  :   /  . .'
     '.'  \  '  '  /  '.'
       ':  \:    :/  :'
         '. \    / .'
           '.\  /.'
             '\/'
*/
tc.merlin.prototype.magic_spell = function(){
	tc.util.log('tc.merlin.magic_spell');
	var i, magic_dust;
	tc.util.dump(this.options);
	tc.util.dump(this.dom);
	tc.util.dump(this.options.steps);
	
	magic_dust = ({
		n_items:0,
		overall_width:0,
		page_width:0,
		item_metadata:{
			max_width:0,
			min_width:100000,
			max_height:0,
			min_height:100000,
			marginLeft:0
		},
		$items:[],
		init:function(merlin){
			tc.util.log('tc.merlin.magic_spell[magic_dust].init');
			this.merlin = merlin;
			
			for(i in this.merlin.options.steps){
				this.merlin.options.steps[i].magic_dom = this.merlin.dom.children().filter(this.merlin.options.steps[i].selector);
				if(this.merlin.options.steps[i].magic_dom.length){
					this.$items.push(this.merlin.options.steps[i].magic_dom.get(0));
					
					if(this.merlin.options.steps[i].magic_dom.outerWidth() < this.item_metadata.min_width){
						this.item_metadata.min_width = this.merlin.options.steps[i].magic_dom.outerWidth();
					}
					if(this.merlin.options.steps[i].magic_dom.outerWidth() > this.item_metadata.max_width){
						this.item_metadata.max_width = this.merlin.options.steps[i].magic_dom.outerWidth();
					}
					
					if(this.merlin.options.steps[i].magic_dom.outerHeight() < this.item_metadata.min_height){
						this.item_metadata.min_height = this.merlin.options.steps[i].magic_dom.outerHeight();
					}
					if(this.merlin.options.steps[i].magic_dom.outerHeight() > this.item_metadata.max_height){
						this.item_metadata.max_height = this.merlin.options.steps[i].magic_dom.outerHeight();
					}
				}
			}
			
			this.n_items = this.$items.length;
			this.$items = tc.jQ(this.$items);
			this.page_width = tc.jQ(window).width(); 
			this.overall_width = (this.page_width * this.n_items);
			this.item_metadata.marginLeft = (this.page_width - this.item_metadata.max_width)/2
			
			this.merlin.dom.css({
				'width':this.overall_width + 'px',
				'height':this.item_metadata.max_height + 'px'
				//'marginLeft':-1 * this.item_metadata.marginLeft
			});
			this.$items.show().css({
				'float':'left',
				'clear':'none',
				'width':this.item_metadata.max_width+'px',
				'marginLeft':this.item_metadata.marginLeft
			}).removeClass('clearfix');
			
			return this;
		},
		resize_handler:function(e){
			tc.util.log('tc.merlin.magic_spell[magic_dust].resize_handler');
			
		},
		show_step:function(step){
			tc.util.log('tc.merlin.magic_spell[magic_dust].show_step');
			if(!step.magic_dom){
				return;
			}
			tc.util.dump(step.magic_dom);
			tc.util.dump(step.magic_dom.position().left);
			tc.util.dump(this.item_metadata.marginLeft);
			
			tc.util.dump( (-1 * this.item_metadata.marginLeft) - ( step.magic_dom.position().left ) );
			
			this.merlin.dom.css({
				//'marginLeft': ((-1 * this.item_metadata.marginLeft) - ( step.magic_dom.position().left )) + 'px'
				'marginLeft': (( step.magic_dom.position().left )) + 'px'
			})
			
			
		}
	}).init(this);
	
	tc.util.dump('----');
	tc.util.dump('----');
	tc.util.dump(magic_dust);
	tc.util.dump('----');
	tc.util.dump('----');
	
	return magic_dust;
};
/* ** * * end magic  * * ** */

tc.merlin.prototype.show_step = function(step,force){
	tc.util.log('tc.merlin.show_step['+step+']');
	var i, j, temp_e_data;
	
	tc.util.dump(step);
	
	if(this.current_step && !force){
		//this.current_step.dom.find('input, textarea').unbind('keyup change');
		
		if(step == this.current_step.step_name){
			return;
		}
		if(this.current_step){
			if(tc.jQ.isFunction(this.current_step.finish)){
				this.current_step.finish(this,this.current_step.dom);
				//if(this.current_step.finish(this,this.current_step.dom) === false){
				//	return;
				//};
			}
		}
	}
	if(force && this.current_step){
		if(tc.jQ.isFunction(this.current_step.finish)){
			this.current_step.finish(this,this.current_step.dom);
			//if(this.current_step.finish(this,this.current_step.dom) === false){
			//	return;
			//};
		}
	}
	
	if(!this.options.steps[step]){
		return;
	}
	
	this.options.steps[step].step_name = step;
	if(this.current_step && this.current_step.use_for_history){
		this.options.steps[step].prev_step = this.current_step.step_name;
	} else if(this.current_step){
		this.options.steps[step].prev_step = this.current_step.prev_step;
	}
	this.current_step = this.options.steps[step];
	if(this.options.next_button){
		this.options.next_button.removeClass('disabled');
	}
	if(this.current_step.progress_selector){
		if(this.options.progress_element){
			this.options.progress_element.find(this.current_step.progress_selector)
				.addClass('cur')
				.attr('href','#'+this.current_step.step_name)
				.nextAll().removeClass('cur').attr('href','#');
		}
	}
	if(this.current_step.title && this.options.title){
		this.options.title.html(this.current_step.title);
	}
	if(this.current_step.sub_title && this.options.sub_title){
		this.options.sub_title.html(this.current_step.sub_title);
	}
	if(tc.jQ.isFunction(this.current_step)){
		this.current_step(this);
		return;
	}
	
	if(tc.jQ.isFunction(this.current_step.transition)){
		this.current_step.transition(this);
	}else if(this.magic){
		this.magic.show_step(this.current_step);
	} else if(this.dom && !this.magic){
		this.dom.find('.step').hide();
		this.dom.find(this.current_step.selector).show();
	}
	
	if(this.current_step.inputs && !this.current_step.has_been_initialized){
		for(i in this.current_step.inputs){
			temp_e_data = tc.jQ.extend({},this.event_data,{input:this.current_step.inputs[i]});
			if(!this.current_step.inputs[i].dom && this.current_step.inputs[i].selector){
				this.current_step.inputs[i].dom = this.current_step.dom.find(this.current_step.inputs[i].selector);
				if(!this.current_step.inputs[i].dom.length){
					tc.util.dump(this.current_step.inputs[i].selector);
				}
			}
			if(this.current_step.inputs[i].counter && !this.current_step.inputs[i].counter.dom){
				this.current_step.inputs[i].counter.dom = this.current_step.dom.find(this.current_step.inputs[i].counter.selector)
				this.current_step.inputs[i].counter.dom.text('0/'+this.current_step.inputs[i].counter.limit);
			}
			this.current_step.inputs[i].dom
				.bind('focus',temp_e_data,this.handlers.focus)
				.bind('keyup change',temp_e_data,this.handlers.keypress)
				.bind('blur',temp_e_data,this.handlers.blur).data({merlin:this,input:this.current_step.inputs[i]}).each(function(i,j){
					var $j;
					$j = tc.jQ(j);
					if($j.data().input.hint || ($j.data().input.hint === "")){
						j.value = $j.data().input.hint;
					}
				});
			if(this.current_step.inputs[i].handlers){
				for(j in this.current_step.inputs[i].handlers){
					this.current_step.inputs[i].dom.bind(j,this.event_data,this.current_step.inputs[i].handlers[j]);
				}
			}
			if(this.current_step.inputs[i].focus_first){
				//this.current_step.inputs[i].dom.focus();
			}
		}
	}
	
	if(this.options.name){
		window.location.hash = this.options.name+','+step;
	} else {
		window.location.hash = step;
	}
	if(tc.jQ.isFunction(this.current_step.init)){
		this.current_step.init(this,this.current_step.dom);
	}
	this.validate(false);
	this.current_step.has_been_initialized = true;
}

tc.merlin.prototype.validate = function(on_submit){
	tc.util.log('tc.merlin.validate');
	var i, valid, temp_valid, j;
	if(!this.current_step.inputs){
		return true;
	}
	valid = true;
	this.current_step.errors = [];
	for(i in this.current_step.inputs){
		if(!this.current_step.inputs[i].validators){
			continue;
		}
		if(on_submit){
			this.current_step.inputs[i].dom.addClass('has-been-focused').addClass('has-attempted-submit');
		}
		if(tc.jQ.isFunction(this.current_step.inputs[i].validators)){
			temp_valid = this.current_step.inputs[i].validators(this,this.current_step.inputs[i].dom,this.current_step);
		} else {
			temp_valid = tc.validate(this.current_step.inputs[i].dom,this.current_step.inputs[i].validators);
		}
		
		if(!temp_valid.valid){
			valid = false;
			if(this.current_step.inputs[i].counter && this.current_step.inputs[i].dom.hasClass('has-been-focused')){
				this.current_step.inputs[i].counter.dom.addClass('invalid').removeClass('valid');
			}
		} else{
			if(this.current_step.inputs[i].counter && this.current_step.inputs[i].counter.dom.hasClass('invalid')){
				this.current_step.inputs[i].counter.dom.addClass('valid').removeClass('invalid');
			}
		}
	}
	if(valid){
		if(this.dom){
			this.dom.trigger('merlin-step-valid',{
				step:this.current_step
			});
		}
		this.current_step.dom.removeClass('invalid').addClass('valid');
		return true;
	} else {
		if(this.dom){
			this.dom.trigger('merlin-step-invalid',{
				step:this.current_step
			});
		}
		this.current_step.dom.removeClass('valid').addClass('invalid');
		return false;
	}
}

tc.merlin.prototype.handlers = {
	hashchange:function(e,d){
		tc.util.log('tc.merlin.handlers.hashchange['+window.location.hash+']');
		e.data.me.handlers.handle_hash(e.data.me,window.location.hash.substring(1,window.location.hash.length));
	},
	handle_hash:function(merlin,hash){
		tc.util.log('tc.merlin.handlers.handle_hash');
		if(merlin.options.name){
			if(hash.split(',')[0] != merlin.options.name){
				merlin.current_hash = null;
				return;
			}
			hash = hash.split(',')[1];
			merlin.current_hash = hash;
			merlin.show_step(merlin.current_hash,true);
		} else if(merlin.current_hash != hash){
			merlin.current_hash = hash;
			merlin.show_step(merlin.current_hash,false);
		}
	},
	indicator_click:function(e,d){
		tc.util.log('tc.merlin.handlers.indicator_click');
		if(tc.jQ(e.target).parent().attr('href') == '#'){ e.preventDefault(); }
	},
	a_click:function(e,d){
		tc.util.log('tc.merlin.handlers.a_click');
	},
	last_step:function(e,d){
		tc.util.log('tc.merlin.handlers.last_step');
		e.preventDefault();
		if(e.data.me.current_step && e.data.me.current_step.prev_step){
			window.location.hash = e.data.me.current_step.prev_step;
			//e.data.me.show_step(e.data.me.current_step.prev_step);
		}
	},
	next_step:function(e,d){
		tc.util.log('tc.merlin.handlers.next_step');
		var valid;
		e.preventDefault();
		valid = e.data.me.validate(true);
		if(!valid){
			if(e.data.me.options.error_indicator){
				e.data.me.options.error_indicator.html('<span>Oops! Please fill in the fields marked in red.</span>').show();
			}
			return;
		} else {
			if(e.data.me.options.error_indicator){
				e.data.me.options.error_indicator.hide();
			}
		}
		if(e.target.className.indexOf('disabled') > 0){
			return;
		}
		if(e.data.me.current_step && e.data.me.current_step.next_step){
			if(e.data.me.options.name){
				window.location.hash = e.data.me.options.name+','+e.data.me.current_step.next_step;
			} else {
				window.location.hash = e.data.me.current_step.next_step;
			}
			
			//e.data.me.show_step(e.data.me.current_step.next_step);
		}
	},
	focus:function(e,d){
		var $t;
		if(e.target.className.indexOf('has-been-focused') == -1){
			$t = tc.jQ(e.target);
			$t.addClass('has-been-focused').removeClass('valid invalid');    //.filter('[type=text], textarea').val('');
			if (e.target.nodeName == "TEXTAREA" || (e.target.nodeName == "INPUT" && ($t.attr("type") == "text"))) {
				if ($t.data().input.hint || $t.data().input.hint === "") {
					$t.val("");
				}
			}
		}
		//if(e.data.me.options.error_indicator){
		//	e.data.me.options.error_indicator.hide();
		//}
	},
	keypress:function(e,d){
		e.data.me.validate(false);
		if(e.which == 13){
			if(e.data.me.options.next_button && e.data.me.options.next_button.hasClass('enabled')){
				e.data.me.options.next_button.click();
			}
		}
		if(e.data.input.counter && e.data.input.counter.dom){
			e.data.input.counter.dom.text(e.data.input.dom.val().length+'/'+e.data.input.counter.limit);
		}
	},
	blur:function(e,d){
		var $t;
		$t = tc.jQ(e.target);
		if(!e.target.value.length){
			tc.jQ(e.target).removeClass('has-been-focused');
			if($t.data().input.hint || ($t.data().input.hint === "")){
				$t.val($t.data().input.hint);
			}
		}
	},
	valid:function(e,d){
		tc.util.log('tc.merlin.handlers.valid');
		if(e.data.me.options.next_button){
			e.data.me.options.next_button.removeClass('disabled').addClass('enabled');
		}
		if(e.data.me.options.error_indicator){
			e.data.me.options.error_indicator.hide();
		}
	},
	invalid:function(e,d){
		tc.util.log('tc.merlin.handlers.invalid');
		if(e.data.me.options.next_button){
			e.data.me.options.next_button.removeClass('enabled').addClass('disabled');
		}
	}
}

