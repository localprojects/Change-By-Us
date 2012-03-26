DROP TABLE IF EXISTS `homepage_question`;
CREATE TABLE `homepage_question` (
  `homepage_question_id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(200) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_datetime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`homepage_question_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;