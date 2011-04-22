<?php
/*
Plugin Name: Custom Admin Branding
Plugin URI: http://redlettersstudio.com/blog/2008/01/24/wordpress-custom-admin-branding/
Description: Allows you to brand your WordPress install for clients.  Display custom images and styles for the login screen, admin header and footer.
Author: Josh Byers
Version: 3.0.3
Author URI: http://redlettersstudio.com
*/ 


add_action('admin_menu', 'custom_admin_branding_add_pages');
add_action('admin_init', 'admin_branding_options_init' );

/*********************************************
 Init plugin options to white list our options
*********************************************/

function admin_branding_options_init(){
	register_setting( 'admin_branding_options', 'custom_admin_branding_link' );	
}

/*********************************************
 Add Menu Page
*********************************************/
function custom_admin_branding_add_pages() {

	$custombranding_admin = add_options_page('Custom Admin Branding', 'Custom Admin Branding', 8, 'brandingoptions', 'admin_branding_options_page');

/*********************************************
 Add settings link on plugin page
*********************************************/

function your_plugin_settings_link($links) { 
  $settings_link = '<a href="options-general.php?page=brandingoptions">Settings</a>'; 
  array_unshift($links, $settings_link); 
  return $links; 
}
 
$plugin = plugin_basename(__FILE__); 
add_filter("plugin_action_links_$plugin", 'your_plugin_settings_link' );



/*********************************************
 Add help instructions for WordPress sliding help menu
*********************************************/	

$admin_branding_help = "
<style>
h6 {
	font-size:0.85em;
	border-bottom:1px solid #d1d1d1;
	padding-bottom:3px;
	margin:2.33em 0 10px;}

ul.help_list {
	margin-top:10px;}
	
ul.help_list li {
	list-style-type:disc;
	margin-left:20px;}
</style>

<p>Well, you obviously have the plugin activated so thats out of the way.  Now on to the customization of your WordPress Admin.</p>
<p>Nearly every visual feature in the login screen, header section, and footer section can be modified to fit your custom color and image scheme.</p>

<h6>Changing Colors</h6>
<p>The options that support color change have a swatch next to the form field.  You can either click the color swatch or click into the form field.  Doing so will bring up a palette of color options.  You are not restricted by the choices in the palette.  You can enter any 6 figure hexidecimal color code.  You must however precede your code with the pound sign (#).</p>

<h6>Customizing Images</h6>
There are four images that you can customize:
<ul class='help_list'>
	<li>Login Form Background</li>
	<li>Login Form Login Button Background</li>
	<li>Admin Header Logo</li>
	<li>Footer Logo</li>
</ul>

<p>All of the default images are in the images folder which is in the custom-admin-branding plugin folder.
To change an image:</p>
<ol>
	<li>Create your custom images with the provided Photoshop templates. (They are in the psd_image_templates folder)</li>
	<li>Upload your custom image(s) with the built in WordPress uploader.</li>
	<li>After your image is uploaded click the insert in post button or copy and paste the file url in image field</li>
	<li>Click the save changes button at the bottom of options page and you will see your changes immediately.</li>
</ol>


<p>Please note that the optimal size for the header logo is 32px by 32px.  You may have an image longer than 32px but not higher as it will break the layout.  If your image is longer than 32px please enter the width of the image in the supplied field.</p>


<h6>Changing the Admin Footer Content</h6>
<p>The custom footer is designed for you to put your logo and some helpful information for your client.  The optimal image size is 32px by 32px.</p>

<p>The footer text field will accept all text and most html.  I use this area to point a link back to my site or a support page for my clients.</p>

<h6>Custom CSS</h6>
<p>A new feature is the ability to add your own custom css.  This field can be used to change any css rule present in the admin.  These will not apply to the login page however.</p>
"
;
add_contextual_help($custombranding_admin, $admin_branding_help);
}

/*********************************************
 Ensure, that the needed javascripts and styles been loaded to allow drag/drop, expand/collapse and hide/show of boxes
*********************************************/	

function on_load_page() {
		wp_enqueue_script('common');
		wp_enqueue_script('wp-lists');
		wp_enqueue_script('postbox');
		wp_enqueue_script('media-upload');
		wp_enqueue_script('thickbox');
		wp_enqueue_style('thickbox');
}

/*********************************************
 Default options to be loaded on plugin activation
*********************************************/	

function admin_branding_options_page() {
$options = get_option('custom_admin_branding_link');
	$options['footer_text'] = 'Custom Admin Branding plugin developed by <a href="http://redlettersstudio.com">Red Letters Studio</a>';  
	$options['login_button_color'] = '#21759B';
	$options['login_logo'] = '../../wp-content/plugins/custom-admin-branding/images/login-logo.png';
	$options['login_button_background'] = '../../wp-content/plugins/custom-admin-branding/images/button-grad.png';
	$options['admin_header_logo'] = '../../wp-content/plugins/custom-admin-branding/images/header-logo.png';
	$options['admin_footer_logo'] = '../../wp-content/plugins/custom-admin-branding/images/footer-logo.png';
	$options['login_border_color'] = '#298CBA';
	$options['login_border_hover_color'] = '#13455b';
	$options['login_text_color'] = '#FFFFFF';
	$options['admin_header_logo_width'] = '32px';
	$options['lost_password_color'] = '#21759B';
	$options['lost_password_hover_color'] = '#D54E21';
	$options['custom_css'] = '.sample {color:#000;}';
	add_option( 'custom_admin_branding_link', $options );
 ?>
 
<style >
#ColorPickerDiv {
    display: block;
    display: none;
    position: relative;
    border: 1px solid #777;
    background: #fff}
#ColorPickerDiv TD.color {
	cursor: pointer;
	font-size: xx-small;
	font-family: 'Arial' , 'Microsoft Sans Serif';}
#ColorPickerDiv TD.color label{
	cursor: pointer;}
