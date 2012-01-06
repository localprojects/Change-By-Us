--
-- Creates the database and user account.
-- 
-- Replace db_name, db_user_name and db_user_password 
-- with your values.
--
-- ------------------------------------------------------

DROP DATABASE IF EXISTS `db_name`;
CREATE DATABASE IF NOT EXISTS `db_name` DEFAULT CHARACTER SET = 'utf8' DEFAULT COLLATE = 'utf8_general_ci';

CREATE USER 'db_user_name'@'127.0.0.1' IDENTIFIED BY 'db_user_password';
GRANT CREATE, DELETE, INSERT, SELECT, UPDATE ON `db_name`.* TO 'db_user_name'@'127.0.0.1';

CREATE USER 'db_user_name'@'localhost' IDENTIFIED BY 'db_user_password';
GRANT CREATE, DELETE, INSERT, SELECT, UPDATE ON `db_name`.* TO 'db_user_name'@'localhost';

USE `db_name`;

source sql/models.sql;
source sql/data_badwords.sql;
source sql/data_tasks.sql;
source sql/data_user_groups.sql;
