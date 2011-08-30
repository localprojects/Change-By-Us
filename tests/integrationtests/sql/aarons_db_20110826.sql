-- MySQL dump 10.13  Distrib 5.5.12, for osx10.6 (i386)
--
-- Host: localhost    Database: cbu_db
-- ------------------------------------------------------
-- Server version	5.5.12

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attachments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(512) NOT NULL COMMENT 'The display name -- the file name or title of the media',
  `descriptions` text,
  `mirrored` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `media_id` varchar(64) DEFAULT NULL COMMENT 'The id of the media relative to its type (e.g., the Youtube ID, or uploaded file id, ...)',
  `type` varchar(64) NOT NULL DEFAULT 'file',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachments`
--

LOCK TABLES `attachments` WRITE;
/*!40000 ALTER TABLE `attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badwords`
--

DROP TABLE IF EXISTS `badwords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badwords` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kill_words` text,
  `warn_words` text,
  `updated_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badwords`
--

LOCK TABLES `badwords` WRITE;
/*!40000 ALTER TABLE `badwords` DISABLE KEYS */;
/*!40000 ALTER TABLE `badwords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beta_invite_code`
--

DROP TABLE IF EXISTS `beta_invite_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `beta_invite_code` (
  `code` char(10) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beta_invite_code`
--

LOCK TABLES `beta_invite_code` WRITE;
/*!40000 ALTER TABLE `beta_invite_code` DISABLE KEYS */;
/*!40000 ALTER TABLE `beta_invite_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beta_invite_request`
--

DROP TABLE IF EXISTS `beta_invite_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `beta_invite_request` (
  `beta_invite_request_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `comment` text,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`beta_invite_request_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beta_invite_request`
--

LOCK TABLES `beta_invite_request` WRITE;
/*!40000 ALTER TABLE `beta_invite_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `beta_invite_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direct_message`
--

DROP TABLE IF EXISTS `direct_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `direct_message` (
  `direct_message_id` int(11) NOT NULL AUTO_INCREMENT,
  `to_user_id` int(11) NOT NULL,
  `from_user_id` int(11) NOT NULL,
  `message` text,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`direct_message_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direct_message`
--

LOCK TABLES `direct_message` WRITE;
/*!40000 ALTER TABLE `direct_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `direct_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facebook_user`
--

DROP TABLE IF EXISTS `facebook_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facebook_user` (
  `facebook_id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `facebook_id` (`facebook_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facebook_user`
--

LOCK TABLES `facebook_user` WRITE;
/*!40000 ALTER TABLE `facebook_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `facebook_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `featured_project`
--

DROP TABLE IF EXISTS `featured_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `featured_project` (
  `ordinal` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `updated_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ordinal`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `featured_project`
--

LOCK TABLES `featured_project` WRITE;
/*!40000 ALTER TABLE `featured_project` DISABLE KEYS */;
/*!40000 ALTER TABLE `featured_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `idea`
--

DROP TABLE IF EXISTS `idea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `idea` (
  `idea_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `location_id` int(11) NOT NULL DEFAULT '-1',
  `submission_type` enum('web','sms','email') NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `num_flags` smallint(6) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idea_id`),
  FULLTEXT KEY `description` (`description`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `idea`
--

LOCK TABLES `idea` WRITE;
/*!40000 ALTER TABLE `idea` DISABLE KEYS */;
/*!40000 ALTER TABLE `idea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `mirrored` tinyint(1) DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `app` (`app`),
  KEY `mirrored` (`mirrored`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `images`
--

LOCK TABLES `images` WRITE;
/*!40000 ALTER TABLE `images` DISABLE KEYS */;
INSERT INTO `images` VALUES (1,'giveaminute',0,'2011-08-26 01:25:35'),(2,'giveaminute',0,'2011-08-26 01:26:05');
/*!40000 ALTER TABLE `images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `keyword`
--

DROP TABLE IF EXISTS `keyword`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `keyword` (
  `keyword` varchar(25) NOT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`keyword`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `keyword`
--

LOCK TABLES `keyword` WRITE;
/*!40000 ALTER TABLE `keyword` DISABLE KEYS */;
INSERT INTO `keyword` VALUES ('access','2011-07-12 22:05:23'),('air','2011-07-12 22:05:23'),('beautification','2011-07-12 22:05:23'),('bicycle','2011-07-12 22:05:23'),('biking','2011-07-12 22:05:23'),('bronx','2011-07-12 22:05:23'),('brooklyn','2011-07-12 22:05:23'),('brownfields','2011-07-12 22:05:23'),('business','2011-07-12 22:05:23'),('cafes','2011-07-12 22:05:23'),('carbon','2011-07-12 22:05:23'),('cars','2011-07-12 22:05:23'),('cleanup','2011-07-12 22:05:23'),('climate','2011-07-12 22:05:23'),('community','2011-07-12 22:05:23'),('compost','2011-07-12 22:05:23'),('composting','2011-07-12 22:05:23'),('conservation','2011-07-12 22:05:23'),('contamination','2011-07-12 22:05:23'),('costs','2011-07-12 22:05:23'),('data','2011-07-12 22:05:23'),('demography','2011-07-12 22:05:23'),('development','2011-07-12 22:05:23'),('ecology','2011-07-12 22:05:23'),('education','2011-07-12 22:05:23'),('efficiency','2011-07-12 22:05:23'),('emissions','2011-07-12 22:05:23'),('empowerment','2011-07-12 22:05:23'),('energy','2011-07-12 22:05:23'),('environment','2011-07-12 22:05:23'),('flowers','2011-07-12 22:05:23'),('food','2011-07-12 22:05:23'),('fruits','2011-07-12 22:05:23'),('garden','2011-07-12 22:05:23'),('gardening','2011-07-12 22:05:23'),('gardens','2011-07-12 22:05:23'),('grants','2011-07-12 22:05:23'),('green','2011-07-12 22:05:23'),('green-jobs','2011-07-12 22:05:23'),('greener','2011-07-12 22:05:23'),('grocery','2011-07-12 22:05:23'),('growing','2011-07-12 22:05:23'),('growth','2011-07-12 22:05:23'),('harlem','2011-07-12 22:05:23'),('health','2011-07-12 22:05:23'),('heat','2011-07-12 22:05:23'),('housing','2011-07-12 22:05:23'),('infastructure','2011-07-12 22:05:23'),('information','2011-07-12 22:05:23'),('involvement','2011-07-12 22:05:23'),('jobs','2011-07-12 22:05:23'),('justice','2011-07-12 22:05:23'),('land','2011-07-12 22:05:23'),('legislation','2011-07-12 22:05:23'),('manhattan','2011-07-12 22:05:23'),('mapping','2011-07-12 22:05:23'),('neighborhood','2011-07-12 22:05:23'),('open','2011-07-12 22:05:23'),('open-space','2011-07-12 22:05:23'),('parks','2011-07-12 22:05:23'),('partnership','2011-07-12 22:05:23'),('performance','2011-07-12 22:05:23'),('planning','2011-07-12 22:05:23'),('plants','2011-07-12 22:05:23'),('plazas','2011-07-12 22:05:23'),('politics','2011-07-12 22:05:23'),('popup','2011-07-12 22:05:23'),('preservation','2011-07-12 22:05:23'),('professional','2011-07-12 22:05:23'),('professionals','2011-07-12 22:05:23'),('public','2011-07-12 22:05:23'),('quality','2011-07-12 22:05:23'),('queens','2011-07-12 22:05:23'),('rail','2011-07-12 22:05:23'),('rainwater','2011-07-12 22:05:23'),('recycling','2011-07-12 22:05:23'),('redevelopment','2011-07-12 22:05:23'),('research','2011-07-12 22:05:23'),('resources','2011-07-12 22:05:23'),('reuse','2011-07-12 22:05:23'),('rooftops','2011-07-12 22:05:23'),('runoff','2011-07-12 22:05:23'),('safety','2011-07-12 22:05:23'),('sanitation','2011-07-12 22:05:23'),('space','2011-07-12 22:05:23'),('speaker','2011-07-12 22:05:23'),('staten','2011-07-12 22:05:23'),('statistics','2011-07-12 22:05:23'),('stormwater','2011-07-12 22:05:23'),('sustainability','2011-07-12 22:05:23'),('traffic','2011-07-12 22:05:23'),('transportation','2011-07-12 22:05:23'),('trees','2011-07-12 22:05:23'),('vegetables','2011-07-12 22:05:23'),('volunteer','2011-07-12 22:05:23'),('walkways','2011-07-12 22:05:23'),('waste','2011-07-12 22:05:23'),('water','2011-07-12 22:05:23'),('waterfront','2011-07-12 22:05:23'),('workshops','2011-07-12 22:05:23'),('youth','2011-07-12 22:05:23');
/*!40000 ALTER TABLE `keyword` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `location` (
  `location_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `lat` decimal(9,6) NOT NULL,
  `lon` decimal(9,6) NOT NULL,
  `borough` varchar(50) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` char(2) DEFAULT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (1,'Citywide',47.606210,-122.332071,'','Seattle, WA, USA','Seattle','WA'),(2,'North Seattle',47.717020,-122.300934,'','North Seattle, Seattle, WA, USA','Seattle','WA'),(3,'Broadview',47.720748,-122.367532,'','Broadview, Seattle, WA, USA','Seattle','WA'),(4,'Bitter Lake',47.726000,-122.351000,'','Bitter Lake, Seattle, WA 98133, USA','Seattle','WA'),(5,'North Beach (Blue Ridge)',47.698279,-122.386521,'','North Beach/ Blue Ridge, Seattle, WA, USA','Seattle','WA'),(6,'Crown Hill',47.694720,-122.374170,'','Crown Hill, Seattle, WA, USA','Seattle','WA'),(7,'Greenwood',47.690612,-122.355300,'','Greenwood, Seattle, WA, USA','Seattle','WA'),(8,'Northgate',47.713153,-122.320961,'','Northgate, Seattle, WA 98125, USA','Seattle','WA'),(9,'Haller Lake',47.719336,-122.337174,'','Haller Lake, Seattle, WA, USA','Seattle','WA'),(10,'Pinehurst',47.721194,-122.320944,'','Pinehurst, Seattle, WA, USA','Seattle','WA'),(11,'North College Park',47.697236,-122.337610,'','North College Park, Seattle, WA, USA','Seattle','WA'),(12,'Maple Leaf',47.697595,-122.319047,'','Maple Leaf, Seattle, WA, USA','Seattle','WA'),(13,'Lake City',47.717598,-122.283737,'','Lake City, Seattle, WA 98125, USA','Seattle','WA'),(14,'Cedar Park',47.725871,-122.288055,'','Cedar Park, 3737 NE 135th St, Seattle, WA 98101, USA','Seattle','WA'),(15,'Matthews Beach',47.704360,-122.280108,'','Matthews Beach, Seattle, WA, USA','Seattle','WA'),(16,'Meadowbrook',47.706593,-122.294822,'','Meadowbrook, Seattle, WA, USA','Seattle','WA'),(17,'Olympic Hills',47.726444,-122.302583,'','Olympic Hills, Seattle, WA, USA','Seattle','WA'),(18,'Victory Heights',47.706389,-122.306917,'','Victory Heights, Seattle, WA, USA','Seattle','WA'),(19,'Wedgwood',47.686765,-122.295682,'','Wedgwood, Seattle, WA 98115, USA','Seattle','WA'),(20,'View Ridge',47.679444,-122.273889,'','View Ridge, Seattle, WA, USA','Seattle','WA'),(21,'Sand Point',47.682639,-122.254444,'','Sand Point, Seattle, WA, USA','Seattle','WA'),(22,'Roosevelt',47.683076,-122.317231,'','Roosevelt, Seattle, WA, USA','Seattle','WA'),(23,'Ravenna',47.675861,-122.300939,'','Ravenna, Seattle, WA, USA','Seattle','WA'),(24,'Bryant',47.672444,-122.284222,'','Bryant, Seattle, WA, USA','Seattle','WA'),(25,'Windermere',47.669722,-122.260889,'','Windermere, Seattle, WA, USA','Seattle','WA'),(26,'Hawthorne Hills',47.672043,-122.275403,'','Hawthorne Hills, Seattle, WA 98105, USA','Seattle','WA'),(27,'Laurelhurst',47.663610,-122.275830,'','Laurelhurst, Seattle, WA 98105, USA','Seattle','WA'),(28,'University District',47.655000,-122.303333,'','University District, Seattle, WA, USA','Seattle','WA'),(29,'University Village',47.663310,-122.298745,'','NE University Village St, Seattle, WA 98105, USA','Seattle','WA'),(30,'Wallingford',47.655654,-122.327627,'','Wallingford, Seattle, WA, USA','Seattle','WA'),(31,'Northlake',47.647880,-122.341190,'','N Northlake Way, Seattle, WA, USA','Seattle','WA'),(32,'Green Lake',47.680984,-122.327968,'','Green Lake, Seattle, WA, USA','Seattle','WA'),(33,'Fremont',47.659720,-122.355830,'','Center of the Universe, Seattle, WA, USA','Seattle','WA'),(34,'Phinney Ridge',47.670868,-122.351618,'','Phinney Ridge, Seattle, WA, USA','Seattle','WA'),(35,'Ballard',47.677000,-122.385000,'','Ballard, Seattle, WA, USA','Seattle','WA'),(36,'West Woodland',47.667030,-122.368131,'','West Woodland, Seattle, WA, USA','Seattle','WA'),(37,'Whittier Heights',47.683059,-122.369514,'','Whittier Heights, Seattle, WA, USA','Seattle','WA'),(38,'Adams',47.669986,-122.388690,'','Old Ballard, Seattle, WA, USA','Seattle','WA'),(39,'Sunset Hill',47.675815,-122.405490,'','Sunset Hill, Seattle, WA, USA','Seattle','WA'),(40,'Loyal Heights',47.682246,-122.385132,'','Loyal Heights, Seattle, WA, USA','Seattle','WA'),(41,'Central Seattle',47.608758,-122.296424,'','Central Seattle, Seattle, WA, USA','Seattle','WA'),(42,'Magnolia',47.652095,-122.401345,'','Magnolia, Seattle, WA, USA','Seattle','WA'),(43,'Lawton Park',47.657647,-122.410876,'','Lawton Park, Seattle, WA, USA','Seattle','WA'),(44,'Briarcliff',47.641628,-122.409477,'','Briarcliff, Seattle, WA, USA','Seattle','WA'),(45,'Southeast Magnolia',47.642444,-122.393874,'','Southeast Magnolia, Seattle, WA, USA','Seattle','WA'),(46,'Interbay',47.640674,-122.382110,'','Interbay, Seattle, WA, USA','Seattle','WA'),(47,'Queen Anne',47.652095,-122.401345,'','Queen Anne, Seattle, WA, USA','Seattle','WA'),(48,'North Queen Anne',47.644511,-122.365608,'','North Queen Anne, Seattle, WA, USA','Seattle','WA'),(49,'East Queen Anne',47.638823,-122.348868,'','East Queen Anne, Seattle, WA, USA','Seattle','WA'),(50,'Lower Queen Anne',47.624140,-122.356310,'','Lower Queen Anne, Seattle, WA, USA','Seattle','WA'),(51,'West Queen Anne',47.632407,-122.369207,'','West Queen Anne, Seattle, WA, USA','Seattle','WA'),(52,'Capitol Hill',47.622942,-122.316456,'','Capitol Hill, Seattle, WA, USA','Seattle','WA'),(53,'Portage Bay (Roanoke)',47.643306,-122.317113,'','E Roanoke St, Seattle, WA, USA','Seattle','WA'),(54,'Broadway',47.625305,-122.322184,'','Broadway, Seattle, WA, USA','Seattle','WA'),(55,'Pike-Pine Corridor',47.606210,-122.332071,'','Seattle, WA, USA','Seattle','WA'),(56,'Montlake',47.641676,-122.305010,'','Montlake, Seattle, WA, USA','Seattle','WA'),(57,'Stevens',47.625660,-122.303653,'','Stevens, Seattle, WA, USA','Seattle','WA'),(58,'Interlaken',47.636399,-122.307317,'','E Interlaken Blvd, Seattle, WA 98112, USA','Seattle','WA'),(59,'Madison Valley',47.936214,-122.216074,'','Madison St, Everett, WA 98203, USA','Seattle','WA'),(60,'Renton Hill',47.492483,-122.196438,'','Renton, Washington, USA','Seattle','WA'),(61,'Madison Park',47.634821,-122.279569,'','Madison Park, Seattle, WA 98112, USA','Seattle','WA'),(62,'Broadmoor',47.633610,-122.288330,'','Broadmoor, Seattle, WA 98112, USA','Seattle','WA'),(63,'Lake Union',47.653066,-122.338480,'','Lake Union, Seattle, WA, USA','Seattle','WA'),(64,'South Lake Union, Seattle',47.625570,-122.334388,'','South-Lake Union, Seattle, WA, USA','Seattle','WA'),(65,'Cascade, Seattle',47.436211,-122.249170,'','Cascade Ave S, Seattle, WA 98188, USA','Seattle','WA'),(66,'Westlake',47.632197,-122.341627,'','Westlake, Seattle, WA 98109, USA','Seattle','WA'),(67,'Eastlake',47.641765,-122.326487,'','Eastlake, Seattle, WA 98102, USA','Seattle','WA'),(68,'Downtown',47.606210,-122.332071,'','Seattle, WA, USA','Seattle','WA'),(69,'Denny Regrade',47.606210,-122.332071,'','Seattle, WA, USA','Seattle','WA'),(70,'Belltown',47.613220,-122.346500,'','Belltown, Seattle, WA, USA','Seattle','WA'),(71,'Pike-Market',47.608987,-122.340682,'','Pike Market, 1501 Pike Pl, Seattle, WA 98101, USA','Seattle','WA'),(72,'Central Business District',47.610628,-122.329631,'','Central Business District, Seattle, WA, USA','Seattle','WA'),(73,'First Hill',47.609438,-122.323291,'','First Hill, Seattle, WA 98104, USA','Seattle','WA'),(74,'Pioneer Square',47.598533,-122.333236,'','Pioneer Square, Seattle, WA, USA','Seattle','WA'),(75,'International District',47.597500,-122.320833,'','International District, Seattle, WA, USA','Seattle','WA'),(76,'Yesler Terrace',47.602803,-122.319687,'','Yesler Terrace, Seattle, WA, USA','Seattle','WA'),(77,'Central Waterfront',47.606742,-122.341744,'','Waterfront Park, 1300 Alaskan Way, Seattle, WA 98101, USA','Seattle','WA'),(78,'West Edge',47.642041,-122.278280,'','E Edgewater Pl, Seattle, WA 98112, USA','Seattle','WA'),(79,'Central District',47.655746,-122.310037,'','Red Square, University of Washington, Seattle, WA 98105, USA','Seattle','WA'),(80,'Mann',47.609204,-122.299360,'','Mann, Seattle, WA, USA','Seattle','WA'),(81,'Minor',47.607515,-122.309073,'','Minor, Seattle, WA, USA','Seattle','WA'),(82,'Cherry Hill and Squire Park',47.606210,-122.332071,'','Seattle, WA, USA','Seattle','WA'),(83,'Atlantic',47.597556,-122.305909,'','Atlantic, Seattle, WA, USA','Seattle','WA'),(84,'Judkins Park',47.592132,-122.301392,'','Judkins Park, Seattle, WA 98144, USA','Seattle','WA'),(85,'Madrona',47.609389,-122.291083,'','Madrona, Seattle, WA, USA','Seattle','WA'),(86,'Madrona Valley',47.763840,-122.204301,'','Madrona St, Bothell, WA 98011, USA','Seattle','WA'),(87,'Harrison (Denny-Blaine)',47.618611,-122.282028,'','Harrison/ Denny Blaine, Seattle, WA, USA','Seattle','WA'),(88,'Washington Park',47.627213,-122.287835,'','Washington Park, Seattle, WA 98112, USA','Seattle','WA'),(89,'Leschi',47.600278,-122.292778,'','Leschi, Seattle, WA, USA','Seattle','WA'),(90,'South End',47.190704,-122.444848,'','South End, Tacoma, WA, USA','Seattle','WA'),(91,'Rainier Valley',47.536055,-122.275231,'','Ranier Valley, Seattle, WA, USA','Seattle','WA'),(92,'Mount Baker',47.584288,-122.289377,'','Mt Baker, Seattle, WA 98144, USA','Seattle','WA'),(93,'Columbia City',47.559866,-122.286499,'','Columbia City, Seattle, WA, USA','Seattle','WA'),(94,'Hillman City',47.674355,-122.322852,'','Hillman Pl NE, Seattle, WA 98115, USA','Seattle','WA'),(95,'Brighton',47.536055,-122.275231,'','Brighton, Seattle, WA 98118, USA','Seattle','WA'),(96,'Dunlap (Othello)',47.537053,-122.282338,'','S Othello St, Seattle, WA, USA','Seattle','WA'),(97,'Rainier Beach (Atlantic City Beach)',47.678174,-122.337143,'','Seattle, Washington, USA','Seattle','WA'),(98,'Rainier View (Lakeridge)',47.505443,-122.246940,'','Lakeridge Park, 10101 Cornell Ave S, Seattle, WA 98178, USA','Seattle','WA'),(99,'Seward Park',47.550260,-122.264850,'','Seward Park, Seattle, WA, USA','Seattle','WA'),(100,'Lakewood',47.563155,-122.271791,'','Lakewood, Seattle, WA 98118, USA','Seattle','WA'),(101,'Beacon Hill',47.552585,-122.300937,'','Mid-Beacon Hill, Seattle, WA, USA','Seattle','WA'),(102,'North Beacon Hill',47.579421,-122.311323,'','North Beacon Hill, Seattle, WA, USA','Seattle','WA'),(103,'Mid Beacon Hill (Maplewood)',47.606210,-122.332071,'','Seattle, WA, USA','Seattle','WA'),(104,'Holly Park',47.539346,-122.286504,'','Holly Park, Seattle, WA, USA','Seattle','WA'),(105,'South Beacon Hill (Van Asselt)',47.545932,-122.319292,'','Van Asselt, Seattle, WA 98108, USA','Seattle','WA'),(106,'Industrial District',47.563958,-122.334335,'','Industrial District East, Seattle, WA, USA','Seattle','WA'),(107,'SoDo',47.584009,-122.327528,'','SODO Busway, Seattle, WA 98134, USA','Seattle','WA'),(108,'Harbor Island',47.579167,-122.351389,'','Harbor Island, Seattle, WA, USA','Seattle','WA'),(109,'Georgetown',47.551940,-122.327780,'','Georgetown, Seattle, WA, USA','Seattle','WA'),(110,'South Park',47.531094,-122.325736,'','South Park, Seattle, WA, USA','Seattle','WA'),(111,'West Seattle',47.570932,-122.386517,'','West Seattle, Seattle, WA, USA','Seattle','WA'),(112,'Alki',47.576390,-122.408610,'','Alki, Seattle, WA, USA','Seattle','WA'),(113,'North Admiral (Admiral District)',47.579266,-122.394385,'','SW Admiral Way, Seattle, WA, USA','Seattle','WA'),(114,'Junction (West Seattle Junction)',46.887692,-124.111598,'','W Seattle Ave & Seattle Ave W, Westport, WA 98595, USA','Seattle','WA'),(115,'Seaview (Mee-Kwa-Mooks)',47.606210,-122.332071,'','Seattle, WA, USA','Seattle','WA'),(116,'Fairmount Park',47.559000,-122.378667,'','Fairmount Park, Seattle, WA, USA','Seattle','WA'),(117,'Genesee',47.563306,-122.392791,'','Genesee, Seattle, WA, USA','Seattle','WA'),(118,'Gatewood',47.538417,-122.383333,'','Gatewood, Seattle, WA, USA','Seattle','WA'),(119,'Fauntleroy',47.523330,-122.391670,'','Fauntleroy, Seattle, WA, USA','Seattle','WA'),(120,'Arbor Heights',47.509550,-122.378190,'','Arbor Heights, Seattle, WA, USA','Seattle','WA'),(121,'Delridge',47.535527,-122.355058,'','Delridge, Seattle, WA, USA','Seattle','WA'),(122,'North Delridge',47.562347,-122.365478,'','North Delridge, Seattle, WA, USA','Seattle','WA'),(123,'Pigeon Point',47.570654,-122.359294,'','Pigeon Point, Seattle, WA 98106, USA','Seattle','WA'),(124,'Riverview',47.544587,-122.352364,'','Riverview, Seattle, WA 98106, USA','Seattle','WA'),(125,'Highland Park',47.524698,-122.346023,'','Highland Park, Seattle, WA, USA','Seattle','WA'),(126,'South Delridge',47.526912,-122.360682,'','South Delridge, Seattle, WA, USA','Seattle','WA'),(127,'Roxhill',47.526730,-122.369928,'','Roxhill, Seattle, WA, USA','Seattle','WA'),(128,'High Point',47.543389,-122.368722,'','High Point, Seattle, WA, USA','Seattle','WA');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrate_version`
--

DROP TABLE IF EXISTS `migrate_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrate_version` (
  `repository_id` varchar(250) NOT NULL,
  `repository_path` text,
  `version` int(11) DEFAULT NULL,
  PRIMARY KEY (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrate_version`
--

LOCK TABLES `migrate_version` WRITE;
/*!40000 ALTER TABLE `migrate_version` DISABLE KEYS */;
INSERT INTO `migrate_version` VALUES ('cbu','giveaminute/migrations/',2);
/*!40000 ALTER TABLE `migrate_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project` (
  `project_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `keywords` text,
  `num_flags` smallint(6) NOT NULL DEFAULT '0',
  `is_official` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_datetime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `organization` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`project_id`),
  FULLTEXT KEY `title` (`title`,`description`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (1,'Replace the Viaduct','Tear down the viaduct before a terrible earthquake makes if all on innocent children! Parks! Pedestrians! Government! Tree! Tree!',2,77,'viaduct trees',0,0,1,'2011-08-26 01:32:28','2011-08-26 01:32:28',NULL);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project__idea`
--

DROP TABLE IF EXISTS `project__idea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project__idea` (
  `project_id` int(11) NOT NULL,
  `idea_id` int(11) NOT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`,`idea_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project__idea`
--

LOCK TABLES `project__idea` WRITE;
/*!40000 ALTER TABLE `project__idea` DISABLE KEYS */;
/*!40000 ALTER TABLE `project__idea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project__project_resource`
--

DROP TABLE IF EXISTS `project__project_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project__project_resource` (
  `project_id` int(11) NOT NULL,
  `project_resource_id` int(11) NOT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`,`project_resource_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project__project_resource`
--

LOCK TABLES `project__project_resource` WRITE;
/*!40000 ALTER TABLE `project__project_resource` DISABLE KEYS */;
INSERT INTO `project__project_resource` VALUES (1,0,'2011-08-26 01:32:28');
/*!40000 ALTER TABLE `project__project_resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project__user`
--

DROP TABLE IF EXISTS `project__user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project__user` (
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_project_admin` tinyint(1) NOT NULL DEFAULT '0',
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`,`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project__user`
--

LOCK TABLES `project__user` WRITE;
/*!40000 ALTER TABLE `project__user` DISABLE KEYS */;
INSERT INTO `project__user` VALUES (1,1,1,'2011-08-26 01:32:28'),
                                   (1,2,0,'2011-08-26 01:32:28');
