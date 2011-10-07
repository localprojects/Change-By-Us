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
        },
        mock_need = {
            "display_date": "August 31st", 
            "project_id": "3", 
            "description": "test stuff", 
            "address": "Code for America", 
            "request": "testers", 
            "date": "2011-08-31", 
            "time": "9:00pm", 
            "duration": "50", 
            "volunteers": [{"display_name": "John D.", "description": null, "image_id": "1", "email": "john.doe@codeforamerica.org", "location_id": "0", "id": "1"},
                           {"display_name": "John E.", "description": null, "image_id": "1", "email": "john.eoe@codeforamerica.org", "location_id": "0", "id": "2"},
                           {"display_name": "John F.", "description": null, "image_id": "1", "email": "john.foe@codeforamerica.org", "location_id": "0", "id": "3"}], 
            "type": "volunteer", 
            "id": "5", 
            "quantity": "6"
        };;

    beforeEach(function() {
        need_widget = tc.gam.project_widgets.needs(mock_options);
    });

    describe('_isVolunteer', function () {
        var vols;
        
        beforeEach(function(){
            vols = [{ id: '1'}, { id: 2} ];
        });
        
        it('returns true if the user is in a list of volunteers', function() {
            expect(need_widget._isVolunteer(1, vols)).toEqual(true);
            expect(need_widget._isVolunteer('1', vols)).toEqual(true);
            expect(need_widget._isVolunteer(2, vols)).toEqual(true);
            expect(need_widget._isVolunteer('2', vols)).toEqual(true);
        });

        it('returns false if the user is not in a list of volunteers', function() {
            var not_defined;

            expect(need_widget._isVolunteer(3, vols)).toEqual(false);
            expect(need_widget._isVolunteer('3', vols)).toEqual(false);
            
            expect(need_widget._isVolunteer(not_defined, vols)).toEqual(false);
            expect(need_widget._isVolunteer(null, vols)).toEqual(false);
        });
    });
    
    describe('_getDetailTemplateData', function () {
        var raw_need_details;
        
        beforeEach(function(){
            raw_need_details = mock_need;
        });
        
        it('creates a "day" template function', function() {
            var new_details = need_widget._getDetailTemplateData(raw_need_details);
            expect(new_details.day).toBeTruthy();
        });
        
        it('creates a "month" template function', function() {
            var new_details = need_widget._getDetailTemplateData(raw_need_details);
            expect(new_details.month).toBeTruthy();
        });

        it('creates a "isVolunteer" template function', function() {
            var new_details = need_widget._getDetailTemplateData(raw_need_details);
            expect(new_details.isVolunteer()).toEqual(true);
        });

        it('creates a "isInKind" template function', function() {
            var new_details = need_widget._getDetailTemplateData(raw_need_details);
            expect(new_details.isInKind()).toEqual(false);
        });

        it('creates a "has_first" template property if there is a least one volunteer', function() {
            var new_details = need_widget._getDetailTemplateData(raw_need_details);
            expect(new_details.has_first).toEqual(true);
        });
        
        it('creates a "first_vol" template property if there is a least one volunteer', function() {
            var new_details = need_widget._getDetailTemplateData(raw_need_details);
            expect(new_details.first_vol).toBeTruthy();
            expect(new_details.first_vol.id).toEqual('1');
        });
        
        it('modifies "volunteers" to shift the first volunteer off the list', function() {
            var new_details = need_widget._getDetailTemplateData(raw_need_details);
            expect(raw_need_details.volunteers.length).toEqual(3);
            expect(new_details.volunteers.length).toEqual(2);
            expect(need_widget._isVolunteer('1', new_details.volunteers)).toEqual(false);
        });
        
        it('creates a "vol_count_minus_one" template property to be the total volunteers minus 1', function() {
            var new_details = need_widget._getDetailTemplateData(raw_need_details);
            expect(new_details.vol_count_minus_one).toEqual(raw_need_details.volunteers.length-1);
            expect(new_details.vol_count_minus_one).toEqual(new_details.volunteers.length);
        });
        
        it('creates a "avatar" template function', function() {
            var new_details = need_widget._getDetailTemplateData(raw_need_details);
            expect(new_details.avatar).toBeTruthy();
        });
    });


    describe('_getVolunteerButtonConfig', function () {
        var vols, not_defined;
        
        beforeEach(function() {
            vols = [{"display_name": "John D.", "description": null, "image_id": "1", "email": "john.doe@codeforamerica.org", "location_id": "0", "id": "1"},
                    {"display_name": "John E.", "description": null, "image_id": "1", "email": "john.eoe@codeforamerica.org", "location_id": "0", "id": "2"},
                    {"display_name": "John F.", "description": null, "image_id": "1", "email": "john.foe@codeforamerica.org", "location_id": "0", "id": "3"}]; 
        });
        
        it('returns "I am helping" if the user is one of the volunteers', function() {
            expect(need_widget._getVolunteerButtonConfig(5, vols, 1)).toEqual({cssClass: 'in-process', text: 'I am helping'});
        });
        
        it('returns "I can help" if the user is not one of the volunteers and more volunteers are needed', function() {
            expect(need_widget._getVolunteerButtonConfig(5, vols, 6)).toEqual({cssClass: 'active', text: 'I can help'});
        });

        it('returns "Complete!" if the user is not one of the volunteers and no more volunteers are needed', function() {
            expect(need_widget._getVolunteerButtonConfig(3, vols, 6)).toEqual({cssClass: 'complete', text: 'Complete!'});
        });

        it('returns "I am helping" if the user is one of the volunteers, even if no more volunteers are needed', function() {
            expect(need_widget._getVolunteerButtonConfig(3, vols, 1)).toEqual({cssClass: 'in-process', text: 'I am helping'});
        });
        
        it('returns "Complete!" if no more volunteers are needed and no user is logged in', function() {
            expect(need_widget._getVolunteerButtonConfig(3, vols, not_defined)).toEqual({cssClass: 'complete', text: 'Complete!'});
        });

        it('returns "I can help" if more volunteers are needed and no user is logged in', function() {
            expect(need_widget._getVolunteerButtonConfig(5, vols, null)).toEqual({cssClass: 'active', text: 'I can help'});
        });
    });

    describe('_getProgressElementWidth', function () {
        it('gets the width of the progress element', function() {
            expect(need_widget._getProgressElementWidth(100, 1, 4)).toEqual(25);
        });
    });
    
    describe('_updateVolunteerProgress', function () {
        var $container, need;
        beforeEach(function(){
            $container = tc.jQ('<div class="volunteer-details"> \
                <div class="volunteer-count">We have <strong>0</strong> volunteers</div> \
                <div class="progress-wrapper"><div class="progress"><div class="progress-pin"></div></div></div> \
                <a class="help-link active" href="#">I can help</a> \
                </div>'
            );
            need = mock_need;
        });
        
        it('sets the number of people who have volunteered', function() {
            need_widget._updateVolunteerProgress($container, need);
            
            expect($container.find('.volunteer-count strong').text()).toEqual('3');
        });
    });
    
    describe('_getUserId', function () {
        it('gets the user id if it exists', function() {
            expect(need_widget._getUserId()).toEqual(5);
        });
        
        it('return null if the user id does not exists', function() {
            need_widget = tc.gam.project_widgets.needs(tc.jQ.extend(true, mock_options, { user: null }) );
            expect(need_widget._getUserId()).toEqual(null);
        });

    });
});