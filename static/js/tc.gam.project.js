tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project = function(app, dom) {
    // Create an object to handle widget visibility events
    tc.gam.widgetVisibilityHandler();

    var widget_options = {
        app: app,                                   //for merlin
        project_data: app.app_page.data.project,    //project specific data
        user: app.app_page.user,                    //user data
        project_user: app.app_page.project_user,    //project user data
        media_root: app.app_page.media_root         //root directory for images and such
    };

    app.components.project_widgets = {
        'infopane': tc.gam.project_widgets.infopane(
            tc.jQ.extend({ name: 'infopane', dom: dom.find('.box.mission') }, widget_options)
        ),
        'resources': tc.gam.project_widgets.resources(
            tc.jQ.extend({ name: 'resources', dom: dom.find('.box.resources') }, widget_options)
        ),
        'related_resources': tc.gam.project_widgets.related_resources(
            tc.jQ.extend({ name: 'related_resources', dom: dom.find('.box.related-resources') }, widget_options)
        ),
        'add_link': tc.gam.project_widgets.add_link(
            tc.jQ.extend({ name: 'add_link', dom: dom.find('.box.add-link') }, widget_options)
        ),
        'conversation': tc.gam.project_widgets.conversation(
            tc.jQ.extend({ name: 'conversation', dom: dom.find('.box.conversation') }, widget_options)
        ),
        'members': tc.gam.project_widgets.members(
            tc.jQ.extend({ name: 'members', dom: dom.find('.box.members') }, widget_options)
        )
    };
};