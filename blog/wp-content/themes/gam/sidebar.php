<?php
/**
 * Template: Sidebar.php
 *
 * @package WPFramework
 * @subpackage Template
 */
?>

				<div class="east sidebar">
					<div class="box blog-rss">
						<a href="<?php bloginfo( 'rss2_url' ); ?>" title="<?php echo wp_specialchars( get_bloginfo( 'name' ), 1 ) ?> Posts RSS feed" rel="alternate" type="application/rss+xml" class="rounded-button small rss-button"><abbr>RSS</abbr></a>
					</div>
					<div class="box blog-categories">
						<div class="hd">
							<h3>Categories</h3>
						</div>
						<div class="bd">
							<ul>
								<?php
								$listCats = wp_list_categories('echo=0&show_count=1&title_li=');
								$listCats = str_replace(array('(',')'), array('<span class="counter">','</span>'), $listCats);
								echo $listCats;
								?>
							</ul>
						</div>
					</div>
					<!--<div class="box blog-signup">
						<div class="hd">
							<h3 class="fancy-caps">Sign up <span>for</span> Emails</h3>
						</div>
						<div class="bd">
							<form action="" method="POST">
								<h4>Sign up to get our posts via email. No more than one message per day.</h4>
								<input type="text" />
								<input type="submit" class="rounded-button small" value="Sign Up" />
							</form>
						</div>
					</div>-->
					<div class="box blog-feedback">
						<div class="hd">
							<h3>We Love Feedback</h3>
						</div>
						<div class="bd">
							Comment on a post and <a href="http://nyc.changeby.us/feedback">send it to us</a>.
						</div>
					</div>
					<div class="box blog-archive">
						<div class="hd">
							<h3>Archive</h3>
						</div>
						<div class="bd">
							<ul>
								<?php
								$listArchives = wp_get_archives( 'type=monthly&show_post_count=1&echo=0' );
								$listArchives = str_replace(array('(',')'), array('<span class="counter">','</span>'), $listArchives);
								echo $listArchives;
								?>
							</ul>
						</div>
					</div>
				</div><!--end east (sidebar) -->
