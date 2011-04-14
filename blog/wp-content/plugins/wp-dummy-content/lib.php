<?php
require_once("content/paragraph.php");
require_once("content/paragraphs.php");
require_once("content/styled.php");
require_once("content/titles.php");



	function create_stuff($form_var)
	{
		$num_pages = if_empty_zero($form_var["num_pages"]);
		$num_sub_pages = if_empty_zero($form_var["num_sub_pages"]);
		$content_type = $form_var["content_type"];
		$parent_id = if_empty_zero($form_var["parent_id"]);
		$page_template = $form_var["page_template"];
		$page_status = $form_var["page_status"];
		$custom_fields = array();
		for($i = 0;$i < 5;$i++)
		{
			if(isset($form_var["meta_key".$i]) && !empty($form_var["meta_key".$i]))
			{
				$custom_fields[$form_var["meta_key".$i]] =$form_var["meta_value".$i];	
			}
		}
		
		//MAIN PAGE CREATION LOOP!!!
		for($x = 0; $x < $num_pages; $x++)
		{
			$content = get_post_content($content_type);
			$title = get_post_title();
			//$result .= "Creating a post titled $title with content $content with parent $parend_id and page template $page_template and post status $page_status and custom field $custom_fields";
			$result_id = insert_page($title,$content,$parent_id,$page_template,$page_status,$custom_fields);
			
			if(is_numeric($result_id))
			{
			for($y = 0; $y < $num_sub_pages; $y++)
			{
			$content = get_post_content($content_type);
			$title = get_post_title();
			//$result .= "Creating a post titled $title with content $content with parent $parend_id and page template $page_template and post status $page_status and custom field $custom_fields";
			$child_id = insert_page($title,$content,$result_id,$page_template,$page_status,$custom_fields);
			
			}
			
			}
			else
			{
			$result .= $result_id;
			}
			
			
			
		}
		if(empty($result))
			$result = "Run Complete";
		return $result;
	}
	
	
	
	function get_post_content($type)
	{
	global $paragraphs;
	global $paragraph;
	global $styled;
	
		$rand = 0;
		if($type == "grabbag")
			$rand = rand(1,3);
		if($type=="paragraphs" || $rand == 1)
		{
			shuffle($paragraphs);
			return $paragraphs[0];
		}
		elseif($type=="paragraph" || $rand == 2)
		{
			shuffle($paragraph);
			return $paragraph[0];
		}
		elseif($type=="styled" || $rand == 3)
		{
			shuffle($styled);
			return $styled[0];
		}
	
	}
	
	function get_post_title()
	{
	global $titles;
		shuffle($titles);
			return $titles[0];
	}
	
	
	
	function insert_page($title,$content,$parent_id,$template_id,$page_status,$custom_fields)
	{
		global $wpdb;
	global $userdata;

		//get user data
	get_currentuserinfo();
	//get url for GUID
	$url = get_bloginfo('url');

	//get next auto increment id
	$guid_query = $wpdb->get_row("SHOW TABLE STATUS like '" . $wpdb->posts . "'");
	$guid = $guid_query->Auto_increment;

	//main query to build on
	$query = 'INSERT INTO ' . $wpdb->posts . ' (post_author, post_date, post_date_gmt, post_content, post_title, post_status, post_name, post_modified, post_modified_gmt, post_type, comment_status, ping_status, post_parent, post_excerpt, guid) VALUES ';
	$template_query = "INSERT INTO " . $wpdb->postmeta . " (meta_key, meta_value, post_id) VALUES ";
	$cat_query = 'INSERT INTO ' . $wpdb->term_relationships . ' (object_ID, term_taxonomy_id, term_order) VALUES ';
	$original_template = $template_query;

	
	$query .= "(";
		$query .= "'" . $userdata->ID . "'"; //post author
		$query .= ", NOW()"; //post published timestamp
		
		$query .= ", '" . get_gmt_from_date(time()) . "'"; 
		$query .= ", '" . mysql_real_escape_string($content) . "'"; //post content
		$query .= ", '" . mysql_real_escape_string($title) . "'"; //post title
		//$query .= ", '" . 0 . "'"; //post category
		$query .= ", '" . $page_status . "'"; //post status
		$query .= ", '" . sanitize_title_with_dashes($title) . "'"; //page name
		$query .= ", NOW()"; //modified timestamps
		$query .= ", '" . get_gmt_from_date(time()) . "'"; 
		$query .= ", 'page'"; //post type
		$query .= ", 'open'"; //comment status
		$query .= ", 'open'"; //ping status
		$query .= ", ".$parent_id; //post parent
		//change page excerpt placeholders
		$query .= ", '" . mysql_real_escape_string(substr(strip_tags($content),0,200)) . "'"; //post excerpt

			$page_id = '/?page_id=';
		$query .= ", '" . $url . $page_id . $guid++ . "'"; //guid form
		$query .= ")";
	
	
	if ($wpdb->query($query)) {

		$insert_id =  $wpdb->insert_id;
		foreach($custom_fields as $key=>$val)
		{
			$cfQuery = $template_query. "('".mysql_real_escape_string($key)."','".mysql_real_escape_string($val)."',".$insert_id.")";
				if (!$wpdb->query($cfQuery)) {
		return "An error occurred: ". mysql_error(); 

					}			
		}
		$templateQuery = $template_query. "('_wp_page_template','".$template_id."',".$insert_id.")";
				if (!$wpdb->query($templateQuery)) {
		return "An error occurred: ". mysql_error(); 

					}
		

$genQuery = $template_query. "('dummy_content_generator','1',".$insert_id.")";
				if (!$wpdb->query($genQuery)) {
		return "An error occurred: ". mysql_error(); 

					}
		


		
		return $insert_id;
		
		
	}
	else
	{
		return "An error occurred: ". mysql_error(); 
		}
	
	}
	
	
	function delete_stuff()
{
		global $wpdb;
					if (!$wpdb->query("DELETE FROM ".$wpdb->posts." WHERE ID IN (SELECT post_id FROM ".$wpdb->postmeta." WHERE meta_key='dummy_content_generator')" )) {
		return "An error occurred: ". mysql_error(); 

					}
					
					if (!$wpdb->query("DELETE FROM ".$wpdb->postmeta." WHERE meta_key='dummy_content_generator'" )) {
		return "An error occurred clearing out the postmeta table: ". mysql_error(); 

					}
					
		return "Pages Deleted.";


}

	
	
	function if_empty_zero($val)
	{
		$val = trim($val);
		if($val == "" || empty($val))
			return 0;
		return $val;
	}
	
	
	
	
	
	
	
	
	

	function create_blog_stuff($form_var)
	{
		$num_pages = if_empty_zero($form_var["num_pages"]);
		$content_type = $form_var["content_type"];
		$cat_id = $form_var["cat"];
		$spacing = $form_var["post_spacing"];

		$page_status = $form_var["page_status"];
		$custom_fields = array();
		for($i = 0;$i < 5;$i++)
		{
			if(isset($form_var["meta_key".$i]) && !empty($form_var["meta_key".$i]))
			{
				$custom_fields[$form_var["meta_key".$i]] =$form_var["meta_value".$i];	
			}
		}
		
		$date = strtotime("now");
		
		//MAIN PAGE CREATION LOOP!!!
		for($x = 0; $x < $num_pages; $x++)
		{
			$content = get_post_content($content_type);
			$title = get_post_title();
		
		
			if($x>0)
			{
				if($spacing =="day" || $spacing=="week")
					$date = strtotime($x." ".$spacing."s ago");
				
			}
			
			$result_id = insert_post($title,$content,$cat_id,$date,$page_status,$custom_fields);
				
			if(!is_numeric($result_id))
				$result .= $result_id;	
					
		}
		if(empty($result))
			$result = "Run Complete";
		return $result;
	}
	

	
	
	
	
	
	function insert_post($title,$content,$cat_id,$date,$page_status,$custom_fields)
	{
	
		global $wpdb;
	global $userdata;

		//get user data
	get_currentuserinfo();
	//get url for GUID
	$url = get_bloginfo('url');

	//get next auto increment id
	$guid_query = $wpdb->get_row("SHOW TABLE STATUS like '" . $wpdb->posts . "'");
	$guid = $guid_query->Auto_increment;

	//main query to build on
	$query = 'INSERT INTO ' . $wpdb->posts . ' (post_author, post_date, post_date_gmt, post_content, post_title, post_status, post_name, post_modified, post_modified_gmt, post_type, comment_status, ping_status, post_parent, post_excerpt, guid) VALUES ';
	$template_query = "INSERT INTO " . $wpdb->postmeta . " (meta_key, meta_value, post_id) VALUES ";
	$cat_query = 'INSERT INTO ' . $wpdb->term_relationships . ' (object_ID, term_taxonomy_id, term_order) VALUES ';
	$original_template = $template_query;

	
	$query .= "(";
		$query .= "'" . $userdata->ID . "'"; //post author
		$query .= ", FROM_UNIXTIME('".$date."')"; //post published timestamp
		
		$query .= ", '" . get_gmt_from_date($date) . "'"; 
		$query .= ", '" . mysql_real_escape_string($content) . "'"; //post content
		$query .= ", '" . mysql_real_escape_string($title) . "'"; //post title
		//$query .= ", '" . 0 . "'"; //post category
		$query .= ", '" . $page_status . "'"; //post status
		$query .= ", '" . sanitize_title_with_dashes($title) . "'"; //page name
		$query .= ", FROM_UNIXTIME(".$date.")"; //modified timestamps
		$query .= ", '" . get_gmt_from_date($date) . "'"; 
		$query .= ", 'post'"; //post type
		$query .= ", 'open'"; //comment status
		$query .= ", 'open'"; //ping status
		$query .= ", 0"; //post parent
		//change page excerpt placeholders
		$query .= ", '" . mysql_real_escape_string(substr(strip_tags($content),0,200)) . "'"; //post excerpt

			$page_id = '/?post_id=';
		$query .= ", '" . $url . $page_id . $guid++ . "'"; //guid form
		$query .= ")";
	
	
	if ($wpdb->query($query)) {

		$insert_id =  $wpdb->insert_id;
		foreach($custom_fields as $key=>$val)
		{
			$cfQuery = $template_query. "('".mysql_real_escape_string($key)."','".mysql_real_escape_string($val)."',".$insert_id.")";
				if (!$wpdb->query($cfQuery)) {
		return "An error occurred: ". mysql_error(); 

					}			
		}
		$templateQuery = $template_query. "('_wp_page_template','".$template_id."',".$insert_id.")";
				if (!$wpdb->query($templateQuery)) {
		return "An error occurred: ". mysql_error(); 

					}
		

$genQuery = $template_query. "('dummy_content_generator','1',".$insert_id.")";
				if (!$wpdb->query($genQuery)) {
		return "An error occurred: ". mysql_error(); 

					}
		

if($cat_id != "-1"){
$catQuery = $cat_query. "('".$insert_id."','".$cat_id."',0)";
				if (!$wpdb->query($catQuery)) {
		return "An error occurred: ". mysql_error(); 

					}
		}

		
		return $insert_id;
		
		
	}
	else
	{
		return "An error occurred: ". mysql_error(); 
		}

	
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	