/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

/**
 * File: Pages, Project
 * Main logic for Project page.
 *
 * Filename:
 * project.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 * - tc.gam.app.js
 * - tc.gam.project.js
 * - tc.gam.invite.js
 */

/**
 * App Page Feature: Nice Drop Downs
 * Utilizes jqDropDown to make nice drop downs for selects.
 */
app_page.features.push(function(app) {
    tc.jQ("select.duration").jqDropDown({ 
        direction: 'down',
        effect: 'fade',
        effectSpeed: 150,
        placeholder: '.duration'
    });

    tc.jQ("select.point_person").jqDropDown({ 
        direction: 'down',
        effect: 'fade',
        effectSpeed: 150,
        placeholder: '.point_person'
    });
    
    tc.jQ("select.message_filter_select").show().jqDropDown({ 
        direction: 'down',
        effect: 'fade',
        effectSpeed: 150,
        placeholder: '.message_filter_select'
    });
});

/**
 * App Page Feature: Visual Enhancements
 * Various visual enhancements
 */
app_page.features.push(function(app) {
    // random note-card backgrounds
    tc.randomNoteCardBg(tc.jQ('.ideas-invite .items'));
    
    // add 'official resource' tags to resources
    //tc.addOfficialResourceTags(tc.jQ('.box.resources .organizations table.resources-list'));
});

/**
 * App Page Feature: Project Data Events
 * This handles image uploading, and joining and leaving a project.  Also
 * handling idea invite action.
 */
app_page.features.push(function(app) {
    tc.gam.project(app, tc.jQ('.continent.project'));

    // Bind "create-image-uploaded" to document to handle uploading
    // and image via AJAX call.  when successful, display new image as the
    // project image.
    tc.jQ(document).unbind('create-image-uploaded').bind('create-image-uploaded', {
        app: app
    }, function(e, d) {
        e.data.app.components.modal.hide();
        if (d.responseJSON.thumbnail_id) {
            tc.jQ.ajax({
                type: 'POST',
                url: '/project/photo',
                data: {
                    project_id: app_page.data.project.project_id,
                    image_id: d.responseJSON.thumbnail_id
                },
                dataType: 'text',
                success: function(data,ts,xhr) {
                    tc.jQ('img.proj').attr('src', e.data.app.app_page.media_root + 
                        'images/' + (d.responseJSON.thumbnail_id % 10) + '/' + 
                        d.responseJSON.thumbnail_id + '.png');
                }
            });
        }
    });
    
    // Handle modal dialog for project image upload.  Utilize file uploader
    // library; pass the modal definition as event data.  Trigger 
    // "create-image-uploaded" when successful.
    tc.jQ('a.change-image').bind('click', {
        app: app,
        source_element: tc.jQ('.modal-content.upload-image'),
        init: function(modal, callback) {
            var uploader = new qq.FileUploader({
                element: modal.options.element.find('.file-uploader').get(0),
                action: '/create/photo',
                onComplete: function(id, fileName, responseJSON) {
                    // Trigger uploaded event with new image IDs
                    tc.jQ(document).trigger('create-image-uploaded',{
                        id: id,
                        fileName: fileName,
                        responseJSON: responseJSON
                    });
                    return true;
                }
            });
            
            // Call callback if available.
            if(tc.jQ.isFunction(callback)){
                callback(modal);
            }
        }
    },
    function(e, d) {
        // Handle click event.
        e.preventDefault();
        e.data.app.components.modal.show(e.data);
    });
    
    // Handle join project click event.  Utilize a merlin modal dialogue and define
    // it in the click event data.  On no user, do?  
    tc.jQ('a.join-project').bind('click', {
        app: app,
        no_user: {
            source_element: tc.jQ('.modal-content.join-no-user'),
            init: function(modal, event_target, callback) {
                if (tc.jQ.isFunction(callback)) {
                    callback(modal);
                }
            }
        },
        user: {
            source_element: tc.jQ('.modal-content.introduce-yourself'),
            init: function(modal, event_target, callback) {
            	/*
                var modal_merlin = new tc.merlin(app, tc.app.merlin_join_modal(modal, event_target, callback));
                
                if(tc.jQ.isFunction(callback)){
                    callback(modal);
                }
                */
               tc.util.log('WTF')
                tc.jQ.ajax({
                    type: 'POST',
                    url: '/project/join',
                    data: {
                    	project_id: app.app_page.data.project.project_id
                    },
                    context: app,
                    dataType: 'text',
                    success: function(data,ts,xhr) {
                        window.location.reload(true);
                    }
                });
            }
        }
    },
    function(e,d) {
        // Check user, choose appropriate modal.
        if (!e.data.app.app_page.user) {
            e.data.app.components.modal.show(e.data.no_user, e.target);
        } else {
            e.data.app.components.modal.show(e.data.user, e.target);
        }
    });
    
    // Handle leaving project event.  This is done with a modal and AJAX call.
    tc.jQ('a.leave-project').bind('click', { app:app }, function(e, d) {
        var t = tc.jQ(this);
        e.preventDefault();
        
        // Handle modal.
        e.data.app.components.modal.show({
            app: app,
            source_element: tc.jQ('.modal-content.leave-project'),
            submit: function(modal, callback) {
                tc.jQ.ajax({
                    type: 'POST',
                    url: '/project/leave',
                    data: {
                        project_id: app.app_page.data.project.project_id
                    },
                    context: app,
                    dataType: 'text',
                    success: function(data, ts, xhr) {
                        if (data == 'False') {
                            return false;
                        }
                        
                        // Reload page.
                        window.location.reload(true);
                    }
                });
            }
        });
    });
    
    // Handle idea invites.
    tc.gam.ideas_invite(app, {
        elements: tc.jQ('a.invite'),
        ref_project_id: app_page.data.project.project_id
    });
    
    
    var $title = tc.jQ('.project-header .main');
    if(app.app_page.project_user.is_project_admin || ( app.app_page.user &&  app.app_page.user.is_admin)) {
        $title.addClass("mod-inline-edit");
        new tc.inlineEditor({
            dom: $title,
            service: {
                url: "/project/title",
                param: "title",
                post_data: {
                    project_id: app_page.data.project.project_id
                }
            },
            charlimit: 50
        });
    }
});

