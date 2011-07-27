/**
 * File: Utilities
 * This file holds various utility functions for CBU.
 * 
 * Dependencies:
 * tc.gam.base.js
 */
 
/**
 * Class: tc.util
 * Container for utility functions.
 */
tc.util = tc.util || {};

/**
 * Function: tc.util.log
 * Logs a basic message to the console if available.
 *
 * Parameters:
 * message - {String} Message to log.
 * level - {String} Property of console to send message to.  Options are (info,
 *     log, debug, error, ??)
 */
tc.util.log = function(message, level) {
    // Check if app_page as prevented logging.
    if (app_page && app_page.prevent_logging) {
        return;
    }
    
    // If console is available, use this.
    if (typeof console != "undefined" && typeof console.log != "undefined") {
        if (!level) {
            console.info(message);
        } else {
            console[level](message);
        }
    }
    
    // For iPhone development, use ipd.
    if (typeof ipd != "undefined" && typeof ipd.log != "undefined") {
        ipd.log(message);
    }
};

/**
 * Function: tc.util.dump
 * Dumps variable to log for debugging.
 *
 * Parameters:
 * message - {Object} Object to dump.
 */
tc.util.dump = function(object) {
    // Check if app_page as prevented logging.
    if (app_page && app_page.prevent_logging) {
        return;
    }
    
    // Log to console if available.
    if (typeof console != "undefined" && typeof console.log != "undefined") {
        console.log(object);
    }

    // If iphone available, log.
    if (typeof ipd != "undefined" && typeof ipd.log != "undefined") {
        ipd.log(object);
    }
};

/**
 * Function: tc.timer
 * Set timer utilizing setTimeout() function.
 *
 * Parameters:
 * time - {Integer} Milliseconds.
 * func - {Function} Function to call at the end of the timer.
 * callback - {Function} Function to callback when timer is cleared out.  See clearTimer().
 *
 * Returns:
 * {Object} The object that holds the 'timer' and `callback`.
 */
tc.timer = function(time, func, callback) {
    var a = {
        timer: setTimeout(func, time),
        callback: null
    }
    if (typeof (callback) == 'function') {
        a.callback = callback;
    }
    return a;
};

/**
 * Function: tc.clearTimer
 * Clears a timer set at timer().
 *
 * Parameters:
 * a - {Object} Object returned from timer().
 *
 * Returns:
 * {Object} The function itself.
 */
tc.clearTimer = function (a) {
    clearTimeout(a.timer);
    if (typeof (a.callback) == 'function') {
        a.callback();
    };
    return this;
};

/**
 * Function: tc.animate_bg
 * Animate background color.
 *
 * Parameters:
 * ele - {Object} jQuery DOM element
 * from - {Object} Color to start form
 * to - {Object} Color to go to
 */
tc.animate_bg = function(ele, from, to) {
    from += (from > to) ? -0.25 : 0.25;

    if (!tc.jQ.support.opacity) {
        if (from != to) {
            var opStr = (Math.round(from * 25.5)).toString(16);
            ele.css({
                backgroundColor: 'transparent',
                filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#" + opStr + "FFFFFF, endColorstr=#" + opStr + "FFFFFF) !important",
                '-ms-filter': "progid:DXImageTransform.Microsoft.gradient(startColorstr=#" + opStr + "FFFFFF, endColorstr=#" + opStr + "FFFFFF) !important"
            });
        } else {
            //ele.css({background:'transparent',filter:"none"}); 
            //tc.jQ('.more-info.after-idea-message').attr('style','');  
        }
    } else {
        ele.css("backgroundColor", "rgba(255, 255, 255, " + (from) / 10 + ")");
    }
    if (from != to) {
        setTimeout(function () {
            tc.animate_bg(ele, from, to)
        }, 50);
    }
};

/**
 * Function: tc.addOfficialResourceTags
 * Add official resource tags. ??
 *
 * Parameters:
 * dom - {Object} jQuery DOM element
 */
tc.addOfficialResourceTags = function(dom) {
    var officialResourceCells = dom.find('td.official-resource');
    dom.parent().children('.official-resource-tag').remove();

    for (var i = 0; i < officialResourceCells.length; i++) {
        var td = officialResourceCells.eq(i)
        var tdPos = td.position();
        var tdWidth = td.outerWidth();

        dom.before('<div class="official-resource-tag" id="tag-' + i + '" style="top:' + tdPos.top + 'px; left:' + tdPos.left + 'px; width:' + (tdWidth - 48) + 'px"><span>Official Resource</span></div>');
        td.css({
            'padding-top': '25px'
        });
    };
};

