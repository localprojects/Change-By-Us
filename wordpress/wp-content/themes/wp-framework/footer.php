<?php
/**
 * Template: Footer.php
 *
 * @package WPFramework
 * @subpackage Template
 */
?>
		<!--END #content-->
		</div>
			
		<!--BEGIN .footer-->
		<div class="footer">
			<p id="copyright">&copy; <?php the_time( 'Y' ); ?> <a href="<?php bloginfo( 'url' ); ?>"><?php bloginfo( 'name' ); ?></a>. <?php wpframework_credits(); ?></p>
			<!-- Theme Hook -->
			<?php wp_footer(); ?>
		
		<!--END .footer-->
		</div>
	<!--END .container-->
	</div> 
<!--END body-->
</body>
<!--END html(kthxbye)-->
</html>