.ColorPickerDivSample {
	margin: 0px 0px 0px 4px;
	border: solid 1px #000;
	padding: 0px 10px;	
	position: relative;
	cursor: pointer;}
input.wide {
	width:308px;}
</style>
<script type="text/javascript" src="<?php echo $site_url; ?>/wp-content/plugins/custom-admin-branding/js/ColorPicker.js"></script>
<script type="text/javascript">
jQuery(function($) {
   $(".vtrColorPicker").attachColorPicker();
});
</script>





<script type="text/javascript">
jQuery(document).ready(function() {

jQuery('#upload_login_logo_button').click(function() {
 formfield = jQuery('#upload_login_logo').attr('name');
 window.send_to_editor = window.send_to_editor_clone;
 tb_show('', 'media-upload.php?type=image&amp;TB_iframe=true');
 return false;
});

window.send_to_editor_clone = function(html) {
 imgurl = jQuery('img',html).attr('src');
 jQuery('#upload_login_logo').val(imgurl);
 tb_remove();
} 

jQuery('#upload_admin_logo_button').click(function() {
 formfield = jQuery('#upload_admin_logo').attr('name');
 window.send_to_editor = window.send_to_editor_cloneb;
 tb_show('', 'media-upload.php?type=image&amp;TB_iframe=true');
 return false;
});

window.send_to_editor_cloneb = function(html) {
 imgurl = jQuery('img',html).attr('src');
 jQuery('#upload_admin_logo').val(imgurl);
 tb_remove();
}

jQuery('#upload_footer_logo_button').click(function() {
 formfield = jQuery('#upload_footer_logo').attr('name');
 window.send_to_editor = window.send_to_editor_clonec;
 tb_show('', 'media-upload.php?type=image&amp;TB_iframe=true');
 return false;
});

window.send_to_editor_clonec = function(html) {
 imgurl = jQuery('img',html).attr('src');
 jQuery('#upload_footer_logo').val(imgurl);
 tb_remove();
} 

jQuery('#upload_login_button_background_button').click(function() {
 formfield = jQuery('#upload_login_button_background').attr('name');
 window.send_to_editor = window.send_to_editor_cloned;
 tb_show('', 'media-upload.php?type=image&amp;TB_iframe=true');
 return false;
});

window.send_to_editor_cloned = function(html) {
 imgurl = jQuery('img',html).attr('src');
 jQuery('#upload_login_button_background').val(imgurl);
 tb_remove();
} 



});


</script>

