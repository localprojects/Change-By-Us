
/******************** Begin ./static/js/tc.gam.base.js     ********************/
/**
 * File: Base
 * Base file for the TC application.  This should be included
 * before any other TC file.
 *
 * Filename:
 * tc.gam.base.js
 */

/**
 * Variable: tc
 * This is the main container for the tc framework.
 */
var tc = tc || {};

/**
 * Variable: tc.gam
 * This is the main container for the CBU (was GAM)
 * application.
 */
tc.gam = tc.gam || {};

/**
 * Variable: app_page
 * Container for the app page. ??
 */
var app_page = app_page || {};

/**
 * Variable: tc.jQ
 * Localize jQuery into tc.  Not exactly sure why.
 */
if (typeof jQuery != "undefined") {
    tc.jQ = jQuery;
}
/********************   End ./static/js/tc.gam.base.js     ********************/


/******************** Begin ./static/js/tc.util.js         ********************/
/**
 * File: Utilities
 * This file holds various utility functions for CBU.
 *
 * Filename:
 * tc.util.js
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
/********************   End ./static/js/tc.util.js         ********************/


/******************** Begin ./static/js/tc.gam.validate.js ********************/
/**
 * File: Validate
 * Defines input validators, mostly used in the Merlin framework.
 *
 * Filename:
 * tc.gam.validate.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 */

/**
 * Variable: tc.validator_regex
 * {Object} Defines an object with properties
 * - email: regex expression for validating emails.
 * - url: regex expression for validating urls.
 */
