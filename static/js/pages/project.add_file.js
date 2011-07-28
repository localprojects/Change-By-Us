/**
 * File:
 * Page JS for Project file attachments.
 */

// Initial objects, if for some reason they have not been.
var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

/**
 * Add file widget for projects
 */
tc.gam.project_widgets.add_file = function(project, dom, deps, options) {
    var me = this;

    // Set options and properties (??)
    this.options = tc.jQ.extend({name:'add_file'}, options);
    this.dom = dom;
    var widget = tc.gam.widget(this, project);
    
    this.handlers = {};
    this.elements = { window: tc.jQ(window) };
    this.components = { merlin: null }

    // Build Merlin component (??)
    this.build_merlin = function() {
        if (this.components.merlin) {
            return;
        }
        this.components.merlin = new tc.merlin(options.app, {
            name: 'add-file',
            dom: dom.find('.merlin.add-file'),
            next_button: dom.find('a.submit'),
            first_step: 'file-info',
            use_hashchange: false,
            data: {
                project_id: null,
                title: null,
                url: null,
                main_text: ''
            },
            steps: {
                'file-info': {
                    selector: '.step.add-file-step',
                    next_step: 'file-submit',
                    inputs: {
                        title: {
                            selector:'input.file-title',
                            validators: ['min-3', 'max-50', 'required'],
                            hint: 'File title',
                            counter:{
                                selector: '.charlimit.title',
                                limit: 50
                            }
                        },
                    },
                    init: function(merlin, dom) {
                        merlin.current_step.inputs.title.dom
                            .removeClass('has-been-focused')
                            .removeClass('has-attempted-submit')
                            .val('')
                            .triggerHandler('keyup');
                        
                        merlin.current_step.inputs.title.dom.val('Title');
                        
                    },
                    finish: function(merlin, dom) {
                        merlin.options.data = tc.jQ.extend(merlin.options.data, {
                            project_id: merlin.app.app_page.data.project.project_id,
                            title: merlin.current_step.inputs.title.dom.val(),
                        });
                    }
                },
                'file-submit': {
                    selector: '.step.submit-file-step',
                    next_step: 'goal-info',
                    init: function(merlin, dom){
                        tc.jQ.ajax({
                            type: 'POST',
                            url: '/project/file/add',
                            data: merlin.options.data,
                            context: merlin,
                            dataType: 'text',
                            success: function(data, ts, xhr) {
                                if (data == 'False'){
                                    return false;
                                }
                                project.dom.trigger('resources-refresh', {type: 'link'});
                                window.location.hash = 'project-home';
                            }
                        });
                    }
                }
            }
        });
    };
    
    // Call the build step (??)
    this.build_merlin();

    // Return object
    return {
        show: function(propagate) {
            widget.show(propagate);
            if (me.components.merlin) {
                me.components.merlin.show_step('file-info');
            }
            
            // Scroll up to the top.
            if ((me.dom.offset().top - me.elements.window.scrollTop()) < 0) {
                me.elements.window.scrollTop(0);
            }
        },
        hide: widget.hide
    };
};