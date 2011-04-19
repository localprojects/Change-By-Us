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
			
			tc.util.dump(page.features[i]);
			
			if(tc.jQ.isFunction(page.features[i])){
				if(page.features[i](_me) === false){
					break;
				}
			}
		}
	}
	
	// called from the main logout callback, or, if we were logged in to facebook, from the FB logout callback
	this.finish_logout = function(e){
		window.location.hash = '';
		if (window.location.pathname === "/useraccount") {
			if (e.data.app.app_page.user) {
				window.location.assign("/useraccount/"+ e.data.app.app_page.user.u_id);
				return;
			}
		}
		window.location.reload(true);
	};
	
	tc.jQ(window).bind('hashchange',{app:this}, function(e){
		if(window.location.hash.substring(1,window.location.hash.length) === 'logout'){
			tc.jQ.ajax({
				type:'POST',
				url:'/logout',
				context:e.data.app,
				dataType:'text',
				success:function(data,ts,xhr){
					var me = this;
					if(FB._userStatus == 'unknown'){
						me.finish_logout(e);
					} else {
						FB.getLoginStatus(function(response) {
							if (response.session) {
								FB.logout(function(response){
									me.finish_logout(e);
								});
							} else {
								me.finish_logout(e);
							}
						});
					}
				}
			});
		}
	});
	
};

tc.animate_bg = function(ele, from, to) {
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
			setTimeout(function() { tc.animate_bg(ele, from, to) }, 50);
		}
};

tc.time_since = function(el) {
	var raw = el.text();
	el.attr("title", raw.split(" ").join("T") + "Z");
	el.prettyDate();
};















