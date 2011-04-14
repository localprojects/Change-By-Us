<?php
/*
Plugin Name: Admin Bar Disabler
Plugin URI: http://scottkclark.com/wordpress/admin-bar-disabler/
Description: Disable the WP Admin Bar in 3.1+ entirely, or only for roles and capabilities which aren't in the 'whitelist' or 'blacklist'.
Version: 1.0.1
Author: Scott Kingsley Clark
Author URI: http://scottkclark.com/
*/

add_action('init','admin_bar_disabler_network_disable',8);
add_action('init','admin_bar_disabler_disable',9);

function admin_bar_disabler_network_activated ()
{
    if(!function_exists('is_plugin_active_for_network'))
    {
        $plugins = get_site_option( 'active_sitewide_plugins');
        if(isset($plugins[plugin_basename(__FILE__)]))
        {
            return true;
        }
        return false;
    }
    return is_plugin_active_for_network(plugin_basename(__FILE__));
}
function admin_bar_disabler_network_disable ()
{
    if(is_multisite()&&admin_bar_disabler_network_activated())
    {
        $disable = false;
        $disable_all = get_site_option('admin_bar_disabler_disable_all');
        if(1==$disable_all)
            $disable = true;
        $whitelist_roles = get_site_option('admin_bar_disabler_whitelist_roles');
        if(false===$disable&&!empty($whitelist_roles))
        {
            $disable = true;
            if(!is_array($whitelist_roles))
            {
                $whitelist_roles = array($whitelist_roles);
            }
            foreach($whitelist_roles as $role)
            {
                if(current_user_can($role))
                    return;
            }
        }
        $whitelist_caps = get_site_option('admin_bar_disabler_whitelist_caps');
        $whitelist_caps = explode(',',$whitelist_caps);
        if(false===$disable&&!empty($whitelist_caps))
        {
            $disable = true;
            foreach($whitelist_caps as $cap)
            {
                if(current_user_can($cap))
                    return;
            }
        }
        $blacklist_roles = get_site_option('admin_bar_disabler_blacklist_roles');
        if(false===$disable&&!empty($blacklist_roles))
        {
            if(!is_array($blacklist_roles))
            {
                $blacklist_roles = array($blacklist_roles);
            }
            foreach($blacklist_roles as $role)
            {
                if(!current_user_can($role))
                    $disable = true;
            }
        }
        $blacklist_caps = get_site_option('admin_bar_disabler_blacklist_caps');
        $blacklist_caps = explode(',',$blacklist_caps);
        if(false===$disable&&!empty($blacklist_caps))
        {
            foreach($blacklist_caps as $cap)
            {
                if(!current_user_can($cap))
                    $disable = true;
            }
        }
        if(false!==$disable)
        {
            add_filter('show_admin_bar','__return_false');
            add_action('admin_head','admin_bar_disabler_hide');
            remove_action('personal_options','_admin_bar_preferences');
        }
    }
}
function admin_bar_disabler_disable ()
{
    $disable = false;
    $disable_all = get_option('admin_bar_disabler_disable_all');
    if(1==$disable_all)
        $disable = true;
    $whitelist_roles = get_option('admin_bar_disabler_whitelist_roles');
    if(false===$disable&&!empty($whitelist_roles))
    {
        $disable = true;
        if(!is_array($whitelist_roles))
        {
            $whitelist_roles = array($whitelist_roles);
        }
        foreach($whitelist_roles as $role)
        {
            if(current_user_can($role))
                return;
        }
    }
    $whitelist_caps = get_option('admin_bar_disabler_whitelist_caps');
    $whitelist_caps = explode(',',$whitelist_caps);
    if(false===$disable&&!empty($whitelist_caps))
    {
        $disable = true;
        foreach($whitelist_caps as $cap)
        {
            if(current_user_can($cap))
                return;
        }
    }
    $blacklist_roles = get_option('admin_bar_disabler_blacklist_roles');
    if(false===$disable&&!empty($blacklist_roles))
    {
        if(!is_array($blacklist_roles))
        {
            $blacklist_roles = array($blacklist_roles);
        }
        foreach($blacklist_roles as $role)
        {
            if(!current_user_can($role))
                $disable = true;
        }
    }
    $blacklist_caps = get_option('admin_bar_disabler_blacklist_caps');
    $blacklist_caps = explode(',',$blacklist_caps);
    if(false===$disable&&!empty($blacklist_caps))
    {
        foreach($blacklist_caps as $cap)
        {
            if(!current_user_can($cap))
                $disable = true;
        }
    }
    if(false!==$disable)
    {
        add_filter('show_admin_bar','__return_false');
        add_action('admin_head','admin_bar_disabler_hide');
        remove_action('personal_options','_admin_bar_preferences');
    }
}
function admin_bar_disabler_hide ()
{
?><style type="text/css">.show-admin-bar { display: none; }</style><?php
}

