<?php
/**
 * Template: Comments.php
 *
 * @package WPFramework
 * @subpackage Template
 */

// Make sure comments.php doesn't get loaded directly
if ( !empty( $_SERVER[ 'SCRIPT_FILENAME' ] ) && 'comments.php' == basename( $_SERVER[ 'SCRIPT_FILENAME' ] ) )
	die ( 'Please do not load this page directly. Thanks!' );

if ( post_password_required() ) { ?>
	<p class="password-protected alert">This post is password protected. Enter the password to view comments.</p>
<?php return; } ?>

<?php if ( have_comments() ) : // If comments exist for this entry, continue ?>
<!--BEGIN #comments-->
<div id="comments">
    
<?php if ( ! empty( $comments_by_type['comment'] ) ) { ?>
	<?php framework_discussion_title( 'comment' ); ?>
    <?php framework_discussion_rss(); ?>
    <!--BEGIN .comment-list-->
    <ol class="comment-list">
		<?php wp_list_comments(array(
        'type' => 'comment',
        'callback' => 'framework_comments_callback',
        'end-callback' => 'framework_comments_endcallback' )); ?>
    <!--END .comment-list-->
    </ol>
<?php } ?>

<?php if ( ! empty( $comments_by_type['pings'] ) ) { ?>
	<?php framework_discussion_title( 'pings' ); ?>
	<!--BEGIN .pings-list-->
    <ol class="pings-list">
		<?php wp_list_comments(array(
        'type' => 'pings',
        'callback' => 'framework_pings_callback',
        'end-callback' => 'framework_pings_endcallback' )); ?>
	<!--END .pings-list-->
    </ol>
<?php } ?>

<!--END #comments-->
</div>
<?php endif; // ( have_comments() ) ?>

<?php if ( comments_open() ) : // show comment form ?>
<!--BEGIN #respond-->
<div id="respond">

    <div class="cancel-comment-reply"><?php cancel_comment_reply_link( 'Cancel Reply' ); ?></div>
    
    <h3 id="leave-a-reply"><?php comment_form_title( 'Leave a Reply', 'Leave a Reply to %s' ); ?></h3> 
    
    <?php if ( get_option( 'comment_registration' ) && !is_user_logged_in() ) : ?>
	<p id="login-req" class="alert">You must be <a href="<?php echo get_option( 'siteurl' ); ?>/wp-login.php?redirect_to=<?php echo urlencode( get_permalink() ); ?>">logged in</a> to post a comment.</p>
    <?php else : ?>
	
    <!--BEGIN #comment-form-->
	<form id="comment-form" method="post" action="<?php echo get_option( 'siteurl' ); ?>/wp-comments-post.php">
		
		<?php if ( is_user_logged_in() ) : global $current_user; // If user is logged-in, then show them their identity ?>

        <p>Logged in as <a href="<?php echo get_option( 'siteurl' ); ?>/wp-admin/profile.php"><?php echo $user_identity; ?></a>. <a href="<?php echo wp_logout_url( get_permalink() ); ?>" title="Log out of this account">Log out &raquo;</a></p>
        
        <!--BEGIN #form-section-author-->
        <div id="form-section-author" class="form-section">
            <input name="author" id="author" type="text" value="<?php echo $current_user->user_nicename; ?>" tabindex="1" <?php if ( $req ) echo "aria-required='true'"; ?> />
            <label for="author"<?php if ( $req ) echo ' class="required"'; ?>>Name</label>
        <!--END #form-section-author-->
        </div>
        
        <!--BEGIN #form-section-email-->
        <div id="form-section-email" class="form-section">
            <input name="email" id="email" type="text" value="<?php echo $current_user->user_email; ?>" tabindex="2" <?php if ( $req ) echo "aria-required='true'"; ?> />
            <label for="email"<?php if ( $req ) echo ' class="required"'; ?>>Email</label>
        <!--END #form-section-email-->
        </div>
		
        <!--BEGIN #form-section-url-->
        <div id="form-section-url" class="form-section">
            <input name="url" id="url" type="text" value="<?php echo $current_user->user_url; ?>" tabindex="3" />
            <label for="url">Website</label>
        <!--END #form-section-url-->
        </div>
		
		<?php else : // If user isn't logged-in, ask them for their details ?>
        
        <!--BEGIN #form-section-author-->
        <div id="form-section-author" class="form-section">
            <input name="author" id="author" type="text" value="<?php echo $comment_author; ?>" tabindex="1" <?php if ( $req ) echo "aria-required='true'"; ?> />
            <label for="author"<?php if ( $req ) echo ' class="required"'; ?>>Name</label>
        <!--END #form-section-author-->
        </div>
        
        <!--BEGIN #form-section-email-->
        <div id="form-section-email" class="form-section">
            <input name="email" id="email" type="text" value="<?php echo $comment_author_email; ?>" tabindex="2" <?php if ( $req ) echo "aria-required='true'"; ?> />
            <label for="email"<?php if ( $req ) echo ' class="required"'; ?>>Email</label>
        <!--END #form-section-email-->
        </div>
		
        <!--BEGIN #form-section-url-->
        <div id="form-section-url" class="form-section">
            <input name="url" id="url" type="text" value="<?php echo $comment_author_url; ?>" tabindex="3" />
            <label for="url">Website</label>
        <!--END #form-section-url-->
        </div>
        
		<?php endif; // if ( is_user_logged_in() ) ?>
		
		<!--BEGIN #form-section-comment-->
        <div id="form-section-comment" class="form-section">
        	<textarea name="comment" id="comment" tabindex="4" rows="10" cols="65"></textarea>
        	<p id="allowed-tags">You can use these <abbr title="HyperText Markup Language">HTML</abbr> tags and attributes: <span class="allowed-tags"><?php echo allowed_tags(); ?></span></p>
        <!--END #form-section-comment-->
        </div>
        
        <!--BEGIN #form-section-actions-->
        <div id="form-section-actions" class="form-section">
			<button name="submit" id="submit" type="submit" tabindex="5">Submit Comment</button>
			<?php comment_id_fields(); ?>
        <!--END #form-section-actions-->
        </div>

	<?php do_action( 'comment_form', $post->ID ); // Available action: comment_form ?>
    <!--END #comment-form-->
    </form>
    
	<?php endif; // If registration required and not logged in ?>
<!--END #respond-->
</div>
<?php endif; // ( comments_open() ) ?>