/**
 * Function: tc.truncate
 * Truncate string.
 *
 * Parameters:
 * str - {String} String to truncate.
 * len - {String} Length to truncate to.
 * suffic - {String} Suffix to add, or will auto add &hellip;
 *
 * Return:
 * {String} Truncated string.
 */
tc.truncate = function(str, len, suffix) {
    if (typeof str === "string") {
        if (str.length > len) {
            return str.substring(0, len) + (suffix || "&hellip;");
        }
    }
    return str;
};

/**
 * Function: tc.randomNoteCardBg
 * Add class randomly to note card for different background colors.
 *
 * Parameters:
 * ideasList - {Object} jQuery object that is container of notecards (as li)
 */
tc.randomNoteCardBg = function(ideasList) {
    var ideas = ideasList.children('li');
    for (i = 0; i < ideas.length; i++) {
        ideas.eq(i).children('.note-card').addClass('card' + (Math.floor(Math.random() * 4) + 1));
    }
};

/**
 * Function: tc.makeEmailLink
 * Make an email link.
 *
 * Parameters:
 * name - {String} Email name from name@domain.
 * domain - {String} Domain name from name@domain.
 *
 * Return:
 * {String} Email link.
 */
tc.makeEmailLink = function(name, domain) {
    addr = name + '@' + domain;
    s = '<a href="mailto:' + addr + '">' + addr + '</a>';
    return s;
};

/**
 * Function: tc.jQ.fn.time_since
 * jQuery function to format time to be in "time since" format.
 */
tc.jQ.fn.time_since = function() {
    return this.each(function () {
        var me, raw;
        me = tc.jQ(this);
        raw = me.text();
        me.attr("title", raw.split(" ").join("T") + "Z");
        me.prettyDate();
    });
};

/**
 * Function: makeClass
 * Creates a "class" in Javascript.  See <http://ejohn.org/blog/simple-class-instantiation/>
 *
 * Authors:
 * - John Resig (MIT Licensed)
 */
function makeClass() {
    return function (args) {
        if (this instanceof arguments.callee) {
            if (typeof this.init == "function") this.init.apply(this, args.callee ? args : arguments);
        } else return new arguments.callee(arguments);
    };
}

/**
 * Variable: ua
 * {String} User agent string.  Taken from jQuery's browser property.
 */
var ua = tc.jQ.browser;

/**
 * Variable: os
 * {String} Operating system string.
 */
var os = '';

/**
 * Variable: isMsie8orBelow
 * {Boolean} Whether IE8 or below.
 */
var isMsie8orBelow = false;

/**
 * Variable: isMsie7orBelow
 * {Boolean} Whether IE7 or below.
 */
var isMsie7orBelow = false;

/**
 * Variable: isiPad
 * {Boolean} Whether iPad or not.
 */
var isiPad = false;

/**
 * Function: tc.browserDetection
 * Detect browser and get some variables.
 */
tc.browserDetection = function() {
    // If less than IE9
    if (ua && ua.msie && ua.version < 9) {
        isMsie8orBelow = true;
    
        (function () {
            var originalTitle = document.title.split("#")[0];
            document.attachEvent("onpropertychange", function (e) {
                if (e.propertyName === "title" && document.title !== originalTitle) {
                    document.title = originalTitle;
                }
            });
        }());
    
        if (ua.version < 8) {
            tc.jQ('body').addClass('ie7');
            isMsie7orBelow = true
        }
    };
    
    // For Mozilla browsers: gecko 1.9.1 is for FF3.5, 1.9.0 for FF3
    if (ua.mozilla) {
        if (ua.version.slice(0, 5) == "1.9.0") {
            tc.jQ('body').addClass('ff3')
        } else if (ua.version.slice(0, 5) == "1.9.1") {}
    } else if (ua.webkit) {
        tc.jQ('body').addClass('webkit')
    };
    
    // Chrome browsers
    if (navigator.userAgent.indexOf('Chrome') != -1) {
        tc.jQ('body').addClass('chrome')
    }
    
    // Windows or Mac
    if (navigator.appVersion.indexOf("Win") != -1) {
        os = 'windows';
    } else if (navigator.appVersion.indexOf("Mac") != -1) {
        os = 'mac'
    };
    
    // Check for iPad
    if (navigator.userAgent.match(/iPad/i) != null) {
        os = 'ipad';
        isiPad = true;
    }
    
    tc.jQ('body').addClass(os);
}
tc.browserDetection();