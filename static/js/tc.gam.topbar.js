var tc = tc || {};

tc.top_bar = function(element, options) {
    var o = tc.jQ.extend({
        slideSpeed: 250,
        fadeSpeed: 200
    }, options),
    self = {};
    
    tc.jQ('div.dropdown').removeClass('no-js');
    
    var getPopularTags = function(success) {
        tc.jQ.ajax({
            url:'/rest/v1/keywords/',
            dataType:'json',
            success:function(data, status, xhr) {
                if (success) {
                    success(data, status, xhr);
                }
            }
        });
    };
    
    self._getTagsMarkup = function(tagsList) {
        return tc.jQ.map(tagsList, function(tag, i) {
          return '<a href="/search?terms=' + tag.name + '">' + tag.name + '</a> (' + tag.count + ')';
        }).join(', ');
    };
    
    function init() {
        if (isiPad === true) {
            element.find(".username > a, .myprojects > a, .lang > a").removeAttr('href');
            element.find(".username > a, .myprojects > a, .lang > a").toggle(
                function() { 
                    tc.jQ('.userland .dropdown').hide();
                    tc.jQ(this).parent().children(".dropdown").stop(true, true).slideDown(o.slideSpeed);
                }, function() { 
                    tc.jQ(this).parent().children(".dropdown").fadeOut(o.fadeSpeed); 
                }
            );
        } else {
            element.find(".username, .myprojects, .lang-selector, .search-button").mouseenter(function () {
                if( $.browser.msie && $.browser.version < 8 ) {
                    tc.jQ(this).children(".dropdown").stop(true, true).fadeIn(o.slideSpeed);
                } else {
                    tc.jQ(this).children(".dropdown").stop(true, true).slideDown(o.slideSpeed);
                }
                tc.jQ(this).children("a").toggleClass("opened");
            }).mouseleave(function () {
                tc.jQ(this).children(".dropdown").delay(200).fadeOut(o.fadeSpeed);
                tc.jQ(this).children("a").toggleClass("opened");
            });
        };
        
        getPopularTags(function(data) {
            var markup = self._getTagsMarkup(data);
            tc.jQ('.browse-tags').html(markup);
        });
    }
    
    init();
    return self;
};
