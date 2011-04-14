<?php
/**
 * Comments - functions that deal with comments
 *
 * @package WPFramework
 * @subpackage Core
 */

/**
 * framework_discussion_title()
 *
 * @since 0.3
 * @needsdoc
 * @filter framework_many_comments, framework_no_comments, framework_one_comment, framework_comments_number
 */
function framework_discussion_title( $type = NULL, $echo = true ) {
	if ( !$type ) return;

	$comment_count = framework_count( 'comment', false );
	$ping_count = framework_count( 'pings', false );

	switch( $type ) {
		case 'comment' :
			$count = $comment_count;
			$many  = apply_filters( 'framework_many_comments', (string) '% Comments' ); // Available filter: framework_many_comments
			$none  = apply_filters( 'framework_no_comments', (string) 'No Comments yet' ); // Available filter: framework_no_comments
			$one   = apply_filters( 'framework_one_comment', (string) '1 Comment' ); // Available filter: framework_one_comment
			break;
		case 'pings' :
			$count = $ping_count;
			$many  = apply_filters( 'framework_many_pings', (string) '% Trackbacks' ); // Available filter: framework_many_pings
			$none  = apply_filters( 'framework_no_pings', (string) '' ); // Available filter: framework_no_pings
			$one   = apply_filters( 'framework_one_ping', (string) '1 Trackback' ); // Available filter: framework_one_comment
			break;
	}
	
	if ( $count > 1 ) {
		$number = str_replace( '%', number_format_i18n( $count ), $many );
	} elseif ( $count == 0 ) {
		$number = $none;
	} else { // it must be one
		$number = $one;
	}
	
	// Now let's format this badboy.
	$tag = apply_filters( 'framework_discussion_title_tag', (string) 'h3' ); // Available filter: framework_discussion_title_tag
	
	if ( $number ) {
		$discussion_title  = '<'. $tag .' class="'. $type .'-title">';
		$discussion_title .= '<span class="'. $type .'-title-meta">' . $number . ' to ' . '</span>';
		$discussion_title .= '<span class="'. $type .'-title-meta-sep">&#8220;</span>';
		$discussion_title .= get_the_title();
		$discussion_title .= '<span class="'. $type .'-title-meta-sep">&#8221;</span></'. $tag .'>';
	}
	$framework_discussion_title = apply_filters( 'framework_discussion_title', (string) $discussion_title ); // Available filter: framework_discussion_title
	return ( $echo ) ? print( $framework_discussion_title ) : $framework_discussion_title;
}

/**
 * framework_discussion_rss()
 *
 * @since 0.3
 * @needsdoc
 */
function framework_discussion_rss() {
	global $id;
	$uri = get_post_comments_feed_link( $id );
	$text = "<p class=\"comment-feed-link\">You can follow all the replies to this entry through the <a href=\"{$uri}\">comments</a> feed.</p>";
	echo $text;
}

/**
 * framework_count()
 *
 * @since 0.3
 * @needsdoc
 */
function framework_count( $type = NULL, $echo = true ) {
	if ( !$type ) return;
	global $wp_query;

	$comment_count = count( $wp_query->comments_by_type['comment'] );
	$ping_count = count( $wp_query->comments_by_type['trackback'] );
	
	switch ( $type ):
		case 'comment':
			return ( $echo ) ? print( $comment_count ) : $comment_count;
			break;
		case 'pings':
			return ( $echo ) ? print( $ping_count ) : $ping_count;
			break;
	endswitch;
}

/**
 * framework_comment_author() short description
 *
 * @since 0.3
 * @todo needs filter
 */
function framework_comment_author( $meta_format = '%avatar% %name%' ) {
	$meta_format = apply_filters( 'framework_comment_author_meta_format', $meta_format ); // Available filter: framework_comment_author_meta_format
	if ( ! $meta_format ) return;
	
	// No keywords to replace
	if ( strpos( $meta_format, '%' ) === false ) {
		echo $meta_format;
	} else {
		$open  = '<!--BEGIN .comment-author-->' . "\n";
		$open .= '<div class="comment-author vcard">' . "\n";
		$close  = "\n" . '<!--END .comment-author-->' . "\n";
		$close .= '</div>' . "\n";
		
		// separate the %keywords%
		$meta_array = preg_split( '/(%.+?%)/', $meta_format, -1, PREG_SPLIT_DELIM_CAPTURE );

		// parse through the keywords
		foreach ( $meta_array as $key => $str ) {
			switch ( $str ) {
				case '%avatar%':
					$meta_array[$key] = framework_comment_avatar();
					break;

				case '%name%':
					$meta_array[$key] = framework_comment_name();
					break;
			}
		}
		$output = join( '', $meta_array );
		if ( $output ) echo $open . $output . $close; // output the result
	}
}

/**
 * framework_comment_meta() short description
 *
 * @since 0.3.1
 * @todo needs filter
 */
