#--------------------------------------------------------------------
# Copyright (c) 2011 Local Projects. All rights reserved.
# Licensed under the Affero GNU GPL v3, see LICENSE for more details.
#--------------------------------------------------------------------
##
## Seed the Tasks table for the digest_emailer to work properly
##
INSERT INTO `tasks` (`task_id`,`task_name`,`status`,`owner_id`,`updated_datetime`)
VALUES
  (1, 'Generate Digests', NULL, NULL, '2011-06-22 19:04:55'),
  (2, 'Email Digests', NULL, NULL, '2011-06-20 22:50:50');
