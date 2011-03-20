if(!tc){ var tc = {}; }

tc.locationDropdown = makeClass();

tc.locationDropdown.validator = function(merlin,elements){
	//tc.util.log('tc.locationDropdown.validator');
	if(elements.filter('.location-city').filter(':checked').length){
		return {
			valid:true,
			errors:[]
		}
	}
	if(elements.filter('.location-hood').filter(':checked').length){
		if(elements.filter('.location-hood-enter').attr('location_id')){
			return {
				valid:true,
				errors:[]
			}
		}
	}
	elements.filter('.location-hood-enter').addClass('not-valid').removeClass('valid');
	return {
		valid:false,
		errors:['Please select a location.']
	};
};

tc.locationDropdown.prototype.init = function(options){
	//tc.util.log('tc.locationDropdown.init');
	var i, found;
	this.options = tc.jQ.extend({
		radios:null,
		input:null,
		list:null,
		warning:null,
		step:null,
		locations:tc.locations
	},options);
	this.bindEvents();
	if(this.options.warning){
		this.options.warning.hide();
	}
	this.options.list.hide().children('ul').children().remove();
	if(this.options.input.attr('location_id')){
		for(i = 0; i < this.options.locations.length; i++){
			if(this.options.locations[i].location_id == this.options.input.attr('location_id')){
				this.options.input.val(this.options.locations[i].name);
				found = true;
				break;
			}
		}
		if(!found){
			this.options.input.removeAttr('location_id');
		}
	}
};

tc.locationDropdown.prototype.getLocation = function(){
	//tc.util.log('tc.locationDropdown.prototype.getLocation','warn');
	if(this.options.input.attr('location_id')){
		return this.options.input.attr('location_id');
	} else {
		return false;
	}
}

tc.locationDropdown.prototype.bindEvents = function(){
	//tc.util.log('tc.locationDropdown.bindEvents');
	this.options.input.bind('focus blur keydown keyup keypress',{dropdown:this},function(e){
		switch(e.type){
			case 'focus':e.data.dropdown.inputFocusHandler(e);break;
			case 'keyup':e.data.dropdown.inputKeyUpHandler(e);break;
			case 'keydown':e.data.dropdown.inputKeyDownHandler(e);break;
			case 'keypress':e.data.dropdown.inputKeyPressHandler(e);break;
			case 'blur':break;
		}
	});
	this.options.list.bind('click',{dropdown:this},function(e){
		var t, location_tuple;
		if(e.target.nodeName == 'SPAN'){
			t = e.target.parentNode;
		} else if(e.target.nodeName == 'A'){
			t = e.target;
		}
		if(!t){
			return;
		}
		e.preventDefault();
		if(e.data.dropdown.options.warning){
			e.data.dropdown.options.warning.hide();
		}
		
		location_tuple = t.hash.substring(1,t.hash.length).split(',');
		
		e.data.dropdown.options.input.removeClass('not-valid').addClass('valid').attr('location_id',location_tuple[1]).val(location_tuple[0]).trigger('change');
		e.data.dropdown.options.list.hide();
	});
	if(this.options.radios){
		this.options.radios.bind('change',{dropdown:this},function(e){
			e.data.dropdown.radioHandler(e);
		});
	}
};

tc.locationDropdown.prototype.inputFocusHandler = function(e){
	//tc.util.log('tc.locationDropdown.inputFocusHandler');
	if(this.options.radios){
		this.options.radios.filter('#location-hood').attr('checked',true);
	}
};

