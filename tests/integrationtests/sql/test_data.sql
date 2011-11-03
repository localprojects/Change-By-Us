/* Users */

INSERT INTO `user` (user_id, email, first_name, last_name, location_id, group_membership_bitmask, is_oncall, email_notification, last_account_page_access_datetime, is_active, created_datetime, updated_datetime)
            VALUES (3, 'admin@gmail.com', 'Site', 'Administrator', 0,   0010,                     0,         'digest',           '2011-07-29 14:35:27',           1, '2011-05-15 12:12:12', '2011-05-15 12:12:13');

INSERT INTO `project` (project_id, title, num_flags, is_official, is_active, created_datetime, updated_datetime)
            VALUES    (0,          'hello', 2,       0,         1, '2011-07-29 14:35:27', '2011-07-29 14:35:27')

