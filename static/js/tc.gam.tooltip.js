if (!tc) { var tc = {}; }

tc.resource_tooltip = makeClass();

tc.resource_tooltip.prototype.options = {
	trigger: null,
	get_url: null,
	get_params: null
};

tc.resource_tooltip.prototype.tooltip = null;


tc.resource_tooltip.prototype.init = function(options) {
	var me;
	tc.util.log("tc.resource_tooltip.init");
	me = this;
	this.options = tc.jQ.extend(this.options, options);
	this.build_tooltip();
	this.cached_data = {};
	this.options.trigger.bind('mouseover',{me:this},this.handlers.mouseover);
	this.options.trigger.bind('mouseout',{me:this},this.handlers.mouseout);
	this.tooltip = tc.jQ('.tooltip');
	
};

tc.resource_tooltip.prototype.handlers = {
	mouseover:function(e){
		if(!e.data.me.current)
		e.data.me.show();
	},
	mouseout:function(e){
		e.data.me.hide();
	}
}

tc.resource_tooltip.prototype.show = function(){
	tc.util.log("tc.resource_tooltip.show");
	tc.util.dump(this.options.trigger);
	var target_pos;
	target_pos = {
		top:this.options.trigger.offset().top+this.options.trigger.height(),
		left:this.options.trigger.offset().left+this.options.trigger.width()
	}
	
	this.tooltip.css('position','absolute').css('opacity',1).removeClass('template-content').show();
	this.tooltip.html('<div class="tooltip-bd spinner"><img class="loading" src="/static/images/loader32x32.gif" /></div>');
	if(this.options.trigger.data('cached-data')){
		this.tooltip.animate({
			'top':target_pos.top,
			'left':target_pos.left
		},1000,'easeOutElastic').text(this.options.trigger.data('cached-data'));
	} else {
		tc.jQ.ajax({
			url: this.options.get_url,
			data: this.options.get_params,
			async:false,
			context: this,
			dataType:'json',
			success:function(data,ts,xhr){
				this.options.trigger.data('cached-data',data);
			}
		});
		this.tooltip.animate({
			'top':target_pos.top,
			'left':target_pos.left
		},1000,'easeOutElastic').text(this.options.trigger.data('cached-data'));
	}
	
}

tc.resource_tooltip.prototype.hide = function(){
	tc.util.log("tc.resource_tooltip.hide");
	tc.util.dump(this.options.trigger);
	this.tooltip.animate({
		'opacity':0.0
	},300,'easeOutCirc',function(){
		tc.jQ(this).hide();
	});
}

tc.resource_tooltip.prototype.build_tooltip = function(){
	tc.util.log("tc.resource_tooltip.build_tooltip");
	var me;
	me = this;
	this.tooltip = this.options.trigger.tooltip({
		position: "center right",
		offset: [0, 0],
		predelay: 100,
		tip:'.tooltip',
		events: {
			def: ",",    // default show/hide events for an element
			tooltip: ","     // the tooltip element
		},
		onBeforeShow: function(e) {
			var tip, trig, target_pos;
			tip = this.getTip();
			tip.css('position','absolute').removeClass('template-content').show();
			trig = this.getTrigger();
			target_pos = {
				top:trig.offset().top+trig.height(),
				left:trig.offset().left+trig.width()
			}
			
			tc.util.dump(target_pos);
			
			tip.html('<div class="tooltip-bd spinner"><img class="loading" src="/static/images/loader32x32.gif" /></div>');
			if(this.getTip().data('cached-data')){
				this.getTip().animate({
					'top':target_pos.top-50,
					'left':target_pos.left
				},1000,'easeOutElastic').text(this.getTip().data('cached-data'));
			} else {
				tc.jQ.ajax({
					url: me.options.get_url,
					data: me.options.get_params,
					async:false,
					context: this,
					dataType:'json',
					success:function(data,ts,xhr){
						this.getTip().data('cached-data',data);
					}
				});
				this.getTip().animate({
					'top':target_pos.top-50,
					'left':target_pos.left
				},1000,'easeOutElastic').text(this.getTip().data('cached-data'));
			}
			return false;
		},
		onBeforeHide:function(e){
			this.getTip().animate({
				'opacity':0.0
			},300,'easeOutCirc',function(){
				tc.jQ(this).hide();
			});
			return true;
		},
		onHide: function(e) {
			this.getTip().animate({
				'opacity':0.0
			},1000,'easeOutCirc',function(){
				tc.jQ(this).hide();
			});
		}
	}).data("tooltip");//.dynamic( {} );
}