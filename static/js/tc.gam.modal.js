/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/
if(!tc){ var tc = {}; }

tc.modal = makeClass();

tc.modal.prototype.modal = null;

tc.modal.prototype.init = function(app,options){
	tc.util.log('tc.modal.init');
	this.options = tc.jQ.extend({
		element:null
	},options);
	this.options.element.overlay({
		top: "15%",
		left: 'center',
		fixed: false,
		speed: 75,
		mask: {
			color: '#55504b',
			opacity: 0.5,
			zIndex: 19998
		}
	});
	this.modal = this.options.element.data('overlay');
};

tc.modal.prototype.show = function(opts, event_target){
	tc.util.log('tc.modal.show');
	function load(me){
		me.modal.load();
	}
	var content;
	content = "";
	if(opts.source_element){
		content = opts.source_element.clone().removeClass("template-content");
	}
	this.options.element.children().remove();
	content.show();
	this.options.element.append(content);
	tc.util.dump(this.options.element.find('.close'));
	this.options.element.find('.close, .cancel').bind('click',{me:this},function(e){
		e.preventDefault();
		e.data.me.hide();
	});
	this.options.element.find('.submit').bind('click',{me:this,opts:opts},function(e){
		e.preventDefault();
		e.data.me.hide();
		if(tc.jQ.isFunction(e.data.opts.submit)){
			e.data.opts.submit();
		}
	});
	this.options.element.bind('onBeforeClose',{me:this, opts:opts},function(e){
		if(e.data.opts.preventClose){
			return false;
		}
		return true;
	});
	this.options.element.bind('onClose',{me:this},function(e){
		var me;
		me = e.data.me;
		if (tc.jQ.isFunction(me.cleanup)) {
			me.cleanup.apply(me);
			me.cleanup = null;
		}
		me.options.element.children().remove();
	});
	if(tc.jQ.isFunction(opts.init)){
		if (event_target) {
			opts.init(this,event_target,load);
		} else {
			opts.init(this, load);
		}
	} else {
		load(this);
	}
};

tc.modal.prototype.hide = function(){
	tc.util.log('tc.modal.hide');
	this.modal.close();
};