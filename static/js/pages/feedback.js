/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

/**
 * File: Feedback
 * Main logic for Feedback page.
 *
 * Filename:
 * feedback.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 * - tc.gam.app.js
 * - tc.gam.merlin.js
 */

/**
 * App Page Feature: Feedback
 * 
 */
app_page.features.push(function (app) {
    tc.util.log('Give A Minute: Feedback');

    /**
     * Add Merlin component.
     */
    app.components.merlin = new tc.merlin(app, {
        dom: tc.jQ('.merlin.feedback'),
        next_button: tc.jQ('input.submit'),
        first_step: 'feedback-form',
        data: {
            type: null,
            name: null,
            email: null,
            text: null
        },
        use_hashchange: false,
        steps: {
            'feedback-form': {
                selector: '.feedback-form',
                next_step: 'finish',
                data: {
                    type: null,
                    name: null,
                    email: null,
                    text: null
                },
                inputs: {
                    type: {
                        selector: 'select.feedback-type'
                    },
                    name: {
                        selector: 'input.name',
                        validators: ['min-3,max-32', 'required'],
                        hint: ''
                    },
                    email: {
                        selector: 'input.email',
                        validators: ['min-3', 'max-32', 'email', 'required'],
                        hint: ''
                    },
                    text: {
                        selector: 'textarea.text',
                        validators: ['min-3,max-1024', 'required'],
                        hint: ''
                    }
                },
                finish: function (merlin, dom) {
                    if (merlin.current_step.inputs.type.dom.hasClass('changed')) {
                        var feedbackType = merlin.current_step.inputs.type.dom.text()
                    } else {
                        var feedbackType = 'general'
                    }

                    merlin.options.data = tc.jQ.extend(merlin.options.data, {
                        type: feedbackType,
                        name: merlin.current_step.inputs.name.dom.val(),
                        email: merlin.current_step.inputs.email.dom.val(),
                        text: merlin.current_step.inputs.text.dom.val()
                    });
                }
            },
            'finish': {
                selector: '.finish',
                init: function (merlin, dom) {
                    tc.jQ.ajax({
                        type: 'POST',
                        url: '/feedback',
                        data: merlin.options.data,
                        context: merlin,
                        dataType: 'text',
                        success: function (data, ts, xhr) {
                            if (data == 'False') {
                                this.show_step('feedback-error');
                                return false;
                            }
                            this.show_step('thanks');
                        },
                        error: function (data, ts, xhr) {
                            tc.util.log(data);
                        }
                    });

                }
            },
            'thanks': {
                selector: '.thanks'
            },
            'feedback-error': {
                selector: '.feedback-error'
            }
        }
    });

    tc.jQ(function () {
        tc.jQ("select.feedback-type").jqDropDown({
            direction: 'down',
            effect: 'fade',
            effectSpeed: 150,
            placeholder: '.feedback-type'
        });
    });
});
