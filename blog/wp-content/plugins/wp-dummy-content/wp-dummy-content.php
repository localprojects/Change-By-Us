<?php
/*
Plugin Name: WP Dummy Content
Plugin URI: http://skeevisarts.com/
Description: Generates a ton of content for the purposes of theme development.
Version: 0.5
Author: Zvi Band
Author URI: http://www.skeevisarts.com/

This program is free software; you can redistribute it and/or
modify it under the terms of version 2 of the GNU General Public
License as published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details, available at
http://www.gnu.org/copyleft/gpl.html
or by writing to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

require_once("lib.php");

global $paragraph;

function add_mass_page() {
add_options_page('WP Dummy Content 0.5', 'Dummy Content', '8', __FILE__, 'dummy_content_admin');
}


function dummy_content_admin() {
	global $wpdb;

	//look for the hidden post data to know that the form was submitted
	if (isset($_POST['checker'])) {
		$result = create_stuff($_POST);
		echo '<div id="message" class="updated fade"><p>' . $result . '</p></div>';
}

	if (isset($_POST['blogchecker'])) {
		$result = create_blog_stuff($_POST);
		echo '<div id="message" class="updated fade"><p>' . $result . '</p></div>';
}


	if (isset($_POST['delete'])) {
		$result = delete_stuff($_POST);
		echo '<div id="message" class="updated fade"><p>' . $result . '</p></div>';
}


?>


<div class="wrap">
<div id="poststuff">
<h1>Wordpress Dummy Content Generator</h1>
<ul>
<li>Instantly fill your site with sample blog posts and pages.</li>
<li>Different content styles for your theme to handle.</li>
<li>Delete it all in one click!</li>

</ul>
<div id="grabit" class="gbx-group">
<div class="postbox">
<h3><?php _e('Generate Pages', 'dummy_content'); ?></h3>
<div class="inside">
<table border="0" width="100%">
<form name="dummy-content" method="post" action="<?php echo $_SERVER["REQUEST_URI"]; ?>" enctype="multipart/form-data">
<?php wp_nonce_field('make-dummy-content'); ?>
	<tr><td width="20%"><?php _e('Number of Top Level Pages', 'dummy_content'); ?></td><td><input type="text" name="num_pages" size="4"></td></tr>
	<tr><td colspan="2"><p><strong>WARNING: </strong> The nerd in you is tempted to type in a really big number to see what happens. Here's what happens: stuff breaks. The only way to fix it is to go in via an external control panel (like phpMyAdmin) and clear out tables. So do it once, laugh, then fix it and don't do it again.</p></td></tr>
	<tr><td><?php _e('Number of Sub Pages Per Page', 'dummy_content'); ?></td><td><input type="text" name="num_sub_pages" size="4"></td></tr>
	<tr><td><?php _e('Type of Pages', 'dummy_content'); ?></td><td><select name="content_type"><option value="paragraphs">Just Paragraphs</option><option value="paragraph">Just One Paragraph</option><option value="styled">Styled (lists, paragraphs, quotes, etc)</option><option value="grabbag">Grab Bag (mix of everything)</option></select></td></tr>
	<tr><td><?php _e('Page Parent', 'dummy_content'); ?></td><td><select name="parent_id" id="parent_id">
<option value='0'><?php _e('Main Page (no parent)', 'dummy_content'); ?></option>
<?php parent_dropdown($post->post_parent); ?>
</select></td></tr>
	<?php if ( 0 != count( get_page_templates() ) ) {
?>
<tr><td><?php _e('Page Template') ?></td><td>
<label class="hidden" for="page_template"><?php _e('Page Template') ?></label><select name="page_template" id="page_template">
<option value='default'><?php _e('Default Template'); ?></option>
<?php page_template_dropdown($post->page_template); ?>
</select></td></tr>
<?php
	}
?>
	<tr><td><?php _e('Page Status', 'dummy_content'); ?></td><td><input type="radio" name="page_status" value="publish" checked>&nbsp;<?php _e('Published', 'dummy_content'); ?><br /><input type="radio" name="page_status" value="draft">&nbsp;<?php _e('Draft', 'dummy_content'); ?></td></tr>

<input type="hidden" name="checker" value="OK">

<tr><td colspan="2"><h4>Custom Fields</h4></td></tr>

<tr><td colspan="2">&nbsp;</td></tr>

<tr><td><?php _e('Name', 'dummy_content'); ?></td>
<td><?php _e('Value', 'dummy_content'); ?></td></tr>

<? for($i = 0; $i < 5;$i++) { ?>
<tr><td><input name="meta_key<? echo $i; ?>" type="text" size="20"></td>
<td><textarea name="meta_value<? echo $i; ?>" cols="40" rows="4"></textarea></td></tr>
<? } ?>
<tr><td colspan="2"><p class="submit">
<input type="submit" name="Submit" value="Aaaand.... ENGAGE!" />
</p></td></tr>
</form>
</table>	
</div>
</div>
</div>
















<div id="grabit" class="gbx-group">
<div class="postbox">
<h3><?php _e('Generate Blog Posts', 'dummy_content'); ?></h3>
<div class="inside">
<table border="0" width="100%">
<form name="dummy-content" method="post" action="<?php echo $_SERVER["REQUEST_URI"]; ?>" enctype="multipart/form-data">
<?php wp_nonce_field('make-dummy-content'); ?>
	<tr><td width="20%"><?php _e('Number of Blog Posts', 'dummy_content'); ?></td><td><input type="text" name="num_pages" size="4"></td></tr>
	<tr><td colspan="2"><p><strong>WARNING: </strong> The nerd in you is tempted to type in a really big number to see what happens. Here's what happens: stuff breaks. The only way to fix it is to go in via an external control panel (like phpMyAdmin) and clear out tables. So do it once, laugh, then fix it and don't do it again.</p></td></tr>

<tr><td><?php _e('Type of Pages', 'dummy_content'); ?></td><td><select name="content_type"><option value="paragraphs">Just Paragraphs</option><option value="paragraph">Just One Paragraph</option><option value="styled">Styled (lists, paragraphs, quotes, etc)</option><option value="grabbag">Grab Bag (mix of everything)</option></select></td></tr>


	<tr><td><?php _e('Post Status', 'dummy_content'); ?></td><td><input type="radio" name="page_status" value="publish" checked>&nbsp;<?php _e('Published', 'dummy_content'); ?><br /><input type="radio" name="page_status" value="draft">&nbsp;<?php _e('Draft', 'dummy_content'); ?></td></tr>

	<tr><td width="20%"><?php _e('Blog Category', 'dummy_content'); ?></td><td> <?php wp_dropdown_categories("show_option_none=None"); ?></td></tr>
	<tr><td width="20%"><?php _e('Chronological Spacing', 'dummy_content'); ?></td><td>
	
	<input type="radio" name="post_spacing" value="none">&nbsp;<?php _e('None (All posts the same)', 'dummy_content'); ?><br />
	<input type="radio" name="post_spacing" value="day">&nbsp;<?php _e('1 Day Apart', 'dummy_content'); ?><br />
	<input type="radio" name="post_spacing" value="week">&nbsp;<?php _e('1 Week Apart', 'dummy_content'); ?><br />
	
	
	</td></tr>


<input type="hidden" name="blogchecker" value="OK">

<tr><td colspan="2"><h4>Custom Fields</h4></td></tr>

<tr><td colspan="2">&nbsp;</td></tr>

<tr><td><?php _e('Name', 'dummy_content'); ?></td>
<td><?php _e('Value', 'dummy_content'); ?></td></tr>

<? for($i = 0; $i < 5;$i++) { ?>
<tr><td><input name="meta_key<? echo $i; ?>" type="text" size="20"></td>
<td><textarea name="meta_value<? echo $i; ?>" cols="40" rows="4"></textarea></td></tr>
<? } ?>
<tr><td colspan="2"><p class="submit">
<input type="submit" name="Submit" value="Aaaand.... ENGAGE!" />
</p></td></tr>
</form>
</table>	
</div>
</div>
</div>






























<div id="grabit" class="gbx-group">
<div class="postbox">
<h3><?php _e('Delete Dummy Content', 'dummy_content'); ?></h3>
<div class="inside">
<p>In one click, you can delete all dummy content (we marked all dummy content with a special attribute).</p>
<p><strong>WARNING:</strong>This will delete any posts or pages created by this plugin, <strong>including pages you may have edited since then.</strong> If you want to prevent a page from being deleted, remove the 'dummy_content_generator'.</p>

<form name="dummy-content-delete" method="post" action="<?php echo $_SERVER["REQUEST_URI"]; ?>" enctype="multipart/form-data">

<p class="submit">
<input type="submit" name="delete" value="OK! Delete them all!" />
</p>
</form>
</div>
</div>

</div>






<div id="grabit" class="gbx-group">
<div class="postbox">
<h3><?php _e('About This Plugin', 'dummy_content'); ?></h3>
<div class="inside">
<p>This plugin is totally free for you to use. Developed by <a href="http://skeevisarts.com">skeevisArts</a>. If you like/hate it that much:</p>
<p><ul>
<li><a href="http://skeevisarts.com" target="_blank">Check out my site.</a></li>
<li><a href="http://twitter.com/skeevis" target="_blank">Follow me on twitter.</a></li>
<li><a href="mailto:zvi@skeevisarts.com" target="_blank">Send me an e-mail.</a></li>
<li>And consider me for your next design/dev project!</li>
</ul>
</p>
<p>Thanks! -Zvi</p>
</div>
</div>

</div>
</div>
</div>
<?php
}
//add the action so the blog knows it's there
add_action('admin_menu', 'add_mass_page');	
?>