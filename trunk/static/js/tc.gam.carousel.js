if (!tc) { var tc = {}; }

tc.carousel = makeClass();

tc.carousel.prototype.options = {
	element: null,
	scrollPaneSelector: ".scrollable:first",
	itemsSelector: ".items",
	pagination: null // { current: jQuery obj, total: jQuery obj }
};

tc.carousel.prototype.carousel = null;

tc.carousel.prototype.init = function(options) {
	var me, scrollPane, w, h;
	tc.util.log("tc.carousel.init");
	me = this;
	this.options = tc.jQ.extend(this.options, options);
	
	//tc.util.dump(this.options);
	
	scrollPane = this.options.element.find(this.options.scrollPaneSelector);
	
	//tc.util.dump(scrollPane);
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
	
	try {
		scrollPane.scrollable({
			speed: 300,
			circular: true
		});
		this.carousel = scrollPane.data("scrollable");
	} catch(err) {
		tc.util.log("Problem initializing carousel: likely because this carousel contains no items!", "warn");
		//tc.util.dump(err);
	}
	/*
	//if (this.carousel && this.options.pagination) {
		this.carousel.onSeek(function(e, i) {
			me.updatePagination();
		});
	//}
	this.updatePagination();*/
};

tc.carousel.prototype.updatePagination = function() {
	if (this.carousel && this.options.pagiination) {
		tc.util.log("tc.carousel.updatePagination");
		this.options.pagination.current.text( this.carousel.getIndex() );
		this.options.pagination.total.text( this.carousel.getSize() );
	}
};