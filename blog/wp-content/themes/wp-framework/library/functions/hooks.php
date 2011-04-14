<?php
/**
 * Hooks - WP Framework's hook system
 *
 * @package WPFramework
 * @subpackage WP_Framework
 */

/**
 * framework_hook_before_html() short description.
 *
 * Long description.
 *
 * @since 0.3
 * @hook action framework_hook_before_html
 */
function framework_hook_before_html() {
	do_action( 'framework_hook_before_html' );
}

/**
 * framework_hook_after_html() short description.
 *
 * Long description.
 *
 * @since 0.3
 * @hook action framework_hook_after_html
 */
function framework_hook_after_html() {
	do_action( 'framework_hook_after_html' );
}

/**
 * framework_hook_comments() short description.
 *
 * Long description.
 *
 * @since 0.3
 * @hook action framework_hook_loop
 */
function framework_hook_comments( $callback = array('framework_comment_author', 'framework_comment_meta', 'framework_comment_moderation', 'framework_comment_text', 'framework_comment_reply' ) ) {
	do_action( 'framework_hook_comments_open' ); // Available action: framework_comment_open
	do_action( 'framework_hook_comments' );

	$callback = apply_filters( 'framework_comments_callback', $callback ); // Available filter: framework_comments_callback
	
	// If $callback is an array, loop through all callbacks and call those functions if they exist
	if ( is_array( $callback ) ) {
		foreach( $callback as $function ) {
			if ( function_exists( $function ) ) {
				call_user_func( $function );
			}
		}
	}
	
	// If $callback is a string, just call that function if it exist
	elseif ( is_string( $callback ) ) {
		if ( function_exists( $callback ) ) {
			call_user_func( $callback );
		}
	}
	do_action( 'framework_hook_comments_close' ); // Available action: framework_comment_close
}
?>