tc.validator_regex = {
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    url: /^((ht|f)tps?:\/\/)?[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\%"\,\{\}\\|\\\^\[\]`]+)?$/
};

/**
 * Variable: tc.password
 * {Object} Holds valid characters for passwords.  See
 * tc.password_strength().
 */
tc.password = {
    'm_strUpperCase': "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    'm_strLowerCase': "abcdefghijklmnopqrstuvwxyz",
    'm_strNumber': "0123456789",
    'm_strCharacters': "!@#$%^&*?_~"
};

/**
 * Variable: tc.validator_utils
 * {Object} Holds some useful utility function for validating.
 */
tc.validator_utils = {};

/**
 * Function: tc.validator_utils.is_empty
 * Checks if string is empty.
 *
 * Parameters:
 * str - {String} String to check.
 *
 * Returns:
 * {Boolean} Whether string is empty or not.
 */
tc.validator_utils.is_empty = function(str) {
    return tc.jQ.trim(str) ? false : true;
};

/**
 * Function: tc.validator_utils.val_escape_hints
 * Takes an input value and checks against hint.
 *
 * Parameters:
 * elemnt - {Object} jQuery element to check.
 *
 * Returns:
 * {String} The value of the element, or if it is the same as the
 * hint, returns an empty string.
 */
tc.validator_utils.val_escape_hints = function (element) {
    var value = element.val();
    var hint = element.data().input ? element.data().input.hint : null;
    
    if (!hint) {
        return value;
    }
    return (value === hint ? "" : value);
};

/**
 * Function: tc.validate
 * Main validation function.
 *
 * The following are the built in validators
 * - min-X: Where XX is an integer for the minimum number of characters
 *     that the length of the input value can have.
 * - max-X: Where XX is an integer for the maximum number of characters
 *     that the length of the input value can have.
 * - not-STRING: Where STRING is a specific string that the input
 *     value cannot have.
 * - password-X: Where X is the password strength that the input
 *     value has to equal or exceed.  See tc.password_strength().
 * - required: Checks that there is an input value.
 * - csv-email: Checks that input is a comma-separated list of
 *     emails.
 * - email: Checks that input is a valid email address.
 * - csv-url: Checks that input is a comma-separated list of
 *     urls.  This does not handle if URL's have commas in them.
 * - url: Checks that input is a valid URL address.
 * - numeric: Checks that input is a valid number.
 * - selected: Checks that input has been selected.
 *
 * Parameters:
 * element - {Mixed} jQuery element object or jQuery selector.  Not
 *     having a valid element or selector will throw error.
 * validators - {Array} An array of strings.  Each string refers to a
 *     validation call.
 *
 * Return:
 * {Object} An object with the following properties
 * - valid: {Boolean} Whether element validated.
 * - errors: {Array} Array of string validation errors.
 * - data: {Object} The DOM element ??
 */
tc.validate = function(element, validators) {
    var valid = true;
    var required = false;
    var errors = [];
    var empty, value, num_val, i, tempvalue, tempelement, j;
    
    // Accept either selector or jQuery element.
    if (!element instanceof tc.jQ) {
        element = tc.jQ(element);
    }
    value = element.val();

    // If there is no elements to validate, the assumption
    // is that this is an error.
    if (!element.get(0)) {
        return {
            valid: false,
            errors: ['Input not found.'],
            data: element
        };
    }

    // Go through validators array.
    for (i in validators) {
        // Check min.
        if (validators[i].substring(0, 3) == 'min') {
            value = tc.validator_utils.val_escape_hints(element);
            num_val = parseFloat(value);
            
            if (isNaN(num_val)) {
                if (value.length < (validators[i].split('-')[1] * 1.0)) {
                    valid = false;
                    errors.push("Too short.");
                }
            } else {
                if (value < (validators[i].split('-')[1] * 1.0)) {
                    valid = false;
                    errors.push("Too small.");
                }
            }
            continue;
        }
        // check max.
        if (validators[i].substring(0, 3) == 'max') {
            value = tc.validator_utils.val_escape_hints(element);
            num_val = parseFloat(value);
            
            if (isNaN(num_val)) {
                if (value.length > (validators[i].split('-')[1] * 1.0)) {
                    valid = false;
                    errors.push("Too long.");
                }
            } else {
                if (value > (validators[i].split('-')[1] * 1.0)) {
                    valid = false;
                    errors.push("Too big.");
                }
            }
            continue;
        }
        // Not a specfific string
        if (validators[i].substring(0, 3) == 'not') {
            if (value === validators[i].split('-')[1]) {
                valid = false;
                errors.push("Invalid value.");
            }
            continue;
        }
        // Password strength
        if (validators[i].substring(0, 8) == 'password') {
            tempvalue = tc.password_strength(value);
            tempelement = element.filter('.has-been-focused').siblings('.pass-strength');
            if (tempvalue < (validators[i].split('-')[1] * 1.0)) {
                valid = false;
                errors.push("Too Weak.");
                if (tempelement.length) {
                    tempelement.text('Too weak').addClass('weak');
                }
            } else {
                if (tempelement.length) {
                    tempelement.text('Strong').removeClass('weak');
                }
            }
            continue;
        }
        
        // Mutually exclusive validators.
        switch (validators[i]) {
            // Required.
            case 'required':
                required = true;
                if (element.get(0).type == 'checkbox') {
                    if (!element.filter(':checked').length || !element.get(0).checked) {
                        valid = false;
                        errors.push("This is required.");
                    }
                } else {
                    value = tc.validator_utils.val_escape_hints(element);
                    if (!value.length) {
                        empty = true;
                        valid = false;
                        errors.push("This is required.");
                    }
                }
                break;
                
            // Comma separated list of emails.
            case 'csv-email':
                value = value.split(',');
                for (j in value) {
                    if (!tc.validator_regex.email.test(tc.jQ.trim(value[j]))) {
                        valid = false;
                        errors.push("Invalid Email.");
                    }
                }
                break;
                
            // Email address.
            case 'email':
                tempelement = element.filter('.has-attempted-submit').parent().parent().find('.email-error');
                if (!tc.validator_regex.email.test(value)) {
                    valid = false;
                    if (tempelement.length) {
                        tempelement.show();
                    }
                    errors.push("Invalid Email.");
                } else {
                    if (tempelement.length) {
                        tempelement.hide();
                    }
                }
                break;
                
            // Comma separated list of urls.
            case 'csv-url':
                value = value.split(',');
                for (j in value) {
                    if (!tc.validator_regex.url.test(tc.jQ.trim(value[j]))) {
                        valid = false;
                        errors.push("Invalid Url.");
                    }
                }
                break;
                
            // URL
            case 'url':
                if (!tc.validator_regex.url.test(value)) {
                    valid = false;
                    errors.push("Invalid Url.");
                }
                break;
            
            // Numeric value
            case 'numeric':
                if (isNaN(Number(value))) {
                    valid = false;
                    errors.push('Not a number.');
                }
                break;
                
            // Selected
            case 'selected':
                if (value == '-1') {
                    valid = false;
                    errors.push('Must select a value.');
                }
                break;
            }
    }

    // If pass tests, is empty and not required, then valid.
    if (!valid && !required && !tc.jQ.trim(value).length) {
        valid = true;
    }

    // Handle if validity.
    if (valid) {
        element.removeClass('not-valid');
        if (required || tc.jQ.trim(value).length) {
            element.addClass('valid');
        }
        return {
            valid: true
        };
    } else {
        element.removeClass('valid').addClass('not-valid');
        return {
            valid: false,
            errors: errors
        };
    }
};

/**
 * Function: tc.password_strength
 * Password strength meter v2.0.  Measures password strength.
 *
 * Based on code from
 * - <http://www.intelligent-web.co.uk>
 * - <http://www.geekwisdom.com/dyn/passwdmeter>
 *
 * Password Strength Algorithm
 * Password Length
 * - 5 Points: Less than 4 characters
 * - 10 Points: 5 to 7 characters
 * - 25 Points: 8 or more
 *
 * Letters
 * - 0 Points: No letters
 * - 10 Points: Letters are all lower case
 * - 20 Points: Letters are upper case and lower case
 *
 * Numbers
 * - 0 Points: No numbers
 * - 10 Points: 1 number
 * - 20 Points: 3 or more numbers
 *
 * Characters
 * - 0 Points: No characters
 * - 10 Points: 1 character
 * - 25 Points: More than 1 character
 *
 * Bonus
 * - 2 Points: Letters and numbers
 * - 3 Points: Letters, numbers, and characters
 * - 5 Points: Mixed case letters, numbers, and characters
 *
 * Password Text Range
 * - >= 90: Very Secure
 * - >= 80: Secure
 * - >= 70: Very Strong
 * - >= 60: Strong
 * - >= 50: Average
 * - >= 25: Weak
 * - >= 0: Very Weak
 * 
 * Authors:
 * - Matthew R. Miller - 2007 <http://www.codeandcoffee.com>
 *
 * Parameters:
 * {String} Password string.
 *
 * Return:
 * {Integer} Password strength score.
 */
tc.password_strength = function(strPassword) {
    // Reset combination count
    var nScore = 0;

    // Password length
    // -- Less than 4 characters
    if (strPassword.length < 5) {
        nScore += 5;
    }
    // -- 5 to 7 characters
    else if (strPassword.length > 4 && strPassword.length < 8) {
        nScore += 10;
    }
    // -- 8 or more
    else if (strPassword.length > 7) {
        nScore += 25;
    }

    // Letters
    var nUpperCount = tc.countContain(strPassword, tc.password.m_strUpperCase);
    var nLowerCount = tc.countContain(strPassword, tc.password.m_strLowerCase);
    var nLowerUpperCount = nUpperCount + nLowerCount;
    // -- Letters are all lower case
    if (nUpperCount == 0 && nLowerCount != 0) {
        nScore += 10;
    }
    // -- Letters are upper case and lower case
    else if (nUpperCount != 0 && nLowerCount != 0) {
        nScore += 20;
    }

    // Numbers
    var nNumberCount = tc.countContain(strPassword, tc.password.m_strNumber);
    // -- 1 number
    if (nNumberCount == 1) {
        nScore += 10;
    }
    // -- 3 or more numbers
    if (nNumberCount >= 3) {
        nScore += 20;
    }

    // Characters
    var nCharacterCount = tc.countContain(strPassword, tc.password.m_strCharacters);
    // -- 1 character
    if (nCharacterCount == 1) {
        nScore += 10;
    }
    // -- More than 1 character
    if (nCharacterCount > 1) {
        nScore += 25;
    }

    // Bonus
    // -- Letters and numbers
    if (nNumberCount != 0 && nLowerUpperCount != 0) {
        nScore += 2;
    }
    // -- Letters, numbers, and characters
    if (nNumberCount != 0 && nLowerUpperCount != 0 && nCharacterCount != 0) {
        nScore += 3;
    }
    // -- Mixed case letters, numbers, and characters
    if (nNumberCount != 0 && nUpperCount != 0 && nLowerCount != 0 && nCharacterCount != 0) {
        nScore += 5;
    }

    return nScore;
};

/**
 * Function: tc.countContain
 * Counts number of times a string contains another string.
 *
 * Parameters:
 * strPassword - {String} String to check for sub strings in.
 * strCheck - {String} String to look for in strPassword.
 *
 * Returns:
 * {Integer} Number of times that strCheck was found.
 */
tc.countContain = function(strPassword, strCheck) {
    var nCount = 0;
    for (i = 0; i < strPassword.length; i++) {
        if (strCheck.indexOf(strPassword.charAt(i)) > -1) {
            nCount++;
        }
    }
    return nCount;
};
/********************   End ./static/js/tc.gam.validate.js ********************/


/******************** Begin ./static/js/tc.gam.merlin.js   ********************/
/**
 * File: Merlin
 * This file defines the wizard handling framework, known as
 * Merlin.
 *
 * Filename:
 * tc.gam.merlin.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 */

/**
 * Class: tc.merlin
 * Merlin is a wizard handling library.
 */
tc.merlin = tc.merlin || makeClass();

/**
 * Variable: tc.merlin.prototype.options
 * Default options for Merlin.
 */
tc.merlin.prototype.options = {
    name: null,
    dom: null,
    progress_element: null,
    next_button: null,
    back_button: null,
    watch_keypress: true,
    first_step: 'start',
    allow_hash_override_onload: false,
    use_hashchange: true,
    steps: {
        'start': {
            progress_selector: '.1',
            selector: '.start',
            prev_step: null,
            next_step: null
        }
    }
};

/**
 * Function: tc.merlin.prototype.init
 * Initialization function when creating a Merlin object.  Not
 * sure if this needs to manually called or not?
 *
 * Parameters:
 * app - {Object} App object?
 * options - {Object} Options to use, defaults provided by tc.merlin.options.
 */
tc.merlin.prototype.init = function(app, options) {
    // Define options, by utilizing defaults.
    this.options = tc.jQ.extend({}, this.options, options);
    
    // Define the app object that will be used throughout.
    this.app = app;
    
    // Turn in provided DOM element into jQuery object.  This ends
    // up being the DOM space for further DOM querying.
    if (this.options.dom instanceof String) {
        this.options.dom = tc.jQ(options.dom);
    }
    this.dom = this.options.dom;
    
    // Define some intial values for the Merlin object.
    this.magic = null;
    this.event_data = {
        app: app,
        me: this
    };
    
    // Start handling the steps.
    this.handle_steps();
    this.handle_controls(options.controls);
    this.setup_events(app);
    
    // Set address if using hash location and forcing onload.  This will start
    // the step asscoaited with has, otherwise, start on step one.
    if (this.options.use_hashchange && this.options.allow_hash_override_onload) {
        this.set_address(window.location.hash.substring(1, window.location.hash.length));
    } else {
        if (this.options.first_step) {
            this.show_step(this.options.first_step);
        }
    }

    // Initialize current hash.
    this.current_hash = null;
};

/**
 * Function: tc.merlin.prototype.setup_events
 * Set up events that are passed into the Merlin object.
 *
 * Parameters:
 * app - {Object} App object?
 */
tc.merlin.prototype.setup_events = function(app) {
    // For hash steps, unbind any existing hashchange, and add new hashchange
    if (this.options.use_hashchange) {
        tc.jQ(window)
            .unbind('hashchange', this.event_data, this.handlers.hashchange)
            .bind('hashchange', this.event_data, this.handlers.hashchange);
    }
    
    // Add events to DOM objects
    if (this.dom) {
        this.dom.find('a.step_link').unbind('click').bind('click', this.event_data, this.handlers.a_click);
        this.dom.bind('merlin-step-valid', this.event_data, this.handlers.valid);
        this.dom.bind('merlin-step-invalid', this.event_data, this.handlers.invalid);
    }
    
    // Handle back button.
    if (this.options.back_button) {
        this.options.back_button.unbind('click').bind('click', this.event_data, this.handlers.prev_step);
    }
    
    // Handle next button.
    if (this.options.next_button) {
        this.options.next_button.addClass('disabled');
        this.options.next_button.unbind('click').bind('click', this.event_data, this.handlers.next_step);
    }
};

/**
 * Function: tc.merlin.prototype.deallocate_magic
 * Unbind all Merlin events.
 */
tc.merlin.prototype.deallocate_magic = function() {
    if (this.options.use_hashchange) {
        tc.jQ(window).unbind('hashchange', this.handlers.hashchange);
    }
    if (this.dom) {
        this.dom.find('a.step_link').unbind('click', this.handlers.a_click);
        this.dom.unbind('merlin-step-valid', this.handlers.valid);
        this.dom.unbind('merlin-step-invalid', this.handlers.invalid);
    }
    if (this.options.back_button) {
        this.options.back_button.unbind('click', this.handlers.prev_step);
    }
    if (this.options.next_button) {
        this.options.next_button.unbind('click', this.handlers.next_step);
    }
};

/**
 * Function: tc.merlin.prototype.handle_controls
 * Event handling for progress element and error indicator.
 *
 * Parameters:
 * controls - {Object} Not sure what this is used for?
 */
tc.merlin.prototype.handle_controls = function(controls) {
    if (this.options.progress_element) {
        this.options.progress_element.find('a.indicator').bind('click', this.event_data, this.handlers.indicator_click);
    }
    if (this.options.error_indicator) {
        this.options.error_indicator.html('<span></span>');
    }
};

/**
 * Function: tc.merlin.prototype.handle_steps
 * If enabled, use the magic_spell(), and create step jQuery objects.
 */
tc.merlin.prototype.handle_steps = function() {
    // If magic is enabled, use magic spell.
    if (this.options.magic) {
        this.magic = this.magic_spell();
    }
    
    // Turn DOM string elements into jQuery objects.
    var i;
    for (i in this.options.steps) {
        if (this.options.steps[i].selector && this.dom) {
            this.options.steps[i].dom = this.dom.find(this.options.steps[i].selector);
        }
    }
};

/**
 * Function: tc.merlin.prototype.magic_spell
 * Some sort of magic....
 *
 * It is thought that this handles a wizard that has pages that scroll
 * left and right.  This can be seen on the front page with ideas.
 *         
 */

/**
 * Magic!!:
 *      __________________
 *    .-'  \ _.-''-._ /  '-.
 *  .-/\   .'.      .'.   /\-.
 * _'/  \.'   '.  .'   './  \'_
 *:======:======::======:======:  
 * '. '.  \     ''     /  .' .'
 *   '. .  \   :  :   /  . .'
 *     '.'  \  '  '  /  '.'
 *       ':  \:    :/  :'
 *         '. \    / .'
 *           '.\  /.'
 *             '\/'
 */
tc.merlin.prototype.magic_spell = function() {
    var i;
    var magic_dust;

    // Magic_Dust is an object that calls itself with this (the Merlin
    // magic_spell object) and specifically the init() function.
    magic_dust = ({
        // Default options.
        n_items: 0,
        overall_width: 0,
        page_width: 0,
        item_metadata: {
            max_width: 0,
            min_width: 100000,
            max_height: 0,
            min_height: 100000,
            marginLeft: 0
        },
        $items: [],
        
        /**
         * Initialize steps and handle dimensions.
         */
        init: function(merlin) {
            this.merlin = merlin;

            // Go through steps and manager height and width.
            for (i in this.merlin.options.steps) {
                this.merlin.options.steps[i].magic_dom = this.merlin.dom.children().filter(this.merlin.options.steps[i].selector);
                if (this.merlin.options.steps[i].magic_dom.length) {
                    this.$items.push(this.merlin.options.steps[i].magic_dom.get(0));

                    if (this.merlin.options.steps[i].magic_dom.outerWidth() < this.item_metadata.min_width) {
                        this.item_metadata.min_width = this.merlin.options.steps[i].magic_dom.outerWidth();
                    }
                    if (this.merlin.options.steps[i].magic_dom.outerWidth() > this.item_metadata.max_width) {
                        this.item_metadata.max_width = this.merlin.options.steps[i].magic_dom.outerWidth();
                    }

                    if (this.merlin.options.steps[i].magic_dom.outerHeight() < this.item_metadata.min_height) {
                        this.item_metadata.min_height = this.merlin.options.steps[i].magic_dom.outerHeight();
                    }
                    if (this.merlin.options.steps[i].magic_dom.outerHeight() > this.item_metadata.max_height) {
                        this.item_metadata.max_height = this.merlin.options.steps[i].magic_dom.outerHeight();
                    }
                }
            }

            // Define properties
            this.n_items = this.$items.length;
            this.$items = tc.jQ(this.$items);
            this.page_width = tc.jQ(window).width();
            this.overall_width = (this.page_width * this.n_items);
            this.item_metadata.marginLeft = (this.page_width - this.item_metadata.max_width) / 2

            // Define CSS based on found dimenstions
            this.merlin.dom.css({
                'width': this.overall_width + 'px',
                'height': this.item_metadata.max_height + 'px'
            });
            this.$items.show().css({
                'float': 'left',
                'clear': 'none',
                'width': this.item_metadata.max_width + 'px',
                'marginLeft': this.item_metadata.marginLeft
            }).removeClass('clearfix');

            return this;
        },
        
        /**
         * Resize handler for events?
         */
        resize_handler: function(e) {
            // Not sure what this does.
        },
        
        /**
         * Show a step
         */
        show_step: function(step) {
            if (!step.magic_dom) {
                return;
            }
            this.merlin.dom.css({
                'marginLeft': ((step.magic_dom.position().left)) + 'px'
            });
        }
    }).init(this);

    return magic_dust;
};

/**
 * Function: tc.merlin.prototype.show_step
 * Show a specific step.
 *
 * Parameters:
 * step - {String} Step identifier.
 * force - {Boolean} Whether to force ??.
 */
tc.merlin.prototype.show_step = function(step, force) {
    var i;
    var j;
    var temp_e_data;

    // If current step defined and not forcing.  Check if current is the one
    // we should show, and show.  Finish current step.
    if (this.current_step && !force) {
        if (step == this.current_step.step_name) {
            if (!this.current_step.dom.filter(':visible').length) {
                this.current_step.dom.show();
            }
            return;
        }
        if (this.current_step) {
            if (tc.jQ.isFunction(this.current_step.finish)) {
                this.current_step.finish(this, this.current_step.dom);
            }
        }
    }
    
    // If current step and forcing, then finish current step.
    if (force && this.current_step) {
        if (tc.jQ.isFunction(this.current_step.finish)) {
            this.current_step.finish(this, this.current_step.dom);
        }
    }

    // If step is not defined in the option, then just return.
    if (!this.options.steps[step]) {
        return;
    }

    // Put step name into step_name
    this.options.steps[step].step_name = step;
    
    // Handle history (back and next)
    if (this.current_step && this.current_step.use_for_history) {
        this.options.steps[step].prev_step = this.current_step.step_name;
    } else if (this.current_step) {
        this.options.steps[step].prev_step = this.current_step.prev_step;
    }
    
    // Define this as current step
    this.current_step = this.options.steps[step];
    
    // Enable next button if available.
    if (this.options.next_button) {
        this.options.next_button.removeClass('disabled');
    }
    
    // Handle progress selector.
    if (this.current_step.progress_selector) {
        if (this.options.progress_element) {
            this.options.progress_element
                .find(this.current_step.progress_selector)
                .addClass('cur')
                .attr('href', '#' + this.current_step.step_name)
                .nextAll()
                .removeClass('cur')
                .attr('href', '#');
        }
    }
    
    // Make overall title, name of step.  Same with sub-ttile
    if (this.current_step.title && this.options.title) {
        this.options.title.html(this.current_step.title);
    }
    if (this.current_step.sub_title && this.options.sub_title) {
        this.options.sub_title.html(this.current_step.sub_title);
    }
    
    // If step is a function, call it ??
    if (tc.jQ.isFunction(this.current_step)) {
        this.current_step(this);
        return;
    }

    // Handle our transition process, either a transiton callback,
    // merlin magic, or show/hide
    if (tc.jQ.isFunction(this.current_step.transition)) {
        this.current_step.transition(this);
    } else if (this.magic) {
        this.magic.show_step(this.current_step);
    } else if (this.dom && !this.magic) {
        this.dom.find('.step').hide();
        this.dom.find(this.current_step.selector).show();
    }

    // Handle the inputs and go through them.
    if (this.current_step.inputs && !this.current_step.has_been_initialized) {
        for (i in this.current_step.inputs) {
            // Use input DOM if step DOM is not available
            if (!this.current_step.inputs[i].dom && this.current_step.inputs[i].selector) {
                this.current_step.inputs[i].dom = this.current_step.dom.find(this.current_step.inputs[i].selector);
                if (!this.current_step.inputs[i].dom.length) {
                    tc.util.dump(this.current_step.inputs[i].selector);
                }
            }
            
            // If the value attribute is populated, then save it on the input object in case its needed
            if (this.current_step.inputs[i].dom.val()) {
                this.current_step.inputs[i].default_val = this.current_step.inputs[i].dom.val();
            }
            
            // Create a temp event data object
            temp_e_data = tc.jQ.extend({}, this.event_data, {
                input: this.current_step.inputs[i]
            });
            
            // Handle text input counters.
            if (this.current_step.inputs[i].counter && !this.current_step.inputs[i].counter.dom) {
                this.current_step.inputs[i].counter.dom = this.current_step.dom.find(this.current_step.inputs[i].counter.selector)
                this.current_step.inputs[i].counter.dom.text('0/' + this.current_step.inputs[i].counter.limit);
            }
            
            // Bind input events with handlers.  Handle hint text.
            this.current_step.inputs[i].dom
                .bind('focus', temp_e_data, this.handlers.focus)
                .bind('keyup change', temp_e_data, this.handlers.keypress)
                .bind('blur', temp_e_data, this.handlers.blur).data({
                    merlin: this,
                    input: this.current_step.inputs[i]
                }).each(function (i, j) {
                    var $j = tc.jQ(j);
                    
                    if ($j.data().input.hint || ($j.data().input.hint === "")) {
                        j.value = $j.data().input.hint;
                    }
                });
                
            // Add any custom event handlers.
            if (this.current_step.inputs[i].handlers) {
                for (j in this.current_step.inputs[i].handlers) {
                    this.current_step.inputs[i].dom.bind(j, this.event_data, this.current_step.inputs[i].handlers[j]);
                }
            }
            
            // Not used.
            if (this.current_step.inputs[i].focus_first) {
                //this.current_step.inputs[i].dom.focus();
            }
        }
    }

    // Handle hash changes.  Format of <merlin name>,<step name> or 
    // just <step name>.
    if (this.options.use_hashchange && !this.current_step.supress_hash) {
        if (this.options.name) {
            window.location.hash = this.options.name + ',' + step;
        } else {
            window.location.hash = step;
        }
    }

    // Call init() function.
    if (tc.jQ.isFunction(this.current_step.init)) {
        this.current_step.init(this, this.current_step.dom);
    }
    
    // Validate
    this.validate(false);
    
    // Mark as initialized.
    this.current_step.has_been_initialized = true;
};

/**
 * Function: tc.merlin.prototype.set_address
 * Set hash address.
 *
 * Parameters:
 * hash - {String} Hash string.
 */
tc.merlin.prototype.set_address = function(hash) {
    var force;
    var hash_buffer = hash.split(",");

    // If there is a merlin name, check that current
    // merlin name is the same, and then force the step,
    // otherwise don't force.
    if (this.options.name) {
        if (hash_buffer[0] !== this.options.name) {
            this.current_hash = null;
            return;
        }
        hash = hash_buffer[1];
        force = true;
    } else if (this.current_hash !== hash) {
        force = false;
    }
    
    // Set hash and show step.
    this.current_hash = hash;
    this.show_step(this.current_hash, force);
};

/**
 * Function: tc.merlin.prototype.validate
 * Validate input values.
 *
 * Parameters:
 * on_submit - {Boolean} Whether validation is happening on submit.
 */
tc.merlin.prototype.validate = function(on_submit) {
    var i;
    var valid = true;
    var temp_valid;
    this.current_step.errors = [];
    
    // If no inputs, then there is no need to validate.
    if (!this.current_step.inputs) {
        return true;
    }
    
    // Go through inputs.
    for (i in this.current_step.inputs) {
    
        // If no validators, then its valid.
        if (!this.current_step.inputs[i].validators) {
            continue;
        }
        
        // For submits, add class and handle hints.
        if (on_submit) {
            this.current_step.inputs[i].dom.addClass('has-been-focused has-attempted-submit');
            if (this.current_step.inputs[i].hint && (this.current_step.inputs[i].dom.val() == this.current_step.inputs[i].hint)) {
                this.current_step.inputs[i].dom.val('');
            }
        }
        
        // If validators is a function, call that, otherwise use tc.validate()
        if (tc.jQ.isFunction(this.current_step.inputs[i].validators)) {
            temp_valid = this.current_step.inputs[i].validators(this, this.current_step.inputs[i].dom, this.current_step, on_submit);
        } else {
            temp_valid = tc.validate(this.current_step.inputs[i].dom, this.current_step.inputs[i].validators);
        }

        // Handle individual input valid or not
        if (!temp_valid.valid) {
            valid = false;
            if (this.current_step.inputs[i].counter && this.current_step.inputs[i].dom.hasClass('has-been-focused')) {
                this.current_step.inputs[i].counter.dom.addClass('invalid').removeClass('valid');
            }
        } else {
            if (this.current_step.inputs[i].counter && this.current_step.inputs[i].counter.dom.hasClass('invalid')) {
                this.current_step.inputs[i].counter.dom.addClass('valid').removeClass('invalid');
            }
        }
    }
    
    // Handle overall validatity and go to apprpriate step.
    if (valid) {
        if (this.dom) {
            this.dom.trigger('merlin-step-valid', {
                step: this.current_step
            });
        }
        this.current_step.dom.removeClass('invalid').addClass('valid');
        return true;
    } else {
        if (this.dom) {
            this.dom.trigger('merlin-step-invalid', {
                step: this.current_step
            });
        }
        this.current_step.dom.removeClass('valid').addClass('invalid');
        return false;
    }
};

/**
 * Function: tc.merlin.handlers
 * Event handlers for Merlin objects.  Holds multiple event handlers.
 */
tc.merlin.prototype.handlers = {};

/**
 * Function: tc.merlin.prototype.handlers.hashchange
 * Hash change event.  Gets had value and puts it into the event object.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.hashchange = function(e, d) {
    e.data.me.set_address(window.location.hash.substring(1, window.location.hash.length));
};

/**
 * Function: tc.merlin.prototype.handlers.indicator_click
 * Indicator click event handling.  Prevent defaults for links that go to #.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.indicator_click = function(e, d) {
    if (tc.jQ(e.target).parent().attr('href') == '#') {
        e.preventDefault();
    }
};

/**
 * Function: tc.merlin.prototype.handlers.a_click
 * Handle click.  This does not currently do anything.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.a_click = function(e, d) {
    // tc.util.log('tc.merlin.handlers.a_click');
};

/**
 * Function: tc.merlin.prototype.handlers.prev_step
 * Previous step for merlin wizard event handling.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.prev_step = function(e, d) {
    e.preventDefault();
    if (e.data.me.current_step && e.data.me.current_step.prev_step) {
        if (e.data.me.options.use_hashchange) {
            window.location.hash = e.data.me.current_step.prev_step;
        } else {
            e.data.me.show_step(e.data.me.current_step.prev_step);
        }
    }
};

/**
 * Function: tc.merlin.prototype.handlers.next_step
 * Next step for merlin wizard event handling.  Spark validation.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.next_step = function (e, d) {
    var valid;
    e.preventDefault();
    valid = e.data.me.validate(true);
    
    if (!valid) {
        if (e.data.me.options.error_indicator) {
            e.data.me.options.error_indicator.html('<span>Oops! Please fill in the fields marked in red.</span>').show();
        }
        return;
    } else {
        if (e.data.me.options.error_indicator) {
            e.data.me.options.error_indicator.hide();
        }
    }
    if (e.target.className.indexOf('disabled') > 0) {
        return;
    }
    if (e.data.me.current_step && e.data.me.current_step.next_step) {
        e.data.me.show_step(e.data.me.current_step.next_step);
    }
};

/**
 * Function: tc.merlin.prototype.handlers.focus
 * Focus event.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.focus = function (e, d) {
    var $t;
    if (e.target.className.indexOf('has-been-focused') == -1) {
        $t = tc.jQ(e.target);
        $t.addClass('has-been-focused').removeClass('valid invalid');
        if (e.target.nodeName == "TEXTAREA" || (e.target.nodeName == "INPUT" && ($t.attr("type") == "text"))) {
            if ($t.data().input.hint || $t.data().input.hint === "") {
                $t.val("");
            }
        }
    }
};

/**
 * Function: tc.merlin.prototype.handlers.keypress
 * Key press event.  Handles counters.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.keypress = function(e, d) {
    e.data.me.validate(false);
    if (e.which == 13 && e.target.nodeName != 'TEXTAREA') {
        if (e.data.me.options.next_button && e.data.me.options.next_button.hasClass('enabled')) {
            e.data.me.options.next_button.click();
        }
    }
    if (e.data.input.counter && e.data.input.counter.dom) {
        e.data.input.counter.dom.text(e.data.input.dom.val().length + '/' + e.data.input.counter.limit);
    }
};

/**
 * Function: tc.merlin.prototype.handlers.keypress
 * Blur event.  Handles classes and hints.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.blur = function (e, d) {
    var $t;
    $t = tc.jQ(e.target);
    if (!e.target.value.length) {
        tc.jQ(e.target).removeClass('has-been-focused');
        if ($t.data().input.hint || ($t.data().input.hint === "")) {
            $t.val($t.data().input.hint);
        }
    }
};

/**
 * Function: tc.merlin.prototype.handlers.valid
 * Valididate event.  Handles enabling next button.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.valid = function (e, d) {
    if (e.data.me.options.next_button) {
        e.data.me.options.next_button.removeClass('disabled').addClass('enabled');
    }
    if (e.data.me.options.error_indicator) {
        e.data.me.options.error_indicator.hide();
    }
};

/**
 * Function: tc.merlin.prototype.handlers.invalid
 * Invalididate event.  Handles disabling next button.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.invalid = function (e, d) {
    if (e.data.me.options.next_button) {
        e.data.me.options.next_button.removeClass('enabled').addClass('disabled');
    }
};

/********************   End ./static/js/tc.gam.merlin.js   ********************/


/******************** Begin ./static/js/tc.gam.topbar.js   ********************/
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
            cache:true,
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
                tc.jQ(this).children(".dropdown").fadeOut(o.fadeSpeed);
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

/********************   End ./static/js/tc.gam.topbar.js   ********************/


/******************** Begin ./static/js/tc.gam.modal.js    ********************/
/**
 * File: Modal
 * This file defines the modal widget.
 *
 * Filename:
 * tc.gam.modal.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 */

 /**
  * Class: tc.modal
  */
tc.modal = makeClass();

/**
 * Variable: tc.modal.prototype.modal
 * Internal reference to the modal object.
 */
tc.modal.prototype.modal = null;

/**
 * Function: tc.modal.prototype.init
 * Initialize the modal at creation time. See
 * makeClass() for more details.
 *
 * Parameters:
 * app - {Object} Reference to the application (app_page)
 * options - {Object} Setup options object literal
 */
tc.modal.prototype.init = function(app, options){
    tc.util.log('tc.modal.init');
    
    //Extend the options
    this.options = tc.jQ.extend({
        element: null
    }, options);
    
    //Init the overlay with set options
    this.options.element.overlay({
        top: '15%',
        left: 'center',
        fixed: false,
        speed: 75,
        mask: {
            color: '#55504b',
            opacity: 0.5,
            zIndex: 19998
        }
    });
    
    //Set the internal reference
    this.modal = this.options.element.data('overlay');
};


/**
 * Function: tc.modal.prototype.show
 * Shows the modal dialog according to the given parameters.
 *
 * Parameters:
 * opts - {Object} Options for how to handle the show event. Includes:
 *        * source_element (required) - a jQuery object containing a template of
 *            the content to be shown inside the modal. This is expected to have
 *            a class of template-content
 *        * submit - a function that will be executed if someone clicks an element
 *            with a class of "submit".
 *        * preventClose - prevent the modal from closing (?)
 *        * init - a hook to do custom initialization
 * event_target - {Object} An object passed into the init function (?)
 */
tc.modal.prototype.show = function(opts, event_target){
    tc.util.log('tc.modal.show');

    var content = '';
    
    function load(me){
        me.modal.load();
    }
    
    if(opts.source_element){
        content = opts.source_element.clone().removeClass('template-content');
    }
    
    this.options.element.children().remove();
    content.show();
    
    this.options.element.append(content);

    //Bind events
    tc.util.dump(this.options.element.find('.close'));
    
    //Hide the modal when someone clicks elements with "close" or "cancel" classes
    this.options.element.find('.close, .cancel').bind('click',{me:this},function(e){
        e.preventDefault();
        e.data.me.hide();
    });
    
    //Call the opts.submit function if it exists when someone clicks an element with a "submit" class
    this.options.element.find('.submit').bind('click',{me:this,opts:opts},function(e){
        e.preventDefault();
        e.data.me.hide();
        if(tc.jQ.isFunction(e.data.opts.submit)){
            e.data.opts.submit();
        }
    });
    
    //Prevent the modal from closing if explicitly specfied
    this.options.element.bind('onBeforeClose',{me:this, opts:opts},function(e){
        if(e.data.opts.preventClose){
            return false;
        }
        return true;
    });
    
    //Clean up on close
    this.options.element.bind('onClose',{me:this},function(e){
        var me;
        me = e.data.me;
        if (tc.jQ.isFunction(me.cleanup)) {
            me.cleanup.apply(me);
            me.cleanup = null;
        }
        me.options.element.children().remove();
    });
    
    //call opts.init if provided, otherwise call load()
    if(tc.jQ.isFunction(opts.init)){
        if (event_target) {
            opts.init(this, event_target, load);
        } else {
            opts.init(this, load);
        }
    } else {
        load(this);
    }
};

/**
 * Function: tc.modal.prototype.hide
 * Hide the modal.
 */
tc.modal.prototype.hide = function(){
    tc.util.log('tc.modal.hide');
    this.modal.close();
};
/********************   End ./static/js/tc.gam.modal.js    ********************/


/******************** Begin ./static/js/tc.gam.carousel.js ********************/
/**
 * File: Carousel
 * This file defines the carousel widget.
 *
 * Filename:
 * tc.gam.carousel.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 * - jqtools.scrollable.js
 */

/**
 * Class: tc.carousel
 */
tc.carousel = makeClass();

/**
 * Variable: tc.carousel.prototype.carousel
 * Internal reference to the carousel object.
 */
tc.carousel.prototype.carousel = null;

/**
 * Function: tc.carousel.prototype.init
 * Initialize the carousel at creation time. See
 * makeClass() for more details.
 *
 * Parameters:
 * options - {Object} Setup options object literal
 */
tc.carousel.prototype.init = function(options) {
    tc.util.log('tc.carousel.init');
    
    //Extend the options
    this.options = tc.jQ.extend({
        element: null,
        next_button:null,
        prev_button:null,
        scrollable: {
            items: '.items',
            speed: 300,
            circular: true
        },
        scrollPaneSelector: '.scrollable:first',
        pagination: false // { current: jQuery obj, total: jQuery obj }
    }, options);
    
    this.rendered = false;
    
    if (this.has_items() && this.options.element.is(':visible')) {
        this.render();
    } else {
        tc.util.log('postponing carousel rendering', 'warn');
    }
};

/**
 * Function: tc.carousel.prototype.destroy
 * Destroy the widget and unbind events.
 */
tc.carousel.prototype.destroy = function() {
    this.options.element.find(this.options.scrollPaneSelector).removeData('scrollable');
    if (this.next_btn) {
        this.next_btn.unbind('click');
    }
    if (this.prev_btn) {
        this.prev_btn.unbind('click');
    }   
};

/**
 * Function: tc.carousel.prototype.render
 * Render the widget.
 *
 * Parameters:
 * width - {Number} 
 * height - {Number} 
 */
tc.carousel.prototype.render = function(width, height) {
    var me, scrollpane, w, h;
    tc.util.log('tc.carousel.render');
    if (this.rendered === true) { 
        tc.util.log('carousel already rendered!!!', 'warn');
        return;
    }
    
    me = this;
    w = width || this.options.element.width();
    h = height || 0;
    
    //Set the width on the element
    this.options.element.width(w);
    
    //Set the scrollpane
    scrollpane = this.options.element.find(this.options.scrollPaneSelector);
    
    scrollpane.children(this.options.scrollable.items).children('li').each(function() {
        var item, item_height;
        item = tc.jQ(this);
        item.width(w);
        item_height = item.outerHeight();
        if (item_height > h) {
            h = item_height;
        }
    });
    
    //Set the scrollpane height
    scrollpane.height(h);
    this.carousel = scrollpane.scrollable(this.options.scrollable).data('scrollable');
    
    //
    this.carousel.onSeek(function(e, i) {
        me.update_pagination();
    });
    
    //
    this.carousel.onAddItem(function(e, i) {
        me.update_navigation();
        me.update_pagination();
    });
    
    //Handle the next button
    if(!this.next_btn){
        if(this.options.next_button){
            this.next_btn = this.options.next_button;
            this.next_btn.bind('click', {carousel:this.carousel}, function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.data.carousel.next();
            });
        } else {
            this.next_btn = this.options.element.find('.next');
            this.next_btn.bind('click', function(e) {
                e.preventDefault();
            });
        }
    }
    
    //Handle the previous button
    if(!this.prev_btn){
        if(this.options.prev_button){
            this.prev_btn = this.options.prev_button;
            this.prev_btn.bind('click', {carousel:this.carousel}, function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.data.carousel.prev();
            });
        } else {
            this.prev_btn = this.options.element.find('.prev');
            this.prev_btn.bind('click', function(e) {
                e.preventDefault();
            });
        }
    }
    
    this.rendered = true;
    this.update_navigation();
    this.update_pagination();
};

