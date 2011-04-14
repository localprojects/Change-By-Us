<?php
/**
 * Template: Search.php
 *
 * @package WPFramework
 * @subpackage Template
 */

get_header();
?>

				<div class="west hfeed">
					
				<?php if ( have_posts() ) : ?>
					
					<h1 class="page-title search-title">Search Results for: <?php the_post(); echo '<span class="search-term">'. $s .'</span>'; rewind_posts(); ?></h1>
					
					<?php while ( have_posts() ) : the_post(); ?>
						
					<div id="post-<?php the_ID(); ?>" class="box post <?php semantic_entries(); ?>">
						<div class="hd">
							<!-- <cite class="standout-tag"><?php echo framework_get_terms( 'cats' ); ?></cite> -->
							<h2><a href="<?php the_permalink(); ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a></h2>
						</div>
						<div class="bd">
							<?php the_excerpt(); ?>
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
							<h2><a href="">Your search for "<?php echo "$s"; ?>" did not match any entries</a></h2>
						</div>
						<div class="bd">
							<p>Suggestions:</p>
							<ul>
								<li>Make sure all words are spelled correctly.</li>
								<li>Try different keywords.</li>
								<li>Try more general keywords.</li>
							</ul>
						</div>
					</div>
					
				<?php endif; ?>
				
				</div><!--end .west-->
				


<?php get_sidebar(); ?>
<?php get_footer(); ?>