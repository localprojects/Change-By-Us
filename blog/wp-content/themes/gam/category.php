<?php
/**
 * Template: Category.php
 *
 * @package WPFramework
 * @subpackage Template
 */

get_header();
?>

				<div class="west hfeed">
					
				<?php if ( have_posts() ) : ?>
					
					<h1 class="page-title archive-title">Category Archives: <span id="category-title"><?php single_cat_title(); ?></span></h1>
					
					<?php while ( have_posts() ) : the_post(); ?>
						
					<div id="post-<?php the_ID(); ?>" class="box post <?php semantic_entries(); ?>">
						<div class="hd">
							<!-- <cite class="standout-tag"><?php echo framework_get_terms( 'cats' ); ?></cite> -->
							<h2><a href="<?php the_permalink(); ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a></h2>
						</div>
						<div class="bd">
							<?php the_content( 'Read more &raquo;' ); ?>
						</div>
						<div class="ft">
							<cite class="meta">
								Posted <span class="date"><?php the_time( get_option('date_format') ); ?></span> at <span class="time"><?php the_time( get_option('time_format') ); ?></span>
								<?php edit_post_link( 'edit', '<span class="edit-post">[', ']</span>' ); ?>
							</cite>
						</div>
					</div><!-- end post -->
					
					<?php endwhile; ?>
					<?php include ( TEMPLATEPATH . '/navigation.php' ); ?>
					<?php else : ?>
						
					<div id="post-0" class="box post <?php semantic_entries(); ?>">
						<div class="hd">
							<h2><a href="">Oops! You are looking for something that isn't here.</a></h2>
						</div>
						<div class="bd">
							<p>Try using the search box above to find  what you are looking for.</p>
						</div>
					</div>
					
				<?php endif; ?>
				
				</div><!--end .west-->
				


<?php get_sidebar(); ?>
<?php get_footer(); ?>