/**
 * Function: tc.carousel.prototype.update_navigation
 * If the carousel has only one item, hide the next/prev buttons
 */
tc.carousel.prototype.update_navigation = function() {
    if (!this.rendered) { return; }
    tc.util.log('tc.carousel.update_navigation');
    if (this.carousel.getSize() < 2) {
        if (this.next_btn) { this.next_btn.hide(); }
        if (this.prev_btn) { this.prev_btn.hide(); }
    } else {
        if (this.next_btn) { this.next_btn.show(); }
        if (this.prev_btn) { this.prev_btn.show(); }
    }
    return this;
};

/**
 * Function: tc.carousel.prototype.update_pagination
 * Update the current page and the total pages.
 */
tc.carousel.prototype.update_pagination = function() {
    if (!this.options.pagination || !this.rendered) { return; }
    tc.util.log('tc.carousel.update_pagination');
    if (this.options.pagination) {
        this.options.pagination.current.text( this.carousel.getIndex() + 1 );
        this.options.pagination.total.text( this.carousel.getSize() );
    }
    return this;
};

/**
 * Function: tc.carousel.prototype.has_items
 * Returns whether or not the carousel has any items.
 */
tc.carousel.prototype.has_items = function() {
    return ( this.options.element.find(this.options.scrollPaneSelector).
             children(this.options.scrollable.items).
             children('li').length > 0 );
};

