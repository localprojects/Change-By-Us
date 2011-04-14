<?php
/**
 * Functions - Framework gatekeeper
 *
 * This file defines a few constants variables, loads up the core framework file, 
 * and finally initialises the main WP Framework Class.
 *
 * @package WPFramework
 * @subpackage Functions
 */

define( 'WP_FRAMEWORK', '0.2.4' ); // Defines current version for WP Framework
	
	/* Blast you red baron! Initialise WP Framework */
	require_once( TEMPLATEPATH . '/library/framework.php' );
	WPFramework::init();
?>