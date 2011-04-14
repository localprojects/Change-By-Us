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
				<div class="west hfeed">
					
					<div id="post-0" class="box post <?php semantic_entries(); ?>">
						<div class="hd">
							<h2><a href="">Oops! You are looking for something that isn't here.</a></h2>
						</div>
						<div class="bd">
							<p>Try using the search box above to find  what you are looking for.</p>
						</div>
					</div>
					
				</div><!--end .west-->

<?php get_sidebar(); ?>
<?php get_footer(); ?>