<?php
/**
 * Template: Header.php 
 *
 * @package WPFramework
 * @subpackage Template
 */
?>
<!DOCTYPE html>
<html class='universe'>
	
<head class='heavens'>
	
	<title><?php semantic_title(); ?></title>
	
	<meta name="description" content=""/>
	<meta name="author" content=""/>
	<meta http-equiv="Content-Type" content="<?php bloginfo( 'html_type' ); ?>; charset=<?php bloginfo('charset'); ?>" />
	<meta name="generator" content="WordPress" />
	<meta name="framework" content="WP Framework" />
	
	<link rel="icon" href="/favicon.ico"/>
	<link rel="shortcut icon" href="/favicon.ico"/>
	
	<link rel="stylesheet" href="/static/css/tc.reset.css" type="text/css" media="screen" charset="utf-8" />
	<link rel="stylesheet" href="/static/css/tc.gam.main.css" type="text/css" media="screen" charset="utf-8"/>
	<!--<link rel="stylesheet" href="http://ec2-50-16-1-176.compute-1.amazonaws.com/static/css/tc.reset.css" type="text/css" media="screen" charset="utf-8" />
	<link rel="stylesheet" href="http://ec2-50-16-1-176.compute-1.amazonaws.com/static/css/tc.gam.main.css" type="text/css" media="screen" charset="utf-8"/>-->
	<link rel="stylesheet" href="<?php bloginfo( 'stylesheet_url' ); ?>" type="text/css" media="screen, projection" />
	<link rel="stylesheet" href="<?php echo CSS . '/print.css'; ?>" type="text/css" media="print" />
	
	<link rel="alternate" type="application/rss+xml" title="<?php bloginfo( 'name' ); ?> RSS Feed" href="<?php bloginfo( 'rss2_url' ); ?>" />
	<link rel="alternate" type="text/xml" title="RSS .92" href="<?php bloginfo( 'rss_url' ); ?>" />
	<link rel="alternate" type="application/atom+xml" title="Atom 0.3" href="<?php bloginfo( 'atom_url' ); ?>" />
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />

	<!-- Theme Hook -->
    <?php if ( is_singular() ) wp_enqueue_script( 'comment-reply' ); // loads the javascript required for threaded comments ?>
	<?php wp_head(); ?>
	
	<script type="text/javascript" src="http://use.typekit.com/mco2pzd.js"></script>
	<script type="text/javascript">try{Typekit.load();}catch(e){}</script>

	<style type="text/css">
		.wf-loading .exosphere, .wf-loading .exosphere .small-note { visibility: hidden }
		.force-typekit .exosphere { visibility: visible }
	</style>

</head>



<body class="earth <?php semantic_body(); ?>">
	
	<div class='exosphere'>

		<div class='atmosphere'>
			<div class='stratosphere'>

				<ul class="navbar clearfix">
					<li class="home">
						<a href="http://ec2-50-16-1-176.compute-1.amazonaws.com/"><span>Change by Us</span></a>
					</li>
					<!--<li class="simplicity">
						<a href="http://www.nyc.gov/html/simplicity/html/about/about.shtml" target="_blank"><span>NYC SimpliCity</span></a>
					</li>-->
					<li class="news-about">
						<a href='/'>News</a>
						<a href='http://ec2-50-16-1-176.compute-1.amazonaws.com/about'>About</a>
					</li>
					<li class="search">
						<form action='http://ec2-50-16-1-176.compute-1.amazonaws.com/search' method='GET'>
							<input type='text' name='terms' value="" />
							<input type='submit' value='Search' />
						</form>
					</li>
				</ul><!--end navbar-->

			</div>
		</div>

		<div class='continent blog'>
			<div class='headlands clearfix'>
				<!-- <span class="above-h1 fancy-caps"><span>The</span> Official</span> -->
				<h1><a href="/">Change by Us <span class="unbold">Blog</a></span></h1>
				<!-- <div class="description">
					Updates from Change by Us community projects and all the news from Change by Us <abbr>HQ</abbr>.
				</div> -->
				<div class="search generic-search">
					<form class="searchform" method="get" action="<?php bloginfo( 'url' ); ?>">
						<input class="search" name="s" type="text" value="Search..." tabindex="1" />
					    <input class="search-btn rounded-button" type="submit" tabindex="2" name='headlands-search-btn' value='Search'/>
					</form>
				</div>
			</div>
			
			
			<!-- CONTENT HERE -->
			<div class='midlands clearfix'>
				