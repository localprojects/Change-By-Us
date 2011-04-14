<?php
/**
 * Template: Page.php
 *
 * @package WPFramework
 * @subpackage Template
 */

get_header();
?>
			<!--BEGIN #primary .hfeed-->
			<div id="primary" class="hfeed">
			<?php if ( have_posts() ) : ?>
				<?php while ( have_posts() ) : the_post(); ?>

				<!--BEGIN .hentry-->
				<div id="post-<?php the_ID(); ?>" class="<?php semantic_entries(); ?>">
					<h1 class="entry-title"><?php the_title(); ?></h1>
                    <?php if ( current_user_can( 'edit_post', $post->ID ) ): ?>
                    <!--BEGIN .entry-meta .entry-header-->
					<div class="entry-meta entry-header">
						<?php edit_post_link( 'edit', '<span class="edit-post">[', ']</span>' ); ?>
					<!--END .entry-meta .entry-header-->
                    </div>
                    <?php endif; ?>

					<!--BEGIN .entry-content .article-->
					<div class="entry-content article">
						<?php the_content(); ?>
					<!--END .entry-content .article-->
					</div>

					<!-- Auto Discovery Trackbacks
					<?php trackback_rdf(); ?>
					-->
				<!--END .hentry-->
				</div>
				<?php comments_template( '', true ); ?>

			<?php endwhile; endif; ?>
			<!--END #primary .hfeed-->
			</div>

<?php get_sidebar(); ?>
<?php get_footer(); ?>