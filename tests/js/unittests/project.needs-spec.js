if (window.EnvJasmine) {
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.base.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.util.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'pages/project.data.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'pages/project.needs.js');
}

describe('project.needs.js', function () {
    var need_widget,
        mock_options = {
            //for merlin
            app: {
                components: {
                    modal: {}
                }
            },
            //project specific data
            project_data: {
                info: {
                    owner: { u_id: 100 }
                }
            },
            //user data
            user: {
                is_admin: false,
                is_leader: false
            },
            //project user data
            project_user: {
                is_member: false,
                is_project_admin: false
            },
            //root directory for images and such
            media_root: 'http://cbumedia.com',
            dom: tc.jQ('body'),
            name: 'test'
        };

    beforeEach(function() {
        need_widget = tc.gam.project_widgets.needs(mock_options);
    });

    describe('isVolunteer', function () {
        it('returns true if the user is in a list of volunteers', function() {
            var vols = [{ id: '1'}, { id: 2} ]

            expect(need_widget.isVolunteer(1, vols)).toBeTruthy();
            expect(need_widget.isVolunteer('1', vols)).toBeTruthy();
            expect(need_widget.isVolunteer(2, vols)).toBeTruthy();
            expect(need_widget.isVolunteer('2', vols)).toBeTruthy();
            expect(need_widget.isVolunteer(4, vols)).toBeFalsy();
            expect(need_widget.isVolunteer('4', vols)).toBeFalsy();
        });
    });
});