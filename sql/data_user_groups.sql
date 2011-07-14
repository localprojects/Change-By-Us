-- phpMyAdmin SQL Dump
-- version 3.2.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jul 12, 2011 at 03:07 PM
-- Server version: 5.1.44
-- PHP Version: 5.3.2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `cbu`
--

--
-- Dumping data for table `user_group`
--

INSERT INTO `user_group` VALUES(1, 'admin', 'Site admin/super users', 1, '2011-07-12 15:07:17');
INSERT INTO `user_group` VALUES(2, 'moderator', 'Site moderators', 1, '2011-07-12 15:07:17');
INSERT INTO `user_group` VALUES(3, 'leader', 'Reponse leaders/"endorsers"', 1, '2011-07-12 15:07:17');