tc.locationDropdown.prototype.inputKeyUpHandler = function(e){
	//tc.util.log('tc.locationDropdown.inputKeyUpHandler');
	if(e.which == 38 || e.which == 40 || e.which == 13){
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	this.options.input.removeClass('valid').addClass('not-valid').removeAttr('location_id');
	this.superFilterAndUpdateList(e.target.value);
};

tc.locationDropdown.prototype.inputKeyDownHandler = function(e){
	//tc.util.log('tc.locationDropdown.inputKeyDownHandler');
	switch(e.which){
		case 13:
			e.preventDefault();
			e.stopPropagation();
			this.modifySelection(0);
			break;
		case 38:
			e.preventDefault();
			this.modifySelection(-1);
			break;
		case 40:
			e.preventDefault();
			this.modifySelection(1);
			break;
	}
};

tc.locationDropdown.prototype.inputKeyPressHandler = function(e){
	//tc.util.log('tc.locationDropdown.inputKeyPressHandler');
	if(e.which == 13){
		e.preventDefault();
	}
};

tc.locationDropdown.prototype.modifySelection = function(direction){
	//tc.util.log('tc.locationDropdown.modifySelection');
	var currently_selected;
	currently_selected = this.options.list.find('.selected');
	if(!currently_selected.length){
		this.options.list.find('li:first').addClass('selected');
		return;
	}
	switch(direction){
		case -1:
			currently_selected.removeClass('selected').prev().addClass('selected');
			break;
		case 0:
			currently_selected.children('a').click();
			break;
		case 1:
			currently_selected.removeClass('selected').next().addClass('selected');
			break;
	}
};

tc.locationDropdown.prototype.radioHandler = function(e){
	//tc.util.log('tc.locationDropdown.radioHandler');
	var lastvalue;
	if(!e.target.checked){
		return;
	}
	switch(e.target.id){
		case 'location-city':
			this.options.input.data('last-value',this.options.input.val()).val('').removeClass('not-valid').removeClass('valid');//.removeAttr('location_id');
			this.options.list.hide();
			break;
		case 'location-hood':
			lastvalue = this.options.input.data('last-value');
			if(this.options.input.attr('location_id')){
				this.options.input.removeClass('not-valid').addClass('valid');
			} else {
				this.options.list.show();
			}
			if(lastvalue){
				this.options.input.val(lastvalue);
				this.superFilterAndUpdateList(lastvalue,true);
			}
			break;
	}
};

tc.locationDropdown.prototype.superFilterAndUpdateList = function(text,skipUpdate){
	//tc.util.log('tc.locationDropdown.filterLocations');
	var i, filter, n_filtered, temp_start, temp_string, html;
	filter = new RegExp(text,"gi");
	n_filtered = 0;
	html = "";
	for(i = 0; i < this.options.locations.length; i++){
		temp_start = this.options.locations[i].name.search(filter);
		if(temp_start == -1){
			continue;
		}
		if(temp_start == 0){
			temp_string = '<li><a href="#'+this.options.locations[i].name+','+this.options.locations[i].location_id+'">'+
										'<span>' + 
										this.options.locations[i].name.substring(0,text.length) + '</span>' + 
										this.options.locations[i].name.substring(text.length,this.options.locations[i].name.length) +
									'</a></li>';
		} else {
			temp_string = '<li><a href="#'+this.options.locations[i].name+','+this.options.locations[i].location_id+'">'+
										(''+this.options.locations[i].name.substring(0,temp_start)) + '<span>' + 
										this.options.locations[i].name.substring(temp_start,temp_start+text.length) + '</span>' + 
										this.options.locations[i].name.substring(temp_start+text.length,this.options.locations[i].name.length) +
									'</a></li>';
		}
		
		html += temp_string;
		n_filtered++;
	}
	
	if(!n_filtered){
		if(this.options.warning){
			this.options.warning.show();
		}
		this.options.input.removeClass('valid').addClass('not-valid').removeAttr('location_id');
	} else {
		this.options.list.children('ul').get(0).innerHTML = html;
		if(n_filtered == 1){
			//this.options.input.removeClass('not-valid').addClass('valid').attr('valid-location','true');
			this.options.list.find('li:first').addClass('selected');
		}
		if(!this.options.input.attr('location_id')){
			this.options.list.show();
		}
	} 
};
