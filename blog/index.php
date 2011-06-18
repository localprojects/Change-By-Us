<?php
/* check for changeby.us cbu_key.  If it doesn't exist, redirect to beta splash. 
   This is obviously a temporary solution.
   You could set this w/ a constant in wp-config, but then you'd have to wait till much 
   later in the process to do it. 
 */
if (!isset($_COOKIE['cbu_key']) && $_GET['feed'] != 'cbujson') {
    header('Location: http://nyc.changeby.us/beta');
    exit;
}


/**
 * Front to the WordPress application. This file doesn't do anything, but loads
 * wp-blog-header.php which does and tells WordPress to load the theme.
 *
 * @package WordPress
 */

/**
 * Tells WordPress to load the WordPress theme and output it.
 *
 * @var bool
 */
define('WP_USE_THEMES', true);

/** Loads the WordPress Environment and Template */
require('./wp-blog-header.php');
?>