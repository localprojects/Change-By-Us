DROP TABLE IF EXISTS `project_goal`;

ALTER TABLE `project_message` DROP `project_goal_id`;
UPDATE `project_message` SET `message_type` = NULL WHERE `message_type` = 'goal_achieved';
ALTER TABLE `project_message` MODIFY `message_type` enum('member_comment','admin_comment','join','endorsement') DEFAULT NULL;