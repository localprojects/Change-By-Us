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
	this.options.trigger.bind('mouseover',{me:this},this.handlers.mouseover);
	this.options.trigger.bind('mouseout',{me:this},this.handlers.mouseout);
};

tc.resource_tooltip.prototype.handlers = {
	mouseover:function(e){
		e.data.me.tooltip.show();
	},
	mouseout:function(e){
		e.data.me.tooltip.hide();
	}
}

tc.resource_tooltip.prototype.build_tooltip = function(){
	tc.util.log("tc.resource_tooltip.build_tooltip");
	var me;
	me = this;
	this.tooltip = this.options.trigger.tooltip({
		position: "center right",
		offset: [0, 20],
		predelay: 100,
		tip:'.template-content.tooltip',
		events: {
			def: ",",    // default show/hide events for an element
			tooltip: ","     // the tooltip element
		},
		onShow: function(e) {
			var tip, trig;
			tip = this.getTip();
			trig = this.getTrigger();
			
			if (!(tip.hasClass("has-been-loaded"))) {
				tip.html('<div class="tooltip-bd spinner"><img class="loading" src="/static/images/loader32x32.gif" /></div>');
				tip.addClass('has-been-loaded');
				tc.util.dump(me.options);
				tc.jQ.ajax({
					url: me.options.get_url,
					data: me.options.get_params,
					context: this,
					dataType:'json',
					success:function(data,ts,xhr){
						var html;
						tc.util.dump(data);
						//this.getTip().html(html);//.addClass("has-been-loaded");
					}
				});
			}
		},
		onBeforeHide:function(e){
			return true;
		},
		onHide: function(e) {
			
		}
	}).data("tooltip");//.dynamic( {} );
}