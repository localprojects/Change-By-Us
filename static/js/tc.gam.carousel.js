if (!tc) { var tc = {}; }

tc.carousel = makeClass();

tc.carousel.prototype.options = {
	element: null,
	scrollable: {
		items: ".items",
		speed: 300,
		circular: true
	},
	scrollPaneSelector: ".scrollable:first",
	pagination: null // { current: jQuery obj, total: jQuery obj }
};

tc.carousel.prototype.carousel = null;

tc.carousel.prototype.init = function(options) {
	tc.util.log("tc.carousel.init");
	
	this.options = tc.jQ.extend(this.options, options);
	this.has_finished_init = false;
	
	if (this.options.element.find(this.options.scrollPaneSelector)
	        .children(this.options.scrollable.items)
	        .children("li").length) {
		this.init_carousel();
	}
};

tc.carousel.prototype.init_carousel = function() {
	var me, scrollpane, w, h;
	tc.util.log("tc.carousel.init_carousel");
	if (this.has_finished_init) { 
		tc.util.log("carousel already rendered", "warn");
	}
	me = this;
	w = this.options.element.width();
	h = 0;
	this.options.element.width(w);
	scrollpane = this.options.element.find(this.options.scrollPaneSelector);
	scrollpane.children(this.options.scrollable.items).children("li").each(function() {
		var item, item_height;
		item = tc.jQ(this);
		item.width(w);
		item_height = item.height();
		if (item_height > h) {
			h = item_height;
		}
	});
	scrollpane.height(h);
	this.carousel = scrollpane.scrollable(this.options.scrollable).data("scrollable");
	
	if (this.options.pagination) {
		this.carousel.onSeek(function(e, i) {
			me.update_pagination();
		});
	}
	this.carousel.onAddItem(function(e, i) {
		me.update_pagination();
		// TODO (update "next" button if we've gone from have 1 item to having 2)
	});
	
	this.has_finished_init = true;
	me.update_pagination();
};

tc.carousel.prototype.update_pagination = function() {
	if (!this.has_finished_init) { return; }
	
	if (this.options.pagination) {
		this.options.pagination.current.text( this.carousel.getIndex() + 1 );
		this.options.pagination.total.text( this.carousel.getSize() );
	}
};
