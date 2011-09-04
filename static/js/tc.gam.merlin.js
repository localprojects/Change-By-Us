/**
 * File: Merlin
 * This file defines the wizard handling framework, known as
 * Merlin.
 *
 * Filename:
 * tc.gam.merlin.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 */

/**
 * Class: tc.merlin
 * Merlin is a wizard handling library.
 */
tc.merlin = tc.merlin || makeClass();

/**
 * Variable: tc.merlin.prototype.options
 * Default options for Merlin.
 */
tc.merlin.prototype.options = {
    name: null,
    dom: null,
    progress_element: null,
    next_button: null,
    back_button: null,
    watch_keypress: true,
    first_step: 'start',
    allow_hash_override_onload: false,
    use_hashchange: true,
    steps: {
        'start': {
            progress_selector: '.1',
            selector: '.start',
            prev_step: null,
            next_step: null
        }
    }
};

/**
 * Function: tc.merlin.prototype.init
 * Initialization function when creating a Merlin object.  Not
 * sure if this needs to manually called or not?
 *
 * Parameters:
 * app - {Object} App object?
 * options - {Object} Options to use, defaults provided by tc.merlin.options.
 */
tc.merlin.prototype.init = function(app, options) {
    // Define options, by utilizing defaults.
    this.options = tc.jQ.extend({}, this.options, options);
    
    // Define the app object that will be used throughout.
    this.app = app;
    
    // Turn in provided DOM element into jQuery object.  This ends
    // up being the DOM space for further DOM querying.
    if (this.options.dom instanceof String) {
        this.options.dom = tc.jQ(options.dom);
    }
    this.dom = this.options.dom;
    
    // Define some intial values for the Merlin object.
    this.magic = null;
    this.event_data = {
        app: app,
        me: this
    };
    
    // Start handling the steps.
    this.handle_steps();
    this.handle_controls(options.controls);
    this.setup_events(app);
    
    // Set address if using hash location and forcing onload.  This will start
    // the step asscoaited with has, otherwise, start on step one.
    if (this.options.use_hashchange && this.options.allow_hash_override_onload) {
        this.set_address(window.location.hash.substring(1, window.location.hash.length));
    } else {
        if (this.options.first_step) {
            this.show_step(this.options.first_step);
        }
    }

    // Initialize current hash.
    this.current_hash = null;
};

/**
 * Function: tc.merlin.prototype.setup_events
 * Set up events that are passed into the Merlin object.
 *
 * Parameters:
 * app - {Object} App object?
 */
tc.merlin.prototype.setup_events = function(app) {
    // For hash steps, unbind any existing hashchange, and add new hashchange
    if (this.options.use_hashchange) {
        tc.jQ(window)
            .unbind('hashchange', this.event_data, this.handlers.hashchange)
            .bind('hashchange', this.event_data, this.handlers.hashchange);
    }
    
    // Add events to DOM objects
    if (this.dom) {
        this.dom.find('a.step_link').unbind('click').bind('click', this.event_data, this.handlers.a_click);
        this.dom.bind('merlin-step-valid', this.event_data, this.handlers.valid);
        this.dom.bind('merlin-step-invalid', this.event_data, this.handlers.invalid);
    }
    
    // Handle back button.
    if (this.options.back_button) {
        this.options.back_button.unbind('click').bind('click', this.event_data, this.handlers.prev_step);
    }
    
    // Handle next button.
    if (this.options.next_button) {
        this.options.next_button.addClass('disabled');
        this.options.next_button.unbind('click').bind('click', this.event_data, this.handlers.next_step);
    }
};

/**
 * Function: tc.merlin.prototype.deallocate_magic
 * Unbind all Merlin events.
 */
tc.merlin.prototype.deallocate_magic = function() {
    if (this.options.use_hashchange) {
        tc.jQ(window).unbind('hashchange', this.handlers.hashchange);
    }
    if (this.dom) {
        this.dom.find('a.step_link').unbind('click', this.handlers.a_click);
        this.dom.unbind('merlin-step-valid', this.handlers.valid);
        this.dom.unbind('merlin-step-invalid', this.handlers.invalid);
    }
    if (this.options.back_button) {
        this.options.back_button.unbind('click', this.handlers.prev_step);
    }
    if (this.options.next_button) {
        this.options.next_button.unbind('click', this.handlers.next_step);
    }
};

/**
 * Function: tc.merlin.prototype.handle_controls
 * Event handling for progress element and error indicator.
 *
 * Parameters:
 * controls - {Object} Not sure what this is used for?
 */
