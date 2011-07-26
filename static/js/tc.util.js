/**
 * File: Utilities
 * This file holds various utility functions for CBU.
 */

var tc = tc || {};
tc.util = tc.util || {};

(function(tc) {

  /**
   * Function: Log
   * Logs a basic message to the console if available.
   *
   * Parameters:
   * message - {String} Message to log.
   * level - {String} Property of console to send message to.  Options are (info,
   *     log, debug, error, ??)
   */
	tc.util.log = function(message,level){
		if(app_page && app_page.prevent_logging){ return; }
		if (typeof console != "undefined" && typeof console.log != "undefined") {
			if(!level){
				console.info(message);
			} else {
				console[level](message);
			}
		}
		if (typeof ipd != "undefined" && typeof ipd.log != "undefined"){
			ipd.log(message);
		}
	};
	tc.util.dump = function(object){
		if(app_page && app_page.prevent_logging){ return; }
		if (typeof console != "undefined" && typeof console.log != "undefined") {
			console.log(object);
		}
		
		if (typeof ipd != "undefined" && typeof ipd.log != "undefined"){
			ipd.log(object);
		}
	};
	
	if(jQuery){
	  tc.jQ = jQuery;
	}
	
	/* indexOf not supported in IE
	   // Mozilla's implementation bellow:
		
		(using jQuery.inArray for now)
	
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(obj) {
			if (this === void 0 || this === null)
				throw new TypeError();
			
			var t = Object(this);
			var len = t.length >>> 0;
			if (len === 0)
				return -1;
			
			var n = 0;
			if (arguments.length > 0) {
				n = Number(arguments[1]);
				if (n !== n)
					n = 0;
				else if (n !== 0 && n !== (1/0) && n !== -(1/0))
					n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
			
			if (n >= len)
				return -1;
			
			var k = n >= 0
				? n
				: Math.max(len - Math.abs(n), 0);
			
			for (; k < len; k++) {
				if (k in t && t[k] === obj)
					return k;
			}
			return -1;
		};
	}*/
	
})(tc);


// makeClass - By John Resig (MIT Licensed)
function makeClass(){
  return function(args){
    if ( this instanceof arguments.callee ) {
      if ( typeof this.init == "function" )
        this.init.apply( this, args.callee ? args : arguments );
    } else
      return new arguments.callee( arguments );
  };
}

tc.timer = function(time,func,callback){
	var a = {timer:setTimeout(func,time),callback:null}
	if(typeof(callback) == 'function'){a.callback = callback;}
	return a;
};

tc.clearTimer = function(a){
	clearTimeout(a.timer);
	if(typeof(a.callback) == 'function'){a.callback();};
	return this;
};