/**
 * Function: tc.carousel.prototype.is_rendered
 * Returns whether or not the carousel is rendered.
 */
tc.carousel.prototype.is_rendered = function() {
    return this.rendered;
};

/**
 * Function: tc.carousel.prototype.get_element
 * Returns the jQuery object of the element.
 */
tc.carousel.prototype.get_element = function(){
    return this.options.element;
};

/********************   End ./static/js/tc.gam.carousel.js ********************/


/******************** Begin ./static/js/tc.gam.tooltip.js  ********************/
if (!tc) { var tc = {}; }

tc.resource_tooltip = makeClass();

tc.resource_tooltip.prototype.tooltip = null;

tc.resource_tooltip.prototype.init = function(options) {
	var me;
	tc.util.log("tc.resource_tooltip.init");
	me = this;
	this.options = tc.jQ.extend({
		triggers: tc.jQ('.tooltip_trigger'),
		trigger_class:null,
		tooltip_element:tc.jQ('#organization-tooltip'),
		markup_source_element: null,
		get_url: null
	}, options);
	this.window = tc.jQ(window);
	this.tooltip = this.options.tooltip_element;
	this.triggers = this.options.triggers;
	this.triggers.bind('mouseover',{me:this},this.handlers.trigger_mouseover);
	this.triggers.bind('mouseout',{me:this},this.handlers.trigger_mouseout);
	this.tooltip.bind('mouseover',{me:this},this.handlers.tooltip_mouseover);
	this.tooltip.bind('mouseout',{me:this},this.handlers.tooltip_mouseout);
	this.has_been_shown = false;
	this.current_trigger = null;
	this.current_trigger_id = null;
	this.cached_data = {};
};