tc.merlin.prototype.handle_controls = function(controls) {
    if (this.options.progress_element) {
        this.options.progress_element.find('a.indicator').bind('click', this.event_data, this.handlers.indicator_click);
    }
    if (this.options.error_indicator) {
        this.options.error_indicator.html('<span></span>');
    }
};

/**
 * Function: tc.merlin.prototype.handle_steps
 * If enabled, use the magic_spell(), and create step jQuery objects.
 */
tc.merlin.prototype.handle_steps = function() {
    // If magic is enabled, use magic spell.
    if (this.options.magic) {
        this.magic = this.magic_spell();
    }
    
    // Turn DOM string elements into jQuery objects.
    var i;
    for (i in this.options.steps) {
        if (this.options.steps[i].selector && this.dom) {
            this.options.steps[i].dom = this.dom.find(this.options.steps[i].selector);
        }
    }
};

/**
 * Function: tc.merlin.prototype.magic_spell
 * Some sort of magic....
 *
 * It is thought that this handles a wizard that has pages that scroll
 * left and right.  This can be seen on the front page with ideas.
 *         
 */

/**
 * Magic!!:
 *      __________________
 *    .-'  \ _.-''-._ /  '-.
 *  .-/\   .'.      .'.   /\-.
 * _'/  \.'   '.  .'   './  \'_
 *:======:======::======:======:  
 * '. '.  \     ''     /  .' .'
 *   '. .  \   :  :   /  . .'
 *     '.'  \  '  '  /  '.'
 *       ':  \:    :/  :'
 *         '. \    / .'
 *           '.\  /.'
 *             '\/'
 */
tc.merlin.prototype.magic_spell = function() {
    var i;
    var magic_dust;

    // Magic_Dust is an object that calls itself with this (the Merlin
    // magic_spell object) and specifically the init() function.
    magic_dust = ({
        // Default options.
        n_items: 0,
        overall_width: 0,
        page_width: 0,
        item_metadata: {
            max_width: 0,
            min_width: 100000,
            max_height: 0,
            min_height: 100000,
            marginLeft: 0
        },
        $items: [],
        
        /**
         * Initialize steps and handle dimensions.
         */
        init: function(merlin) {
            this.merlin = merlin;

            // Go through steps and manager height and width.
            for (i in this.merlin.options.steps) {
                this.merlin.options.steps[i].magic_dom = this.merlin.dom.children().filter(this.merlin.options.steps[i].selector);
                if (this.merlin.options.steps[i].magic_dom.length) {
                    this.$items.push(this.merlin.options.steps[i].magic_dom.get(0));

                    if (this.merlin.options.steps[i].magic_dom.outerWidth() < this.item_metadata.min_width) {
                        this.item_metadata.min_width = this.merlin.options.steps[i].magic_dom.outerWidth();
                    }
                    if (this.merlin.options.steps[i].magic_dom.outerWidth() > this.item_metadata.max_width) {
                        this.item_metadata.max_width = this.merlin.options.steps[i].magic_dom.outerWidth();
                    }

                    if (this.merlin.options.steps[i].magic_dom.outerHeight() < this.item_metadata.min_height) {
                        this.item_metadata.min_height = this.merlin.options.steps[i].magic_dom.outerHeight();
                    }
                    if (this.merlin.options.steps[i].magic_dom.outerHeight() > this.item_metadata.max_height) {
                        this.item_metadata.max_height = this.merlin.options.steps[i].magic_dom.outerHeight();
                    }
                }
            }

            // Define properties
            this.n_items = this.$items.length;
            this.$items = tc.jQ(this.$items);
            this.page_width = tc.jQ(window).width();
            this.overall_width = (this.page_width * this.n_items);
            this.item_metadata.marginLeft = (this.page_width - this.item_metadata.max_width) / 2

            // Define CSS based on found dimenstions
            this.merlin.dom.css({
                'width': this.overall_width + 'px',
                'height': this.item_metadata.max_height + 'px'
            });
            this.$items.show().css({
                'float': 'left',
                'clear': 'none',
                'width': this.item_metadata.max_width + 'px',
                'marginLeft': this.item_metadata.marginLeft
            }).removeClass('clearfix');

            return this;
        },
        
        /**
         * Resize handler for events?
         */
        resize_handler: function(e) {
            // Not sure what this does.
        },
        
        /**
         * Show a step
         */
        show_step: function(step) {
            if (!step.magic_dom) {
                return;
            }
            this.merlin.dom.css({
                'marginLeft': ((step.magic_dom.position().left)) + 'px'
            });
        }
    }).init(this);

    return magic_dust;
};

