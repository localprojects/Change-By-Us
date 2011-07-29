/**
 * File: Merlin Example Widget
 * This file holds an example merlin widget.
 *
 * Filename:
 * tc.gam.example_widget.js
 *
 * Dependencies:
 * - tc.gam.util.js
 * - tc.util.js
 * - tc.gam.app.js
 * - tc.gam.merlin.js
 */

/**
 * Variable: tc.gam.widgets
 * Container for widgets.
 */
tc.gam.widgets = tc.gam.widgets || {};

/**
 * Function: tc.gam.widgets.example_widget
 * Custom widget for a merlin wizard.
 *
 * Parameters:
 * data_object - ??
 * dom - jQuery element to use as context to find() other elements.
 * deps - ??
 * options - Object of options. ??
 */
tc.gam.widgets.example_widget = function(data_object, dom, deps, options) {
    var this_widget = this;
	var widget = tc.gam.widget(this, data_object);
	this.dom = dom;
	
    // Initialize components
	this.components = {
		'merlin': null
	};
	
	// Define options for widget that are passed in.
	this.options = tc.jQ.extend({ 'name': 'custom_widget_name' }, options);
	
	// Create merlin build method, call and show intial step
    this.build_merlin = function() {
        if (this.components.merlin) {
            return;
        }
        this.components.merlin = new tc.merlin(options.app, this.merlin_options(dom));
    }
    this.build_merlin();
    this.components.merlin.show_step('step_id_X');
    
    // Return the widget object.
    return { 
		'show': function() {
			this_widget.components.merlin.show_step('step_id_X');
			widget.show();
		},
		'hide': widget.hide
	};
}

/**
 * Variable: tc.gam.widgets.example_widget.merlin_options
 * Define the merlin wizard options here.
 */
tc.gam.widgets.example_widget.merlin_options = function(dom) {
    return {
        name: 'merlin_app_id',
        dom: dom.find('.merlin.example-wizard'),
        next_button: dom.find('a.next-button'),
        first_step: 'step_id_1',
        data: {
            data_property: 'default-value',
            text_input: '',
            checkbox_input: '0',
            email_input: ''
        },
        use_hashchange: false,
        steps: {
            'step_id_1': {
                selector: '.step.step-selector-1',
                next_step: 'step_id_2',
                inputs: {
                    'input_textfield': {
                        selector: 'input.textfield-input',
                        validators: ['min-3', 'max-200', 'required'],
                        hint: 'This is a hint for a textfield...',
                        handlers: {
                            focus: function(e, d) {
                                alert('Were focused!');
                            }
                        }
                    },
                    'input_checkbox': {
                        selector: 'input.checkbox-input'
                    }
                },
                init: function(merlin, dom) {
                    // Init stuff here.
                },
                finish: function(merlin, dom) {
                    // Add data from the inputs.
                    merlin.options.data = tc.jQ.extend(merlin.options.data, {
                        text_input: merlin.current_step.inputs.input_textfield.dom.val(),
                        checkbox_input: merlin.current_step.inputs.input_checkbox.dom.val()
                    });
                }
            },
            'step_id_2': {
                selector: '.step.step-selector-2',
                next_step: 'step_id_3_success',
                inputs: {
                    'input_textfield_email': {
                        selector: 'input.textfield-input-email',
                        validators: ['email', 'required'],
                        hint: 'Please enter your email'
                    }
                },
                init: function(merlin, dom) {
                    // Init stuff here.
                },
                finish: function(merlin, dom) {
                    // Add data from the inputs.
                    merlin.options.data = tc.jQ.extend(merlin.options.data, {
                        email_input: merlin.current_step.inputs.input_textfield_email.dom.val()
                    });
                }
            },
            'step_id_3_success': {
                selector: '.step.step-id-3-success',
                init: function(merlin, dom) {
                    alert('Success!  Data: ' + merlin.options.data);
                }
            },
            'step_id_4_error': {
                selector: '.step.step-id-4-error',
                init: function(merlin, dom) {
                    alert('There was an error');
                    
                    // Go back to first step
                    merlin.show_step('step_id_1');
                }
            }
        }
    };
};