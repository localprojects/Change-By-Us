if (!tc) { var tc = {}; }

tc.resource_tooltip = makeClass();

tc.resource_tooltip.prototype.options = {
	element: null,
	get_url: null,
	get_params: null
};

tc.resource_tooltip.prototype.tooltip = null;

tc.resource_tooltip.prototype.init = function(options) {
	var me;
	tc.util.log("tc.resource_tooltip.init");
	me = this;
	this.options = tc.jQ.extend(this.options, options);
		
	this.options.element.tooltip({
		position: "center right",
		offset: [-10, -20],
		predelay: 100,
		onShow: function(e) {
			var tip, trig;
			tip = this.getTip();
			trig = this.getTrigger();
			
			if (!(tip.hasClass("has-been-loaded"))) {
				tip.html('<div class="tooltip-bd spinner"><img class="loading" src="/static/images/loader32x32.gif" /></div>');
				tc.jQ.ajax({
					url: me.options.get_url,
					data: me.options.get_params,
					context: tip,
					dataType:'json',
					success:function(data,ts,xhr){
						var html;
						//tc.util.dump(data);
						
						html = 
							"<div class='tooltip-hd'>"+ 
								"<h2>"+ data.title +"</h2>"+
							"</div>"+
							"<div class='tooltip-bd'>"+
								"<div class='info'>"+
									"<div class='thumb'>"+
										"<img alt='"+ data.title + "' src='http://placehold.it/90x90'/>"+
									"</div>"+
									"<div class='main'>"+
										"<p>"+ data.description +"</p>"+
									"</div>"+
								"</div>"+
								"<dl class='details'>"+
									"<dt>Visit Us</dt>"+
									"<dd><a href='"+ data.url +"'>"+ data.url +"</a></dd>"+
								"</dl>"+
							"</div>";
						
						this.html(html).addClass("has-been-loaded");
					}
				});
			}
		},
		onHide: function(e) {
			
		}
	});
	
	this.tooltip = this.options.element.data("tooltip");
};