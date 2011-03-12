if (!tc) { var tc = {}; }

tc.carousel = makeClass();

tc.carousel.prototype.options = {
	element: null
};

tc.carousel.prototype.carousel = null;

tc.carousel.prototype.init = function(app, options) {
	tc.util.log("tc.carousel.init");
	this.options = tc.jQ.extend(this.options, options);
	this.options.element.scrollable({
		speed: 300,
		circular: true
	});
	this.carousel = this.options.element.data("scrollable");
};