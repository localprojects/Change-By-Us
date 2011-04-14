<?php
/**
 * Template: Attachment.php
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
					<h1 class="entry-title"><a href="<?php echo get_permalink($post->post_parent); ?>" rev="attachment"><?php echo get_the_title($post->post_parent); ?></a> &raquo; <?php the_title(); ?></h1>
					
					<!--BEGIN .entry-meta .entry-header-->
					<div class="entry-meta entry-header">
						<span class="author vcard">Written by <?php printf( '<a class="url fn" href="' . get_author_posts_url( $authordata->ID, $authordata->user_nicename ) . '" title="' . sprintf( 'View all posts by %s', $authordata->display_name ) . '">' . get_the_author() . '</a>' ) ?></span>
						<span class="published">on <abbr class="published-time" title="<?php the_time( get_option('date_format') .' - '. get_option('time_format') ); ?>"><?php the_time( get_option('date_format') ); ?></abbr></span>
						<span class="meta-sep">&mdash;</span>
						<span class="comment-count"><a href="<?php comments_link(); ?>"><?php comments_number( 'Leave a Comment', '1 Comment', '% Comments' ); ?></a></span>
						<?php edit_post_link( 'edit', '<span class="edit-post">[', ']</span>' ); ?>
					<!--END .entry-meta .entry-header-->
                    </div>
					
					<!--BEGIN .entry-content .article-->
					<div class="entry-content article">
						<div class="entry-attachment">
							<?php echo wp_get_attachment_link( $post->ID, 'medium', false, true); ?>
						</div>
						<?php the_content(); ?>
					 <!--END .entry-content .article-->
					</div>
				<!--END .hentry-->
				</div>

				<?php comments_template( '', true ); ?>
                <?php include ( TEMPLATEPATH . '/navigation.php' ); ?>
				<?php endwhile; else : ?>

				<!--BEGIN #post-0-->
				<div id="post-0" class="<?php semantic_entries(); ?>">
					<h1 class="entry-title">Not Found</h1>

					<!--BEGIN .entry-content-->
					<div class="entry-content">
						<p>Sorry, no attachments matched your criteria.</p>
						<?php get_search_form(); ?>
					<!--END .entry-content-->
					</div>
				<!--END #post-0-->
				</div>

			<?php endif; ?>
			<!--END #primary .hfeed-->
			</div>

<?php get_sidebar(); ?>
<?php get_footer(); ?>