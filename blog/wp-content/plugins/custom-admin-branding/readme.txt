=== Plugin Name ===
Contributors: jayberz
Donate link: http://redlettersstudio.com/blog/2008/01/24/wordpress-custom-admin-branding/
Tags: branding, logos, admin, custom, images, header, footer, login
Requires at least: 2.7
Tested up to: 3.1
Stable tag: 3.0.3

The Custom Admin Branding Plugin allows you to brand and customize the WordPress administration area for clients or for personal use.  You can display custom images and styles for the login screen, admin header and footer.

== Description ==

The Custom Admin Branding Plugin allows you to brand and customize the WordPress administration area for clients or for personal use.  You can display custom images and styles for the login screen, admin header and footer. 

It should be fairly easy to use for anyone familiar with WordPress and has basic css and html skills. At its simplest it only requires you to activate and then replace three images with your own. Photoshop templates are included to help you with that.

**Get more support on [the official Custom Admin Branding forum](http://wordpress.org/tags/custom-admin-branding?forum_id=10).**

== Installation ==

1. Download the Custom Branding Plugin
2. Upload the custom_admin_branding folder to your plugins folder
3. Go to the plugin section in your admin and activate

**Changing Colors**
The options that support color change have a swatch next to the form field. You can either click the color swatch or click into the form field. Doing so will bring up a palette of color options. You are not restricted by the choices in the palette. You can enter any 6 figure hexadecimal color code. You must however precede your code with the pound sign (#).

**Customizing Images**
There are four images that you can customize:

* Login Form Logo
* Login Form Login Button Background
* Admin Header Logo
* Footer Logo

All of the default images are in the images folder which is in the custom-admin-branding plugin folder. To change an image:

1. Create your custom images with the provided Photoshop templates. (They are in the psd-image-templates folder)
2. Upload your custom image(s) with the built in uploader or store them elsewhere and enter in the url that points to the image.
4. Click the save changes button at the bottom of options page.

Please note that the optimal size for the header logo is 32px by 32px.  You may have an image longer than 32px but not higher as it will break the layout.  If your image is longer than 32px please enter the width of the image in the supplied field.


**Changing the Admin Footer Content**
The custom footer is designed for you to put your logo and some helpful information for your client.  The optimal image size is 32px by 32px.

The footer text field will accept all text and most html.  I use this area to point a link back to my site or a support page for my clients.

**Custom CSS**
A new feature is the ability to add your own custom css.  This field can be used to change any css rule present in the admin.  These will not apply to the login page however.

== Screenshots ==

1. The Custom Admin Branding interface

== Changelog ==

= 3.0.2 =
* Bug Fixes

= 3.0.1 =
* Bug Fixes

= 3.0 =
* Rewrote the plugin to take advantage of the improved WordPress UI
* Added the ability to upload images via the WordPress uploader
* Added a field to allow custom css
* Cleaned code and fixed bugs

= 2.0.1 =
* Fixed a bug in the database calls

= 2.0 =
* Added new options to change colors on for elements in the login and admin header
* Cleaned and updated code to be forward compatible
* Added a live preview for the login screen to the admin options
* Added a screenshot to the WordPress repository
* Updated the admin options page to current styles
* Added the ability to turn off the Back to Blog link in the login screen
* Updated the psd templates and added new default images
* Fixed updating issue where updating would overwrite your current images

= 1.3.5 =
* Updated version bug in the WordPress repository

= 1.3.4 =
* Corrected a bug in the way the plugin got the username of the person logged in

= 1.3 =
* Added link to main site in admin header
* Updated css for login page
* Updated .psd template for login page

= 1.2 =
* Verified 2.7 compatibility.

= 1.1.2 =
* Updated css to work with 2.5 version of OZH Drop Down Menu.
* Verified 2.6 compatibility.


= 1.1.1 =
* Added custom classes to style the login button.

= 1.1 =
* Added a settings page to update the footer link.

= 1.0.1 =
* Adjusted plugin to the new Admin for WP 2.5
* Simplified the login image
* Enlarged the main logo image for the admin header
* Added support for Ozh’s Drop Down Menu Plugin
* Added a priority to the style sheet to have seamless integration with the Drop Down Menu Plugin

= 1.0 =
* The first version