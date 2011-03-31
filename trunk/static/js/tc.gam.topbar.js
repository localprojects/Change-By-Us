if (!tc) { var tc = {}; }

tc.top_bar = function(element, options) {
	var o;
	
	o = tc.jQ.extend({
		slideSpeed: 250,
		fadeSpeed: 200
	}, options);
	
	tc.jQ('div.dropdown').removeClass('no-js');
	
	function init() {
		element.find(".username, .myprojects").mouseenter(function () {
			tc.jQ(this).children(".dropdown").stop(true, true).slideDown(o.slideSpeed);
		}).mouseleave(function () {
			tc.jQ(this).children(".dropdown").fadeOut(o.fadeSpeed);
		});
	}
	
	init();
	return {
		
	};
};