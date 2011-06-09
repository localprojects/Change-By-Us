if(!tc){ var tc = {}; }

tc.app = makeClass();

tc.app.prototype.app_page = null;
tc.app.prototype.components = {};
tc.app.prototype.events = tc.jQ({});

tc.app.prototype.init = function(page){
	tc.util.log('tc.app.init');
	var _me, feature_status;
	_me = this;
	this.app_page = page;
	
	if(page.features){
		for(i in page.features){
			if(tc.jQ.isFunction(page.features[i])){
				tc.util.dump(i);
				if(page.features[i](_me) === false){
					tc.util.dump('FEATURE FAILED');
					break;
				}
			}
		}
	}
	
	tc.util.dump('HERE HERE HERE');
	
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
	
	tc.util.dump('HERE HERE HERE');
	
	tc.jQ(window).bind('hashchange',{app:this}, function(e){
		tc.util.dump('here');
		tc.util.dump(window.location.hash);
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
				ele.css({
					background:'transparent',
					filter:"progid:DXImageTransform.Microsoft.gradient(startColorstr=#" + opStr + "FFFFFF, endColorstr=#" + opStr + "FFFFFF) !important",
					'-ms-filter':"progid:DXImageTransform.Microsoft.gradient(startColorstr=#" + opStr + "FFFFFF, endColorstr=#" + opStr + "FFFFFF) !important"
				});
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

tc.addOfficialResourceTags = function(dom){
	tc.util.log('tc.addOfficialResourceTags');
	var officialResourceCells = dom.find('td.official-resource');
	for(var i = 0; i < officialResourceCells.length; i++) {
		var td = officialResourceCells.eq(i)
		var tdPos = td.position();
		var tdWidth = td.outerWidth();
		
		td.parents('table').parent().children('.official-resource-tag').remove();
		td.parents('table').before('<div class="official-resource-tag" style="top:' + tdPos.top + 'px; left:' + tdPos.left + 'px; width:' + (tdWidth - 48) + 'px"><span>Official Resource</span></div>');
		td.css({'padding-top' : '25px'});
	};
};

tc.jQ.fn.time_since = function() {
	return this.each(function() {
		var me, raw;
		me = tc.jQ(this);
		raw = me.text();
		me.attr("title", raw.split(" ").join("T") + "Z");
		me.prettyDate();
	});
};

tc.truncate = function(str, len, suffix) {
	if (typeof str === "string") {
		if (str.length > len) {
			return str.substring(0, len) + (suffix || "&hellip;");
		}
	}
	return str;
};




/* Browser Detection Stuff */
var ua = tc.jQ.browser;
var os;
var isMsie8orBelow = false;
var isMsie7orBelow = false;

if( ua && ua.msie && ua.version < 9 ) {
	isMsie8orBelow = true;
	
	if( ua.version < 8 ) {
		tc.jQ('body').addClass('ie7');
		isMsie7orBelow = true
	}
};

if (ua.mozilla) { /* gecko 1.9.1 is for FF3.5, 1.9.0 for FF3 */
	if (ua.version.slice(0,5) == "1.9.0") { tc.jQ('body').addClass('ff3') }
	else if (ua.version.slice(0,5) == "1.9.1") {  }
} else if (ua.webkit) {
	tc.jQ('body').addClass('webkit')
};

if (navigator.userAgent.indexOf('Chrome')!=-1) {
	tc.jQ('body').addClass('chrome')
}

if (navigator.appVersion.indexOf("Win")!=-1) {
	os = 'windows';
} else if (navigator.appVersion.indexOf("Mac")!=-1) {
	os = 'mac'
};	

tc.jQ('body').addClass(os);