if (!tc) { var tc = {}; }

tc.resource_tooltip = makeClass();

tc.resource_tooltip.prototype.tooltip = null;

tc.resource_tooltip.prototype.init = function(options) {
	var me;
	tc.util.log("tc.resource_tooltip.init");
	me = this;
	this.options = tc.jQ.extend({
		triggers: tc.jQ('.tooltip_trigger'),
		trigger_class:null,
		tooltip_element:tc.jQ('#organization-tooltip'),
		markup_source_element: null,
		get_url: null
	}, options);
	this.tooltip = this.options.tooltip_element;
	this.triggers = this.options.triggers;
	this.triggers.bind('mouseover',{me:this},this.handlers.trigger_mouseover);
	this.triggers.bind('mouseout',{me:this},this.handlers.trigger_mouseout);
	this.tooltip.bind('mouseover',{me:this},this.handlers.tooltip_mouseover);
	this.tooltip.bind('mouseout',{me:this},this.handlers.tooltip_mouseout);
	this.has_been_shown = false;
	this.current_trigger = null;
	this.current_trigger_id = null;
	this.cached_data = {};
};

tc.resource_tooltip.prototype.add_trigger = function(trigger){
	tc.util.log("tc.resource_tooltip.add_trigger");
	trigger.bind('mouseover', {me:this}, this.handlers.trigger_mouseover);
	trigger.bind('mouseout', {me:this}, this.handlers.trigger_mouseout);
	tc.util.dump(trigger);
	if(!this.triggers.length){
		this.triggers = trigger;
	} else {
		this.triggers.add(trigger);
	}
};

tc.resource_tooltip.prototype.clear_triggers = function(trigger){
	tc.util.log("tc.resource_tooltip.clear_triggers");
	this.triggers.each(function(i,j){
		tc.jQ(j).unbind('mouseover').unbind('mouseout');
	});
};

tc.resource_tooltip.prototype.handlers = {
	trigger_mouseover:function(e){
		//tc.util.log("tc.resource_tooltip.trigger_mouseover");
		var t;
		t = e.target;
		while (t.className.indexOf(e.data.me.options.trigger_class) == -1 && t.nodeName != 'BODY'){
			t = t.parentNode;
		}
		e.data.me.current_trigger = tc.jQ(t);
		e.data.me.tooltip.stop();
		e.data.me.show();
	},
	trigger_mouseout:function(e){
		//tc.util.log("tc.resource_tooltip.trigger_mouseout");
		var t, rt;
		t = e.target;
		rt = (e.relatedTarget) ? e.relatedTarget : e.toElement;
		if(rt){
			while(rt != t && rt.nodeName != 'BODY'){
				rt = rt.parentNode;
				if(!rt || rt == t){
					return;
				}
			}
		}
		e.data.me.tooltip.stop();
		e.data.me.hide();
	},
	tooltip_mouseover:function(e){
		//tc.util.log("tc.resource_tooltip.tooltip_mouseover");
		if(e.data.me.current_trigger){
			e.data.me.tooltip.stop();
			e.data.me.show();
		}
	},
	tooltip_mouseout:function(e){
		//tc.util.log("tc.resource_tooltip.tooltip_mouseout");
		var t, rt;
		t = e.target;
		rt = (e.relatedTarget) ? e.relatedTarget : e.toElement;
		if(rt){
			while(rt != t && rt.nodeName != 'BODY'){
				rt = rt.parentNode;
				if(!rt || rt == t){
					return;
				}
			}
		}
		e.data.me.tooltip.stop();
		e.data.me.hide();
	}
};

tc.resource_tooltip.prototype.generate_markup = function(data){
	tc.util.log("tc.resource_tooltip.generate_markup");
	var markup;
	markup = this.options.markup_source_element.clone().css('display','block').removeClass('template-content');
	markup.append("<div class='tooltip-tail'></div>");
	markup.find('h2').text(data.title);
	if(data.is_official && data.is_official == true)
	{
		markup.find('.tooltip-hd').after('<div class="tooltip-md"><span>Official Project</span></div>');
	}
	if (data.image_id > 1) {
		markup.find('img').attr('src','/images/'+(data.image_id % 10)+'/'+data.image_id+'.png');
	} else {
		markup.find('img').attr('src','/static/images/thumb_genAvatar100.png');
	}
	markup.find('.main p').text(data.description);
	markup.find('dd a').attr('target','_blank').attr('href',data.url).text(tc.truncate(data.url,28,'...'));
	return tc.jQ('<div>').append(markup).html();
};

tc.resource_tooltip.prototype.show = function(){
	//tc.util.log("tc.resource_tooltip.show");
	var target_pos, me, load_content;
	target_pos = function(self){
		return {
			top:self.current_trigger.offset().top - self.tooltip.height(),
			left:self.current_trigger.offset().left + (self.current_trigger.width()/2) - (self.tooltip.width()/2)
		};
	};
	me = this;
	load_content = false;
	
	if(this.current_trigger.attr('rel').split(',')[1] != this.current_trigger_id){
		this.current_trigger_id = this.current_trigger.attr('rel').split(',')[1];
		load_content = true;
	}
	
	if(this.cached_data[this.current_trigger_id]){
		if(load_content){
			this.tooltip.html((this.cached_data[this.current_trigger_id]));
		}
		this.move_to_target(target_pos(this), this.has_been_shown ? true : false);
	} else {
		if(load_content){
			this.tooltip.html('<div class="tooltip-bd spinner"><img class="loading" src="/static/images/loader32x32.gif" /></div>');
		}
		this.move_to_target(target_pos(this), this.has_been_shown ? true : false);
		
		if(load_content){
			tc.jQ.ajax({
				url: this.options.get_url,
				data: {
					project_resource_id:this.current_trigger_id
				},
				async:false,
				context: this,
				dataType:'json',
				success:function(data,ts,xhr){
					this.cached_data[this.current_trigger_id] = this.generate_markup(data);
				}
			});
		
			this.tooltip.html(this.cached_data[this.current_trigger_id]);
			this.move_to_target(target_pos(this), this.has_been_shown ? true : false);
		}
	}
};

tc.resource_tooltip.prototype.move_to_target = function(target_pos,animate){
	if(animate){
		this.tooltip.stop().show().animate({
			'opacity':1.0,
			'top':target_pos.top,
			'left':target_pos.left
		},500,'easeOutCubic',function(){
		
		});
	} else {
		this.tooltip.stop().css({
			'opacity':0.0,
			'top':target_pos.top,
			'left':target_pos.left
		}).show().animate({
			'opacity':1.0
		},500,'easeOutCubic',function(){
		
		});
	}
	this.has_been_shown = true;
};

tc.resource_tooltip.prototype.hide = function(){
	//tc.util.log("tc.resource_tooltip.hide");
	var me = this;
	this.tooltip.animate({
		'opacity':0.0
	},200,'easeOutCirc',function(){
		tc.jQ(this).hide();
		me.current_trigger = null;
	});
};