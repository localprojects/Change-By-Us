<?php
/**
 * Template: 404.php
 *
 * @package WPFramework
 * @subpackage Template
 */

header( "HTTP/1.1 404 Not found", true, 404 );
get_header();
?>
			<!--BEGIN #primary .hfeed-->
			<div id="primary" class="hfeed">
				<!--BEGIN #post-0-->
				<div id="post-0" class="<?php semantic_entries(); ?>">
					<h1 class="entry-title">Not Found</h1>

					<!--BEGIN .entry-content-->
					<div class="entry-content">
						<p>Sorry, but you are looking for something that isn't here.</p>
						<?php get_search_form(); ?>
					<!--END .entry-content-->
					</div>
				<!--END #post-0-->
				</div>
			<!--END #primary .hfeed-->
			</div>

<?php get_sidebar(); ?>
<?php get_footer(); ?>