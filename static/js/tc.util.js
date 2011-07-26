/**
 * File: Utilities
 * This file holds various utility functions for CBU.
 * 
 * Dependencies:
 * tc.gam.base.js
 */
var tc = tc || {};
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