<div id="howto-metaboxes-general" class="wrap">
	<?php screen_icon('options-general'); ?>
    <h2>Custom Admin Branding Options</h2>
	<div class="left_side" style="width:540px;float:left;margin-right:20px;">
		<div class="metabox-holder" >       
        	<div class="postbox">
            	<h3 class="hndle"><span>Login Screen Options</span></h3>
            	<div class="inside">
                	<form method="post" action="options.php">
                	<?php settings_fields('admin_branding_options');?>
                	<?php $options = get_option('custom_admin_branding_link');?>
                	<? $site_url = get_settings('siteurl'); ?>
                	<table class="form-table">                   
	                    <tr valign="top">
	                        <th scope="row">Login Logo</th>
	                            <td><input type="text" style="width:238px;" class="wide" id="upload_login_logo" name="custom_admin_branding_link[login_logo]" value="<?php echo $options['login_logo']; ?>" /><input id="upload_login_logo_button" type="button" value="Upload" /><br />Enter a full url or upload an image.
	                            </td>
	                    </tr>
                    	
	                    <tr valign="top">
	                        <th scope="row">Login Button Background</th>
	                            <td><input type="text" style="width:238px;" class="wide" id="upload_login_button_background" name="custom_admin_branding_link[login_button_background]" value="<?php echo $options['login_button_background']; ?>" /><input id="upload_login_button_background_button" type="button" value="Upload" /><br />Enter a full url or upload an image.
	                            </td>
	                    </tr>
	                    <tr valign="top">
	                        <th scope="row">Login Button Border Color</th>
	                            <td><input type="text" class="vtrColorPicker" name="custom_admin_branding_link[login_button_color]" value="<?php echo $options['login_button_color']; ?>" />
	                            </td>
	                    </tr>
	                    <tr valign="top">
	                        <th scope="row">Login Button Hover Color</th>
	                            <td><input type="text" class="vtrColorPicker" name="custom_admin_branding_link[login_border_hover_color]" value="<?php echo $options['login_border_hover_color']; ?>" />
	                            </td>
	                    </tr>
	                    <tr valign="top">
	                        <th scope="row">Login Button Text Color</th>
	                            <td><input type="text" class="vtrColorPicker" name="custom_admin_branding_link[login_text_color]" value="<?php echo $options['login_text_color']; ?>" />
	                            </td>
	                    </tr>
	                    <tr valign="top">
	                        <th scope="row">Lost Your Password Link</th>       
	                            <td>Link Color:<br /><input type="text" class="vtrColorPicker" name="custom_admin_branding_link[lost_password_color]" value="<?php echo $options['lost_password_color']; ?>" /><br />Hover Color:<br /><input type="text" class="vtrColorPicker" name="custom_admin_branding_link[lost_password_hover_color]" value="<?php echo $options['lost_password_hover_color']; ?>" /></td>
	                    </tr>
                	</table>
           		</div><!-- end .inside -->
        	</div><!-- end .postbox -->        
     	</div><!-- end .metabox-holder -->
     
	    <div class="metabox-holder">       
	    	<div class="postbox">
	        	<h3 class="hndle"><span>Admin Header Options</span></h3>
	            <div class="inside">
	            	<table class="form-table">
	                	<tr valign="top">
	                    	<th style="width:187px;" scope="row">Admin Header Logo</th>
	                        	<td><input type="text" style="width:251px;" class="wide" id="upload_admin_logo" name="custom_admin_branding_link[admin_header_logo]" value="<?php echo $options['admin_header_logo']; ?>" /><input id="upload_admin_logo_button" type="button" value="Upload" /><br />Enter a full url or upload an image.</td>
	                    </tr>
	                    <tr valign="top">
	                        <th style="width:187px;" scope="row">Admin Header Logo Width</th>
	                            <td><input type="text" style="width:251px;" class="wide" name="custom_admin_branding_link[admin_header_logo_width]" value="<?php echo $options['admin_header_logo_width']; ?>" /><br />Enter the width of the logo in pixels.</td>
	                    </tr>
	            	</table>
	            </div><!-- end .inside --> 
	        </div><!-- end .postbox -->       
		</div><!-- end .metabox-holder -->
     
		<div class="metabox-holder">       
			<div class="postbox">
			    <h3 class="hndle"><span>Admin Footer Options</span></h3>
			    <div class="inside">
			        <table class="form-table">
			            <tr valign="top">
			                <th scope="row">Admin Footer Logo</th>
			                    <td><input type="text" style="width:251px;" class="wide" id="upload_footer_logo" name="custom_admin_branding_link[admin_footer_logo]" value="<?php echo $options['admin_footer_logo']; ?>" /><input id="upload_footer_logo_button" type="button" value="Upload" /><br />Enter a full url or upload an image.
			                    </td>
			            </tr>
			            <tr valign="top">
			                <th scope="row">Footer Text</th>
			                    <td><textarea style="width:308px;" rows="5" name="custom_admin_branding_link[footer_text]" class="wide" /><?php echo stripslashes($options['footer_text']); ?></textarea>
								</td>
			            </tr>
			    	</table>
			    </div><!-- end .inside -->
			</div><!-- end .postbox -->       
		</div><!-- end .metabox-holder -->
     
		<p class="submit">
			<input type="submit" class="button-primary" value="<?php _e('Save Changes') ?>" />
		</p>
	</div><!-- end .left_side -->
	
	<div class="right_side" style="float:left;width:362px;">	
		<div class="metabox-holder">       
	        <div class="postbox">
	            <h3 class="hndle"><span>Custom CSS</span></h3>
	            <div class="inside">
	                <table class="form-table">
		                <tr valign="top">
		                        <td><textarea style="width:338px;height:297px;" name="custom_admin_branding_link[custom_css]" class="wide" /><?php echo stripslashes($options['custom_css']); ?></textarea><br />If you want to override or add to any of the styles in the WordPress admin enter your own custom css here.
								</td>
		                </tr>
	            	</table>
	            </div><!-- end .inside -->
			</div><!-- end .postbox -->
		</div><!-- end .metabox-holder -->
		</form>
		<div class="metabox-holder">       
	        <div class="postbox">
	            <h3 class="hndle"><span>Please Donate</span></h3>
	            <div class="inside" style="padding:10px;">
	            	<p>If you have found this plugin useful please consider donating to keep the development and support current.  Thanks.
						<form action="https://www.paypal.com/cgi-bin/webscr" method="post">
							<input type="hidden" name="cmd" value="_s-xclick">
							<input type="hidden" name="hosted_button_id" value="BFBKDBDT457TU">
							<input type="image" src="https://www.paypal.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
							<img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">
						</form>
					</p>
				</div><!-- end .inside -->
			</div><!-- end .postbox -->
		</div><!-- end .metabox-holder -->
	</div><!-- end .right_side -->
