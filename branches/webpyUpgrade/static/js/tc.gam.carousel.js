if (!tc) { var tc = {}; }

tc.carousel = makeClass();

tc.carousel.prototype.carousel = null;

tc.carousel.prototype.init = function(options) {
	tc.util.log("tc.carousel.init");
	
	this.options = tc.jQ.extend({
		element: null,
		next_button:null,
		prev_button:null,
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
	
	this.carousel.onSeek(function(e, i) {
		me.update_pagination();
	});
	this.carousel.onAddItem(function(e, i) {
		me.update_navigation();
		me.update_pagination();
	});
	
	if(!this.next_btn){
		if(this.options.next_button){
			this.next_btn = this.options.next_button;
			this.next_btn.bind("click", {carousel:this.carousel}, function(e) {
				e.preventDefault();
				e.stopPropagation();
				e.data.carousel.next();
			});
		} else {
			this.next_btn = this.options.element.find(".next");
			this.next_btn.bind("click", function(e) {
				e.preventDefault();
			});
		}
	}
	
	if(!this.prev_btn){
		if(this.options.prev_button){
			this.prev_btn = this.options.prev_button;
			this.prev_btn.bind("click", {carousel:this.carousel}, function(e) {
				e.preventDefault();
				e.stopPropagation();
				e.data.carousel.prev();
			});
		} else {
			this.prev_btn = this.options.element.find(".prev");
			this.prev_btn.bind("click", function(e) {
				e.preventDefault();
			});
		}
	}
	
	this.rendered = true;
	this.update_navigation();
	this.update_pagination();
};

// if the carousel has only one item, 
// hide the next/prev buttons
tc.carousel.prototype.update_navigation = function() {
	if (!this.rendered) { return; }
	tc.util.log("tc.carousel.update_navigation");
	if (this.carousel.getSize() < 2) {
		if (this.next_btn) { this.next_btn.hide(); }
		if (this.prev_btn) { this.prev_btn.hide(); }
	} else {
		if (this.next_btn) { this.next_btn.show(); }
		if (this.prev_btn) { this.prev_btn.show(); }
	}
	return this;
};

tc.carousel.prototype.update_pagination = function() {
	if (!this.options.pagination || !this.rendered) { return; }
	tc.util.log("tc.carousel.update_pagination");
	if (this.options.pagination) {
		this.options.pagination.current.text( this.carousel.getIndex() + 1 );
		this.options.pagination.total.text( this.carousel.getSize() );
	}
	return this;
};

tc.carousel.prototype.has_items = function() {
	return ( this.options.element.find(this.options.scrollPaneSelector).
	         children(this.options.scrollable.items).
	         children("li").length > 0 );
};

tc.carousel.prototype.is_rendered = function() {
	return this.rendered;
};

tc.carousel.prototype.get_element = function(){
	return this.options.element;
};
