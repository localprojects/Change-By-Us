<?php
/**
 * Template: Navigation.php 
 *
 * @package WPFramework
 * @subpackage Template
 */

if ( is_singular() and !is_page() ) { ?>
<!--BEGIN .navigation-links-->
<div class="navigation-links single-page-navigation">
	<div class="nav-previous"><?php previous_post_link( '&laquo; <span class="nav-meta">%link</span>' ); ?></div>
	<div class="nav-next"><?php next_post_link('%link <span class="nav-meta">&raquo;</span>'); ?></div>
<!--END .navigation-links-->
</div>
<?php } else { ?>
<!--BEGIN .navigation-links-->
<div class="navigation-links page-navigation">
	<span class="nav-next"><?php next_posts_link( '<span class="nav-meta">&laquo;</span> Older Entries' ); ?></span>
	<span class="nav-previous"><?php previous_posts_link( 'Newer Entries <span class="nav-meta">&raquo;</span>' ); ?></span>
<!--END .navigation-links-->
</div>
<?php } ?>