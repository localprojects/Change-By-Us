from unittest2 import TestCase
from nose.tools import *

from mock import Mock

from giveaminute.models import Event
from giveaminute.models import User

class Test_User_display_name (TestCase):

    @istest
    def returns_full_first_and_last_name_when_user_has_nonzero_group_bitmask(self):
        user = User()
        user.first_name = 'Mjumbe'
        user.last_name = 'Poe'
        user.affiliation = None
        user.group_membership_bitmask = 7

        dname = user.display_name

        assert_equal(dname, 'Mjumbe Poe')

    @istest
    def returns_full_first_and_last_name_when_user_has_zero_group_bitmask(self):
        user = User()
        user.first_name = 'Mjumbe'
        user.last_name = 'Poe'
        user.affiliation = None
        user.group_membership_bitmask = 0

        dname = user.display_name

        assert_equal(dname, 'Mjumbe P.')


class Test_Event_rsvpServiceName (TestCase):

    @istest
    def returns_Facebook_for_facebook_urls(self):
        event = Event()
        urls = [r'http://www.facebook.com/event.php?eid=260448760649956',
                r'https://www.facebook.com/event.php?eid=260448760649956',
                r'https://WWW.FACEBOOK.COM/event.php?eid=260448760649956',]

        for url in urls:
            event.rsvp_url = url
            assert_equal(event.rsvp_service_name, 'Facebook')

    @istest
    def returns_Meetup_for_meetup_urls(self):
        event = Event()
        urls = [r'http://www.meetup.com/phillypug/events/33895172/',
                r'https://www.meetup.com/phillypug/events/33895172/',
                r'http://WWW.MEETUP.COM/phillypug/events/33895172/',]

        for url in urls:
            event.rsvp_url = url
            assert_equal(event.rsvp_service_name, 'Meetup')

    @istest
    def returns_Eventbrite_for_eventbrite_urls(self):
        event = Event()
        urls = [r'http://www.eventbrite.com/event/1695937595/efblike',
                r'http://WWW.EVENTBRITE.COM/event/1695937595/efblike',
                r'https://www.eventbrite.com/event/1695937595/efblike',]

        for url in urls:
            event.rsvp_url = url
            assert_equal(event.rsvp_service_name, 'Eventbrite')

    @istest
    def return_None_for_urls_it_cant_handle(self):
        event = Event()
        urls = [r'http://www.google.com/event/1695937595/efblike',
                r'http://calendar.google.COM/event/1695937595/efblike',
                r'https://www.twitter.com/event/1695937595/efblike',]

        for url in urls:
            event.rsvp_url = url
            assert_is_none(event.rsvp_service_name)
