	facebookClass = function() { this.initialize.apply(this, arguments); };
	facebookClass.prototype = {
		initialize: function () {},
		connect: function () {
			var requiredPerms = ['email','user_about_me','user_birthday','user_website','publish_stream'];
			FB.login(
				function(response) {
					if(response.authResponse){
						window.location.hash = 'facebook-login-preprocess';
						
						//POST will not work because we need to populate template 
						// specific data related to this request.
						window.location.href = "/facebook/login?uid="+response.authResponse.userID+"&access_token="+response.authResponse.accessToken;
						
					} else {
						tc.jQ('.cannot-be-clicked, .has-been-clicked').removeClass('has-been-clicked').removeClass('cannot-be-clicked');
					}
				},
				{scope: requiredPerms.join(',')}
			);
		}
	};
	F = new facebookClass();