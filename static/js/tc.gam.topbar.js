var tc = tc || {};

tc.top_bar = function(element, options) {
    var o = tc.jQ.extend({
        slideSpeed: 250,
        fadeSpeed: 200
    }, options);
    
    tc.jQ('div.dropdown').removeClass('no-js');
    
    function init() {
        if (isiPad === true) {
            element.find(".username > a, .myprojects > a").removeAttr('href');
            element.find(".username > a, .myprojects > a").toggle(
                function() { 
                    tc.jQ('.userland .dropdown').hide();
                    tc.jQ(this).parent().children(".dropdown").stop(true, true).slideDown(o.slideSpeed);
                }, function() { 
                    tc.jQ(this).parent().children(".dropdown").fadeOut(o.fadeSpeed); 
                }
            );
        } else {
            element.find(".username, .myprojects").mouseenter(function () {
                if( $.browser.msie && $.browser.version < 8 ) {
                    tc.jQ(this).children(".dropdown").stop(true, true).fadeIn(o.slideSpeed);
                } else {
                    tc.jQ(this).children(".dropdown").stop(true, true).slideDown(o.slideSpeed);
                }
            }).mouseleave(function () {
                tc.jQ(this).children(".dropdown").fadeOut(o.fadeSpeed);
            });
        };
    }
    
    init();
    return {};
};