/**
 * Function: tc.merlin.prototype.show_step
 * Show a specific step.
 *
 * Parameters:
 * step - {String} Step identifier.
 * force - {Boolean} Whether to force ??.
 */
tc.merlin.prototype.show_step = function(step, force) {
    var i;
    var j;
    var temp_e_data;

    // If current step defined and not forcing.  Check if current is the one
    // we should show, and show.  Finish current step.
    if (this.current_step && !force) {
        if (step == this.current_step.step_name) {
            if (!this.current_step.dom.filter(':visible').length) {
                this.current_step.dom.show();
            }
            return;
        }
        if (this.current_step) {
            if (tc.jQ.isFunction(this.current_step.finish)) {
                this.current_step.finish(this, this.current_step.dom);
            }
        }
    }
    
    // If current step and forcing, then finish current step.
    if (force && this.current_step) {
        if (tc.jQ.isFunction(this.current_step.finish)) {
            this.current_step.finish(this, this.current_step.dom);
        }
    }

    // If step is not defined in the option, then just return.
    if (!this.options.steps[step]) {
        return;
    }

    // Put step name into step_name
    this.options.steps[step].step_name = step;
    
    // Handle history (back and next)
    if (this.current_step && this.current_step.use_for_history) {
        this.options.steps[step].prev_step = this.current_step.step_name;
    } else if (this.current_step) {
        this.options.steps[step].prev_step = this.current_step.prev_step;
    }
    
    // Define this as current step
    this.current_step = this.options.steps[step];
    
    // Enable next button if available.
    if (this.options.next_button) {
        this.options.next_button.removeClass('disabled');
    }
    
    // Handle progress selector.
    if (this.current_step.progress_selector) {
        if (this.options.progress_element) {
            this.options.progress_element
                .find(this.current_step.progress_selector)
                .addClass('cur')
                .attr('href', '#' + this.current_step.step_name)
                .nextAll()
                .removeClass('cur')
                .attr('href', '#');
        }
    }
    
    // Make overall title, name of step.  Same with sub-ttile
    if (this.current_step.title && this.options.title) {
        this.options.title.html(this.current_step.title);
    }
    if (this.current_step.sub_title && this.options.sub_title) {
        this.options.sub_title.html(this.current_step.sub_title);
    }
    
    // If step is a function, call it ??
    if (tc.jQ.isFunction(this.current_step)) {
        this.current_step(this);
        return;
    }

    // Handle our transition process, either a transiton callback,
    // merlin magic, or show/hide
    if (tc.jQ.isFunction(this.current_step.transition)) {
        this.current_step.transition(this);
    } else if (this.magic) {
        this.magic.show_step(this.current_step);
    } else if (this.dom && !this.magic) {
        this.dom.find('.step').hide();
        this.dom.find(this.current_step.selector).show();
    }

    // Handle the inputs and go through them.
    if (this.current_step.inputs && !this.current_step.has_been_initialized) {
        for (i in this.current_step.inputs) {
            // Use input DOM if step DOM is not available
            if (!this.current_step.inputs[i].dom && this.current_step.inputs[i].selector) {
                this.current_step.inputs[i].dom = this.current_step.dom.find(this.current_step.inputs[i].selector);
                if (!this.current_step.inputs[i].dom.length) {
                    tc.util.dump(this.current_step.inputs[i].selector);
                }
            }
            
            // If the value attribute is populated, then save it on the input object in case its needed
            if (this.current_step.inputs[i].dom.val()) {
                this.current_step.inputs[i].default_val = this.current_step.inputs[i].dom.val();
            }
            
            // Create a temp event data object
            temp_e_data = tc.jQ.extend({}, this.event_data, {
                input: this.current_step.inputs[i]
            });
            
            // Handle text input counters.
            if (this.current_step.inputs[i].counter && !this.current_step.inputs[i].counter.dom) {
                this.current_step.inputs[i].counter.dom = this.current_step.dom.find(this.current_step.inputs[i].counter.selector)
                this.current_step.inputs[i].counter.dom.text('0/' + this.current_step.inputs[i].counter.limit);
            }
            
            // Bind input events with handlers.  Handle hint text.
            this.current_step.inputs[i].dom
                .bind('focus', temp_e_data, this.handlers.focus)
                .bind('keyup change', temp_e_data, this.handlers.keypress)
                .bind('blur', temp_e_data, this.handlers.blur).data({
                    merlin: this,
                    input: this.current_step.inputs[i]
                }).each(function (i, j) {
                    var $j = tc.jQ(j);
                    
                    if ($j.data().input.hint || ($j.data().input.hint === "")) {
                        j.value = $j.data().input.hint;
                    }
                });
                
            // Add any custom event handlers.
            if (this.current_step.inputs[i].handlers) {
                for (j in this.current_step.inputs[i].handlers) {
                    this.current_step.inputs[i].dom.bind(j, this.event_data, this.current_step.inputs[i].handlers[j]);
                }
            }
            
            // Not used.
            if (this.current_step.inputs[i].focus_first) {
                //this.current_step.inputs[i].dom.focus();
            }
        }
    }

    // Handle hash changes.  Format of <merlin name>,<step name> or 
    // just <step name>.
    if (this.options.use_hashchange && !this.current_step.supress_hash) {
        if (this.options.name) {
            window.location.hash = this.options.name + ',' + step;
        } else {
            window.location.hash = step;
        }
    }

    // Call init() function.
    if (tc.jQ.isFunction(this.current_step.init)) {
        this.current_step.init(this, this.current_step.dom);
    }
    
    // Validate
    this.validate(false);
    
    // Mark as initialized.
    this.current_step.has_been_initialized = true;
};

