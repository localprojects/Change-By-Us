<?php
/**
 * Template: Footer.php
 *
 * @package WPFramework
 * @subpackage Template
 */
?>
					
			</div><!--end midlands -->

			<div class='foothills'>

			</div>
		</div><!-- end continent-->
		
		
		<div class='seafloor'>
			<div class='west'>
				<div class='box logos clearfix'>
					<a href='http://www.localprojects.net' target='_blank'><img src='<?php echo IMAGES . '/footer-localprojects.png'; ?>' alt='Local Projects' /></a>
					<a href='http://www.ceosforcities.org/' target='_blank'><img src='<?php echo IMAGES . '/footer-ceosforcities.png'; ?>' alt='CEOs For Cities' /></a>
					<a href='http://www.rockefellerfoundation.org' target='_blank'><img src='<?php echo IMAGES . '/footer-rockefeller.png'; ?>' alt='The Rockefeller Foundation' /></a>
					<a href='http://www.ofbyandforus.org/' target='_blank'><img src='<?php echo IMAGES . '/footer-us.png'; ?>' alt='US' /></a>
					<a href='http://www.knightfoundation.org/' target='_blank'><img src='<?php echo IMAGES . '/footer-knight.png'; ?>' alt='The Knight Foundation' /></a>
					<a href='http://www.nyc.gov/html/planyc2030/html/home/home.shtml' target='_blank'><img src='<?php echo IMAGES . '/footer-planyc.png'; ?>' alt='PLANYC' /></a>
				</div>
				<div class="box">
					<ul class="sitemap">
						<li><a href='/about'>About Give a Minute</a></li>
						<li><a href='http://www.nyc.gov/html/simplicity/html/about/about.shtml'>About Simplicity</a></li>
						<li><a href='/blog'>News</a></li>
						<li><a href='/tou'>Terms of Service</a></li>
						<li><a href='/feedback'>Feedback</a></li>
					</ul>
					<div class="search generic-search">
						<form action='/home' method='GET'>
							<input type='text' name='query' />
							<input type='submit' name='ft-search-btn' id='ft-search-btn' class='ft-search-btn' value='Search' />
						</form>
					</div>
				</div>
			</div>
			<div class='east'>
				<div class='box social-networking'>
					<div class="facebook">
						<iframe src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fwww.giveaminute.info&amp;layout=standard&amp;show_faces=false&amp;width=275&amp;action=like&amp;font=verdana&amp;colorscheme=light&amp;height=60" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:300px; height:60px;" allowTransparency="true"></iframe>
					</div>
				</div>
				<div class='box copyright'>
					<p>&copy; Copyright <strong>Give a Minute</strong> 2011</p>
				</div>
			</div>
		</div><!-- end seafloor-->


	</div><!-- end exosphere -->


	<!-- Javascript goes here -->
	<script type="text/javascript" src="http://localhost:9090/static/js/libs/jquery-1.5.1.js"></script>
	<script type="text/javascript">
		jQuery(document).one('ready',function(e){
			/* DELETE THIS LATER!!!!!!! */
			$('body').delay(3000).queue(function() {
				$(this).addClass("force-typekit");
			});
		});
	</script>

</body>

</html>