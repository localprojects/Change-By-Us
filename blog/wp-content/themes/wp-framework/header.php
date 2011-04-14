<?php
/**
 * Template: Header.php 
 *
 * @package WPFramework
 * @subpackage Template
 */
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<!--BEGIN html-->
<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?>>
<!-- Built on WP Framework (http://wpframework.com) - Powered by WordPress (http://wordpress.org) -->

<!--BEGIN head-->
<head profile="<?php get_profile_uri(); ?>">

	<title><?php semantic_title(); ?></title>

	<!-- Meta Tags -->
	<meta http-equiv="Content-Type" content="<?php bloginfo( 'html_type' ); ?>; charset=<?php bloginfo('charset'); ?>" />
	<meta name="generator" content="WordPress" />
	<meta name="framework" content="WP Framework" />

	<!-- Favicon: Browser + iPhone Webclip -->
	<link rel="shortcut icon" href="<?php echo IMAGES . '/favicon.ico'; ?>" />
	<link rel="apple-touch-icon" href="<?php echo IMAGES . '/iphone.png'; ?>" />

	<!-- Stylesheets -->
	<link rel="stylesheet" href="<?php bloginfo( 'stylesheet_url' ); ?>" type="text/css" media="screen, projection" />
	<link rel="stylesheet" href="<?php echo CSS . '/print.css'; ?>" type="text/css" media="print" />

  	<!-- Links: RSS + Atom Syndication + Pingback etc. -->
	<link rel="alternate" type="application/rss+xml" title="<?php bloginfo( 'name' ); ?> RSS Feed" href="<?php bloginfo( 'rss2_url' ); ?>" />
	<link rel="alternate" type="text/xml" title="RSS .92" href="<?php bloginfo( 'rss_url' ); ?>" />
	<link rel="alternate" type="application/atom+xml" title="Atom 0.3" href="<?php bloginfo( 'atom_url' ); ?>" />
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />

	<!-- Theme Hook -->
    <?php if ( is_singular() ) wp_enqueue_script( 'comment-reply' ); // loads the javascript required for threaded comments ?>
	<?php wp_head(); ?>

<!--END head-->
</head>

<!--BEGIN body-->
<body class="<?php semantic_body(); ?>">
	
	<!--BEGIN .container-->
	<div class="container">

		<!--BEGIN .header-->
		<div class="header">
			<div id="logo"><a href="<?php bloginfo( 'url' ); ?>"><?php bloginfo( 'name' ) ?></a></div>
			<p id="tagline"><?php bloginfo( 'description' ) ?></p>

		<!--END .header-->
		</div>

        <?php wp_page_menu( 'show_home=1' ); ?>

		<!--BEGIN #content-->
		<div id="content">
		