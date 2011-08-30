tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project = function(app, dom) {
    var widget_options = {
        app: app,                                   //for merlin
        project_data: app.app_page.data.project,    //project specific data
        user: app.app_page.user,                    //user data
        project_user: app.app_page.project_user,    //project user data
        media_root: app.app_page.media_root         //root directory for images and such
    };

    app.components.project_widgets = {
        'home': tc.gam.project_widgets.home(
            tc.jQ.extend({ name: 'home', dom: dom.find('.project-section.home') }, widget_options)
        ),
        'needs': tc.gam.project_widgets.needs(
            tc.jQ.extend({ name: 'needs', dom: dom.find('.project-section.needs') }, widget_options)
        ),
        'need-detail': tc.gam.project_widgets.need_detail(
            tc.jQ.extend({ name: 'need-detail', dom: dom.find('.project-section.need-detail') }, widget_options)
        ),
       'need-form': tc.gam.project_widgets.need_form(
            tc.jQ.extend({ name: 'need-form', dom: dom.find('.project-section.need-form') }, widget_options)
        ),
        'infopane': tc.gam.project_widgets.infopane(
            tc.jQ.extend({ name: 'infopane', dom: dom.find('.box.mission') }, widget_options)
        ),
        'resources': tc.gam.project_widgets.resources(
            tc.jQ.extend({ name: 'resources', dom: dom.find('.box.resources') }, widget_options)
        ),
        'related_resources': tc.gam.project_widgets.related_resources(
            tc.jQ.extend({ name: 'related_resources', dom: dom.find('.project-section.related-resources') }, widget_options)
        ),
        'add_link': tc.gam.project_widgets.add_link(
            tc.jQ.extend({ name: 'add_link', dom: dom.find('.project-section.add-link') }, widget_options)
        ),
        'conversation': tc.gam.project_widgets.conversation(
            tc.jQ.extend({ name: 'conversation', dom: dom.find('.project-section.conversation') }, widget_options)
        ),
        'members': tc.gam.project_widgets.members(
            tc.jQ.extend({ name: 'members', dom: dom.find('.project-section.members') }, widget_options)
        )
    };
    
    // Add fresh ideas component if available.
    if (tc.gam.project_widgets.fresh_ideas) {
        app.components.related_ideas = tc.gam.project_widgets.fresh_ideas(
            tc.jQ.extend({ name: 'fresh_ideas', dom: dom.find('.box.fresh-ideas') }, widget_options)
        );
    }
    
    tc.gam.project_widgets.project_tabs(
        tc.jQ.extend({ name: 'project_tabs', dom: dom.find('.project-tabs') }, widget_options)
    );

    // Create an object to handle widget visibility events
    tc.gam.widgetVisibilityHandler();
};
