/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  by Andrew Mahon                 ****/
/****  amahon@gmail.com                ****/
/******************************************/
/******************************************/

if(!tc){ var tc = {}; }

(function(tc) {
	tc.util = {};
	tc.util.log = function(message,level){
		if (typeof console != "undefined" && typeof console.debug != "undefined") {
			if(!level){
				console.info(message);
			} else {
				console[level](message);
			}
		}
	}
	tc.util.dump = function(object){
		if (typeof console != "undefined" && typeof console.debug != "undefined") {
			console.log(object)
		}
	}
	
	if(jQuery){
	  tc.jQ = jQuery;
	}
	
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