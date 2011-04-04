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
	this.triggers = options.triggers;
	this.triggers.bind('mouseover',{me:this},this.handlers.trigger_mouseover);
	this.triggers.bind('mouseout',{me:this},this.handlers.trigger_mouseout);
	this.tooltip.bind('mouseover',{me:this},this.handlers.tooltip_mouseover);
	this.tooltip.bind('mouseout',{me:this},this.handlers.tooltip_mouseout);
	this.has_been_shown = false;
	this.current_trigger = null;
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
	var i;
	this.triggers.each(function(i,j){
		tc.jQ(j).unbind('mouseover').unbind('mouseout');
	});
};

tc.resource_tooltip.prototype.handlers = {
	trigger_mouseover:function(e){
		//tc.util.log("tc.resource_tooltip.trigger_mouseover");
		var t;
		t = e.target;
		if(e.data.me.current_trigger){
			if(e.data.me.options.trigger_class){
				while (t.className.indexOf(e.data.me.options.trigger_class) == -1 && t.nodeName != 'BODY'){
					t = t.parentNode;
				}
			} else {
				while (t.className != e.data.me.current_trigger.get(0).className && t.nodeName != 'BODY'){
					t = t.parentNode;
				}
			}
			
			if(t != e.data.me.current_trigger){
				e.data.me.current_trigger = tc.jQ(t);
				e.data.me.tooltip.stop();
				e.data.me.show();
			}
		} else {
			
			if(e.data.me.options.trigger_class){
				while (t.className.indexOf(e.data.me.options.trigger_class) == -1 && t.nodeName != 'BODY'){
					t = t.parentNode;
				}
			} else {
				while (t.className != e.data.me.current_trigger.get(0).className && t.nodeName != 'BODY'){
					t = t.parentNode;
				}
			}
			
			e.data.me.current_trigger = tc.jQ(t);
			e.data.me.tooltip.stop();
			e.data.me.show();
		}
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
}

tc.resource_tooltip.prototype.generate_markup = function(data){
	tc.util.log("tc.resource_tooltip.generate_markup");
	var markup;
	markup = this.options.markup_source_element.clone().css('display','block').removeClass('template-content');
	markup.find('h2').text(data.title);
	markup.find('img').attr('src','/images/'+(data.image_id % 10)+'/'+data.image_id+'.png');
	markup.find('.main p').text(data.description);
	markup.find('dd a').attr('href',data.url).text(data.url);
	return markup;
}

tc.resource_tooltip.prototype.show = function(){
	//tc.util.log("tc.resource_tooltip.show");
	var target_pos, me;
	target_pos = function(self){
		return {
			top:self.current_trigger.offset().top - self.tooltip.height() - 20,
			left:self.current_trigger.offset().left + (self.current_trigger.width()/2) - (self.tooltip.width()/2)
		};
	};
	me = this;
	
	if(this.current_trigger.data('cached-data')){
		this.tooltip.html(this.current_trigger.data('cached-data'));
		this.move_to_target(target_pos(this), this.has_been_shown ? true : false);
	} else {
		this.tooltip.html('<div class="tooltip-bd spinner"><img class="loading" src="/static/images/loader32x32.gif" /></div>');
		this.move_to_target(target_pos(this), this.has_been_shown ? true : false);
		
		tc.util.dump(this.current_trigger);
		
		tc.jQ.ajax({
			url: this.options.get_url,
			data: {
				project_resource_id:this.current_trigger.attr('rel').split(',')[1]
			},
			async:false,
			context: this,
			dataType:'json',
			success:function(data,ts,xhr){
				this.current_trigger.data('cached-data',this.generate_markup(data));
			}
		});
		this.tooltip.html(this.current_trigger.data('cached-data'));
		this.move_to_target(target_pos(this), this.has_been_shown ? true : false);
	}
}

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
}

tc.resource_tooltip.prototype.hide = function(){
	//tc.util.log("tc.resource_tooltip.hide");
	var me = this;
	this.tooltip.animate({
		'opacity':0.0
	},200,'easeOutCirc',function(){
		tc.jQ(this).hide();
		me.current_trigger = null;
	});
}