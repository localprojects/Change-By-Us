	facebookClass = function() { this.initialize.apply(this, arguments); };
	facebookClass.prototype = {
		initialize: function () {},
		connect: function () {
			var requiredPerms = ['email','user_about_me','user_birthday','user_website','publish_stream'];
			FB.login(
				function(response) {
					if(response.session){
						//window.location.href = "/login_facebook"
						window.location.href = "/facebook/login?uid="+response.session.uid+"&access_token="+response.session.access_token;
						// window.location.href = "/login_facebook?uid="+response.session.uid+"&access_token="+response.session.access_token;
					} else {
						// login failure, do something here
					}
				},
				{perms: requiredPerms.join(',')}
			);
		}
	};
	F = new facebookClass();