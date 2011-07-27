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