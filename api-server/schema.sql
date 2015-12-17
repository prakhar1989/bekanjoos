-- MySQL dump 10.13  Distrib 5.7.9, for osx10.9 (x86_64)
--
-- Host: pricetell.ccfbrfce9agt.us-east-1.rds.amazonaws.com    Database: pricetell
-- ------------------------------------------------------
-- Server version	5.6.23-log

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
-- Table structure for table `priceHistory`
--

DROP TABLE IF EXISTS `priceHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `priceHistory` (
  `site` varchar(50) NOT NULL DEFAULT '',
  `pid` varchar(50) NOT NULL DEFAULT '',
  `time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `price` int(11) NOT NULL,
  PRIMARY KEY (`site`,`pid`,`time`),
  CONSTRAINT `priceHistory_ibfk_1` FOREIGN KEY (`site`, `pid`) REFERENCES `product` (`site`, `pid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `site` varchar(50) NOT NULL DEFAULT '',
  `pid` varchar(50) NOT NULL DEFAULT '',
  `title` varchar(200) DEFAULT NULL,
  `image` varchar(200) DEFAULT NULL,
  `price` int(11) NOT NULL,
  PRIMARY KEY (`site`,`pid`),
  UNIQUE KEY `idx_product` (`site`,`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `fbid` bigint(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  PRIMARY KEY (`fbid`),
  UNIQUE KEY `idx_fbid` (`fbid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userProducts`
--

DROP TABLE IF EXISTS `userProducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userProducts` (
  `fbid` bigint(20) NOT NULL DEFAULT '0',
  `site` varchar(50) NOT NULL DEFAULT '',
  `pid` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`fbid`,`site`,`pid`),
  KEY `site` (`site`,`pid`),
  CONSTRAINT `userProducts_ibfk_1` FOREIGN KEY (`fbid`) REFERENCES `user` (`fbid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `userProducts_ibfk_2` FOREIGN KEY (`site`, `pid`) REFERENCES `product` (`site`, `pid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-12-16 12:45:48
