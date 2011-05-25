<?php
/*
Plugin Name: Change By Us json feed
Plugin URI: http://changeby.us
Description: Returns top featured posts as json for changeby.us homepage
Version: 1.0
Author: ethan@localprojects.net
*/

function cbuJSONFeed() {
    $output = array();
    
    query_posts('showposts=2&category_name=featured');
    
    while (have_posts()) {
        the_post();
        
        $categories = get_the_category();
        
        $output[] = array('id' => (int) get_the_ID(),
                          'link' => get_permalink(),
                          'title' => get_the_title(),
                          'text' => parseBody(get_the_content()),
                          'datetime' => get_the_time('m.d.Y'));
    }
    
    header('Content-Type: application/json; charset=' . get_option('blog_charset'), true);
    echo json_encode($output);
}

function parseBody($body) {
    $more_tag = '<span id="more';
    
    if (strpos($body, $more_tag) === false) {
        return substr($body, 0, strpos($body, ' ', 100)) . '...';
    } else {
        return substr($body, 0, strpos($body, $more_tag));
    }
}

add_action('do_feed_cbujson', 'cbuJSONFeed');

?>
