/**
 * @file
 * Base file for the TC GAM application.
 */

/**
 * Define globl objects that are used everywhere.
 */
var tc = tc || {};
var app_page = app_page || {};

/**
 * Localize jQuery into tc.  Not sure why this is needed?
 */
if (typeof jQuery != "undefined") {
    tc.jQ = jQuery;
}