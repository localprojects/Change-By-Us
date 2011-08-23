/**
 * File: Project
 * This file provides the main logic, event handling, and
 * widget container for the Project page and features.
 *
 * Filename:
 * tc.game.project.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 * - tc.gam.app.js
 */

/**
 * Variable: tc.gam.project_widgets
 * Container for project widgets.
 */
tc.gam.project_widgets = tc.gam.project_widgets || {};

/**
 * Function: tc.gam.widget
 * Widget object to extend other widgets.  Specifically
 * this adds a show and hide function for each widget.
 *
 * Parameters:
 * inheritor - {Object} Object to add functionality to.
 * project - {Object} Project object for DOM use?
 *
 * Returns:
 * {Object} Original inheritor object passed in with new
 * properties.
 */
tc.gam.widget = function (inheritor, project) {
    if (!inheritor) {
        return;
    }

    inheritor.show = function (propagate) {
        if (inheritor.dom) {
            inheritor.dom.show();
        }
        if (propagate !== false) {
            project.dom.trigger('project-widget-show', {
                name: inheritor.options.name
            });
        }
    };

    inheritor.hide = function (propagate) {
        if (inheritor.dom) {
            inheritor.dom.hide();
        }
        if (propagate !== false) {
            project.dom.trigger('project-widget-hide', {
                name: inheritor.options.name
            });
        }
    };

    return inheritor;
};

/**
 * Function: tc.gam.project
 * Project object that handles overarching logic of project.
 *
 * Parameters:
 * options - {Object} Object of options
 */
tc.gam.project_old = function(options) {
    var hash_onload;
    var me = this;
    var this_project = this;

    // Combine options (this is currently unnecessary).
    this.options = tc.jQ.extend({}, options);

    // Define local properties.
    this.dom = this.options.dom;
    this.event_data = {
        project: this
    };
    this.data = this.options.data;
    this.widget = new tc.gam.widget(null, this);

    // Get hash location.
    hash_onload = window.location.hash;

    // Components of the project interface.
    this.components = {
        'infopane': new tc.gam.project_widgets.infopane(this, this.dom.find('.box.mission'),
            { widget: this.widget }, { app: options.app }),
        'resources': new tc.gam.project_widgets.resources(this, this.dom.find('.box.resources'),
            { widget: this.widget }, { app: options.app }),
        'related_resources': new tc.gam.project_widgets.related_resources(this, this.dom.find('.box.related-resources'),
            { widget: this.widget }, { app: options.app }),
        'add_link': new tc.gam.project_widgets.add_link(this, this.dom.find('.box.add-link'),
            { widget: this.widget }, { app: options.app }),
        'conversation': new tc.gam.project_widgets.conversation(this, this.dom.find('.box.conversation'),
            { widget: this.widget }, { app: options.app }),
        'members': new tc.gam.project_widgets.members(this, this.dom.find('.box.members'),
            { widget: this.widget }, { app: options.app })
    };

    // Add fresh ideas component if available.
    if (tc.gam.project_widgets.fresh_ideas) {
        this.components.related_ideas = new tc.gam.project_widgets.fresh_ideas(this,
            this.dom.find('.box.fresh-ideas'), { widget: this.widget }, { app: options.app });
    }

    // Return project page to initial state.
    this.go_home = function (e) {
        if (e) {
            e.data.project.components.conversation.show(false);

            if (tc.gam.project_widgets.members) {
                e.data.project.components.members.hide(false);
            }
            e.data.project.components.add_link.hide(false);
            e.data.project.components.related_resources.hide(false);
        } else {
            this.components.conversation.show(false);
        }
    };

    // Object of handlers.
    this.handlers = {
        // This function shows a specific widget, more specficially
        // it hides the other widgets.
        widget_show: function (e, d) {
            switch (d.name) {
                case 'members':
                    e.data.project.components.conversation.hide(false);
                    e.data.project.components.add_link.hide(false);
                    break;
                    
                case 'related_resources':
                    e.data.project.components.members.hide(false);
                    e.data.project.components.conversation.hide(false);
                    e.data.project.components.add_link.hide(false);
                    break;
                    
                case 'add_link':
                    e.data.project.components.members.hide(false);
                    e.data.project.components.conversation.hide(false);
                    e.data.project.components.related_resources.hide(false);
                    break;
            }
        },
        
        // Hide widget.  This just uses the go_home function in all cases.
        widget_hide: function (e, d) {
            switch (d.name) {
                case 'members':
                case 'related_resources':
                case 'add_link':
                    this_project.go_home(e);
                    break;
                }
        },
        
        // Hash change event.
        hashchange: function (e) {
            var hash = window.location.hash.substring(1, window.location.hash.length);
            
            // For project-home hash, fire go_home.
            if (hash == 'project-home') {
                e.preventDefault();
                this_project.go_home(e);
                return;
            }
            
            // Handle the format of (show|hide),component-id
            switch (hash.split(',')[0]) {
                case 'show':
                    e.preventDefault();
                    if (e.data.project.components[hash.split(',')[1]]) {
                        e.data.project.components[hash.split(',')[1]].show();
                    }
                    break;
                    
                case 'hide':
                    e.preventDefault();
                    if (e.data.project.components[hash.split(',')[1]]) {
                        e.data.project.components[hash.split(',')[1]].hide();
                    }
                    break;
                }
        },
        
        // Remove idea event.
        idea_remove: function (e, d) {
            if (e.data.project.components.related_ideas) {
                e.data.project.components.related_ideas.remove_idea(d.id);
            }
            e.data.project.components.members.remove_idea(d.id);
        }
    };

    // Bind events.
    tc.jQ(window).bind('hashchange', this.event_data, this.handlers.hashchange);
    this.dom.bind('project-widget-show', this.event_data, this.handlers.widget_show);
    this.dom.bind('project-widget-hide', this.event_data, this.handlers.widget_hide);
    this.dom.bind('project-idea-remove', this.event_data, this.handlers.idea_remove);

    // Fire off hashchange event.
    window.location.hash = hash_onload;
    tc.jQ(window).trigger('hashchange');
};