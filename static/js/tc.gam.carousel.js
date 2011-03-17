if (!tc) { var tc = {}; }

tc.carousel = makeClass();

tc.carousel.prototype.options = {
	element: null,
	scrollPaneSelector: ".scrollable:first",
	itemsSelector: ".items"
};

tc.carousel.prototype.carousel = null;

tc.carousel.prototype.init = function(options) {
	var scrollPane, w, h;
	tc.util.log("tc.carousel.init");
	this.options = tc.jQ.extend(this.options, options);
	
	scrollPane = this.options.element.find(this.options.scrollPaneSelector);
	w = this.options.element.width();
	h = 0;
	this.options.element.width(w);
	scrollPane.children(this.options.itemsSelector).children("li").each(function() {
		var item, itemHeight;
		item = tc.jQ(this);
		item.width(w);
		itemHeight = item.height();
		if (itemHeight > h) {
			h = itemHeight;
		}
	});
	scrollPane.height(h);
	
	scrollPane.scrollable({
		speed: 300,
		circular: true
	});
	this.carousel = scrollPane.data("scrollable");
};