if (!tc) { var tc = {}; }

tc.inlineEditor = function(options) {
	this.init(options);
};
tc.inlineEditor.prototype = {
	init: function(options) {
		this.options = tc.jQ.extend({
			dom: null,
			service: null/*{
				url: null,
				param: null,
				post_data:  {}
			}*/,
			empty_text: "Click here to edit.",
			validators: null
		}, options);

		if (typeof this.options.dom === "string") {
			this.options.dom = tc.jQ(this.options.dom);
		}
		this.dom = this.options.dom;

		this.controls = this.dom.find(".inline-edit-controls");
		this.controls.hide().empty().append(this._generateControls());

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
	},
	edit: function() {
		var field;
		if (this.state === "edit") { return; }
		
		this.content.html("<textarea class='data serif'>"+ (this.data || "") + "</textarea>");
		
		field = this.content.find(".data");
		field.bind("keypress", {me: this, field: field}, function(e) {
			e.data.me.validate(e.data.field);
		});
		
		this.controls.show();
		this.dom.addClass("state-editing").removeClass("state-display");
		this.state = "edit";
	},
	display: function() {
		if (this.state === "display") { return; }
		
		this.content.empty();
		if (this.data) {
			this.dom.removeClass("state-empty");
			this._renderDisplayContent();
		} else {
			this.dom.addClass("state-empty");
			this.content.text(this.options.empty_text);
		}
		
		this.controls.hide();
		this.dom.removeClass("state-editing").addClass("state-display");
		this.state = "display";
	},
	validate: function(field) {
		if (!tc.jQ.isArray(this.options.validators)) { return true; }
		return tc.validate(field, this.options.validators).valid;
	},
	save: function() {
		var post_data, field, val;
		
		if (this.state === "edit") {
			field = this.content.find(".data");
			val = tc.jQ.trim( field.val() );
			
			if (field.hasClass("not-valid")) {
				return false;
			}
			if (!this.validate(field)) {
				return false;
			}
			
			if (this.options.service.post_data) {
				post_data = tc.jQ.extend({}, this.options.service.post_data);
			} else {
				post_data = {};
			}
			post_data[this.options.service.param] = val;
			
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
	},
	
	// for internal use:
	
	_generateControls: function() {
		return '<a href="#" class="ca-btn save-btn">Save</a><a href="#" class="cancel-btn">Cancel</a>';
	},
	_renderDisplayContent: function() {
		this.content.text(this.data);
	}
};

tc.inlineLinkEditor = function(options) {
	this.init(options);
};
tc.inlineLinkEditor.prototype = tc.jQ.extend({}, tc.inlineEditor.prototype, {
	_renderDisplayContent: function() {
		this.content.html("<a href='"+ this.data + "'>"+ this.data + "</a>");
	}
});

tc.inlineKeywordsEditor = function(options) {
	this.init(options);
};
tc.inlineKeywordsEditor.prototype = tc.jQ.extend({}, tc.inlineEditor.prototype, {
	/*_generateControls: function() {
		return '<a href="#" class="ca-btn save-btn">Add</a><a href="#" class="cancel-btn">Cancel</a>';
	}*/
});

