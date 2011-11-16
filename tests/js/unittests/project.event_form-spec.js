/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

if (window.EnvJasmine) {
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.gam.base.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'tc.util.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'pages/project.data.js');
    EnvJasmine.load(EnvJasmine.jsDir + 'pages/project.event_form.js');
}

describe('project.event_form.js', function () {
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
    
    describe('_getNeedIndex', function () {
      var needs = [
          {"display_date": "October 1st", "description": "to garden and pull weeds and stuff. to garden and pull weeds and stuff. to garden and pull weeds and stuff. the quick brown fox jumped over the lazy dog.", "event_id": null, "address": "Code for America", "request": "gardeners", "date": "2011-10-01", "time": "11:00 am", "duration": "6", "project_id": "1", "type": "volunteer", "id": "1", "quantity": "4"}, 
          {"description": "to hula hoop like it's 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, and 2011.", "event_id": null, "time": "morning", "request": "hula hoopers", "date": null, "address": null, "duration": "3", "project_id": "1", "type": "volunteer", "id": "2", "quantity": "100"}, 
          //id=3
          {"description": "to help finish some features", "event_id": null, "time": "9:00pm", "request": "hackers", "date": null, "address": null, "duration": "4", "project_id": "1", "type": "volunteer", "id": "3", "quantity": "20"}, 
          {"display_date": "August 31st", "description": "test stuff", "event_id": null, "address": "Code for America", "request": "tester", "date": "2011-08-31", "time": "9:00pm", "duration": "50", "project_id": "3", "type": "volunteer", "id": "5", "quantity": "1"}, 
          //id=6
          {"display_date": "December 25th", "description": "asdf", "event_id": null, "address": "asdf", "request": "asdf", "date": "2011-12-25", "time": "8:00am", "duration": "1", "project_id": "3", "type": "volunteer", "id": "6", "quantity": "1"}, 
          {"display_date": "September 1st", "description": "asdf", "event_id": null, "address": "asdf", "request": "asdf", "date": "2011-09-01", "time": "asdf", "duration": "3", "project_id": "2", "type": "volunteer", "id": "8", "quantity": "1"}
      ];
      
      it('gets the array index of the need for the given need_id', function() {
        expect(event_form._getNeedIndex(6, needs)).toEqual(4);
        expect(event_form._getNeedIndex('3', needs)).toEqual(2);
      });

      it('returns -1 if a need cannot be found.', function() {
        expect(event_form._getNeedIndex(100, needs)).toEqual(-1);
      });
    });
    
    describe('_linkNeed', function () {
      var needs;
      
      beforeEach(function() {
        needs = [
            {"display_date": "October 1st", "description": "to garden and pull weeds and stuff. to garden and pull weeds and stuff. to garden and pull weeds and stuff. the quick brown fox jumped over the lazy dog.", "event_id": null, "address": "Code for America", "request": "gardeners", "date": "2011-10-01", "time": "11:00 am", "duration": "6", "project_id": "1", "type": "volunteer", "id": "1", "quantity": "4"}, 
            {"description": "to hula hoop like it's 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, and 2011.", "event_id": null, "time": "morning", "request": "hula hoopers", "date": null, "address": null, "duration": "3", "project_id": "1", "type": "volunteer", "id": "2", "quantity": "100"}, 
            //id=3, event_id=1
            {"description": "to help finish some features", "event_id": "1", "time": "9:00pm", "request": "hackers", "date": null, "address": null, "duration": "4", "project_id": "1", "type": "volunteer", "id": "3", "quantity": "20"}, 
            {"display_date": "August 31st", "description": "test stuff", "event_id": null, "address": "Code for America", "request": "tester", "date": "2011-08-31", "time": "9:00pm", "duration": "50", "project_id": "3", "type": "volunteer", "id": "5", "quantity": "1"}, 
            //id=6, event_id=null
            {"display_date": "December 25th", "description": "asdf", "event_id": null, "address": "asdf", "request": "asdf", "date": "2011-12-25", "time": "8:00am", "duration": "1", "project_id": "3", "type": "volunteer", "id": "6", "quantity": "1"}, 
            {"display_date": "September 1st", "description": "asdf", "event_id": null, "address": "asdf", "request": "asdf", "date": "2011-09-01", "time": "asdf", "duration": "3", "project_id": "2", "type": "volunteer", "id": "8", "quantity": "1"}
        ];
      });
      
      it('links a need to an event by setting the need event_id to the given event_id', function() {
        event_form._linkNeed(6, 10, needs);
        expect(parseInt(needs[event_form._getNeedIndex(6, needs)].event_id, 10)).toEqual(10);
      });

      it('does not link a need to an event since the event_id is not null', function() {
        event_form._linkNeed(3, 10, needs);
        expect(parseInt(needs[event_form._getNeedIndex(3, needs)].event_id, 10)).toEqual(1);
      });
    });
    
    describe('_unlinkNeed', function () {
      var needs;
      
      beforeEach(function() {
        needs = [
            {"display_date": "October 1st", "description": "to garden and pull weeds and stuff. to garden and pull weeds and stuff. to garden and pull weeds and stuff. the quick brown fox jumped over the lazy dog.", "event_id": null, "address": "Code for America", "request": "gardeners", "date": "2011-10-01", "time": "11:00 am", "duration": "6", "project_id": "1", "type": "volunteer", "id": "1", "quantity": "4"}, 
            {"description": "to hula hoop like it's 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, and 2011.", "event_id": null, "time": "morning", "request": "hula hoopers", "date": null, "address": null, "duration": "3", "project_id": "1", "type": "volunteer", "id": "2", "quantity": "100"}, 
            //id=3, event_id=1
            {"description": "to help finish some features", "event_id": "1", "time": "9:00pm", "request": "hackers", "date": null, "address": null, "duration": "4", "project_id": "1", "type": "volunteer", "id": "3", "quantity": "20"}, 
            {"display_date": "August 31st", "description": "test stuff", "event_id": null, "address": "Code for America", "request": "tester", "date": "2011-08-31", "time": "9:00pm", "duration": "50", "project_id": "3", "type": "volunteer", "id": "5", "quantity": "1"}, 
            //id=6, event_id=null
            {"display_date": "December 25th", "description": "asdf", "event_id": null, "address": "asdf", "request": "asdf", "date": "2011-12-25", "time": "8:00am", "duration": "1", "project_id": "3", "type": "volunteer", "id": "6", "quantity": "1"}, 
            {"display_date": "September 1st", "description": "asdf", "event_id": null, "address": "asdf", "request": "asdf", "date": "2011-09-01", "time": "asdf", "duration": "3", "project_id": "2", "type": "volunteer", "id": "8", "quantity": "1"}
        ];
      });
      
      it('unlinks a need from an event only if the event_id on the need matches the event\'s id', function() {
        event_form._linkNeed(6, 10, needs);
        expect(parseInt(needs[event_form._getNeedIndex(6, needs)].event_id, 10)).toEqual(10);

        event_form._unlinkNeed(6, 10, needs);
        expect(needs[event_form._getNeedIndex(6, needs)].event_id).toEqual(null);

        event_form._unlinkNeed(3, 10, needs);
        expect(parseInt(needs[event_form._getNeedIndex(3, needs)].event_id, 10)).toEqual(1);

        event_form._unlinkNeed(3, 1, needs);
        expect(needs[event_form._getNeedIndex(3, needs)].event_id).toEqual(null);
      });
    });
});