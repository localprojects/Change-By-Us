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
tc.gam.widgets.example_widget = {
    // name: Used as an identifier, specifically in any hash navigation.
    name: 'merlin_app_id',
    // dom: jQuery element that will be used to further find() items.
    dom: tc.jQ('.merlin.example-wizard'),
    // next_button: jQuery element acts as the next button.
    next_button: tc.jQ('a.next-button'),
    // back_button: jQuery element acts as the next button.  (Still not working or 
    // fully understood.)
    back_button: tc.jQ('a.back-button'),
    // error_indicator: jQuery element that will contain any error messages from the
    // validators.
    error_indicator: tc.jQ('.error-indicator'),
    // progress_element: jQuery element to display progress of wizard.  (Still not working or 
    // fully understood.)
    progress_element: tc.jQ('.progress-element'),
    // magic: Boolean on whether to use magic, which handles transitional effects
    // for steps.  (Makes a big mess if set to true for this example)
    magic: false,
    // use_hashchange: Boolean to handle changing URL with hash navigation.  (Turning this 
    // to true seems to cause a repeat of steps.)
    use_hashchange: false,
    // first_step: Step ID as defined in the steps object below that will be shown as
    // first step in the wizard.
    first_step: 'step_id_1',
    // data: Object to store data for the wizard.  It is suggested practice to fill
    // this with the defaults you will be using for the wizard.
    data: {
        data_property: 'default-value',
        text_input: '',
        checkbox_input: '0',
        email_input: '',
        error_select: 'none'
    },
    // steps: Object holding each step definition.
    steps: {
        'step_id_1': {
            // progress_selector: Not sure? (Still not working or fully understood.)
            progress_selector: '.1',
            // selector: jQuery selector for the element that contains the step.
            selector: '.step.step-selector-1',
            // prev_step: Step ID for the previous step.  Do not define or define as null
            // if no previous step is used.
            prev_step: null,
            // next_step: Step ID for the next step to use when this step is validated.
            next_step: 'step_id_2',
            // use_for_history: (Not sure what is used for?)
			use_for_history: false,
			// inputs: Object to hold definition of input elements of the wizard.
            inputs: {
                'input_textfield': {
                    // selector: jQuery selector for the input element.
                    selector: 'input.textfield-input',
                    // validators: Array of strings that refer to validators. The complete 
                    // list of validators can be found in the JS Docs on page 
                    // docs/js/files/tc-gam-validate-js.html. Or in the file 
                    // static/js/tc.gam.validate.js. 
                    validators: ['min-3', 'max-200', 'required'],
                    // hint: String to use for text fields that will be put in the
                    // textfield as instructions.
                    hint: 'This is a hint for a textfield...',
                    // counter: Used for textfields, provides a visual counter of
                    // characters.
                    counter: {
                        // selector: jQuery selectory for element to fill with counter.
                        selector: '.charlimit.charlimit-textfield-input',
                        // limit: Character limit for counter.  This should be in align
                        // with a validator of max-X.
                        limit: 200
                    },
                    // handlers: Object of event handlers.  See ??
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
            // init: Function that takes in a merlin and dom paramters.  This is fired when
            // the step is initialized each time.
            init: function(merlin, dom) {
                // Custom debug messages for example purposes.
                tc.jQ('.messages').append('<li>Starting Step 01.</li>');
            },
            // init: Function that takes in a merlin and dom paramters.  This is fired when
            // the step is validated and moving on each time.  This is a good place to set
            // data into the data object.
            finish: function(merlin, dom) {
                // Add data from the inputs.
                merlin.options.data = tc.jQ.extend(merlin.options.data, {
                    text_input: merlin.current_step.inputs.input_textfield.dom.val(),
                    checkbox_input: merlin.current_step.inputs.input_checkbox.dom.val()
                });
                
                // Custom debug messages for example purposes.
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
                
                // Custom debug messages for example purposes.
                tc.jQ('.messages').append('<li>Passed Step 02.</li>');
                tc.jQ('.messages').append('<li>Data: ' + JSON.stringify(merlin.options.data) + '</li>');
                
                // Handle error selection.
                if (merlin.options.data.error_select == 'error') {
                    // How to raise error in merlin?
                    
                    // Custom debug messages for example purposes.
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
            
                // Custom debug messages for example purposes.
                tc.jQ('.messages').append('<li>Init Step 03, Success.</li>');
            }
        },
        'step_id_4_error': {
            selector: '.step.step-id-4-error',
            init: function(merlin, dom) {
            
                // Custom debug messages for example purposes.
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