/**
 * Function: tc.merlin.prototype.set_address
 * Set hash address.
 *
 * Parameters:
 * hash - {String} Hash string.
 */
tc.merlin.prototype.set_address = function(hash) {
    var force;
    var hash_buffer = hash.split(",");

    // If there is a merlin name, check that current
    // merlin name is the same, and then force the step,
    // otherwise don't force.
    if (this.options.name) {
        if (hash_buffer[0] !== this.options.name) {
            this.current_hash = null;
            return;
        }
        hash = hash_buffer[1];
        force = true;
    } else if (this.current_hash !== hash) {
        force = false;
    }
    
    // Set hash and show step.
    this.current_hash = hash;
    this.show_step(this.current_hash, force);
};

/**
 * Function: tc.merlin.prototype.validate
 * Validate input values.
 *
 * Parameters:
 * on_submit - {Boolean} Whether validation is happening on submit.
 */
tc.merlin.prototype.validate = function(on_submit) {
    var i;
    var valid = true;
    var temp_valid;
    this.current_step.errors = [];
    
    // If no inputs, then there is no need to validate.
    if (!this.current_step.inputs) {
        return true;
    }
    
    // Go through inputs.
    for (i in this.current_step.inputs) {
    
        // If no validators, then its valid.
        if (!this.current_step.inputs[i].validators) {
            continue;
        }
        
        // For submits, add class and handle hints.
        if (on_submit) {
            this.current_step.inputs[i].dom.addClass('has-been-focused has-attempted-submit');
            if (this.current_step.inputs[i].hint && (this.current_step.inputs[i].dom.val() == this.current_step.inputs[i].hint)) {
                this.current_step.inputs[i].dom.val('');
            }
        }
        
        // If validators is a function, call that, otherwise use tc.validate()
        if (tc.jQ.isFunction(this.current_step.inputs[i].validators)) {
            temp_valid = this.current_step.inputs[i].validators(this, this.current_step.inputs[i].dom, this.current_step, on_submit);
        } else {
            temp_valid = tc.validate(this.current_step.inputs[i].dom, this.current_step.inputs[i].validators);
        }

        // Handle individual input valid or not
        if (!temp_valid.valid) {
            valid = false;
            if (this.current_step.inputs[i].counter && this.current_step.inputs[i].dom.hasClass('has-been-focused')) {
                this.current_step.inputs[i].counter.dom.addClass('invalid').removeClass('valid');
            }
        } else {
            if (this.current_step.inputs[i].counter && this.current_step.inputs[i].counter.dom.hasClass('invalid')) {
                this.current_step.inputs[i].counter.dom.addClass('valid').removeClass('invalid');
            }
        }
    }
    
    // Handle overall validatity and go to apprpriate step.
    if (valid) {
        if (this.dom) {
            this.dom.trigger('merlin-step-valid', {
                step: this.current_step
            });
        }
        this.current_step.dom.removeClass('invalid').addClass('valid');
        return true;
    } else {
        if (this.dom) {
            this.dom.trigger('merlin-step-invalid', {
                step: this.current_step
            });
        }
        this.current_step.dom.removeClass('valid').addClass('invalid');
        return false;
    }
};

