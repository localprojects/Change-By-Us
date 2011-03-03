if(!tc){ var tc = {}; }

tc.modal = makeClass();

tc.modal.prototype.options = {
	element:null
}

tc.modal.prototype.modal = null;

tc.modal.prototype.init = function(app,options){
	tc.util.log('tc.modal.init');
	this.options = tc.jQ.extend(this.options,options);
	this.options.element.overlay({
		top: 260,
		left: 'center',
		speed:75,
		mask: {
			color: '#55504b',
			opacity: 0.5
		}
	});
	this.modal = this.options.element.data('overlay');
}

tc.modal.prototype.show = function(opts){
	tc.util.log('tc.modal.show');
	function load(me){
		me.modal.load();
	}
	var content;
	content = "";
	if(opts.source_element){
		content = opts.source_element.clone();
	}
	if(opts.tempate){
		if(opts.tempate instanceof String){
			content = w1.jQ(opts.tempate);
		} else {
			content = opts.tempate;
		}
	}
	tc.util.dump(this.options.element);
	this.options.element.children().remove();
	content.show();
	this.options.element.append(content);
	this.options.element.find('.close').bind('click',{me:this},function(e){
		e.data.me.hide();
	});
	if(tc.jQ.isFunction(opts.init)){
		opts.init(this,load);
	} else {
		load(this);
	}
}

tc.modal.prototype.hide = function(){
	tc.util.log('tc.modal.hide');
	this.options.element.one('onClose',{me:this},function(e){
		e.data.me.options.element.children().remove();
	});
	this.modal.close();
}