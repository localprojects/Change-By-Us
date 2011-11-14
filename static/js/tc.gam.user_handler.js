/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/
if(!tc){ var tc = {}; }

tc.user_handler = function(options){
	return function(app){
		tc.util.log('tc.user_handler');
		if(app.app_page.user){
			if(typeof options.user_handler == 'function'){
				if(options.user_handler(app) === false){
					return false;
				}
			}
		} else {
			if(typeof options.no_user_handler == 'function'){
				if(options.no_user_handler(app) === false){
					return false;
				}
			}
		}
		return true;
	};
}