/**
 * Function: tc.app.merlin_join_modal
 * Defines modal merlin object for project join process.
 */
tc.app.merlin_join_modal = function(modal, event_target, callback) {
    return {
        dom: modal.options.element.find('.introduce-yourself'),
        first_step: 'introduce-message-step',
        data: {
            project_id: app_page.data.project.project_id,
            message: null
        },
        use_hashchange: false,
        steps: {
            'introduce-message-step': {
                selector: '.introduce-message-step',
                inputs: {
                    message: {
                        selector: 'textarea.introduce-message',
                        validators: ['max-200']
                    }
                },
                init: function(merlin, dom) {
                    merlin.dom.mouseenter(function() {
                        merlin.current_step.inputs.message.dom.focus();
                    });
                    dom.find('.submit').bind('click', { merlin: merlin, dom: dom}, function(e,d) {
                        e.preventDefault();
                        if (dom.hasClass('invalid')) {
                            return;
                        }
                        e.data.merlin.show_step('finish');
                    });
                },
                finish: function(merlin,dom) {
                    merlin.options.data.message = merlin.current_step.inputs.message.dom.val();
                }
            },
            'finish': {
                selector: '.finish',
                init: function(merlin, dom) {
                    tc.jQ.ajax({
                        type: 'POST',
                        url: '/project/join',
                        data: merlin.options.data,
                        context: merlin,
                        dataType: 'text',
                        success: function(data,ts,xhr) {
                            window.location.reload(true);
                        }
                    });
                }
            }
        }
    };
};
