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
	
	<!-- Always force latest IE rendering engine (even in intranet) & Chrome Frame
		Remove this if you use the .htaccess -->
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
	
	<meta name="description" content=""/>
	<meta name="author" content=""/>
	<meta http-equiv="Content-Type" content="<?php bloginfo( 'html_type' ); ?>; charset=<?php bloginfo('charset'); ?>" />
	<meta name="generator" content="WordPress" />
	<meta name="framework" content="WP Framework" />
	
	<link rel="shortcut icon" href="<?php echo IMAGES . '/favicon.ico'; ?>"/>
	<!-- <link rel="apple-touch-icon" href="<?php echo IMAGES . '/apple-touch-icon.png'; ?>"/> -->
	
	<link rel="stylesheet" href="http://localhost:9090/static/css/tc.reset.css" type="text/css" media="screen" charset="utf-8" />
	<link rel="stylesheet" href="http://localhost:9090/static/css/tc.gam.main.css" type="text/css" media="screen" charset="utf-8"/>
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
						<a href="/"><span>NYC SimpliCity | Give A Minute</span></a>
					</li>
					<li class="news-about">
						<a href='/blog'>News</a>
						<a href='/about'>About</a>
					</li>
					<li class="search">
						<form action='/home' method='GET'>
							<input type='text' name='query' />
							<input type='submit' name='hd-search-btn' value='Search' />
						</form>
					</li>
					<li class="userland">
						<div class="join"><a href='/join'>Join</a></div>
						<div class='login'><a href='/login'>Login</a></div>
						<div class='messages has-messages'><a href='/useraccount#messages'>&nbsp;</a></div>
						<div class='username'>
							<a href='/useraccount'><span class="unbold">Hi, </span>Xxxxxxx!</a>
							<div class="dropdown">
								<div class="membrane">
									<a href="/useraccount">Account</a>
									<a href="">Log out</a>
								</div>
							</div>
						</div>
						<div class='myprojects'>
							<a href='/useraccount'><span class="unbold">My </span>Projects</a>
							<div class="dropdown">
								<div class="membrane">
									<a href="/project">More Trees in the South Bronx</a>
									<a href="/project">Start a garden on 161st and Melrose Ave</a>
								</div>
							</div>
						</div>
					</li>
				</ul>

			</div>
		</div>

		<div class='continent blog'>
			<div class='headlands clearfix'>
				<span class="above-h1 fancy-caps"><span>The</span> Official</span>
				<h1><a href="/">Give a Minute <span class="unbold">Blog</a></span></h1>
				<div class="description">
					Updates from Give a Minute community projects and all the news from Give a Minute <abbr>HQ</abbr>.
				</div>
				<div class="search generic-search">
					<form class="searchform" method="get" action="<?php bloginfo( 'url' ); ?>">
						<input class="search" name="s" type="text" value="Search..." tabindex="1" />
					    <input class="search-btn" type="submit" tabindex="2" name='headlands-search-btn' value='Search'/>
					</form>
				</div>
			</div>
			
			
			<!-- CONTENT HERE -->
			<div class='midlands clearfix'>
				