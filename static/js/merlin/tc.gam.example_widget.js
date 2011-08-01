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
 * Variable: tc.gam.widgets.example_widget.merlin_options
 * Define the merlin wizard options here.
 */
tc.gam.widgets.example_widget = function(dom) {
    return {
        name: 'merlin_app_id',
        dom: tc.jQ('.merlin.example-wizard'),
        next_button: tc.jQ('a.next-button'),
        back_button: tc.jQ('a.back-button'),
        error_indicator: tc.jQ('.error-indicator'),
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
                                tc.jQ('.messages').append('<li>Focuses on the input field.</li>');
                            }
                        }
                    },
                    'input_checkbox': {
                        selector: 'input.checkbox-input'
                    }
                },
                init: function(merlin, dom) {
                    tc.jQ('.messages').append('<li>Starting Step 01.</li>');
                },
                finish: function(merlin, dom) {
                    // Add data from the inputs.
                    merlin.options.data = tc.jQ.extend(merlin.options.data, {
                        text_input: merlin.current_step.inputs.input_textfield.dom.val(),
                        checkbox_input: merlin.current_step.inputs.input_checkbox.dom.val()
                    });
                    
                    tc.jQ('.messages').append('<li>Passed Step 01.</li>');
                    tc.jQ('.messages').append('<li>Data: ' + JSON.stringify(merlin.options.data) + '</li>');
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
                    tc.jQ('.messages').append('<li>Passed Step 01.</li>');
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

/**
 * Function: jQuery ready
 *
 */
jQuery(document).ready(function(e) {
    // Create object for the page application, which is the container
    // for Features.  Features are functions that accept the app object.
    var app_page = {
        data: {},
        features: [],
        prevent_logging: false
    };
    
    // Push a feature.  This feature contains an app.component that is a
    // new merlin object.  This merlin object is defined above.
    app_page.features.push(function(app) {
        app.components.example = new tc.merlin(app, tc.gam.widgets.example_widget());
    });
    
    // Create app.
    tc.app(app_page);
});