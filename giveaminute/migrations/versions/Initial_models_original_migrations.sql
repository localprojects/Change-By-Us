/* 0002 Add a file_id column to project_message table */
ALTER TABLE `project_message` ADD COLUMN `file_id` INTEGER  DEFAULT NULL AFTER `created_datetime`;


/* 0003 - Rename files to attachments */
ALTER TABLE files RENAME TO attachments,
 MODIFY COLUMN title VARCHAR(512) NOT NULL COMMENT 'The display name -- the file name or title of the media',
 ADD COLUMN media_id VARCHAR(64)  COMMENT 'The id of the media relative to its type (e.g., the Youtube ID, or uploaded file id, ...)' AFTER mirrored,
 ADD COLUMN type VARCHAR(64)  NOT NULL DEFAULT 'file' AFTER media_id,
 COMMENT = 'Comment attachment descriptions';


/* 0004 - Copy row id to media_id */
UPDATE attachments SET media_id=id;


/* 0005 - Remove goals */
DROP TABLE IF EXISTS `project_goal`;
ALTER TABLE `project_message` DROP `project_goal_id`;
UPDATE `project_message` SET `message_type` = NULL WHERE `message_type` = 'goal_achieved';
ALTER TABLE `project_message` MODIFY `message_type` enum('member_comment','admin_comment','join','endorsement') DEFAULT NULL;
