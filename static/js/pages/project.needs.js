var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.needs = function(options) {
    tc.util.log('project.needs');
    var dom = options.dom,
        modal = options.app.components.modal,
        merlin,
        MAX_AVATARS = 5,
        self = {};

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

    self._getUserId = function() {
        if (options.user && options.user.u_id) {
            return options.user.u_id;
        }
        return null;
    };

    self._getDetailTemplateData = function(need_details) {
        var new_details = tc.jQ.extend(true, {
                day: function() { return this.date ? (new Date(this.date).getUTCDate()) : ''; },
                month: function() { return this.date ? (new Date(this.date).getUTCMonth()+1) : ''; }
            }, need_details);

        //Special cases for the first volunteer
        new_details.has_first = need_details.volunteers.length > 0;
        if (new_details.has_first) {
            new_details.first_vol = need_details.volunteers[0];
            new_details.volunteers = need_details.volunteers.slice(1, MAX_AVATARS+1);
            new_details.vol_count_minus_one = need_details.volunteers.length-1;
            new_details.avatar = function() { return this.avatar_path ? (options.media_root + this.avatar_path) : '/static/images/thumb_genAvatar.jpg'; };
        }

        return new_details;
    };

    var mergeDetailTemplate = function(need_details) {
        var new_details = self._getDetailTemplateData(need_details),
            $html = ich.need_detail_tmpl(new_details);

        dom.find('.need-stack').html($html);
        updateNeed(need_details);
    };

    self._isVolunteer = function(id, volunteers) {
        var i;
        for (i=0; i<volunteers.length; i++) {
            if (parseInt(volunteers[i].id, 10) === parseInt(id, 10)) {
                return true;
            }
        }
        return false;
    };

    self._getVolunteerButtonConfig = function(vols_needed, volunteers, user_id) {
        if (self._isVolunteer(user_id, volunteers)) {
            return { cssClass: 'in-process', text: 'I am helping'};
        } else {
            if (vols_needed !== volunteers.length) {
                return { cssClass: 'active', text: 'I can help'};
            } else {
                return { cssClass: 'complete', text: 'Complete!'};
            }
        }
    };

    self._getProgressElementWidth = function(max_width, cur_vol_count, vols_needed) {
        return max_width * cur_vol_count / vols_needed;
    };

    self._updateVolunteerProgress = function($container, need) {
        var $volCount = $container.find('.volunteer-count strong'),
            $progress = $container.find('.progress'),
            quantityNum = parseInt(need.quantity, 10);

        $volCount.text(need.volunteers.length);
        $progress.width(self._getProgressElementWidth($progress.parent().width(), need.volunteers.length, quantityNum));
    };

    self._updateVolunteerButton = function($container, need) {
        var $helpLink = $container.find('.help-link'),
            quantityNum = parseInt(need.quantity, 10),
            buttonConfig = self._getVolunteerButtonConfig(quantityNum, need.volunteers, self._getUserId());

        $helpLink
            .removeClass('active in-process complete')
            .addClass(buttonConfig.cssClass)
            .text(buttonConfig.text);
    };

    self._updateSmallAvatars = function($container, need) {
        var $avatars = $container.find('.vol-avatars'),
            $avatar_html;

        $avatar_html = ich.need_vol_avatars({
            volunteers: need.volunteers.slice(0, MAX_AVATARS),
            avatar: function() {return this.avatar_path ? (options.media_root + this.avatar_path) : '/static/images/thumb_genAvatar.jpg'; }
        });

        $avatars.html($avatar_html);
    };

    var updateNeed = function(need) {
        var $needContainer = tc.jQ('.need[data-id|="'+need.id+'"]');

        self._updateVolunteerProgress($needContainer, need);
        self._updateVolunteerButton($needContainer, need);
        self._updateSmallAvatars($needContainer, need);
    };

    /**
     * Function: volunteer
     * The user can volunteer for a specific need.
     */
    var volunteer = function(need, message, callback) {
        var $error_msg = modal.options.element.find('.error-msg').hide();

        tc.jQ.ajax({
            url: '/rest/v1/needs/'+need.id+'/volunteers/',
            data: { member_id: self._getUserId() },
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
                                    if (self.need_id) {
                                        tc.gam.project_data.getNeedDetails(self.need_id, mergeDetailTemplate);
                                    } else {
                                        tc.gam.project_data.getNeedDetails(data.need_id, updateNeed);
                                    }
                                    modal.hide();
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
            h = ich.add_vol_need_tmpl(need);

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
        tc.jQ(tc).bind('show-project-widget', function(event, widgetName, id) {
            if (options.name === widgetName) {
                tc.util.log('&&& showing ' + options.name);

                //We're going to show one need in detail, so go fetch
                //the details and setup the template
                if (id) {
                    self.need_id = id;
                    tc.gam.project_data.getNeedDetails(self.need_id, function(need_details) {
                        mergeDetailTemplate(need_details);
                        dom.show();
                    });
                } else {
                    dom.show();
                }
            } else {
                tc.util.log('&&& hiding ' + options.name);
                dom.hide();
            }
        });

        tc.jQ('.help-link').die('click').live('click', function(event) {
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

        tc.jQ('a.need-delete').die('click').live('click', function(event) {
            event.preventDefault();
            options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.modal-content.remove-need'),
                submit: function(){
                    tc.gam.project_data.deleteNeed(event.target.href.split(',')[1],
                                                   function(data, status, xhr) {
                                                       if(data == 'False'){return false;}
                                                       window.location.hash = 'show,needs';
                                                       window.location.reload();
                                                   });
                }
            });
        });
    };

    bindEvents();

    return self;
};
