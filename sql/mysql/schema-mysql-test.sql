--
-- Creates the database and user account.
-- 
-- Replace cbu_test, cbu_test and cbu_test 
-- with your values.
--
-- ------------------------------------------------------

DROP DATABASE IF EXISTS `cbu_test`;
CREATE DATABASE IF NOT EXISTS `cbu_test` DEFAULT CHARACTER SET = 'utf8' DEFAULT COLLATE = 'utf8_general_ci';

CREATE USER 'cbu_test'@'127.0.0.1' IDENTIFIED BY 'cbu_test';
GRANT CREATE, DELETE, INSERT, SELECT, UPDATE ON `cbu_test`.* TO 'db_user'@'127.0.0.1';

CREATE USER 'cbu_test'@'localhost' IDENTIFIED BY 'cbu_test';
GRANT CREATE, DELETE, INSERT, SELECT, UPDATE ON `cbu_test`.* TO 'cbu_test'@'localhost';

USE `cbu_test`;

source sql/models.sql;
source sql/data_badwords.sql;
source sql/data_tasks.sql;
source sql/data_user_groups.sql;
