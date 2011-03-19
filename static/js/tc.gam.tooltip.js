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
};

tc.resource_tooltip.prototype.handlers = {
	mouseover:function(e){
		tc.util.dump(e.target.nodeName);
		if(e.target.nodeName == 'TD'){
			e.data.me.tooltip.show();
		}
	},
	mouseout:function(e){
		tc.util.dump(e.target.nodeName);
		if(e.target.nodeName == 'TD'){
			e.data.me.tooltip.hide();
		}
	}
}

tc.resource_tooltip.prototype.build_tooltip = function(){
	tc.util.log("tc.resource_tooltip.build_tooltip");
	var me;
	me = this;
	this.tooltip = this.options.trigger.tooltip({
		position: "",
		offset: [0, 0],
		predelay: 100,
		tip:'.template-content.tooltip',
		events: {
			def: ",",    // default show/hide events for an element
			tooltip: ","     // the tooltip element
		},
		onBeforeShow: function(e) {
			var tip, trig, target_pos;
			tip = this.getTip();
			tip.css('position','fixed').show();
			trig = this.getTrigger();
			target_pos = {
				top:this.getTrigger().offset().top+this.getTrigger().height(),
				left:this.getTrigger().offset().left+this.getTrigger().width()
			}
			
			tip.html('<div class="tooltip-bd spinner"><img class="loading" src="/static/images/loader32x32.gif" /></div>');
			
			tc.util.dump(this.getTip().data('cached-data'));
			if(this.getTip().data('cached-data')){
				this.getTip().animate({
					'top':target_pos.top,
					'left':target_pos.left
				},1000,'easeOutElastic');
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
			//this.getTip().hide();
			return true;
		},
		onHide: function(e) {
			
		}
	}).data("tooltip");//.dynamic( {} );
}