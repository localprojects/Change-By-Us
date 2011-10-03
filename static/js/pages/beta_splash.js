app_page.features.push(function(app) {
    if (tc.jQ.cookie && !tc.jQ.cookie('changebyus_betasplash')) {
        app.components.modal.show({
            app: app,
            source_element: tc.jQ('.modal-content.beta-splash')
        });

        tc.jQ.cookie('changebyus_betasplash', 'dontshowthisanymore', { expires: 365 })
    }
});