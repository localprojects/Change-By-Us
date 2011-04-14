=== Plugin Name ===
Contributors: skeevis
Donate link: http://skeevisarts.com/projects/wp-dummy-content/
Tags: lorem ipsum, dummy content, dummy, development, content
Requires at least: 2.5
Tested up to: 2.8.3
Stable tag: 0.5.1

Easy generation and deletion of blog posts, pages, and sub pages for developers. Full site structure in one click.

== Description ==

One pain of theme development is setting up all the pages and blog posts in order for you to see how your site will look Ð one by one by one.

No more!

WP-Dummy-Content is a Wordpress plugin that will generate a bunch of pages, sub-pages and posts which you specify. Titles and content are automatically generated for you as well, and you have a few choices as to the type and length of content.


* One click generates an entire site.
* Choose what type of content to insert: single paragraph, multi paragraphs, styled (lists, blockquotes, links, etc.), or random.
* One click DELETES all content created by the plugin!

== Installation ==

This section describes how to install the plugin and get it working.

e.g.

1. Unzip wp-dummy-content and upload the folder to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. Click 'Dummy Content' in the settings directory in your templates

== Frequently Asked Questions ==

= When would I use this? = 

When developing a new Wordpress-powered website, and you need lots of pages and posts to structure the site around.

= Can I create multi-level page heirarchies? =

You can create top level pages and subject. We can't really go deeper than that, unfortunately.

= I entered a really big number, and now nothing works. =

Doh - didn't I warn you against that? Wordpress can only handle a certain number of pages (my install usually crashes after about 15K). You'll have to access your database via phpMyAdmin or a similar client, and clear out the wp_posts table.

= Can I add tags to my posts? = 

Not at this point. That'll be coming in a future release.

= I only want to delete some but not all of the pages auto-generated =

You have two choices. You can either go through and delete pages through the standard Wordpress interface. Or you can go into posts you want to keep and remove the dummy content custom field. Really simple!

== Screenshots ==

1. Clip of overall interface.

== Changelog ==

= 0.5.1 =
* Fixed up content to remove extra linebreaks.

= 0.5 =
* Initial Version - works!
