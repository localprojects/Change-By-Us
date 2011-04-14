/**
 * Javascript - jQuery enabled
 * 
 * @package WPFramework
 * @subpackage Media
 */

/* Example jQuery
jQuery(document).ready(function($) {
	alert('jQuery + screen.js is loaded and ready to go!');
});
*/

// Dropdown menu using superfish
jQuery(document).ready(function($) {
	$('.nav').supersubs({
		minWidth: 		9,						// requires em unit.
		maxWidth: 		25,						// requires em unit.
		extraWidth: 	0						// extra width can ensure lines don't sometimes turn over due to slight browser differences in how they round-off values
    }).superfish({
		hoverClass:		'nav-hover',			// the class applied to hovered list items 
	//	pathClass:		'overideThisToUse',		// the class you have applied to list items that lead to the current page 
		pathLevels:		1,						// the number of levels of submenus that remain open or are restored using pathClass 
		delay:			400,					// the delay in milliseconds that the mouse can remain outside a submenu without it closing 
		animation:		{opacity:'show'},		// an object equivalent to first parameter of jQuery’s .animate() method 
		speed:			'normal',				// speed of the animation. Equivalent to second parameter of jQuery’s .animate() method 
		autoArrows:		false,					// if true, arrow mark-up generated automatically = cleaner source code at expense of initialisation performance 
		disableHI:		false					// set to true to disable hoverIntent detection 
	//	onInit:			function(){},			// callback function fires once Superfish is initialised – 'this' is the containing ul 
	//	onBeforeShow:	function(){},			// callback function fires just before reveal animation begins – 'this' is the ul about to open 
	//	onShow:			function(){},			// callback function fires once reveal animation completed – 'this' is the opened ul 
	//	onHide:			function(){}			// callback function fires after a sub-menu has closed – 'this' is the ul that just closed 
	});
});