</div><!-- end #howto-metaboxes-general -->

<?php
 
}

/*This is the function that displays the custom login screen.*/
function custom_admin_branding_login() {
$options = get_option('custom_admin_branding_link');
	$login_logo = $options['login_logo'];
	$login_button_color = $options['login_button_color'];
	$login_button_background = $options['login_button_background'];
	$login_border_color = $options['login_border_color'];
	$login_border_hover_color = $options['login_border_hover_color'];
	$login_text_color = $options['login_text_color'];
	$lost_password_color = $options['lost_password_color'];
	$lost_password_hover_color = $options['lost_password_hover_color'];
echo '
<style>
/* Diplays the custom graphics for the login screen*/

.login h1 a { 
	background: url(' . $login_logo . ') center top no-repeat;
}

input.button-primary {
	background:'.$login_button_color.' url('.$login_button_background.' ) repeat-x scroll left top;
	color:'.$login_text_color.' !important;
}

p.submit input:hover {
	border-color:'.$login_border_hover_color.';
}

.login #nav a {
	color:'.$lost_password_color.' !important;
}
	
.login #nav a:hover {
	color:'.$lost_password_hover_color.' !important;
}

</style>
	';
}

add_action('login_head', 'custom_admin_branding_login');

/*This function places the custom header graphic at the top of every WordPress Admin page.*/
function custom_admin_branding_header() {
$options = get_option('custom_admin_branding_link');
	$admin_header_logo = $options['admin_header_logo'];
	$admin_header_logo_width = $options['admin_header_logo_width'];	
	$custom_css = $options['custom_css'];
echo '
<style>

#header-logo { 
	background-image: url('.$admin_header_logo.'); 
	width: '.$admin_header_logo_width.';
	height: 32px;
}

'.$custom_css.'
	
</style>
';

}

add_action('admin_head', 'custom_admin_branding_header', 11);

/*This function places the custom footer at the bottom of every WordPress Admin page.  Change the file in the images folder to replace.  You will also want to change the link (in the code below) that the footer image is pointing to.*/

add_filter( 'admin_footer_text', 'custom_admin_branding_footer_text' );

function custom_admin_branding_footer_text($default_text)  {
	$options = get_option('custom_admin_branding_link');
	$footer_text = $options["footer_text"];
	$admin_footer_logo = $options['admin_footer_logo'];
	echo '<span>';
	echo '<img style="vertical-align:middle;padding-right:10px" src="'. $admin_footer_logo . '">';
	echo $footer_text;
	echo '</span>';
}

?>