tc.resource_tooltip.prototype.add_trigger = function(trigger){
	tc.util.log("tc.resource_tooltip.add_trigger");
	trigger.bind('mouseover', {me:this}, this.handlers.trigger_mouseover);
	trigger.bind('mouseout', {me:this}, this.handlers.trigger_mouseout);
	tc.util.dump(trigger);
	if(!this.triggers.length){
		this.triggers = trigger;
	} else {
		this.triggers.add(trigger);
	}
};

tc.resource_tooltip.prototype.clear_triggers = function(trigger){
	tc.util.log("tc.resource_tooltip.clear_triggers");
	this.triggers.each(function(i,j){
		tc.jQ(j).unbind('mouseover').unbind('mouseout');
	});
};

tc.resource_tooltip.prototype.handlers = {
	trigger_mouseover:function(e){
		//tc.util.log("tc.resource_tooltip.trigger_mouseover");
		var t;
		t = e.target;
		while (t.className.indexOf(e.data.me.options.trigger_class) == -1 && t.nodeName != 'BODY'){
			t = t.parentNode;
		}
		e.data.me.current_trigger = tc.jQ(t);
		e.data.me.tooltip.stop();
		e.data.me.show();
	},
	trigger_mouseout:function(e){
		//tc.util.log("tc.resource_tooltip.trigger_mouseout");
		var t, rt;
		t = e.target;
		rt = (e.relatedTarget) ? e.relatedTarget : e.toElement;
		if(rt){
			while(rt != t && rt.nodeName != 'BODY'){
				rt = rt.parentNode;
				if(!rt || rt == t){
					return;
				}
			}
		}
		e.data.me.tooltip.stop();
		e.data.me.hide();
	},
	tooltip_mouseover:function(e){
		//tc.util.log("tc.resource_tooltip.tooltip_mouseover");
		if(e.data.me.current_trigger){
			e.data.me.tooltip.stop();
			e.data.me.show();
		}
	},
	tooltip_mouseout:function(e){
		//tc.util.log("tc.resource_tooltip.tooltip_mouseout");
		var t, rt;
		t = e.target;
		rt = (e.relatedTarget) ? e.relatedTarget : e.toElement;
		if(rt){
			while(rt != t && rt.nodeName != 'BODY'){
				rt = rt.parentNode;
				if(!rt || rt == t){
					return;
				}
			}
		}
		e.data.me.tooltip.stop();
		e.data.me.hide();
	}
};

tc.resource_tooltip.prototype.generate_markup = function(data){
	tc.util.log("tc.resource_tooltip.generate_markup");
	var markup;
	markup = this.options.markup_source_element.clone().css('display','block').removeClass('template-content');
	markup.prepend("<div class='tooltip-tail-top'></div>");
	markup.append("<div class='tooltip-tail-bottom'></div>");
	markup.find('h2').text(data.title);
	
	if(data.is_official && data.is_official === 1){
		markup.find('.tooltip-hd').after('<div class="tooltip-md"><span>Official Resource</span></div>');
	}
	if (data.image_id > 1) {
		markup.find('img').attr('src',media_root + 'images/'+(data.image_id % 10)+'/'+data.image_id+'.png');
	} else {
		markup.find('img').attr('src','/static/images/thumb_genAvatar100.png');
	}
	markup.find('.main p').text(data.description);
	markup.find('dd a').attr('target','_blank').attr('href',data.url).text(tc.truncate(data.url,28,'...'));
	return tc.jQ('<div>').append(markup).html();
};

tc.resource_tooltip.prototype.show = function(){
	//tc.util.log("tc.resource_tooltip.show");
	var target_pos, me, load_content;
	target_pos = function(self){
		if((self.current_trigger.offset().top - self.window.scrollTop()) < self.tooltip.height()){
			return {
				flip:true,
				top:self.current_trigger.offset().top + self.current_trigger.height(),
				left:self.current_trigger.offset().left + (self.current_trigger.width()/2) - (self.tooltip.width()/2)
			};
		} else {
			return {
				flip:false,
				top:self.current_trigger.offset().top - self.tooltip.height(),
				left:self.current_trigger.offset().left + (self.current_trigger.width()/2) - (self.tooltip.width()/2)
			};
		};
	};
	me = this;
	load_content = false;
	
	if(this.current_trigger.attr('rel').split(',')[1] != this.current_trigger_id){
		this.current_trigger_id = this.current_trigger.attr('rel').split(',')[1];
		load_content = true;
	}
	
	if(this.cached_data[this.current_trigger_id]){
		if(load_content){
			this.tooltip.html((this.cached_data[this.current_trigger_id]));
		}
		this.move_to_target(target_pos(this), this.has_been_shown ? true : false);
	} else {
		if(load_content){
			this.tooltip.html('<div class="tooltip-bd spinner"><img class="loading" src="/static/images/loader32x32.gif" /></div>');
		}
		this.move_to_target(target_pos(this), this.has_been_shown ? true : false);
		
		if(load_content){
			tc.jQ.ajax({
				url: this.options.get_url,
				data: {
					project_resource_id:this.current_trigger_id
				},
				async:false,
				context: this,
				dataType:'json',
				success:function(data,ts,xhr){
					this.cached_data[this.current_trigger_id] = this.generate_markup(data);
				}
			});
		
			this.tooltip.html(this.cached_data[this.current_trigger_id]);
			this.move_to_target(target_pos(this), this.has_been_shown ? true : false);
		}
	}
};

