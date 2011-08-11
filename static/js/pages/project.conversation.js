if(!tc){ var tc = {}; }
if(!tc.gam){ tc.gam = {}; }
if(!tc.gam.project_widgets){ tc.gam.project_widgets = {}; }
tc.gam.project_widgets.conversation = function(project, $dom, deps, opts){
    var me = this,
        widget = tc.gam.widget(me, project),
        options = tc.jQ.extend({name:'conversation'}, opts),
        components = {
            merlin:null
        },
        runtime_data = {
            message_filter:'all',
            n_to_fetch:10,
            offset: options.app.app_page.data.project.info.messages.n_returned,
            message_template:tc.jQ("<li class='message-markup'></li>").append(tc.jQ('.template-content.message-markup').clone().children())
        },
        state = {
            widgetId: 'conversation-comment', //The activated widget id
            fileUploader: 'new',              //The file state: new, successful, unsuccessful, needsreset
            messages: {}                      //The message by widget id
        };
    
    //backwards compatibility
    me.dom = $dom;
    me.options = options;
    
    tc.util.dump(options);

    var refreshUi = function() {
        // Remove active class
        elements.message_type_button.parent().removeClass('active');
        
        // Set active class
        $('#' + state.widgetId).parent().addClass('active');
        
        // Reset the file uploader, for realz
        if (state.fileUploader === 'needsreset') {
            components.file_uploader = getFileUploader();
            state.fileId = '';
            state.fileUploader = 'new';
        }
                
        // Toggle visibility of appropriate conversation widget
        activate_widget[state.widgetId]();

        // Set the text of the textarea based on the activated widget.
        // Call blur to help merlin do validation
        elements.textpane.val(state.messages[state.widgetId] || '').change();
        
        setLabelVisibility();
        
    };

    var activate_widget = {
        /**
         * Function: activate_widget['conversation-comment']
         * Only show the text input conversation widget (hide the file uploader,
         * etc.).
         */
        'conversation-comment' : function() {
            elements.input_message_widget.show();
            elements.input_file_widget.hide();
        },
        
        /**
         * Function: activate_widget['conversation-file']
         * Show the file uploader.  Hide the text input if no file is selected.
         */
        'conversation-file' : function() {
            if (state.fileUploader !== 'successful') {
                elements.input_message_widget.hide();
            }
            elements.input_file_widget.show();
        }
    };
    
    var generate_message = function(d){
        var $out, $main;
        $out = tc.jQ("<li></li>").append(tc.jQ('.template-content.message-markup').clone().children());
        $main = $out.find('.main');
        
        //add user image
        if(d.owner.image_id){
            $out.find('img').attr('src', options.app.app_page.media_root+'images/'+(d.owner.image_id%10)+'/'+d.owner.image_id+'.png' );
        } else {
            $out.find('img').attr('src','/static/images/thumb_genAvatar.jpg');
        }
        
        //handle message type for message author heading
        switch(d.message_type){
            case 'join':
                $main.prepend('<cite class="meta-hd"><strong><a href="/useraccount/'+'XX'+'">'+'XX'+'</a></strong> joined the project!</cite>');
                break;
            default:
                $main.prepend('<cite class="meta-hd"><strong><a href="/useraccount/'+'XX'+'">'+'XX'+'</a></strong> said</cite>');
                break;
        }
        
        //add the idea card if idea is present
        if(d.idea){ 
            $out.find('blockquote.serif').before('<div class="note-card">\
                <cite class="note-meta-hd"></cite>\
                <blockquote>\
                    <p class="message-test">&nbsp;</p>\
                </blockquote>\
                <cite class="note-meta-ft"></cite>\
            </div>');
        }
        
        //add message body, text dependent on message type      
        $out.find('blockquote.serif p').html(handlers.construct_links((d.message_type == 'join' ? d.idea.text : d.body)));
        $out.find('.meta-hd strong a').text(d.owner.name).attr('href','/useraccount/'+d.owner.u_id);
        $out.attr('id','message-'+d.message_id);
        $out.find('.meta-ft').text(d.created).time_since();;
        $out.find('a.close').attr('href','#remove,'+d.message_id);
        return $out;
    };
    
    var elements = {
        userprompt: $dom.find(".conversation-input-message-field label"),
        textpane: $dom.find(".conversation-input textarea"),
        message_stack: $dom.find("ol.comment-stack"),
        load_more_button: $dom.find('.load_more_button'),
        message_type_button: $dom.find('.conversation-tabs a'),
        file_uploader_container: $dom.find('.conversation-input .file-uploader'),
        input_file_widget: $dom.find('.conversation-input-file-field'),
        input_message_widget: $dom.find('.conversation-input-message-field'),
        thumbs: $dom.find('.file-thumb')
    };
    
    var setLabelVisibility = function() {
        // show the default text
        if (tc.validator_utils.is_empty(state.messages[state.widgetId] || '')) {
            elements.userprompt.show();
        } else {
            elements.userprompt.hide();
        }
    };
    
     var handlers = {
        userprompt_click: function(e, d) {
            elements.textpane.focus();
        },
        add_new_message:function(e,d){
            var message, admin_def_msg;
            $dom.find(".empty-state-box").hide();
            admin_def_msg = $dom.find(".admin-default-message");
            if (admin_def_msg.length) {
                admin_def_msg.remove();
            }
            message = generate_message_markup(d);
            message.hide();
            elements.message_stack.prepend(message);
            $dom.find('a.close').unbind('click').bind('click', {project:project,me:e.data.me}, handlers.remove_comment);
            message.slideDown(500);
        },
        construct_links:function(text){
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(exp,"<a target='_blank' href='$1'>$1</a>"); 
        },
        handle_message_body:function(i,j){
            var message, exp;
            message = tc.jQ(j);
            message.html(handlers.construct_links(message.text())); 
        },
        change_message_filter:function(e,d){
            var t = tc.jQ(e.target);
            
            elements.message_stack.children().remove();
            runtime_data.offset = 0;
            if(t.hasClass('changed')){
                runtime_data.message_filter = t.text();
            } else {
                runtime_data.message_filter = t.val();
            }
            
            tc.jQ.ajax({
                type:"GET",
                url:"/project/messages",
                data:{
                    project_id: options.app.app_page.data.project.project_id,
                    n_messages: runtime_data.n_to_fetch,
                    offset: runtime_data.offset,
                    filter: runtime_data.message_filter
                },
                context:e.data.me,
                dataType:"text",
                success: function(data, ts, xhr) {
                    var d, tempdom;
                    try {
                        d = tc.jQ.parseJSON(data);
                    } catch(e) {
                        tc.util.log("/useraccount/messages: json parsing error", "warn");
                        return;
                    }
                    if (!d.length) {
                        return;
                    } else if(d.length < runtime_data.n_to_fetch){
                        elements.load_more_button.animate({
                            opacity:0.0
                        });
                    }
                    for(i in d){
                        elements.message_stack.append(generate_message(d[i]));
                        runtime_data.offset++;
                    }
                    $dom.find('a.close').unbind('click').bind('click', {project:project,me:this}, handlers.remove_comment);
                }
            });
        },
        load_more_button_click:function(e, d){
            e.preventDefault();
            tc.jQ.ajax({
                type:"GET",
                url:"/project/messages",
                data:{
                    project_id: options.app.app_page.data.project.project_id,
                    n_messages: runtime_data.n_to_fetch,
                    offset: runtime_data.offset,
                    filter: runtime_data.message_filter
                },
                context:e.data.me,
                dataType:"text",
                success: function(data, ts, xhr) {
                    var d, tempdom;
                    try {
                        d = tc.jQ.parseJSON(data);
                    } catch(e) {
                        tc.util.log("/useraccount/messages: json parsing error", "warn");
                        return;
                    }
                    if (!d.length) {
                        return;
                    } else if(d.length < runtime_data.n_to_fetch){
                        elements.load_more_button.animate({
                            opacity:0.0
                        });
                    }
                    for(i in d){
                        elements.message_stack.append(generate_message(d[i]));
                    }
                    $dom.find('a.close').unbind('click').bind('click', {project:project,me:this}, handlers.remove_comment);
                    $dom.find('.message-text').each(handlers.handle_message_body);
                }
            });
        },
        remove_comment:function(e){
            e.preventDefault();
            
            e.data.project.options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.modal-content.remove-message')
            });
        },
        textpane_keyup:function(event){
            state.messages[state.widgetId] = $(this).val();
        },
        message_type_button_click:function(event) {
            //Pull the id off the link just clicked
            state.widgetId = tc.jQ(this).attr('id');
            
            //Sync up the UI with the state object
            refreshUi();
            
            //Don't follow the link
            event.preventDefault();
        }, 
        thumb_click:function(event) {
            var $carousel, 
                $carouselControls,
                fileId = parseInt($(this).attr('data-id'), 10);
            
            event.preventDefault();

            project.options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.conversation-media-modal')
            });

            $carousel = tc.jQ('#modal .conversation-media-modal .carousel');
            $carouselControls = tc.jQ('.carousel-controls', $carousel).hide();

            if (me.carousel) {
                me.carousel.destroy();
            }

            tc.jQ.ajax({
                type:'GET',
                url:'/project/messages',
                data:{
                    project_id: options.app.app_page.data.project.project_id
                },
                dataType:'json',
                success: function(data, status, xhr) {
                    var i, selectedIndex = 0, html = '';
                    
                    //show the controls if more than one result
                    if (data.length > 1) {
                        $carouselControls.show();
                    }
                    
                    //with the ajax results
                    for (i=0; i<data.length; i++) {
                        if (data[i].attachment && data[i].attachment.type === 'image') {
                            html += '<li><div class="attachment-img"><img src="' + data[i].attachment.large_thumb_url + '" alt="' + data[i].attachment.title + '" /></div>' + 
                                    '<div class="attachment-desc">' + data[i].body + '</div></li>';
                            
                            //Is this the index that we clicked to open the carousel?
                            if (data[i].file_id === fileId) {
                                selectedIndex = i;
                            }
                        }
                    }

                    $carousel.find('.items').html(html);

                    me.carousel = new tc.carousel({
                        element: $carousel,
                        scrollable: {
                            items: '.items',
                            speed: 300,
                            circular: true,
                            initialIndex: selectedIndex
                        }
                    });
                },
                error: function(xhr, status, error) {
                    $carousel.find('.items').html('<li>Uh oh. We couldn\'t get that image. Would you mind trying again?</li>');
                }
            });
        }
    };
    
    function generate_message_markup(data){
        tc.util.dump(data);
        var markup;
        markup = tc.jQ("<li class='message-markup'></li>").append(tc.jQ('.template-content.message-markup').clone().children());
        markup.attr('id','message-'+data.message_id);
        //markup.find('img').attr('src','/images/'++'/'++'.png')
        markup.find('a.close').hide();//.attr('href','#remove,'+data.message_id);
        markup.find('p.message-body').html(handlers.construct_links(data.message));
        
        if (data.medium_thumb_url) {
            markup.find('.file-thumb').html('<img src="'+data.medium_thumb_url+'" alt="File thumbnail" />');
        }
        
        if(options.app.app_page.user){
            if(options.app.app_page.user.image_id){
                markup.find(".thumb img").attr("src", options.app.app_page.media_root+"images/"+(options.app.app_page.user.image_id % 10)+"/"+options.app.app_page.user.image_id+".png");
            }
            markup.find(".meta-hd > strong").html("<a href='/useraccount/"+options.app.app_page.user.user_id+"'>"+options.app.app_page.user.f_name+" "+options.app.app_page.user.l_name.substring(0,1)+"</a>");
        } else {
            markup.find(".meta-hd").hide();
        }
        
        return markup;
    }
    
    var getMerlin = function() {
        tc.util.log('conversation.build_merlin');
        if(components.merlin){
            return components.merlin;
        }
        
        return new tc.merlin(options.app,{
            name:'project_conversation',
            dom:$dom.find('.merlin.submit-message'),
            next_button:$dom.find('a.submit-button'),
            first_step:'message',
            data:{
                message:null,
                project_id:null,
                main_text:""
            },
            use_hashchange:false,
            steps: {
                //Step 1
                'message':{
                    selector:'.step.message',
                    next_step:'message-submit',
                    inputs:{
                        message:{
                            selector:'textarea.message-input',
                            validators:['min-3','max-200','required'],
                            hint:'',
                            handlers:{
                                focus:function(event, data) {
                                    elements.userprompt.hide();
                                },
                                blur:function(event, data) {
                                    setLabelVisibility();
                                }
                            }
                        },
                        main_text:{
                            selector:'input.main_text',
                            validators:['max-0']
                        }
                    },
                    init:function(merlin, dom) {
                        merlin.current_step.inputs.message.dom.val('').removeClass('has-been-focused has-attempted-submit');
                    },
                    finish:function(merlin, dom) {
                        tc.util.dump(merlin.current_step.dom.height());
                        merlin.dom.find('.step.submit').css('height', merlin.current_step.dom.height());
                        merlin.options.data = {
                            project_id:merlin.app.app_page.data.project.project_id,
                            message:merlin.current_step.inputs.message.dom.val(),
                            main_text:merlin.current_step.inputs.main_text.dom.val(),
                            thumb_url: tc.jQ('.conversation-file-thumb').attr('src'),
                            attachment_id: state.fileId
                        };
                    }
                },
                //Step 2
                'message-submit':{
                    selector:'.step.submit',
                    init:function(merlin, dom){
                        tc.jQ.ajax({
                            type:'POST',
                            url:'/project/message/add',
                            data:merlin.options.data,
                            context:merlin,
                            dataType:'text',
                            success:function(data,ts,xhr){
                                if(data == 'False'){
                                    //window.location.hash = 'project_conversation,message-submit-error';
                                    this.show_step('message-submit-error');
                                    return false;
                                }
                                project.dom.trigger('add-new-message', this.options.data); //"this" is the merlin
                                //window.location.hash = 'project_conversation,message';

                                //We just posted the message, so let's reset everything
                                state.messages = {};
                                state.fileUploader = 'needsreset';
                                refreshUi();

                                //We're done, go back to step 1 so we can do it again!
                                this.show_step('message');
                            }
                        });
                    }
                },
                //Step Error
                'message-submit-error':{
                    selector:'.step.submit-error',
                    init:function(merlin,dom){
                        tc.timer(1000,function(){
                            merlin.show_step('message');
                            //window.location.hash = 'project_conversation,message';
                        });
                    }
                }
            }
        });
    };
    
    /**
     * Function: getFileUploader
     * Create a file upload widget and put it in the appropriate place.
     */
    var getFileUploader = function() {
        return new qq.FileUploader({
            element: elements.file_uploader_container.get(0),
            action: '/create/attachment',
            multiple: false,
            sizeLimit: 20971520, //max size, 20 mb in bytes
            params: {
                max_width:100,
                max_height:100
            },
            template:'<div class="qq-uploader">' + 
                        '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
                        '<div class="qq-upload-button"><label>Browse for file</label></div>' +
                     '</div>' + 
                     '<ul class="qq-upload-list"></ul>',
            fileTemplate: '<li>' +
                '<span class="qq-upload-file-thumb"><img src="/static/images/loader32x32.gif" style="margin: 16px;"></span>' +
                '<span class="qq-upload-file-details">' +
                    '<span class="qq-upload-file"></span>' +
                    '<span class="qq-upload-spinner"></span>' +
                    '<a class="qq-upload-cancel" href="#">Cancel</a>' +
                    '<span class="qq-upload-failed-text">Failed</span>' +
                    '<div class="qq-upload-size"></div>' +
                '</span>' +
            '</li>',
            onSubmit: function(fileName) {
                // Hide the browse for file button
                $('.qq-uploader').hide();
                
                // Show the message input field
                $('.conversation-input-message-field').show();
            },
            onComplete: function(id, fileName, responseJSON) {
                // Trigger uploaded event with new image IDs
                tc.util.log(id);
                tc.util.log(fileName);
                tc.util.log(responseJSON);
                
                if (responseJSON.success) {
                    $('.qq-upload-file-thumb').empty().append('<img class="conversation-file-thumb" src=' + responseJSON.thumb_url + '>');
                    state.fileUploader = 'successful';
                    state.fileId = responseJSON.id;
                } 
                
                else {
                    // TODO: determine what else needs to happen on failure.
                    state.fileUploader = 'unsuccessful';
                }
                
                return true;
            }
        });
    };
    
    /**
     * Function: isProjectMember
     * Is the user a member of this project?
     */
    var isProjectMember = function() {
        return ( 
            (options.app.app_page.project_user.is_member) || 
            (options.app.app_page.project_user.is_project_admin) || 
            (options.app.app_page.user && options.app.app_page.user.is_admin) ||
            (options.app.app_page.user && options.app.app_page.user.is_leader) 
        );
    };
    
    /**
     * Function: bindEvents
     * Bind events during initialization.
     */
    var bindEvents = function() {
        project.dom.bind('add-new-message',{me:me},handlers.add_new_message);
        elements.load_more_button.bind('click', { project:project,me:me }, handlers.load_more_button_click);
        if (elements.userprompt.length) {
            elements.userprompt.bind("click", { project:project,me:me }, handlers.userprompt_click);
        }
        if (elements.textpane.length) {
            elements.textpane.elastic(); //make textarea auto grow its height
        }
        
        // TODO: The following are inconsistent with the way that we're using 
        //       the elements object. We should correct that.
        $dom.find('select.message_filter_select').unbind('change').bind('change', {project:project,me:me}, handlers.change_message_filter);
        $dom.find('a.close').unbind('click').bind('click', {project:project,me:me}, handlers.remove_comment);
        
        elements.message_type_button.click(handlers.message_type_button_click);
        
        //Update the state object when the key is pressed
        elements.textpane.keyup(handlers.textpane_keyup);
        
        //Show the modal carousel of higher res media
        elements.thumbs.live('click', handlers.thumb_click);
    };
    
    /**
     * Function: init
     * Initialize the conversation widget.
     */
    var init = function() {
        bindEvents();
        
        $dom.find('.message-text').each(handlers.handle_message_body);

        //If this user is a member of the project
        if(isProjectMember()) {
            //Enable the merlin widget for participating in the conversation
            components.merlin = getMerlin();
            tc.util.log('----- Merlin!!! -----');
            tc.util.log(components.merlin);
            components.file_uploader = getFileUploader();
            tc.util.log('----- Components!!! -----');
            tc.util.log(components.file_uploader);
            components.merlin.show_step('message');
        }
    };
    
    init();
    
    return { 
        show: function(){
            components.merlin.show_step('message');
            widget.show();
        },
        hide: widget.hide
    };
};
