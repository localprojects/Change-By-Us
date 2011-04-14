<?php
/**
 * Widgets - Improving the functionality for Widgets
 *
 * @package WPFramework
 * @subpackage Widgets
 */

/**
 * register_widgets()
 *
 * @link http://codex.wordpress.org/WordPress_Widgets_Api/register_sidebar
 *
 * @since 0.3
 */
function register_widgets() {
	$defaults = array(
		'before_widget' => '<div id="%1$s" class="widget %2$s">',
		'after_widget' 	=> '</div>',
		'before_title' 	=> '<h3 class="widget-title">',
		'after_title' 	=> '</h3>',
	);
	$args = apply_filters( 'register_widgets', (array) $defaults ); // Available filter: register_widgets
	$how_many = apply_filters( 'register_widgets_count', (int) 1 ); // Available filter: widget_count
	register_sidebars( $how_many, $args );
}

/**
 * widget_area_active() Checks to see if a widget area is active based on ID
 *
 * @since 0.4
 */
function widget_area_active( $index ) {
	global $wp_registered_sidebars;
	
	$widgetarea = wp_get_sidebars_widgets();
	if ( isset($widgetarea[$index]) ) return true;
	
	return false;
}

/**
 * framework_widget_area() Get's Widget Area if widgets are active in that spot
 *
 * @since 0.4
 */
function framework_widget_area( $name = false ) {
	if ( !isset($name) ) {
		$widget[] = "widget.php";
	} else {
		$widget[] = "widget-{$name}.php";
	}
	locate_template( $widget, true );
}
?>