tc.resource_tooltip.prototype.move_to_target = function(target_pos,animate){
	if(target_pos.flip){
		this.tooltip.addClass('flipped');
	} else {
		this.tooltip.removeClass('flipped');
	}
	if(animate){
		this.tooltip.stop().show().animate({
			'opacity':1.0,
			'top':target_pos.top,
			'left':target_pos.left
		},500,'easeOutCubic',function(){
		
		});
	} else {
		this.tooltip.stop().css({
			'opacity':0.0,
			'top':target_pos.top,
			'left':target_pos.left
		}).show().animate({
			'opacity':1.0
		},500,'easeOutCubic',function(){
		
		});
	}
	this.has_been_shown = true;
};

tc.resource_tooltip.prototype.hide = function(){
	//tc.util.log("tc.resource_tooltip.hide");
	var me = this;
	this.tooltip.animate({
		'opacity':0.0
	},200,'easeOutCirc',function(){
		tc.jQ(this).hide();
		me.current_trigger = null;
	});
};

/********************   End ./static/js/tc.gam.tooltip.js  ********************/


/******************** Begin ./static/js/tc.gam.locationDropdown.js ********************/
if(!tc){ var tc = {}; }

tc.locationDropdown = makeClass();

tc.locationDropdown.validator = function(merlin,elements){
	tc.util.log('tc.locationDropdown.validator');
	elements.filter('.location-hood-enter').siblings('.error').hide();
	if(elements.length == 1){
		if(elements.filter('.location-hood-enter').attr('location_id')){
			return {
				valid:true,
				errors:[]
			};
		}
	} else {
		if(elements.filter('.location-city').filter(':checked').length || elements.filter('.location-city')[0].checked){
			return {
				valid:true,
				errors:[]
			};
		}
		if(elements.filter('.location-hood').filter(':checked').length || elements.filter('.location-hood')[0].checked){
			if(elements.filter('.location-hood-enter').attr('location_id')){
				return {
					valid:true,
					errors:[]
				};
			}
		}
	}
	
	elements.filter('.location-hood-enter').addClass('not-valid').removeClass('valid');
	elements.filter('.location-hood-enter').siblings('.error').show();
	return {
		valid:false,
		errors:['Please enter a neighborhood.']
	};
};

tc.locationDropdown.prototype.init = function(options){
	//tc.util.log('tc.locationDropdown.init');
	var i, found;
	this.options = tc.jQ.extend({
		radios:null,
		input:null,
		list:null,
		warning:null,
		step:null,
		locations:tc.locations,
		scrollMenuThreshold:10 //apply a scrollbar after this many items
		                       //set to false to prevent srollbar
	},options);
	this.bindEvents();
	if(this.options.warning){
		this.options.warning.hide();
	}
	this.options.list.hide().children('ul').children().remove();
	if(this.options.input.attr('location_id')){
		for(i = 0; i < this.options.locations.length; i++){
			if(this.options.locations[i].location_id == this.options.input.attr('location_id')){
				this.options.input.val(decodeURI(this.options.locations[i].name));
				found = true;
				break;
			}
		}
		if(!found){
			this.options.input.removeAttr('location_id');
		}
	}
};

tc.locationDropdown.prototype.getLocation = function(){
	//tc.util.log('tc.locationDropdown.prototype.getLocation','warn');
	if(this.options.input.attr('location_id')){
		return this.options.input.attr('location_id');
	}
	return false;
};

tc.locationDropdown.prototype.bindEvents = function(){
	//tc.util.log('tc.locationDropdown.bindEvents');
	this.options.input.bind('focus blur keydown keyup keypress',{dropdown:this},function(e){
		switch(e.type){
			case 'focus':e.data.dropdown.inputFocusHandler(e);break;
			case 'keyup':e.data.dropdown.inputKeyUpHandler(e);break;
			case 'keydown':e.data.dropdown.inputKeyDownHandler(e);break;
			case 'keypress':e.data.dropdown.inputKeyPressHandler(e);break;
			case 'blur':e.data.dropdown.inputBlurHandler(e);break;
		}
	});
	this.options.list.bind('focus click blur',{dropdown:this},function(e){
		switch(e.type){
			case 'focus':e.data.dropdown.listFocusHandler(e);break;
			case 'click':e.data.dropdown.listClickHandler(e);break;
			case 'blur':e.data.dropdown.listBlurHandler(e);break;
		}
	});
	if(this.options.radios){
		this.options.radios.bind('change',{dropdown:this},function(e){
			e.data.dropdown.radioHandler(e);
		});
	}
};

tc.locationDropdown.prototype.open = function() {
	tc.jQ("body").bind("click.location_dropdown", {dropdown:this}, this.anywhereClickHandler);
	this.handleListScrollbar();
	if(this.options.list.find('li').length){
		this.options.list.show();
	}
	
};

tc.locationDropdown.prototype.close = function() {
	tc.jQ("body").unbind("click.location_dropdown", this.anywhereClickHandler);
	this.options.list.hide();
};

tc.locationDropdown.prototype.anywhereClickHandler = function(e) {
	var dropdown;
	dropdown = e.data.dropdown;
		
	if ( !tc.jQ.contains(dropdown.options.list[0], e.target) &&
	     e.target !== dropdown.options.input[0] ) {
			
		dropdown.close();
	}
};

tc.locationDropdown.prototype.listFocusHandler = function(e){
	tc.util.log('tc.locationDropdown.listFocusHandler');
};

tc.locationDropdown.prototype.listClickHandler = function(e){
	//tc.util.log('tc.locationDropdown.listClickHandler');
	var t, location_tuple;
	if(e.target.nodeName == 'SPAN'){
		t = e.target.parentNode;
	} else if(e.target.nodeName == 'A'){
		t = e.target;
	}
	if(!t){
		return;
	}
	e.preventDefault();
	if(e.data.dropdown.options.warning){
		e.data.dropdown.options.warning.hide();
	}
	
	location_tuple = t.hash.substring(1,t.hash.length).split(',');
	
	e.data.dropdown.options.input.removeClass('not-valid').addClass('valid').attr('location_id',location_tuple[1]).val(decodeURI(location_tuple[0])).trigger('change');
	e.data.dropdown.close();
};

tc.locationDropdown.prototype.listBlurHandler = function(e){
	tc.util.log('tc.locationDropdown.listBlurHandler');
	
};

tc.locationDropdown.prototype.inputFocusHandler = function(e){	
	var dropdown;
	dropdown = e.data.dropdown;
	tc.util.log('tc.locationDropdown.inputFocusHandler');
	if(dropdown.options.radios && dropdown.options.radios.filter('.location-hood').length){
		dropdown.options.radios.filter('.location-hood').attr('checked',true);//[0].checked = true;
		tc.jQ('label[for="location-hood"]').trigger('fake-click',{preventChange:true});
	}
	dropdown.open();
	if(e.target.value.toLowerCase() == 'all neighborhoods'){
		e.target.value = '';
	}
};

tc.locationDropdown.prototype.inputBlurHandler = function(e){
	tc.util.log('tc.locationDropdown.inputBlurHandler');

};