/**
 * Function: tc.merlin.handlers
 * Event handlers for Merlin objects.  Holds multiple event handlers.
 */
tc.merlin.prototype.handlers = {};

/**
 * Function: tc.merlin.prototype.handlers.hashchange
 * Hash change event.  Gets had value and puts it into the event object.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.hashchange = function(e, d) {
    e.data.me.set_address(window.location.hash.substring(1, window.location.hash.length));
};

/**
 * Function: tc.merlin.prototype.handlers.indicator_click
 * Indicator click event handling.  Prevent defaults for links that go to #.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.indicator_click = function(e, d) {
    if (tc.jQ(e.target).parent().attr('href') == '#') {
        e.preventDefault();
    }
};

/**
 * Function: tc.merlin.prototype.handlers.a_click
 * Handle click.  This does not currently do anything.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.a_click = function(e, d) {
    // tc.util.log('tc.merlin.handlers.a_click');
};

/**
 * Function: tc.merlin.prototype.handlers.prev_step
 * Previous step for merlin wizard event handling.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.prev_step = function(e, d) {
    e.preventDefault();
    if (e.data.me.current_step && e.data.me.current_step.prev_step) {
        if (e.data.me.options.use_hashchange) {
            window.location.hash = e.data.me.current_step.prev_step;
        } else {
            e.data.me.show_step(e.data.me.current_step.prev_step);
        }
    }
};

/**
 * Function: tc.merlin.prototype.handlers.next_step
 * Next step for merlin wizard event handling.  Spark validation.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.next_step = function (e, d) {
    var valid;
    e.preventDefault();
    valid = e.data.me.validate(true);
    
    if (!valid) {
        if (e.data.me.options.error_indicator) {
            e.data.me.options.error_indicator.html('<span>Oops! Please fill in the fields marked in red.</span>').show();
        }
        return;
    } else {
        if (e.data.me.options.error_indicator) {
            e.data.me.options.error_indicator.hide();
        }
    }
    if (e.target.className.indexOf('disabled') > 0) {
        return;
    }
    if (e.data.me.current_step && e.data.me.current_step.next_step) {
        e.data.me.show_step(e.data.me.current_step.next_step);
    }
};

/**
 * Function: tc.merlin.prototype.handlers.focus
 * Focus event.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.focus = function (e, d) {
    var $t;
    if (e.target.className.indexOf('has-been-focused') == -1) {
        $t = tc.jQ(e.target);
        $t.addClass('has-been-focused').removeClass('valid invalid');
        if (e.target.nodeName == "TEXTAREA" || (e.target.nodeName == "INPUT" && ($t.attr("type") == "text"))) {
            if ($t.data().input.hint || $t.data().input.hint === "") {
                $t.val("");
            }
        }
    }
};

/**
 * Function: tc.merlin.prototype.handlers.keypress
 * Key press event.  Handles counters.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.keypress = function(e, d) {
    e.data.me.validate(false);
    if (e.which == 13 && e.target.nodeName != 'TEXTAREA') {
        if (e.data.me.options.next_button && e.data.me.options.next_button.hasClass('enabled')) {
            e.data.me.options.next_button.click();
        }
    }
    if (e.data.input.counter && e.data.input.counter.dom) {
        e.data.input.counter.dom.text(e.data.input.dom.val().length + '/' + e.data.input.counter.limit);
    }
};

/**
 * Function: tc.merlin.prototype.handlers.keypress
 * Blur event.  Handles classes and hints.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.blur = function (e, d) {
    var $t;
    $t = tc.jQ(e.target);
    if (!e.target.value.length) {
        tc.jQ(e.target).removeClass('has-been-focused');
        if ($t.data().input.hint || ($t.data().input.hint === "")) {
            $t.val($t.data().input.hint);
        }
    }
};

/**
 * Function: tc.merlin.prototype.handlers.valid
 * Valididate event.  Handles enabling next button.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.valid = function (e, d) {
    if (e.data.me.options.next_button) {
        e.data.me.options.next_button.removeClass('disabled').addClass('enabled');
    }
    if (e.data.me.options.error_indicator) {
        e.data.me.options.error_indicator.hide();
    }
};

/**
 * Function: tc.merlin.prototype.handlers.invalid
 * Invalididate event.  Handles disabling next button.
 *
 * Parameters:
 * e - {Object} Event object.
 * d - {Object} Data object.
 */
tc.merlin.prototype.handlers.invalid = function (e, d) {
    if (e.data.me.options.next_button) {
        e.data.me.options.next_button.removeClass('enabled').addClass('disabled');
    }
};
