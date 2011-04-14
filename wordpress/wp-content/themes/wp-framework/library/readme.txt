# WP Framework - Library #

This readme.txt will explain to you WP Framework's basic directory structure. Understanding this, will bring you great power.

About this file
---------------
The idea around WP Framework's directory structure is organization, modularization, and good naming techniques.
When you download WP Framework, you're probably wondering how the directory structure works. Explained below,
is how WP Framework's directory works and how you can use it to your advantage.

wpframework/
The root directory of WP Framework includes all the standard WordPress theme templates.

	/library/
	The /library/'s purpose is to centralized all WP Framework's media into one organized folder.
	WP Framework's files also sits cozy inside the /library/, but contained within /core/.
	I'd advise you to not take a stroll into that neck of the woods, it's not the safest place to be caught in, IMO.
	Didn't mean to scare ya, but fa realz, you shouldn't be going in there.

		- framework.php
		This file is what functions.php loads up when WP Framework is activated.
		Framework.php is the brains of the Framework and connects everything together.
		
		- readme.txt
		You're reading this now... But if you didn't catch on yet, this file is my poor attempt at explaining
		How you can use WP Framework to your advantage. I'll write some proper documentation soon. I promise.

	/functions/
	Functions contain all functions that make WP Framework, well, function. :)
	
		- hooks.php
		hooks.php is where you can reference to while trying to understanding what triggers what inside WP Framework.
		Everything's pretty documented inside hooks.php along with references to what hooks the Framework takes advantage of by default.
		
		- functions.php
		Contains all the framework logic. All the standard presets, default behavior and anything that's anything can be found here.
		
		- comments.php
		This file contains a few functions specific to the comments area.
		
		- widgets.php
		This file contains a few functions specific to widgets.
		
		- pluggable.php
		Pluggables is a special file. Any functions in here are override-able, so you can redefine it's purpose. Pretty cool eh?
		
		
	/extensions/
	extensions is a folder that contains all functionality that extend WP Framework. All you have to do is pop that .php file in there
	and it'll automatically get loaded into the theme. Sweet eh?
	
		- semantic-classes.php
		Semantic Classes is made up of some sick functionality.
		It's a souped-up version of the Sandbox functions, in addition to some other cool functionality
		like browser and OS detection. Oh yeah, no more IE hacks. Say hello to a wealthy load of dynamic, context sensitive css classes to keep your inner css-foo tamed for about a good year*.
	
	/media/
	The Media directory is ***your*** (***i don't think I can stress that enough***) folder where you can put all your theme asset files and folders into.
	So things that are specific to your theme... guess what? It goes here.
	How would you include all those files? theme.php

		/css/
		This is where all your CSS files live in. By default, WP Framework starts you off with two
		files that automatically get loaded so you can get started hacking away.
		
			- print.css
			Basic print layout for your theme. All you gotta do is add some display:none's and your all set.
			
			- screen.css
			This is your starter CSS file that already includes some helpful CSS classes to get you started.
			
			-reset.css
			Ah, the famous Eric Meyer Browser reset.
			I'm sure you'll put this file to good use.
		
			-base.css
			Base.css simply makes your job a lot easier. It contains some basic styling for the framework so you don't have to.
	
		/images/
		The /images/ directory is where all your image files should be contained. go figure.
		By default, WP Framework has 2 image files kinda just sitting there waiting for you to do something about it:
		
			- favicon.ico
			You ever seen one of those cool looking, little 16x16 images on the left side of the address bar?
			Bingo! That's what this one is. You're encouraged to replace this with your own, buddy. Don't get lazy on me now.
			
			- iphone.png
			This particular image is pretty important, and thus, very rewarding in social events.
			If you ever find yourself in a situation where everyones boasting about how cool their site is...
			(remember, this has to be a physical, social event or it wont work well) Well then just whip out your jesusPhone(TM), and
			show them what's really happening by blinding them with your custom site's webclip icon button thingie. They won't see it coming.
	
		/js/
		The /js/ folder is... you guessed it, a place for all your javascript files to get thrown into.
		By default, jQuery is already loaded so you don't have to do things manually.
		
		
			- screen.js
			Just in case you ever plan on writing some javascript on a raining day, WP Framework's got cha covered.
			Screen.js is automatically loaded into the theme so you can get your JavaScript rolling, and results showing in no time.
		
		- custom-functions.php
		Continuing from what was stated under /media/, theme functions starts you off with an empty
		php file with some basic examples of how you can take advantage of the Framework.
		Oh, and yeah, it's already included into the Framework too. Theme.php,
		a place to house all your php functions, mods, and all that good stuff.
	
*random date. you won't get enough of it. trust me. (btw, crack kills.)

// May the Force be with you.