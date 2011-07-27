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

    // Handle feature functions.  Not sure what these are ??
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