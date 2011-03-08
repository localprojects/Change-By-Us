if(!tc){ var tc = {}; }

tc.locationDropdown = makeClass();

tc.locationDropdown.prototype.options = {
	radios:null,
	input:null,
	list:null,
	warning:null,
	locations:tc.locations
}

tc.locationDropdown.prototype.init = function(options){
	tc.util.log('tc.locationDropdown.init');
	this.options = tc.jQ.extend(this.options,options);
	this.bindEvents();
	tc.util.dump(options);
	this.options.warning.hide();
	this.options.list.hide().children('ul').children().remove();
}

tc.locationDropdown.prototype.bindEvents = function(){
	tc.util.log('tc.locationDropdown.bindEvents');
	this.options.input.bind('focus blur keyup',{dropdown:this},function(e){
		switch(e.type){
			case 'focus':e.data.dropdown.inputFocusHandler(e);break;
			case 'keyup':e.data.dropdown.inputKeyUpHandler(e);break;
			case 'blur':break;
		}
	});
	this.options.list.bind('click',{dropdown:this},function(e){
		var t;
		tc.util.dump(e.target);
		if(e.target.nodeName == 'SPAN'){
			t = e.target.parentNode;
		} else if(e.target.nodeName == 'A'){
			t = e.target;
		}
		e.preventDefault();
		e.data.dropdown.options.warning.hide();
		e.data.dropdown.options.input.val(t.hash.substring(1,t.hash.length)).removeClass('not-valid').addClass('valid').attr('valid-location','true');
		e.data.dropdown.options.list.hide();
	});
	this.options.radios.bind('change',{dropdown:this},function(e){
		e.data.dropdown.radioHandler(e);
	});
}

tc.locationDropdown.prototype.inputFocusHandler = function(e){
	tc.util.log('tc.locationDropdown.inputFocusHandler');
	this.options.radios.filter('#location-hood').attr('checked',true).removeAttr('valid-location');
}

tc.locationDropdown.prototype.inputKeyUpHandler = function(e){
	tc.util.log('tc.locationDropdown.keyUpHandler');
	this.superFilterAndUpdateList(e.target.value);
}

tc.locationDropdown.prototype.radioHandler = function(e){
	tc.util.log('tc.locationDropdown.radioHandler');
	var lastvalue;
	if(!e.target.checked){
		return;
	}
	switch(e.target.id){
		case 'location-city':
			this.options.input.data('last-value',this.options.input.val()).val('').removeClass('not-valid').removeClass('valid').removeAttr('valid-location');
			break;
		case 'location-hood':
			lastvalue = this.options.input.data('last-value');
			if(lastvalue){
				this.options.input.val(lastvalue);
				this.superFilterAndUpdateList(lastvalue,true)
			}
			break;
	}
	
	tc.util.dump(e.target.id);
}

tc.locationDropdown.prototype.superFilterAndUpdateList = function(text,skipUpdate){
	tc.util.log('tc.locationDropdown.filterLocations');
	var i, filter, n_filtered, temp_start, temp_string, html;
	filter = new RegExp(text,"gi");
	n_filtered = 0;
	html = "";
	for(i = 0; i < this.options.locations.length; i++){
		temp_start = this.options.locations[i].search(filter);
		if(temp_start == -1){
			continue;
		}
		if(temp_start == 0){
			temp_string = '<li><a href="#'+this.options.locations[i]+'">'+
										'<span>' + 
										this.options.locations[i].substring(0,text.length) + '</span>' + 
										this.options.locations[i].substring(text.length,this.options.locations[i].length) +
									'</a></li>';
		} else {
			temp_string = '<li><a href="#'+this.options.locations[i]+'">'+
										(''+this.options.locations[i].substring(0,temp_start)) + '<span>' + 
										this.options.locations[i].substring(temp_start,temp_start+text.length) + '</span>' + 
										this.options.locations[i].substring(temp_start+text.length,this.options.locations[i].length) +
									'</a></li>';
		}
		
		html += temp_string;
		n_filtered++;
	}
	
	if(!n_filtered){
		this.options.warning.show();
		this.options.input.removeClass('valid').addClass('not-valid');
	} else {
		//if(n_filtered > 20){
		//	this.options.list.hide();
		//}
		if(n_filtered == 1){
			this.options.input.removeClass('not-valid').addClass('valid').attr('valid-location','true');
		} else {
			this.options.list.show();
		}
		this.options.list.children('ul').get(0).innerHTML = html;
	} 
}
