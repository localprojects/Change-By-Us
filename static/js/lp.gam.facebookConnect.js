/**
 * File: Facebook Connect
 * Facebook Connect handling.
 *
 * Filename:
 * lp.gam.facebookConnect.js
 */
 
/**
 * Class: facebookClass
 * Class to handle facebook stuff.
 */
facebookClass = function () {
    this.initialize.apply(this, arguments);
};
 
/**
 * Function: facebookClass.prototype.initialize
 * Initialize function for class (not doing anything, though)
 */
facebookClass.prototype.initialize = function() {
    // Nothing to do here
};
 
/**
 * Function: facebookClass.prototype.connect
 * Connect to facebook.
 */
facebookClass.prototype.connect = function() {
    var requiredPerms = ['email', 'user_about_me', 'user_birthday', 'user_website', 'publish_stream'];
    FB.login(
        function (response) {
            if (response.session) {
                window.location.hash = 'facebook-login-preprocess';
                //POST will not work because we need to populate template 
                // specific data related to this request.
                window.location.href = "/facebook/login?uid=" + response.session.uid + "&access_token=" + response.session.access_token;
    
            } else {
                tc.jQ('.cannot-be-clicked, .has-been-clicked')
                    .removeClass('has-been-clicked')
                    .removeClass('cannot-be-clicked');
            }
        },
        {
            perms: requiredPerms.join(',')
        }
    );
};
 
/**
 * Variable: F
 * {Object} "Instantiation" of the Facebook class.
 */
F = new facebookClass();