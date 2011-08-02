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
 * Container for widgets.  Not entirely necessary.
 */
tc.gam.widgets = tc.gam.widgets || {};

/**
 * Variable: tc.gam.widgets.example_widget
 * Define the merlin wizard options object here.
 */
tc.gam.widgets.example_widget =  {
    name: 'merlin_app_id',
    dom: tc.jQ('.merlin.example-wizard'),
    next_button: tc.jQ('a.next-button'),
    back_button: tc.jQ('a.back-button'),  // Still not working or fully understood
    error_indicator: tc.jQ('.error-indicator'),
    progress_element: tc.jQ('.progress-element'),  // Still not working or fully understood
    magic: false, // Makes a mess if true.
    first_step: 'step_id_1',
    use_hashchange: false, // Turning this to true seems to cause a repeat of steps
    data: {
        data_property: 'default-value',
        text_input: '',
        checkbox_input: '0',
        email_input: '',
        error_select: 'none'
    },
    steps: {
        'step_id_1': {
            progress_selector: '.1',  // Still not working or fully understood
            selector: '.step.step-selector-1',
            prev_step: null,
            next_step: 'step_id_2',
			use_for_history: false, // Not sure what is used for.
            inputs: {
                'input_textfield': {
                    selector: 'input.textfield-input',
                    validators: ['min-3', 'max-200', 'required'],
                    hint: 'This is a hint for a textfield...',
                    counter: {
                        selector: '.charlimit.charlimit-textfield-input',
                        limit: 200
                    },
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
            progress_selector: '.2', // Still not working or fully understood
            selector: '.step.step-selector-2',
            prev_step: 'step_id_1',
            next_step: 'step_id_3_success',
            inputs: {
                'input_textfield_email': {
                    selector: 'input.textfield-input-email',
                    validators: ['email', 'required'],
                    hint: 'Please enter your email'
                },
                'error_select': {
                    selector: 'select.select-error'
                }
            },
            init: function(merlin, dom) {
                tc.jQ('.messages').append('<li>Passed Step 01.</li>');
            },
            finish: function(merlin, dom) {
                // Add data from the inputs.
                merlin.options.data = tc.jQ.extend(merlin.options.data, {
                    email_input: merlin.current_step.inputs.input_textfield_email.dom.val(),
                    error_select: merlin.current_step.inputs.error_select.dom.val()
                });
                
                tc.jQ('.messages').append('<li>Passed Step 02.</li>');
                tc.jQ('.messages').append('<li>Data: ' + JSON.stringify(merlin.options.data) + '</li>');
                
                if (merlin.options.data.error_select == 'error') {
                    // How to raise error in merline?
                    tc.jQ('.messages').append('<li>Raising error.</li>');
                }
                // This causes recursion
                /*
                if (merlin.options.data.error_select == 'redirect') {
                    merlin.show_step('step_id_1');
                    tc.jQ('.messages').append('<li>Redirecting.</li>');
                }
                */
            }
        },
        'step_id_3_success': {
            selector: '.step.step-id-3-success',
            init: function(merlin, dom) {
                tc.jQ('.messages').append('<li>Init Step 03, Success.</li>');
            }
        },
        'step_id_4_error': {
            selector: '.step.step-id-4-error',
            init: function(merlin, dom) {
                tc.jQ('.messages').append('<li>Init Step 04, Error.</li>');
            }
        }
    }
};

/**
 * Function: jQuery ready
 * When page is ready, start execution.
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
        // Add the example component (merlin example widget) here.
        app.components.example_component = new tc.merlin(app, tc.gam.widgets.example_widget);
    });
    
    // Create app.
    tc.app(app_page);
});