tc.locationDropdown.prototype.inputKeyUpHandler = function(e){
	//tc.util.log('tc.locationDropdown.inputKeyUpHandler');
	if(e.which == 38 || e.which == 40 || e.which == 13){
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	this.options.input.removeClass('valid').addClass('not-valid').removeAttr('location_id');
	this.superFilterAndUpdateList(e.target.value);
};

tc.locationDropdown.prototype.inputKeyDownHandler = function(e){
	//tc.util.log('tc.locationDropdown.inputKeyDownHandler');
	switch(e.which){
		case 13:
			e.preventDefault();
			e.stopPropagation();
			this.modifySelection(0);
			break;
		case 38:
			e.preventDefault();
			this.modifySelection(-1);
			break;
		case 40:
			e.preventDefault();
			this.modifySelection(1);
			break;
	}
};

tc.locationDropdown.prototype.inputKeyPressHandler = function(e){
	//tc.util.log('tc.locationDropdown.inputKeyPressHandler');
	if(e.which == 13){
		e.preventDefault();
	}
};

tc.locationDropdown.prototype.modifySelection = function(direction){
	//tc.util.log('tc.locationDropdown.modifySelection');
	var currently_selected;
	currently_selected = this.options.list.find('.selected');
	if(!currently_selected.length){
		this.options.list.find('li:first').addClass('selected');
		return;
	}
	switch(direction){
		case -1:
			currently_selected.removeClass('selected').prev().addClass('selected');
			break;
		case 0:
			currently_selected.children('a').click();
			break;
		case 1:
			currently_selected.removeClass('selected').next().addClass('selected');
			break;
	}
};

tc.locationDropdown.prototype.radioHandler = function(e){
	//tc.util.log('tc.locationDropdown.radioHandler');
	var lastvalue;
	if(!e.target.checked){
		return;
	}
	switch(e.target.id){
		case 'location-city':
			//this.options.input.data('last-value',this.options.input.val()).val('').removeClass('not-valid').removeClass('valid');//.removeAttr('location_id');
			this.options.input.data('last-value',this.options.input.val()).val('').removeClass('not-valid').removeClass('valid').attr('location_id','-1');
			this.close();
			break;
		case 'location-hood':
			lastvalue = this.options.input.data('last-value');
			if(this.options.input.attr('location_id')){
				this.options.input.removeClass('not-valid').addClass('valid');
			} else {
				this.open();
			}
			if(lastvalue){
				this.options.input.val(decodeURI(lastvalue));
				this.superFilterAndUpdateList(lastvalue,true);
			}
			break;
	}
};

tc.locationDropdown.prototype.superFilterAndUpdateList = function(text){
	//tc.util.log('tc.locationDropdown.filterLocations');
	var i, filter, n_filtered, temp_start, temp_string, html;
	filter = new RegExp(text,"gi");
	n_filtered = 0;
	html = "";
	for(i = 0; i < this.options.locations.length; i++){
		temp_start = this.options.locations[i].name.search(filter);
		if(temp_start == -1){
			continue;
		}
		if(temp_start == 0){
			temp_string = '<li><a href="#'+this.options.locations[i].name+','+this.options.locations[i].location_id+'">'+
										'<span>' + 
										this.options.locations[i].name.substring(0,text.length) + '</span>' + 
										this.options.locations[i].name.substring(text.length,this.options.locations[i].name.length) +
									'</a></li>';
		} else {
			temp_string = '<li><a href="#'+this.options.locations[i].name+','+this.options.locations[i].location_id+'">'+
										(''+this.options.locations[i].name.substring(0,temp_start)) + '<span>' + 
										this.options.locations[i].name.substring(temp_start,temp_start+text.length) + '</span>' + 
										this.options.locations[i].name.substring(temp_start+text.length,this.options.locations[i].name.length) +
									'</a></li>';
		}
		
		html += temp_string;
		html = html;
		n_filtered++;
	}
	
	if(!n_filtered){
		if(this.options.warning){
			this.options.warning.show();
		}
		this.options.input.removeClass('valid').addClass('not-valid').removeAttr('location_id');
	} else {
		this.options.list.children('ul').html(html);
		if(n_filtered == 1){
			//this.options.input.removeClass('not-valid').addClass('valid').attr('valid-location','true');
			this.options.list.find('li:first').addClass('selected');
		}
		if(!this.options.input.attr('location_id')){
			this.open();
		} else {
			this.handleListScrollbar();
		}
	} 
};

tc.locationDropdown.prototype.handleListScrollbar = function() {
	var n;
	if (!this.options.scrollMenuThreshold) {
		return;
	}
	n = this.options.list.children('ul').children('li').length;
	this.options.list[n > this.options.scrollMenuThreshold ? "addClass" : "removeClass"]("has-scrollbar");
};

/********************   End ./static/js/tc.gam.locationDropdown.js ********************/


/******************** Begin ./static/js/tc.gam.inlineEditor.js ********************/
if (!tc) { var tc = {}; }

tc.inlineEditor = function(options) {
	this.init(options);
};
tc.inlineEditor.prototype = {
	init: function(options) {
		this.options = tc.jQ.extend({
			dom: null,
			service: null/*{
				url: null,
				param: null,
				post_data:  {}
			}*/,
			empty_text: "Click here to edit.",
			validators: null,
			charlimit: null
		}, options);

		if (typeof this.options.dom === "string") {
			this.options.dom = tc.jQ(this.options.dom);
		}
		this.dom = this.options.dom;

		this.controls = this.dom.find(".inline-edit-controls");
		this.controls.hide().empty().append(this._generateControls());

		this.controls.find(".save-btn").bind("click", {me: this}, function(e) {
			e.preventDefault();
			e.data.me.save();
		});

		this.controls.find(".cancel-btn").bind("click", {me: this}, function(e) {
			e.preventDefault();
			e.data.me.display();
		});

		this.content = this.dom.find(".editable-content");

		this.content.bind("click", {me: this}, function(e) {
			if (e.data.me.state === "display") {
				e.data.me.edit();
			}
		});
		
		if (this.options.charlimit) {
			if (!(tc.jQ.isArray(this.options.validators))) {
				this.options.validators = [];
			}
			this.options.validators.push("max-"+ this.options.charlimit);
		}
		

		this.data = tc.jQ.trim( this.content.text() );

		this.display();
	},
	edit: function() {
		var field, limit_indicator;
		tc.util.log("edit");
		if (this.state === "edit") { return; }
		
		this.content.html("<textarea class='data serif'>"+ (this.data || "") + "</textarea>");
		
		field = this.content.find(".data");
		field.bind("keypress", {me: this, field: field}, function(e) {
			e.data.me.validate(e.data.field);
		});
		
		if (this.options.charlimit) {
			limit_indicator = tc.jQ("<span class='charlimit'></span>");
			limit_indicator.text( (this.data ? this.data.length : "0")+ "/" + this.options.charlimit );
			this.content.append(limit_indicator);
			field.bind("keyup", {me: this, field: field, dom: limit_indicator, limit: this.options.charlimit }, function(e) {
				e.data.dom.text( e.data.field.val().length + "/" + e.data.limit );
			});
		}
		
		this.controls.show();
		this.dom.addClass("state-editing").removeClass("state-display");
		this.state = "edit";
	},
	display: function() {
		if (this.state === "display") { return; }
		
		this.content.empty();
		if (this.data) {
			this.dom.removeClass("state-empty");
			this._renderDisplayContent();
		} else {
			this.dom.addClass("state-empty");
			this.content.text(this.options.empty_text);
		}
		
		this.controls.hide();
		this.dom.removeClass("state-editing").addClass("state-display");
		this.state = "display";
	},
	validate: function(field) {
		if (!tc.jQ.isArray(this.options.validators)) { return true; }
		return tc.validate(field, this.options.validators).valid;
	},
	save: function(callback) {
		var post_data, field, val;
		
		if (this.state === "edit") {
			field = this.content.find(".data");
			if (tc.jQ.isFunction(this._getPostData)) {
				val = this._getPostData();
			} else {
				val = tc.jQ.trim( field.val() );
			}
			
			if (field.hasClass("not-valid")) {
				return false;
			}
			if (!this.validate(field)) {
				return false;
			}
			
			if (this.options.service.post_data) {
				post_data = tc.jQ.extend({}, this.options.service.post_data);
			} else {
				post_data = {};
			}
			post_data[this.options.service.param] = val;
			
			tc.jQ.ajax({
				type: "POST",
				dataType: "text",
				url: this.options.service.url,
				data: post_data,
				context: this,
				success: function(data, ts, xhr) {
					if (tc.jQ.isFunction(callback)) {
						callback.apply(this, [data, ts, xhr]);
						return;
					}
					if (data === "False") {
						//TODO handle error?
						this.display();
						return;
					}
					this.data = post_data[this.options.service.param];
					this.display();
				}
			});
			
		}
	},
	
	// for internal use:
	
	_generateControls: function() {
		return '<a href="#" class="ca-btn save-btn">Save</a><a href="#" class="cancel-btn">Cancel</a>';
	},
	_renderDisplayContent: function() {
		this.content.text(this.data);
	}
};

tc.inlineLocationEditor = function(options) {
	this.init(options);
	this.locationDropdown = null;
};
tc.inlineLocationEditor.prototype = tc.jQ.extend({}, tc.inlineEditor.prototype, {
	edit: function() {
		if (this.state === "edit") { return; }
		
		this.content.html("<input type='text' class='location-group location-hood-enter always-focused' value='"+ tc.jQ.trim( this.content.text() ) +"'/>\
				<div class='location-hood-list' style='display: none'><ul><li></li></ul></div>");
		
		this.locationDropdown = new tc.locationDropdown({
			input: this.content.find('input.location-hood-enter'),
			list: this.content.find('div.location-hood-list'),
			locations: this.options.locations
		});	
		
		this.controls.show();
		this.dom.addClass("state-editing").removeClass("state-display");
		this.state = "edit";
	},
	save: function() {
		tc.inlineEditor.prototype.save.call(this, function(data, ts, xhr) {
			if (data === "False") {
				this.display();
				return;
			}
			if (this._getPostData() === "-1") {
				this.data = "Citywide";
			} else {
				this.data = this.content.find("input.location-hood-enter").val();
			}
			this.display();
		});
	},
	_getPostData: function() {
		if (this.locationDropdown) {
			return this.locationDropdown.getLocation() || "-1";
		}
		return "-1";
	}
});




/********************   End ./static/js/tc.gam.inlineEditor.js ********************/


/******************** Begin ./static/js/tc.gam.project.js  ********************/
tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project = function(app, dom) {
    var widget_options = {
        app: app,                                   //for merlin
        project_data: app.app_page.data.project,    //project specific data
        user: app.app_page.user,                    //user data
        project_user: app.app_page.project_user,    //project user data
        media_root: app.app_page.media_root         //root directory for images and such
    };

    app.components.project_widgets = {
        'home': tc.gam.project_widgets.home(
            tc.jQ.extend({ name: 'home', dom: dom.find('.project-section.home') }, widget_options)
        ),
        'needs': tc.gam.project_widgets.needs(
            tc.jQ.extend({ name: 'needs', dom: dom.find('.project-section.needs') }, widget_options)
        ),
        'need-detail': tc.gam.project_widgets.needs(
            tc.jQ.extend({ name: 'need-detail', dom: dom.find('.project-section.need-detail') }, widget_options)
        ),
       'need-form': tc.gam.project_widgets.need_form(
            tc.jQ.extend({ name: 'need-form', dom: dom.find('.project-section.need-form') }, widget_options)
        ),
        'infopane': tc.gam.project_widgets.infopane(
            tc.jQ.extend({ name: 'infopane', dom: dom.find('.box.mission') }, widget_options)
        ),
        'resources': tc.gam.project_widgets.resources(
            tc.jQ.extend({ name: 'resources', dom: dom.find('.box.resources') }, widget_options)
        ),
        'related_resources': tc.gam.project_widgets.related_resources(
            tc.jQ.extend({ name: 'related_resources', dom: dom.find('.project-section.related-resources') }, widget_options)
        ),
        'add_link': tc.gam.project_widgets.add_link(
            tc.jQ.extend({ name: 'add_link', dom: dom.find('.project-section.add-link') }, widget_options)
        ),
        'conversation': tc.gam.project_widgets.conversation(
            tc.jQ.extend({ name: 'conversation', dom: dom.find('.project-section.conversation') }, widget_options)
        ),
        'members': tc.gam.project_widgets.members(
            tc.jQ.extend({ name: 'members', dom: dom.find('.project-section.members') }, widget_options)
        )
    };
    
    // Add fresh ideas component if available.
    if (tc.gam.project_widgets.fresh_ideas) {
        app.components.related_ideas = tc.gam.project_widgets.fresh_ideas(
            tc.jQ.extend({ name: 'fresh_ideas', dom: dom.find('.box.fresh-ideas') }, widget_options)
        );
    }
    
    tc.gam.project_widgets.project_tabs(
        tc.jQ.extend({ name: 'project_tabs', dom: dom.find('.project-tabs') }, widget_options)
    );

    // Create an object to handle widget visibility events
    tc.gam.widgetVisibilityHandler();
};

/********************   End ./static/js/tc.gam.project.js  ********************/


/******************** Begin ./static/js/tc.gam.invite.js   ********************/
if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }

tc.gam.ideas_invite = function(app, options) {
	
	var o = tc.jQ.extend({
		elements: null,
		ref_project_id: null
	}, options);

	// Invite
	o.elements.bind('click',{
		app:app,
		source_element:tc.jQ('.modal-content.invite-user'),
		init:function(modal,event_target,callback){
			var modal_merlin;
			modal_merlin = new tc.merlin(app,{
				use_hashchange: false,
				name:'ideas_invite',
				dom:modal.options.element.find('.invite-user'),
				next_button: tc.jQ('a.submit'),
				first_step: o.ref_project_id ? 'invite-message-info' : 'invite-message-project-info',
				data:{
					project_id: o.ref_project_id ? o.ref_project_id : null,
					idea_id: null,
					message: null
				},
				steps:{
					'invite-message-project-info':{
						selector:'.invite-message-project-info',
						next_step:'invite-message-info',
						inputs:{
							project_radios:{
								selector:'.project-radio'
							}
						},
						init: function(merlin, dom) {
							var name;
							
							if(dom.find('.project-radio').length == 1){
								dom.find('.project-radio').first().attr('checked',true);
								merlin.show_step("invite-message-info");
								return;
							}
							
							name = tc.jQ(event_target).attr("href").split(",")[2];
							if (name) {
								dom.find(".no-name").hide();
								dom.find(".name").text(name);
							} else {
								dom.find(".has-name").hide();
							}
							
							dom.find('input[type=checkbox],input[type=radio]').prettyCheckboxes();
							
						},
						finish: function(merlin, dom) {
							if(!merlin.current_step.inputs.project_radios.dom.filter(":checked").length){
								merlin.options.data.project_id = null;
								return false;
							}
							merlin.options.data = tc.jQ.extend(merlin.options.data, {
								project_id: merlin.current_step.inputs.project_radios.dom.filter(":checked").attr("rel").split(",")[1]
							});
							
							return true;
						}
					},
					'invite-message-info':{
						selector:'.invite-message-info',
						next_step:'invite-message-submit',
						inputs:{
							invite_message:{
								selector:'textarea.invite-message',
								validators:['max-200'],
								counter:{
									selector:'.charlimit.invite-message',
									limit:200
								}
							}
						},
						init:function(merlin,dom){
							var name;
							
							if (!merlin.options.data.project_id) {
								merlin.show_step("invite-message-project-info");
								return;
							}
							
							name = tc.jQ(event_target).attr("href").split(",")[2];
							if (name) {
								dom.find(".no-name").hide();
								dom.find(".name").text(name);
							} else {
								dom.find(".has-name").hide();
							}
							
						},
						finish: function(merlin, dom) {
							merlin.options.data = tc.jQ.extend(merlin.options.data, {
								idea_id: tc.jQ(event_target).attr("href").split(",")[1],
								message: merlin.current_step.inputs.invite_message.dom.val()
							});
						}
					},
					'invite-message-submit':{
						selector:'.invite-message-submit',
						init: function(merlin, dom) {
							tc.jQ.ajax({
								type:"POST",
								url:"/project/invite",
								data:merlin.options.data,
								context:merlin,
								dataType:"text",
								success: function(data, ts, xhr) {
									if (data == "False") {
										merlin.show_step("invite-message-error");
										return false;
									}
									tc.jQ(event_target).addClass("disabled").text("Invited").unbind("click").bind("click", function(e) {
										e.preventDefault();
									});
									tc.timer(1000, function() {
										modal.hide();
									});
								}
							});
						}
					},
					"invite-message-error": {
						selector:".invite-message-error",
						init: function(merlin, dom) {
							tc.timer(1000, function() {
								modal.hide();
							});
						}
					}
				}
			});
			
			modal.cleanup = function() {
				modal_merlin.deallocate_magic();
			};
			
			if(tc.jQ.isFunction(callback)){
				callback(modal);
			}
		}
	},function(e,d){
		e.preventDefault();
		e.data.app.components.modal.show(e.data, e.target);
	});
};
/********************   End ./static/js/tc.gam.invite.js   ********************/


/******************** Begin ./static/js/tc.gam.add_resource.js ********************/
if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }

tc.gam.add_resource = function(app, options) {
	
	var o = tc.jQ.extend({
		elements: null
	}, options);

	o.elements.bind('click',{
		app:app,
		source_element:tc.jQ('.modal-content.add-resource'),
		init:function(modal,event_target,callback){
			var modal_merlin;
			modal_merlin = new tc.merlin(app,{
				use_hashchange: false,
				name:'add-resource',
				dom:modal.options.element.find('.add-resource'),
				next_button: tc.jQ('a.submit'),
				first_step: 'add-resource-project-info',
				data:{
					project_id: null,
					project_resource_id: null
				},
				steps:{
					'add-resource-project-info':{
						selector:'.add-resource-project-info',
						next_step:'add-resource-submit',
						inputs:{
							project_radios:{
								selector:'.project-radio',
								vallidators:['required']
							}
						},
						init: function(merlin, dom) {
							var name;
						
							dom.find('input[type=checkbox],input[type=radio]').prettyCheckboxes();
						
							if(dom.find('.project-radio').length == 1){
								dom.find('.project-radio').first().attr('checked',true);
							}
					
						},
						finish: function(merlin, dom) {
							if(merlin.current_step.inputs.project_radios.dom.filter(":checked").length){
								merlin.options.data = tc.jQ.extend(merlin.options.data, {
									project_id: merlin.current_step.inputs.project_radios.dom.filter(":checked").attr("rel").split(",")[1],
									project_resource_id: event_target.hash.split(',')[1]
								});
							}
						}
					},
					'add-resource-submit':{
						selector:'.add-resource-submit',
						init: function(merlin, dom) {
						
						
							tc.jQ.ajax({
								type:"POST",
								url:"/project/resource/add",
								data:merlin.options.data,
								context:merlin,
								dataType:"text",
								success: function(data, ts, xhr) {
									//if (data == "False") {
									//	return false;
									//}
									//tc.jQ(event_target).addClass("disabled").text("Added");
									tc.jQ(event_target).parents('td').addClass('added');
									tc.timer(1000, function() {
										modal.hide();
									});
								}
							});
						}
					}
				}
			});
			if(tc.jQ.isFunction(callback)){
				callback(modal);
			}
		}
	},function(e,d){
		e.preventDefault();
		e.data.app.components.modal.show(e.data, e.target);
	});
};
/********************   End ./static/js/tc.gam.add_resource.js ********************/


/******************** Begin ./static/js/tc.gam.user_handler.js ********************/
/**
 * File: User Handler
 * User handling functionality.
 *
 * Filename:
 * tc.gam.user_handler.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 */

/**
 * Function: tc.user_handler
 * Returns function that takes in an App, determins if there is user 
 * (app.app_page.user) and runs either options handler appropriately,
 * returning boolean.
 *
 * Parameters:
 * options - {Object} An object that has a the following functions
 *     - user_handler: Handles when there is a user present.
 *     - no_user_handler: Handles when there is no user.
 *
 * Returns:
 * {Function} A function that takes in the global "app" parameter and
 * returns a boolean based on user handler function.
 */
tc.user_handler = function(options) {
    return function(app) {
        if (app.app_page.user) {
            if (typeof options.user_handler == 'function') {
                if (options.user_handler(app) === false) {
                    return false;
                }
            }
        } else {
            if (typeof options.no_user_handler == 'function') {
                if (options.no_user_handler(app) === false) {
                    return false;
                }
            }
        }
        return true;
    };
}
/********************   End ./static/js/tc.gam.user_handler.js ********************/


/******************** Begin ./static/js/tc.gam.app.js      ********************/
/**
 * File: App
 * This file defines the "app" of the tc framework.
 *
 * Filename:
 * tc.gam.app.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 */

/**
 * Class: tc.app
 * App is ??
 */
tc.app = makeClass();

/**
 * Variable: tc.app.prototype.app_page
 * App Page object.  ??
 */
tc.app.prototype.app_page = null;

/**
 * Variable: tc.app.prototype.components
 * Collection of components of the app.
 */
tc.app.prototype.components = {};

/**
 * Variable: tc.app.prototype.events
 * Collection of jQuery events.
 */
tc.app.prototype.events = tc.jQ({});

/**
 * Function: tc.app.prototype.init
 * Initialize the app.
 *
 * Parameters:
 * page - {Object} Page object used for ??
 */
tc.app.prototype.init = function(page) {
    var _me = this;
    var feature_status;
    this.app_page = page;
    
    // Turn off AJAX caching.
    tc.jQ.ajaxSetup({
        cache: false
    });

    // Handle feature functions.  These are general features for the application,
    // such as merlin wizard set of widgets.
    if (page.features) {
        for (i in page.features) {
            if (tc.jQ.isFunction(page.features[i])) {
                if (page.features[i](_me) === false) {
                    break;
                }
            }
        }
    }

    // Called from the main logout callback, or, if we were logged in to 
    // facebook, from the FB logout callback
    this.finish_logout = function(e) {
        window.location.hash = '';
        if (window.location.pathname === "/useraccount") {
            if (e.data.app.app_page.user) {
                window.location.assign("/useraccount/" + e.data.app.app_page.user.u_id);
                return;
            }
        }
        window.location.reload(true);
    };

    // Handle logout, specifically via hash change event.
    tc.jQ(window).bind('hashchange', {
            app: this
        },
        function(e) {
            if (window.location.hash.substring(1, window.location.hash.length) === 'logout') {
                // Post to logout, when done, handle Facebook logout.
                tc.jQ.ajax({
                    type: 'POST',
                    url: '/logout',
                    context: e.data.app,
                    dataType: 'text',
                    success: function(data, ts, xhr) {
                        var me = this;
                        if (FB._userStatus == 'unknown') {
                            me.finish_logout(e);
                        } else {
                            FB.getLoginStatus(function (response) {
                                if (response.session) {
                                    FB.logout(function (response) {
                                        me.finish_logout(e);
                                    });
                                } else {
                                    me.finish_logout(e);
                                }
                            });
                        }
                    }
                });
            }
        }
    );

};
/********************   End ./static/js/tc.gam.app.js      ********************/

