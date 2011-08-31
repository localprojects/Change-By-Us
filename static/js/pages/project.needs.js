var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.needs = function(options) {
    tc.util.log('project.needs');
    var dom = options.dom,
        modal = options.app.components.modal,
        merlin;

    /**
     * Function: isProjectMember
     * Is the user a member of this project?
     * TODO: find a common place for this to live.
     */
    var isProjectMember = function() {
        return (
            (options.project_user.is_member) ||
            (options.project_user.is_project_admin) ||
            (options.user && options.user.is_admin) ||
            (options.user && options.user.is_leader)
        );
    };

    var updateNeed = function(need_id) {
        var $needContainer = tc.jQ('.need[data-id|="'+need_id+'"]'),
            $volCount = $needContainer.find('.volunteer-count strong'),
            $progress = $needContainer.find('.progress'),
            $avatars = $needContainer.find('.vol-avatars'),
            $helpLink = $needContainer.find('.help-link');

        tc.gam.project_data.getNeedDetails(need_id, function(need) {
            var $avatar_html, 
                MAX = 5, 
                quantityNum = parseInt(need.quantity, 10);
            
            $volCount.text(need.volunteers.length);
            $progress.width($progress.parent().width() * need.volunteers.length / quantityNum);
            
            $helpLink.removeClass('active');
            if (quantityNum === need.volunteers.length) {
                $helpLink.addClass('complete').text('Complete!');
            } else {
                $helpLink.addClass('in-process').text('I am helping');
            }
            
            $avatar_html = ich.need_vol_avatars({
                volunteers: need.volunteers.slice(0, MAX),
                use_avatar: function() { return this.avatar_path; },
                use_generic: function() { return !this.avatar_path; }
            });
            
            $avatars.html($avatar_html);
        });
    };

    /**
     * Function: volunteer
     * The user can volunteer for a specific need.
     */
    var volunteer = function(need, message, callback) {
        var $error_msg = modal.options.element.find('.error-msg').hide();

        tc.jQ.ajax({
            url: '/rest/v1/needs/'+need.id+'/volunteers/',
            data: { member_id: options.user.u_id },
            dataType: 'json',
            type: 'POST',
            success: function(volunteer_data, status, xhr) {

                tc.jQ.ajax({
                    url: '/directmsg',
                    type: 'POST',
                    data: {
                        message: message,
                        to_user_id: options.project_data.info.owner.u_id
                    },
                    success: function(message_data, status, xhr) {
                        callback(volunteer_data);
                    },
                    error: function(xhr, status, error) {
                        $error_msg.show();
                    }
                });

            },
            error: function(xhr, status, error) {
                $error_msg.show();
            }
        });
    };

    /**
     * Function: initMerlin
     * Initialize the merlin object for validation of the modal dialog.
     */
    var initMerlin = function(need) {
        var merlin;

        //Please note that this is very tricky due to the fact that the
        //content of the modal is actually being cloned by the modal widget.
        //This means that there are duplicate elements in the DOM, even
        //ids. This means you should be very specific and careful with your
        //selectors. Also, Pretty Checkboxes rely on label[for] input[id]
        //matching. You will have issues if you have duplicates of these.
        //Yes, this is from experience. =)

        //Make the Pretty Checkbox elements relative to the #modal have
        //ids that you unique from the template.
        modal.options.element.find('.volunteer-agree-section input').attr('id', 'unique-volunteer-agree');
        modal.options.element.find('.volunteer-agree-section label').attr('for', 'unique-volunteer-agree');
        modal.options.element.find('input[type=checkbox]').prettyCheckboxes();

        //We are using merlin only for the built-in validation in this case.

        merlin =  new tc.merlin(options.app, {
            name:'volunteer',
            dom:modal.options.element.find('.user-volunteer-modal.merlin'),
            next_button:modal.options.element.find('.user-volunteer-modal.merlin a.send'),
            first_step:'volunteer_agree',
            use_hashchange:false,
            steps: {
                'volunteer_agree': {
                    selector:'.step.user-volunteer',
                    //These selectors are within the context of the "merlin" root element
                    inputs:{
                        //This is the message being sent to the organizer.
                        'volunteer_agree_msg': {
                            selector:'.volunteer-agree-msg',
                            validators:['max-300'],
                            hint:'',
                            counter: {
                                // selector: jQuery selectory for element to fill with counter.
                                selector: '.charlimit.charlimit-volunteer-agree-msg',
                                // limit: Character limit for counter.  This should be in align
                                // with a validator of max-X.
                                limit: 300
                            }
                        },
                        //This is the checkbox to agree to sign up.
                        'volunteer_agree':{
                            selector:'input.volunteer-agree',
                            validators:['required']
                        }
                    },
                    init:function(merlin, dom) {
                        merlin.options.next_button.click(function(event) {
                            var $this = tc.jQ(this),
                                message = merlin.options.steps.volunteer_agree.inputs.volunteer_agree_msg.dom.val();

                            if (!$this.hasClass('disabled')) {
                                volunteer(need, message, function(data){
                                    modal.hide();
                                    updateNeed(data.need_id);
                                });
                            }
                        });
                    }
                }
            }
        });

        merlin.show_step('volunteer_agree');
    };

    /**
     * Function: showModal
     * Show the volunteer modal to the user
     */
    var showModal = function(need) {
        //use ICanHaz to fill in the modal content template
        var $needDetailsContent = tc.jQ('.modal-content .volunteer-agree-section .volunteer-agree-label'),
            h = ich.add_vol_need_tmpl({
                need_request: need.request,
                need_datetime: need.datetime,
                need_reason: need.reason,
                has_reason: function() { if (need.reason) return true; else return false; },
                has_datetime: function() { if (need.datetime) return true; else return false; }
            });

        $needDetailsContent.html(h);

        //NOTE: the source_element gets cloned here, so be careful
        //binding events!
        modal.show({
            app:options.app,
            source_element:tc.jQ('.template-content.user-volunteer-modal')
        });

        initMerlin(need);
    };

    /**
     * Function: bindEvents
     * Bind events for this widget
     */
    var bindEvents = function() {
        tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
            if (options.name === widgetName) {
                tc.util.log('&&& showing ' + options.name);
                dom.show();
            } else {
                tc.util.log('&&& hiding ' + options.name);
                dom.hide();
            }
        });

        tc.jQ('.help-link').live('click', function(event) {
            event.preventDefault();
            
            var $this = tc.jQ(this),
                need_id = $this.parents('li.need').attr('data-id');

            if ($this.hasClass('active')) {
                if (isProjectMember()) {
                    tc.gam.project_data.getNeedDetails(need_id, showModal);
                } else {
                    modal.show({
                        app:options.app,
                        source_element:tc.jQ('.modal-content.volunteer-no-member')
                    });
                }
            }
        });
    };

    bindEvents();
};
