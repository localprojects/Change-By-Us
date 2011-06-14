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
					<a href='http://www.nyc.gov/html/simplicity/html/about/about.shtml' target='_blank' class="simplicity"><img src='/static/images/footer-nycsimplicity2.png' alt='Local Projects' /></a>
					<a href='http://www.localprojects.net' target='_blank'><img src='/static/images/footer-localprojects.png' alt='Local Projects' /></a>
					<a href='http://www.ceosforcities.org/' target='_blank'><img src='/static/images/footer-ceosforcities.png' alt='CEOs For Cities' /></a>
					<a href='http://www.nyc.gov/html/planyc2030/html/home/home.shtml' target='_blank'><img src='/static/images/footer-planyc.png' alt='PLANYC' /></a>
					<span class="supported fancy-caps">Supported <span>by</span></span>
					<a href='http://www.rockefellerfoundation.org' target='_blank'><img src='/static/images/footer-rockefeller.png' alt='The Rockefeller Foundation' /></a>
					<a href='http://www.knightfoundation.org/' target='_blank'><img src='/static/images/footer-knight.png' alt='The Knight Foundation' /></a>
					
				</div>
				<div class="box">
					<ul class="sitemap">
						<li><a href='http://nyc.changeby.us/about'>About Change by Us NYC</a></li>
						<li><a href='http://www.nyc.gov/html/simplicity/html/about/about.shtml'>About NYC Simplicity</a></li>
						<li><a href='http://nycblog.changeby.us'>News</a></li>
						<li><a href='http://nyc.changeby.us/tou#community-policy'>Community Policy</a></li>
						<li class="sitemap-tou"><a href='http://nyc.changeby.us/tou'>Terms of Use</a></li>
						<li><a href='http://nyc.changeby.us/tou#privacy'>Privacy Policy</a></li>
					</ul>
					<div class="search generic-search clearfix">
						<form action='http://nyc.changeby.us/search' method='GET'>
							<input type='text' id='ft-search-field' class='ft-search-field serif has-been-focused' name='terms' value="" />
							<input type='submit' id='ft-search-btn' class='ft-search-btn' value='Search' />
						</form>
					</div>
					<a href="http://nyc.changeby.us/feedback" class="feedback-button rounded-button small">Contact Us</a>
				</div>
			</div>
			<div class='east'>
				<div class='box'>
					<p class="fancy-caps">Design <span>and</span> Development</p>
					<p>&copy; 2011 <strong>Local Projects, LLC.</strong><br />All rights reserved.</p>
				</div>
				<div class='box'>
					<p class="fancy-caps">Content <span>and</span> NYC Logo</p>
					<p>&copy; 2011 <strong>Mayor's Fund to Advance the City of New York</strong><br />All rights reserved.</p>
				</div>
			</div>
		</div><!-- end seafloor-->


	</div><!-- end exosphere -->


	<!-- Javascript goes here -->
	<script type="text/javascript" src="/static/js/libs/jquery-1.5.1.js"></script>
	<script type="text/javascript" src="/static/js/libs/jquery.easing.1.3.js"></script>
	
	<!-- detect user agent for js + css browser fixes later -->
	<script type="text/javascript">
		var ua = $.browser
		
		$('input.search').focus(function() {
			if ($(this).val() == 'Search blog...' || $(this).val() == '') {
				$(this).val('')
			};
			$(this).addClass('has-been-focused').css('color','#55504B');
		});
		
		$('input.search').blur(function() {
			if ($(this).val() == 'Search blog...' || $(this).val() == '') {
				$(this).val('Search blog...').removeClass('has-been-focused').css('color','#878786');
			}
		});
	</script>
	
</body>

</html>