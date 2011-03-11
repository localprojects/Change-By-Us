if(!tc){ var tc = {}; }

tc.app = makeClass();

tc.app.prototype.app_page = null;
tc.app.prototype.components = {};
tc.app.prototype.events = tc.jQ({});

tc.app.prototype.init = function(page){
	tc.util.log('tc.app.init');
	var _me;
	_me = this;
	this.app_page = page;
	if(page.features){
		for(i in page.features){
			if(tc.jQ.isFunction(page.features[i])){
				page.features[i](_me);
			}
		}
	}
}

function animate_bg(ele, from, to) {
	from += from > to ? -0.25 : 0.25;
		if(!$.support.opacity){
			if(from != to){
				var opStr = (Math.round(from * 25.5)).toString(16);
				ele.css({background:'transparent',filter:"progid:DXImageTransform.Microsoft.gradient(startColorstr=#" + opStr + "FFFFFF, endColorstr=#" + opStr + "FFFFFF)"});   
			}else{
				ele.css({background:'transparent',filter:"none"});   
			}
		}else{
			ele.css("backgroundColor", "rgba(255, 255, 255, " + (from) / 10 + ")"); 
		}
		if(from != to){
			setTimeout(function() { animate_bg(ele, from, to) }, 50);
		}
}