add_action('admin_menu', 'admin_bar_disabler_create_menu');
function admin_bar_disabler_create_menu ()
{
    add_options_page('Admin Bar Disabler','Admin Bar Disabler','administrator',__FILE__,'admin_bar_disabler_settings_page');
    add_action('admin_init','admin_bar_disabler_register_settings');
}
add_action('network_admin_menu', 'admin_bar_disabler_create_network_menu');
function admin_bar_disabler_create_network_menu ()
{
    if(is_multisite()&&admin_bar_disabler_network_activated())
    {
        add_submenu_page('settings.php','Admin Bar Disabler','Admin Bar Disabler','administrator',__FILE__,'admin_bar_disabler_network_settings_page');
        add_action('network_admin_edit_admin_bar_disabler','admin_bar_disabler_network_settings_save');
    }
}
function admin_bar_disabler_register_settings ()
{
    register_setting('admin-bar-disabler-settings-group','admin_bar_disabler_disable_all');
    register_setting('admin-bar-disabler-settings-group','admin_bar_disabler_whitelist_roles');
    register_setting('admin-bar-disabler-settings-group','admin_bar_disabler_whitelist_caps');
    register_setting('admin-bar-disabler-settings-group','admin_bar_disabler_blacklist_roles');
    register_setting('admin-bar-disabler-settings-group','admin_bar_disabler_blacklist_caps');
}
function admin_bar_disabler_network_settings_save ()
{
    $fields = array('admin_bar_disabler_disable_all',
                    'admin_bar_disabler_whitelist_roles',
                    'admin_bar_disabler_whitelist_caps',
                    'admin_bar_disabler_blacklist_roles',
                    'admin_bar_disabler_blacklist_caps');
    foreach($fields as $field)
    {
        if(isset($_POST[$field])&&!empty($_POST[$field]))
        {
            update_site_option($field,$_POST[$field]);
        }
        else
        {
            delete_site_option($field);
        }
    }
    wp_redirect('settings.php?page='.$_POST['page'].'&updated=true');
    die();
}
function admin_bar_disabler_network_settings_page ()
{
    global $wp_roles;
    if(!isset($wp_roles))
    {
        $wp_roles = new WP_Roles();
    }
    $roles = $wp_roles->get_names();
    if(isset($_GET['updated']))
    {
?>
<div id="message" class="updated"><p><?php _e( 'Options saved.' ) ?></p></div>
<?php
    }
?>
<div class="wrap">
    <h2>Admin Bar Disabler</h2>
    <form method="post" action="edit.php?action=admin_bar_disabler">
        <?php wp_nonce_field('admin_bar_disabler'); ?>
        <input type="hidden" name="page" value="<?php echo esc_attr($_GET['page']); ?>" />
        <table class="form-table">
            <tr valign="top">
                <th scope="row">Disable for Everyone?</th>
                <td><input type="checkbox" name="admin_bar_disabler_disable_all" value="1"<?php echo (1==get_site_option('admin_bar_disabler_disable_all')?' CHECKED':''); ?> /></td>
            </tr>
            <tr valign="top">
                <th scope="row">Roles Whitelist</th>
                <td>
                    <select name="admin_bar_disabler_whitelist_roles[]" size="10" style="height:auto;" MULTIPLE>
        <?php
        $whitelist_roles = get_site_option('admin_bar_disabler_whitelist_roles');
        if(!is_array($whitelist_roles))
        {
            $whitelist_roles = array($whitelist_roles);
        }
        foreach($roles as $role=>$name)
        {
?>
                        <option value="<?php echo esc_attr($role); ?>"<?php echo (in_array($role,$whitelist_roles)?' SELECTED':''); ?>><?php echo $name; ?></option>
<?php
        }
        ?>
                    </select>
                    <br /><em>ONLY show the Admin Bar for Users with these Role(s) - CTRL + Click for multiple selections</em>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">Capabilities Whitelist<br />(comma-separated)</th>
                <td>
                    <input type="text" name="admin_bar_disabler_whitelist_caps" value="<?php echo get_site_option('admin_bar_disabler_whitelist_caps'); ?>" />
                    <br /><em>ONLY show the Admin Bar for Users with these Capabilies</em>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">Roles Blacklist</th>
                <td>
                    <select name="admin_bar_disabler_blacklist_roles[]" size="10" style="height:auto;" MULTIPLE>
        <?php
        $blacklist_roles = get_site_option('admin_bar_disabler_blacklist_roles');
        if(!is_array($blacklist_roles))
        {
            $blacklist_roles = array($blacklist_roles);
        }
        foreach($roles as $role=>$name)
        {
?>
                        <option value="<?php echo esc_attr($role); ?>"<?php echo (in_array($role,$blacklist_roles)?' SELECTED':''); ?>><?php echo $name; ?></option>
<?php
        }
        ?>
                    </select>
                    <br /><em>DON'T show the Admin Bar for Users with these Role(s) - CTRL + Click for multiple selections</em>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">Capabilities Blacklist<br />(comma-separated)</th>
                <td>
                    <input type="text" name="admin_bar_disabler_blacklist_caps" value="<?php echo get_site_option('admin_bar_disabler_blacklist_caps'); ?>" />
                    <br /><em>DON'T show the Admin Bar for Users with these Capabilies</em>
                </td>
            </tr>
        </table>
        <p class="submit">
            <input type="submit" class="button-primary" value="<?php _e('Save Changes') ?>" />&nbsp;&nbsp;<small><strong>Don't use Blacklist in combination with Whitelist, in all cases Whitelist overrides Blacklist</strong></small>
        </p>
    </form>
</div>
<?php
}
function admin_bar_disabler_settings_page ()
{
    global $wp_roles;
    if (!isset($wp_roles))
    {
        $wp_roles = new WP_Roles();
    }
    $roles = $wp_roles->get_names();
    if(isset($_GET['settings-updated']))
    {
?>
<div id="message" class="updated"><p><?php _e( 'Options saved.' ) ?></p></div>
<?php
    }
?>
<div class="wrap">
    <h2>Admin Bar Disabler</h2>
    <form method="post" action="options.php">
        <?php settings_fields('admin-bar-disabler-settings-group'); ?>
        <?php do_settings_sections('admin-bar-disabler-settings-group'); ?>
        <table class="form-table">
            <tr valign="top">
            <tr valign="top">
                <th scope="row">Disable for Everyone?</th>
                <td><input type="checkbox" name="admin_bar_disabler_disable_all" value="1"<?php echo (1==get_option('admin_bar_disabler_disable_all')?' CHECKED':''); ?> /></td>
            </tr>
                <th scope="row">Roles Whitelist</th>
                <td>
                    <select name="admin_bar_disabler_whitelist_roles[]" size="10" style="height:auto;" MULTIPLE>
        <?php
        $whitelist_roles = get_option('admin_bar_disabler_whitelist_roles');
        if(!is_array($whitelist_roles))
        {
            $whitelist_roles = array($whitelist_roles);
        }
        foreach($roles as $role=>$name)
        {
?>
                        <option value="<?php echo esc_attr($role); ?>"<?php echo (in_array($role,$whitelist_roles)?' SELECTED':''); ?>><?php echo $name; ?></option>
<?php
        }
        ?>
                    </select>
                    <br /><em>ONLY show the Admin Bar for Users with these Role(s) - CTRL + Click for multiple selections</em>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">Capabilities Whitelist<br />(comma-separated)</th>
                <td>
                    <input type="text" name="admin_bar_disabler_whitelist_caps" value="<?php echo get_option('admin_bar_disabler_whitelist_caps'); ?>" />
                    <br /><em>ONLY show the Admin Bar for Users with these Capabilies</em>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">Roles Blacklist</th>
                <td>
                    <select name="admin_bar_disabler_blacklist_roles[]" size="10" style="height:auto;" MULTIPLE>
        <?php
        $blacklist_roles = get_option('admin_bar_disabler_blacklist_roles');
        if(!is_array($blacklist_roles))
        {
            $blacklist_roles = array($blacklist_roles);
        }
        foreach($roles as $role=>$name)
        {
?>
                        <option value="<?php echo esc_attr($role); ?>"<?php echo (in_array($role,$blacklist_roles)?' SELECTED':''); ?>><?php echo $name; ?></option>
<?php
        }
        ?>
                    </select>
                    <br /><em>DON'T show the Admin Bar for Users with these Role(s) - CTRL + Click for multiple selections</em>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">Capabilities Blacklist<br />(comma-separated)</th>
                <td>
                    <input type="text" name="admin_bar_disabler_blacklist_caps" value="<?php echo get_option('admin_bar_disabler_blacklist_caps'); ?>" />
                    <br /><em>DON'T show the Admin Bar for Users with these Capabilies</em>
                </td>
            </tr>
        </table>
        <p class="submit">
            <input type="submit" class="button-primary" value="<?php _e('Save Changes') ?>" />&nbsp;&nbsp;<small><strong>Don't use Blacklist in combination with Whitelist, in all cases Whitelist overrides Blacklist</strong></small>
        </p>
    </form>
</div>
<?php
}