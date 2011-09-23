if (window.EnvJasmine) {
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.base.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.util.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'pages/project.data.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'pages/project.event_form.js');
}

describe('project.need_form.js', function () {
    var event_form,
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
                is_leader: false,
                u_id: 5
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
        event_form = tc.gam.project_widgets.event_form(mock_options);
    });

    describe('_makeDateString', function () {
        it('makes a date string out of a config object', function() {
            expect(event_form._makeDateString({
              year: '2011',
              month: '9',
              day: '22',
              hour: '5',
              minute: '21',
              meridiem: 'PM'
            })).toEqual('2011-9-22 17:21');
            
            expect(event_form._makeDateString({
              year: '2011',
              month: '9',
              day: '22',
              hour: '5',
              minute: '21',
              meridiem: 'AM'
            })).toEqual('2011-9-22 5:21');
        });
    });
});