function framework_comment_meta( $meta_format = '%date% at %time% | %link% %edit%' ) {	
	$meta_format = apply_filters( 'framework_comment_meta_format', $meta_format ); // Available filter: framework_comment_meta_format
	if ( ! $meta_format ) return;
	
	// No keywords to replace
	if ( strpos( $meta_format, '%' ) === false ) {
		echo $meta_format;
	} else {
		$open  = '<!--BEGIN .comment-meta-->' . "\n";
		$open .= '<div class="comment-meta">' . "\n";
		$close  = "\n" . '<!--END .comment-meta-->' . "\n";
		$close .= '</div>' . "\n";
		
		// separate the %keywords%
		$meta_array = preg_split( '/(%.+?%)/', $meta_format, -1, PREG_SPLIT_DELIM_CAPTURE );

		// parse through the keywords
		foreach ( $meta_array as $key => $str ) {
			switch ( $str ) {
				case '%date%':
					$meta_array[$key] = framework_comment_date();
					break;

				case '%time%':
					$meta_array[$key] = framework_comment_time();
					break;

				case '%link%':
					$meta_array[$key] = framework_comment_link();
					break;
				
				case '%reply%':
					$meta_array[$key] = framework_comment_reply( true );
					break;
					
				case '%edit%':
					$meta_array[$key] = framework_comment_edit();
					break;
			}
		}
		$output = join( '', $meta_array );
		if ( $output ) echo $open . $output . $close; // output the result
	}
}

/**
 * framework_comment_text() short description
 *
 * @since 0.3.1
 */
function framework_comment_text() {
	echo "\n<!--BEGIN .comment-content-->\n";
	echo "<div class=\"comment-content\">\n";
	comment_text();
	echo "\n<!--END .comment-content-->\n";
	echo "</div>\n";
}

/**
 * framework_comment_moderation() short description
 *
 * @since - 0.3.1
 */
function framework_comment_moderation() {
	global $comment;
	if ( $comment->comment_approved == '0' ) echo '<p class="comment-unapproved moderation alert">Your comment is awaiting moderation.</p>\n';
}

/**
 * framework_comment_navigation() paged comments
 *
 * @since 0.3
 * @needsdoc
 * @todo add html comments?
 */
function framework_comment_navigation() {
	$num = get_comments_number() + 1;
	
	$tag = apply_filters( 'framework_comment_navigation_tag', (string) 'div' ); // Available filter: framework_comment_navigation_tag
	$open = "<!--BEGIN .navigation-links-->\n";
	$open .= "<". $tag ." class=\"navigation-links comment-navigation\">\n";
	$close = "<!--END .navigation-links-->\n";
	$close .= "</". $tag .">\n";
	
	if ( $num > get_option( 'comments_per_page' ) ) {		
		$paged_links = paginate_comments_links( array(
			'type' => 'array',
			'echo' => false,
			'prev_text' => '&laquo; Previous Page',
			'next_text' => 'Next Page &raquo;' ) );
		
		if ( $paged_links ) $comment_navigation = $open . join( ' ', $paged_links ) . $close;
	}
	else {
		$comment_navigation = NULL;
	}
	echo apply_filters( 'framework_comment_navigation', (string) $comment_navigation ); // Available filter: framework_comment_navigation
}

/**
 * framework_comments_callback() recreate the comment list
 *
 * @since 0.3
 * @needsdoc
 */
function framework_comments_callback( $comment, $args, $depth ) {	
	$GLOBALS['comment'] = $comment;
	$GLOBALS['comment_depth'] = $depth;
	$tag = apply_filters( 'framework_comments_list_tag', (string) 'li' ); // Available filter: framework_comments_list_tag
	?>
    
    <!--BEING .comment-->
	<<?php echo $tag; ?> class="<?php semantic_comments(); ?>" id="comment-<?php echo comment_ID(); ?>">
    	<?php framework_hook_comments(); ?>
	<?php
}

/**
 * framework_comments_endcallback() close the comment list
 *
 * @since 0.3
 * @needsdoc
 * @todo needs filter
 */
function framework_comments_endcallback(){
	$tag = apply_filters( 'framework_comments_list_tag', (string) 'li' ); // Available filter: framework_comments_list_tag
	echo "<!--END .comment-->\n";
	echo "</". $tag .">\n";
	do_action( 'framework_hook_inside_comments_loop' ); // Available action: framework_hook_inside_comments_loop
}

/**
 * framework_pings_callback() recreate the comment list
 *
 * @since 0.3
 * @needsdoc
 */
function framework_pings_callback( $comment, $args, $depth ) {
	$GLOBALS['comment'] = $comment;
	$tag = apply_filters( 'framework_pings_callback_tag', (string) 'li' ); // Available filter: framework_pings_callback_tag
	$byline = apply_filters( 'framework_pings_callback_byline', (string) 'By ' ); // Available filter: framework_pings_callback_byline
	$time = apply_filters( 'framework_pings_callback_time', (string) ' on ' ); // Available filter: framework_pings_callback_time
	$when = apply_filters( 'framework_pings_callback_when', (string) ' at ' ); // Available filter: framework_pings_callback_time
	?>
    <?php if ( $comment->comment_approved == '0' ) echo '<p class="ping-unapproved moderation alert">Your trackback is awaiting moderation.</p>\n'; ?>
    <!--BEING .pings-->
	<<?php echo $tag; ?> class="<?php echo semantic_comments(); ?>" id="ping-<?php echo $comment->comment_ID; ?>">
		<?php echo $byline; framework_comment_author( false ); echo $time; ?><a class="trackback-time" href="<?php comment_link(); ?>"><?php comment_date(); echo $when; comment_time(); ?></a>
	<?php
}

/**
 * framework_pings_endcallback() close the comment list
 *
 * @since 0.3
 * @needsdoc
 */
function framework_pings_endcallback(){
	$tag = apply_filters( 'framework_pings_callback_tag', (string) 'li' ); // Available filter: framework_pings_callback_tag
	echo "<!--END .pings-list-->\n";
	echo "</". $tag .">\n";
	do_action( 'framework_hook_inside_pings_list' ); // Available action: framework_hook_inside_pings_list
}
?>