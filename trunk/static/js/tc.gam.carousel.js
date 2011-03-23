if (!tc) { var tc = {}; }

tc.carousel = makeClass();

tc.carousel.prototype.carousel = null;

tc.carousel.prototype.init = function(options) {
	tc.util.log("tc.carousel.init");
	
	this.options = tc.jQ.extend({
		element: null,
		scrollable: {
			items: ".items",
			speed: 300,
			circular: true
		},
		scrollPaneSelector: ".scrollable:first",
		pagination: false // { current: jQuery obj, total: jQuery obj }
	}, options);
	
	this.rendered = false;
	
	if (this.has_items() && this.options.element.is(":visible")) {
		this.render();
	} else {
		tc.util.log("postponing carousel rendering", "warn");
	}
};

tc.carousel.prototype.render = function() {
	var me, scrollpane, w, h;
	tc.util.log("tc.carousel.render");
	if (this.rendered === true) { 
		tc.util.log("carousel already rendered!!!", "warn");
		return;
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
		item_height = item.outerHeight();
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
		this.carousel.onAddItem(function(e, i) {
			me.update_pagination();
			// TODO (update "next" button if we've gone from have 1 item to having 2)
		});
	}
	
	this.options.element.find(".next, .prev").bind("click", function(e) {
		e.preventDefault();
	});
	
	this.rendered = true;
	this.update_pagination();
};

tc.carousel.prototype.update_pagination = function() {
	if (!this.rendered) { return; }
	tc.util.log("tc.carousel.update_pagination");
	if (this.options.pagination) {
		this.options.pagination.current.text( this.carousel.getIndex() + 1 );
		this.options.pagination.total.text( this.carousel.getSize() );
	}
};

tc.carousel.prototype.has_items = function() {
	return ( this.options.element.find(this.options.scrollPaneSelector).
	         children(this.options.scrollable.items).
	         children("li").length > 0 );
};

tc.carousel.prototype.is_rendered = function() {
	return this.rendered;
};
