-- phpMyAdmin SQL Dump
-- version 3.2.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Sep 20, 2011 at 05:29 PM
-- Server version: 5.1.44
-- PHP Version: 5.3.2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `cbu`
--

--
-- Dumping data for table `location`
--
TRUNCATE TABLE location;


INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(-1, 'Citywide', 39.952222, -75.164167, '', '', 'Philadelphia', 'PA');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(1, 'Fox Chase', 40.074717, -75.079003, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(2, 'Cedarbrook', 40.073581, -75.173544, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(3, 'Andorra', 40.071439, -75.232214, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(4, 'Bells Corner', 40.068820, -75.052601, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(5, 'Crestmont Farms', 40.069919, -74.979246, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(6, 'Winchester', 40.064409, -75.031359, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(7, 'Ashton', 40.064667, -75.019238, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(8, 'Academy Gardens', 40.062133, -75.009876, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(9, 'West Oak Lane', 40.061495, -75.153255, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(10, 'East Mt. Airy', 40.059444, -75.181062, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(11, 'Upper Roxborough', 40.051389, -75.232592, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(12, 'Burholme', 40.060421, -75.077322, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(13, 'Rhawnhurst', 40.056656, -75.058665, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(14, 'Brookhaven', 40.061300, -74.986360, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(15, 'Lexington', 40.055183, -75.044082, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(16, 'West Mt. Airy', 40.049368, -75.196566, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(17, 'East Torresdale', 40.051852, -74.991455, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(18, 'Shawmont Valley', 40.052707, -75.250936, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(19, 'East Oak Lane', 40.052569, -75.133031, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(20, 'Lawndale', 40.051569, -75.093144, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(21, 'Winchester Park', 40.053952, -75.029743, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(22, 'Pennypack Woods', 40.052310, -75.015319, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(23, 'East Germantown', 40.046700, -75.164250, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(24, 'Upper Holmesburg', 40.044556, -75.009995, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(25, 'Upper Northwood', 40.048848, -75.080355, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(26, 'Somerton', 40.117627, -75.018562, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(27, 'Byberry', 40.119898, -74.987442, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(28, 'Parkwood', 40.097659, -74.969152, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(29, 'Bustleton', 40.093284, -75.042425, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(30, 'Normandy', 40.101941, -74.994070, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(31, 'Walton Park', 40.094704, -74.985510, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(32, 'Morrell Park', 40.074807, -74.990676, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(33, 'Millbrook', 40.080492, -74.975011, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(34, 'Chestnut Hill', 40.071761, -75.212149, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(35, 'Summerdale', 40.035649, -75.093908, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(36, 'Fern Rock', 40.042366, -75.139355, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(37, 'Oxford Circle', 40.035740, -75.080378, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(38, 'Olney', 40.035030, -75.124407, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(39, 'Central Roxborough', 40.034453, -75.215276, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(40, 'Logan', 40.030665, -75.146603, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(41, 'Tacony', 40.027206, -75.044454, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(42, 'Blue Bell Hill', 40.034192, -75.192014, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(43, 'North Delaware', 40.019565, -75.034353, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(44, 'Manayunk', 40.027434, -75.223176, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(45, 'Allegheny West', 40.002341, -75.177043, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(46, 'Wynnefield Heights', 40.002472, -75.211755, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(47, 'St. Hugh', 40.001845, -75.131495, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(48, 'Harrowgate', 40.000663, -75.116180, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(49, 'Wynnefield', 39.991199, -75.230552, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(50, 'Forgotten Blocks', 39.998480, -75.162158, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(51, 'West Fairhill', 39.996690, -75.147882, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(52, 'Port Richmond', 39.983717, -75.093199, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(53, 'Fairhill', 39.995193, -75.133766, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(54, 'Kensington', 39.994801, -75.107554, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(55, 'Strawberry Mansion', 39.991186, -75.179146, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(56, 'North Central', 39.987021, -75.165124, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(57, 'North Phila.', 39.985386, -75.149067, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(58, 'West Kensington', 39.988576, -75.134882, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(59, 'Overbrook Farms', 39.986936, -75.249462, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(60, 'East Kensington', 39.984462, -75.127534, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(61, 'Norris Square', 39.982332, -75.137525, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(62, 'Olde Richmond', 39.976965, -75.117776, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(63, 'Brewerytown', 39.979634, -75.182394, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(64, 'Morris Park', 39.969436, -75.249446, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(65, 'Green Hill Farms', 39.981544, -75.261612, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(66, 'Sharswood', 39.977387, -75.174698, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(67, 'Cecil B Moore', 39.978896, -75.164268, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(68, 'West Parkside', 39.977971, -75.220490, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(69, 'Fishtown', 39.970470, -75.126660, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(70, 'Olde Kensington', 39.974601, -75.141818, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(71, 'Kensington South', 39.974358, -75.137155, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(72, 'Yorktown', 39.974497, -75.154546, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(73, 'Overbrook Park', 39.975586, -75.267346, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(74, 'Ludlow', 39.973888, -75.147337, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(75, 'Cabot', 39.974267, -75.163620, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(76, 'East Parkside', 39.973731, -75.206296, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(77, 'Cathedral Park', 39.973285, -75.221867, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(78, 'Carroll Park', 39.973432, -75.235597, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(79, 'Girard College', 39.973759, -75.172793, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(80, 'Fairmount', 39.970906, -75.177968, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(81, 'Francisville', 39.969688, -75.165590, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(82, 'Mill Creek', 39.965716, -75.216533, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(83, 'Belmont', 39.967240, -75.207298, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(84, 'West Poplar', 39.966353, -75.156101, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(85, 'East Poplar', 39.966021, -75.148816, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(86, 'Northern Liberties', 39.964272, -75.139511, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(87, 'Haddington', 39.965781, -75.234631, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(88, 'Mantua', 39.965600, -75.196908, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(89, 'Spring Garden', 39.965388, -75.168796, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(90, 'Logan Square', 39.958870, -75.171549, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(91, 'Dunlap', 39.961877, -75.222058, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(92, 'University City', 39.952029, -75.191905, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(93, 'Powelton Village', 39.960460, -75.192115, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(94, 'Callowhill/chinatown North', 39.959492, -75.155051, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(95, 'West Powelton', 39.960064, -75.206134, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(96, 'Old City', 39.953885, -75.141777, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(97, 'Northwood', 40.025932, -75.089185, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(98, 'Frankford', 40.017686, -75.081893, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(99, 'Whitaker', 40.026529, -75.108439, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(100, 'Wissinoming', 40.020960, -75.060217, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(101, 'Feltonville', 40.022406, -75.123677, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(102, 'East Falls', 40.016416, -75.189364, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(103, 'Wissahickon', 40.020663, -75.208267, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(104, 'Juniata Park', 40.011201, -75.108245, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(105, 'Nicetown', 40.020969, -75.154210, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(106, 'Hunting Park', 40.012477, -75.133669, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(107, 'East Tioga', 40.006749, -75.148580, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(108, 'Tioga', 40.007955, -75.158267, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(109, 'Frankford Valley', 40.007782, -75.072117, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(110, 'Bridesburg', 39.997081, -75.069504, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(111, 'Castor Gardens', 40.043565, -75.067912, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(112, 'Ogontz', 40.045760, -75.151413, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(113, 'Melrose Park Gardens', 40.047286, -75.117795, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(114, 'Lawncrest', 40.039872, -75.105438, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(115, 'Holmesburg', 40.041320, -75.026738, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(116, 'Germantown', 40.032303, -75.173358, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(117, 'Mayfair', 40.036373, -75.050180, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(118, 'Saunders Park', 39.959294, -75.199756, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(119, 'Cobbs Creek', 39.953879, -75.238017, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(120, 'Walnut Hill', 39.956559, -75.219513, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(121, 'Chinatown', 39.954912, -75.156201, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(122, 'Spruce Hill', 39.952442, -75.207245, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(123, 'Rittenhouse Sq.', 39.948908, -75.173655, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(124, 'Market East', 39.951408, -75.157528, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(125, 'Garden Court', 39.952187, -75.220426, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(126, 'Washington Square West', 39.946639, -75.159673, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(127, 'Cedar Park', 39.947009, -75.219024, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(128, 'Society Hill', 39.944228, -75.145690, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(129, 'Kingsessing', 39.940013, -75.226874, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(130, 'Southwest Center City', 39.942186, -75.177506, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(131, 'West Shore', 39.943876, -75.207761, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(132, 'Hawthorne', 39.940414, -75.163422, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(133, 'Bella Vista', 39.939309, -75.156833, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(134, 'Queen Village', 39.937124, -75.144400, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(135, 'Point Breeze', 39.934092, -75.176868, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(136, 'Grays Ferry', 39.931255, -75.197549, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(137, 'Pennsport', 39.927887, -75.149594, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(138, 'Southwest', 39.924955, -75.233245, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(139, 'South Philadelphia', 39.923867, -75.167799, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(140, 'Eastwick', 39.904549, -75.241348, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(141, 'Whitman', 39.916116, -75.153451, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(142, 'Girard Estate', 39.920339, -75.183055, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(143, 'Packer Park', 39.910549, -75.184021, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(144, 'Navy Yard', 39.889623, -75.170101, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(145, 'Overbrook', 39.978495, -75.244270, '', '', '', '');
INSERT INTO `location` (`location_id`, `name`, `lat`, `lon`, `borough`, `address`, `city`, `state`) VALUES(146, 'Hunting Park Industrial Area', 40.013526, -75.170625, '', '', '', '');
