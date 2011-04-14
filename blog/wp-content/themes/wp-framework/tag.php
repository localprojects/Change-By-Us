<?php
/**
 * Template: Tag.php
 *
 * @package WPFramework
 * @subpackage Template
 */

get_header();
?>
			<!--BEGIN #primary .hfeed-->
			<div id="primary" class="hfeed">
            <?php if ( have_posts() ) : ?>
                <h1 class="page-title archive-title">Tag Archives: <span id="tag-title"><?php single_tag_title(); ?></span></h1>
				<?php while ( have_posts() ) : the_post(); ?>
				
				<!--BEGIN .hentry-->
				<div id="post-<?php the_ID(); ?>" class="<?php semantic_entries(); ?>">
					<h2 class="entry-title"><a href="<?php the_permalink(); ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a></h2>

					<!--BEGIN .entry-meta .entry-header-->
					<div class="entry-meta entry-header">
						<span class="author vcard">Written by <?php printf( '<a class="url fn" href="' . get_author_posts_url( $authordata->ID, $authordata->user_nicename ) . '" title="' . sprintf( 'View all posts by %s', $authordata->display_name ) . '">' . get_the_author() . '</a>' ) ?></span>
						<span class="published">on <abbr class="published-time" title="<?php the_time( get_option('date_format') .' - '. get_option('time_format') ); ?>"><?php the_time( get_option('date_format') ); ?></abbr></span>
						<span class="meta-sep">&mdash;</span>
						<span class="comment-count"><a href="<?php comments_link(); ?>"><?php comments_number( 'Leave a Comment', '1 Comment', '% Comments' ); ?></a></span>
						<?php edit_post_link( 'edit', '<span class="edit-post">[', ']</span>' ); ?>
					<!--END .entry-meta .entry-header-->
                    </div>

					<!--BEGIN .entry-summary .article-->
					<div class="entry-summary article">
						<?php the_excerpt(); ?>
					<!--END .entry-summary .article-->
					</div>

					<!--BEGIN .entry-meta .entry-footer-->
                    <div class="entry-meta entry-footer">
                    	<span class="entry-categories">Posted in <?php echo framework_get_terms( 'cats' ); ?></span>
						<?php if ( framework_get_terms( 'tags' ) ) { ?>
                        <span class="meta-sep">|</span>
                        <span class="entry-tags">Also tagged <?php echo framework_get_terms( 'tags' ); ?></span>
                        <?php } ?>
					<!--END .entry-meta .entry-footer-->
                    </div>
				<!--END .hentry-->
				</div>

				<?php endwhile; ?>
				<?php include ( TEMPLATEPATH . '/navigation.php' ); ?>
				<?php else : ?>

				<!--BEGIN #post-0-->
				<div id="post-0" class="<?php semantic_entries(); ?>">
					<h2 class="entry-title">Not Found</h2>

					<!--BEGIN .entry-content-->
					<div class="entry-content">
						<p>Sorry, but you are looking for something that isn't here.</p>
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