if(!tc){ var tc = {}; }

tc.user_handler = function(options){
	return function(app){
		tc.util.log('tc.user_handler');
		if(app.app_page.user){
			if(typeof options.user_handler == 'function'){
				options.user_handler();
			}
		} else {
			if(typeof options.no_user_handler == 'function'){
				options.no_user_handler();
			}
		}
	};
}