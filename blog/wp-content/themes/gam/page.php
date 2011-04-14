<?php
/**
 * Template: Page.php
 *
 * @package WPFramework
 * @subpackage Template
 */

get_header();
?>

				<div class="west hfeed">
					
				<?php if ( have_posts() ) : ?>
					<?php while ( have_posts() ) : the_post(); ?>
						
					<div id="post-<?php the_ID(); ?>" class="box post <?php semantic_entries(); ?>">
						<div class="hd">
							<!-- <cite class="standout-tag"><?php echo framework_get_terms( 'cats' ); ?></cite> -->
							<h2><a href="<?php the_permalink(); ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a></h2>
						</div>
						<div class="bd">
							<?php the_content( 'Read more &raquo;' ); ?>
							<?php wp_link_pages( array( 'before' => '<div id="page-links"><p><strong>Pages:</strong> ', 'after' => '</p></div>', 'next_or_number' => 'number' ) ); ?>
						</div>
						<div class="ft">
							<cite class="meta">
								Posted <span class="date"><?php the_time( get_option('date_format') ); ?></span> at <span class="time"><?php the_time( get_option('time_format') ); ?></span>
								<?php edit_post_link( 'edit', '<span class="edit-post">[', ']</span>' ); ?>
							</cite>
						</div>
					</div><!-- end post -->
					
					<?php comments_template( '', true ); ?>
					<?php endwhile; ?>
				
				<?php endif; ?>

				</div><!--end .west-->
				

<?php get_sidebar(); ?>
<?php get_footer(); ?>