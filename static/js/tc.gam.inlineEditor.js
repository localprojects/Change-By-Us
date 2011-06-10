if (!tc) { var tc = {}; }

tc.inlineEditor = function(options) {
	
	this.options = tc.jQ.extend({
		dom: null,
		service: null/*{
			url: null,
			param: null
		}*/,
		empty_text: "Click here to edit."
	}, options);
	
	if (typeof this.options.dom === "string") {
		this.options.dom = tc.jQ(this.options.dom);
	}
	this.dom = this.options.dom;
	
	this.controls = this.dom.find(".inline-edit-controls");
	this.controls.hide().html('<a href="#" class="ca-btn save-btn">Save</a>\
		<a href="#" class="cancel-btn">Cancel</a>');
		
	this.controls.find(".save-btn").bind("click", {me: this}, function(e) {
		e.preventDefault();
		e.data.me.save();
	});
	
	this.controls.find(".cancel-btn").bind("click", {me: this}, function(e) {
		e.preventDefault();
		e.data.me.display();
	});
	
	this.content = this.dom.find(".editable-content");
	
	this.content.bind("click", {me: this}, function(e) {
		if (e.data.me.state === "display") {
			e.data.me.edit();
		}
	});
	
	this.data = tc.jQ.trim( this.content.text() );
	
	this.display();
};
tc.inlineEditor.prototype = {
	edit: function() {
		if (this.state === "edit") { return; }
		
		this.content.html("<textarea class='data serif'>"+ (this.data || "") + "</textarea>");
		
		this.controls.show();
		this.dom.addClass("state-editing").removeClass("state-display");
		this.state = "edit";
	},
	display: function() {
		if (this.state === "display") { return; }
		
		this.content.empty();
		if (this.data) {
			this.dom.removeClass("state-empty");
			this.content.text(this.data);
		} else {
			this.dom.addClass("state-empty");
			this.content.text(this.options.empty_text);
		}
		
		this.controls.hide();
		this.dom.removeClass("state-editing").addClass("state-display");
		this.state = "display";
	},
	save: function() {
		var post_data;
		
		if (this.state === "edit") {
			post_data = {};
			post_data[this.options.service.param] = tc.jQ.trim( this.content.find(".data").val() );
			
			tc.jQ.ajax({
				type: "POST",
				dataType: "text",
				url: this.options.service.url,
				data: post_data,
				context: this,
				success: function(data, ts, xhr) {
					if (data === "False") {
						//TODO handle error?
						this.display();
						return;
					}
					this.data = post_data[this.options.service.param];
					this.display();
				}
			});
			
		}
	}
};
