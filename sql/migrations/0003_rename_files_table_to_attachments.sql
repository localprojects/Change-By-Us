ALTER TABLE files RENAME TO attachments,
 MODIFY COLUMN title VARCHAR(512) NOT NULL COMMENT 'The display name -- the file name or title of the media',
 ADD COLUMN media_id VARCHAR(64)  COMMENT 'The id of the media relative to its type (e.g., the Youtube ID, or uploaded file id, ...)' AFTER mirrored,
 ADD COLUMN type VARCHAR(64)  NOT NULL DEFAULT 'file' AFTER media_id, 
 COMMENT = 'Comment attachment descriptions';