/*!40000 ALTER TABLE `project__user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_endorsement`
--

DROP TABLE IF EXISTS `project_endorsement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_endorsement` (
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`,`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_endorsement`
--

LOCK TABLES `project_endorsement` WRITE;
/*!40000 ALTER TABLE `project_endorsement` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_endorsement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_invite`
--

DROP TABLE IF EXISTS `project_invite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_invite` (
  `project_invite_id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(255) DEFAULT NULL,
  `project_id` int(11) NOT NULL,
  `inviter_user_id` int(11) NOT NULL,
  `invitee_idea_id` int(11) DEFAULT NULL,
  `invitee_user_id` int(11) DEFAULT NULL,
  `invitee_email` int(11) DEFAULT NULL,
  `accepted_datetime` timestamp NULL DEFAULT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_invite_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_invite`
--

LOCK TABLES `project_invite` WRITE;
/*!40000 ALTER TABLE `project_invite` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_invite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_leader`
--

DROP TABLE IF EXISTS `project_leader`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_leader` (
  `user_id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_leader`
--

LOCK TABLES `project_leader` WRITE;
/*!40000 ALTER TABLE `project_leader` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_leader` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_link`
--

DROP TABLE IF EXISTS `project_link`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_link` (
  `project_link_id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `url` varchar(255) NOT NULL,
  `image_id` int(11) DEFAULT NULL,
  `num_flags` smallint(6) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_link_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_link`
--

LOCK TABLES `project_link` WRITE;
/*!40000 ALTER TABLE `project_link` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_link` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_message`
--

DROP TABLE IF EXISTS `project_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_message` (
  `project_message_id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `message_type` enum('member_comment','admin_comment','join','endorsement') DEFAULT NULL,
  `idea_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `num_flags` smallint(6) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `file_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`project_message_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_message`
--

LOCK TABLES `project_message` WRITE;
/*!40000 ALTER TABLE `project_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_need`
--

DROP TABLE IF EXISTS `project_need`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_need` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(10) DEFAULT NULL,
  `request` varchar(64) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `description` text,
  `project_id` int(11) NOT NULL,
  `address` varchar(256) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` varchar(32) DEFAULT NULL,
  `duration` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_need`
--

LOCK TABLES `project_need` WRITE;
/*!40000 ALTER TABLE `project_need` DISABLE KEYS */;
INSERT INTO `project_need` VALUES (1,'volunteer','gardeners',5,'to garden and pull weeds and stuff. to garden and pull weeds and stuff. to garden and pull weeds and stuff. the quick brown fox jumped over the lazy dog.',1,'Code for America, 85 2nd St., San Francisco, CA 94105','2011-08-31','11:00 am','6'),(2,'volunteer','hula hoopers',100,'to hula hoop like it\'s 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, and 2011.',1,'Frugal 4 House, 563 46th St., Oakland, CA 94609','2011-08-26','morning','3'),(3,'volunteer','hackers',20,'to help Mjumbe, Aaron, and Tyler finish the needs feature by 8/26/2011',1,'The White House, 1600 Pennsylvania Ave., Washington, D.C.','2011-09-05','9:00pm','4'),(4,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `project_need` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_need_volunteer`
--

DROP TABLE IF EXISTS `project_need_volunteer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_need_volunteer` (
  `need_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  PRIMARY KEY (`need_id`,`member_id`),
  KEY `member_id` (`member_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_need_volunteer`
--

LOCK TABLES `project_need_volunteer` WRITE;
/*!40000 ALTER TABLE `project_need_volunteer` DISABLE KEYS */;
INSERT INTO `project_need_volunteer` VALUES (1,1),(3,1),(1,2);
/*!40000 ALTER TABLE `project_need_volunteer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_resource`
--

DROP TABLE IF EXISTS `project_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_resource` (
  `project_resource_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `physical_address` varchar(255) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_user_id` int(11) DEFAULT NULL,
  `image_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `keywords` text,
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `is_official` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_datetime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_resource_id`),
  FULLTEXT KEY `title` (`title`,`description`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_resource`
--

LOCK TABLES `project_resource` WRITE;
/*!40000 ALTER TABLE `project_resource` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_feedback`
--

DROP TABLE IF EXISTS `site_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `site_feedback` (
  `site_feedback_id` int(11) NOT NULL AUTO_INCREMENT,
  `submitter_name` varchar(100) DEFAULT NULL,
  `submitter_email` varchar(100) DEFAULT NULL,
  `comment` text,
  `is_responded` tinyint(1) NOT NULL DEFAULT '0',
  `responded_user_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_datetime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`site_feedback_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_feedback`
--

LOCK TABLES `site_feedback` WRITE;
/*!40000 ALTER TABLE `site_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `site_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_stopped_phone`
--

DROP TABLE IF EXISTS `sms_stopped_phone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_stopped_phone` (
  `phone` varchar(10) NOT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`phone`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_stopped_phone`
--

LOCK TABLES `sms_stopped_phone` WRITE;
/*!40000 ALTER TABLE `sms_stopped_phone` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_stopped_phone` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tasks` (
  `task_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_name` varchar(255) DEFAULT NULL,
  `status` char(1) DEFAULT NULL,
  `owner_id` varchar(255) DEFAULT NULL,
  `frequency` varchar(20) DEFAULT NULL,
  `updated_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`task_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `twitter_user`
--

DROP TABLE IF EXISTS `twitter_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `twitter_user` (
  `twitter_id` int(11) NOT NULL,
  `twitter_username` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `twitter_id` (`twitter_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `twitter_user`
--

LOCK TABLES `twitter_user` WRITE;
/*!40000 ALTER TABLE `twitter_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `twitter_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unauthenticated_user`
--

DROP TABLE IF EXISTS `unauthenticated_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unauthenticated_user` (
  `auth_guid` char(36) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`auth_guid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unauthenticated_user`
--

LOCK TABLES `unauthenticated_user` WRITE;
/*!40000 ALTER TABLE `unauthenticated_user` DISABLE KEYS */;
INSERT INTO `unauthenticated_user` VALUES ('6f62518c-1e20-4cc2-aa02-28343a1a4bc3','aaron@codeforamerica.org','e03807c64b6081f243adcc2027dd3696','LCp4dxrN6G',NULL,'Aaron','Ogle','2011-08-26 01:18:26');
/*!40000 ALTER TABLE `unauthenticated_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_key` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `full_display_name` varchar(255) DEFAULT NULL,
  `image_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `affiliation` varchar(100) DEFAULT NULL,
  `group_membership_bitmask` tinyint(1) NOT NULL DEFAULT '1',
  `is_oncall` tinyint(1) NOT NULL DEFAULT '0',
  `email_notification` enum('none','digest') NOT NULL DEFAULT 'digest',
  `last_account_page_access_datetime` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_datetime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'','aaron@codeforamerica.org', 'e03807c64b6081f243adcc2027dd3696','LCp4dxrN6G',NULL,'Aaron','Ogle',NULL,1,   0,NULL,NULL,15,0,'digest','2011-08-26 17:30:54',1,'2011-08-26 01:18:43','2011-08-26 17:30:54'),
                          (3,'','billj@codeforamerica.org', 'e03807c64b6081f243adcc2027dd3696','LCp4dxrN6G',NULL,'Billy','Jean',NULL,1,   0,NULL,NULL,2, 0,'digest','2011-08-26 17:30:54',1,'2011-08-26 01:18:43','2011-08-26 17:30:54'),
                          (2,'','mjumbe@codeforamerica.org','e03807c64b6081f243adcc2027dd3696','LCp4dxrN6G',NULL,'Mjumbe','Poe',NULL,NULL,0,NULL,NULL,1, 0,'digest','2011-08-26 17:30:54',1,'2011-08-26 01:18:43','2011-08-26 17:30:54');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user__user_group`
--

DROP TABLE IF EXISTS `user__user_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user__user_group` (
  `user_id` int(11) NOT NULL,
  `user_group_id` int(11) NOT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`user_group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user__user_group`
--

LOCK TABLES `user__user_group` WRITE;
/*!40000 ALTER TABLE `user__user_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `user__user_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_group`
--

DROP TABLE IF EXISTS `user_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_group` (
  `user_group_id` int(11) NOT NULL,
  `group_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_group`
--

LOCK TABLES `user_group` WRITE;
/*!40000 ALTER TABLE `user_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `web_session`
--

DROP TABLE IF EXISTS `web_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `web_session` (
  `session_id` char(128) NOT NULL,
  `atime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data` text,
  UNIQUE KEY `session_id` (`session_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `web_session`
--

LOCK TABLES `web_session` WRITE;
/*!40000 ALTER TABLE `web_session` DISABLE KEYS */;
INSERT INTO `web_session` VALUES ('e125b11c00268ad5fa7b815df507df6eec213879','2011-08-26 19:08:03','KGRwMQpTJ2xhbmcnCnAyClMnJwpzUydpcCcKcDMKVjEyNy4wLjAuMQpwNApzUyd1c2VyX2lkJwpw\nNQpMMUwKc1Mnc2Vzc2lvbl9pZCcKcDYKUydlMTI1YjExYzAwMjY4YWQ1ZmE3YjgxNWRmNTA3ZGY2\nZWVjMjEzODc5JwpwNwpzUydfY2hhbmdlZCcKcDgKSTAxCnMu\n'),('5392d7d664d53b8ad54cc8ca62e559bba6145071','2011-08-26 01:18:47','KGRwMQpTJ2xhbmcnCnAyClMnJwpzUydpcCcKcDMKVjEwLjIxMS41NS4yCnA0CnNTJ3VzZXJfaWQn\nCnA1CkwxTApzUydzZXNzaW9uX2lkJwpwNgpTJzUzOTJkN2Q2NjRkNTNiOGFkNTRjYzhjYTYyZTU1\nOWJiYTYxNDUwNzEnCnA3CnNTJ19jaGFuZ2VkJwpwOApJMDEKcy4=\n'),('5030c028e8624cf3a4be5c75773640a132b219c2','2011-08-26 23:52:34','KGRwMQpTJ2xhbmcnCnAyClMnJwpzUydpcCcKcDMKVjEyNy4wLjAuMQpwNApzUydzZXNzaW9uX2lk\nJwpwNQpTJzUwMzBjMDI4ZTg2MjRjZjNhNGJlNWM3NTc3MzY0MGExMzJiMjE5YzInCnA2CnMu\n');
/*!40000 ALTER TABLE `web_session` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2011-08-26 17:38:53
