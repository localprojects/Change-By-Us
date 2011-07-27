/**
 * File: Base
 * Base file for the TC application.  This should be included
 * before any other TC file.
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