if (!tc) { var tc = {}; }

tc.resource_tooltip = makeClass();

tc.resource_tooltip.prototype.tooltip = null;

tc.resource_tooltip.prototype.init = function(options) {
	var me;
	tc.util.log("tc.resource_tooltip.init");
	me = this;
	this.options = tc.jQ.extend({
		triggers: null,
		tooltip_element:null,
		markup_source_element: null,
		get_url: null
	}, options);
	this.tooltip = this.options.tooltip_element;
	this.triggers = options.triggers;
	this.triggers.bind('mouseover',{me:this},this.handlers.trigger_mouseover);
	this.triggers.bind('mouseout',{me:this},this.handlers.trigger_mouseout);
	this.tooltip.bind('mouseover',{me:this},this.handlers.tooltip_mouseover);
	this.tooltip.bind('mouseout',{me:this},this.handlers.tooltip_mouseout);
	this.current_trigger = null;
};

tc.resource_tooltip.prototype.handlers = {
	trigger_mouseover:function(e){
		//tc.util.log("tc.resource_tooltip.trigger_mouseover");
		var t;
		t = e.target;
		while (t.nodeName != 'TD' && t.nodeName != 'BODY'){
			t = t.parentNode;
		}
		if(t != e.data.me.current_trigger){
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
		while(rt != t && rt.nodeName != 'BODY'){
			rt = rt.parentNode;
			if(rt == t){
				return;
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
		while(rt != t && rt.nodeName != 'BODY'){
			rt = rt.parentNode;
			if(rt == t){
				return;
			}
		}
		e.data.me.tooltip.stop();
		e.data.me.hide();
	}
}

tc.resource_tooltip.prototype.generate_markup = function(data){
	tc.util.log("tc.resource_tooltip.generate_markup");
	var markup;
	markup = this.options.markup_source_element.clone().css('display','block');
	markup.find('h2').text(data.title);
	markup.find('img').attr('src','/images/'+data.image_id);
	markup.find('.main p').text(data.description);
	markup.find('dd a').attr('href',data.url).text(data.url);
	return markup;
}

tc.resource_tooltip.prototype.show = function(){
	//tc.util.log("tc.resource_tooltip.show");
	var target_pos, me;
	target_pos = {
		top:this.current_trigger.offset().top-(this.tooltip.height()/2)-40,
		left:this.current_trigger.offset().left+this.current_trigger.width()
	}
	me = this;
	
	if(this.current_trigger.data('cached-data')){
		this.tooltip.html(this.current_trigger.data('cached-data'));
		this.tooltip.stop().show().animate({
			'opacity':1.0,
			'top':target_pos.top,
			'left':target_pos.left
		},500,'easeOutCubic',function(){
			
		});
	} else {
		this.tooltip.html('<div class="tooltip-bd spinner"><img class="loading" src="/static/images/loader32x32.gif" /></div>');
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
		
		this.tooltip.stop().show().animate({
			'opacity':1.0,
			'top':target_pos.top,
			'left':target_pos.left
		},500,'easeOutCubic',function(){
			
		});
	}
	
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