-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: gestor_inversores
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id_address` bigint NOT NULL AUTO_INCREMENT,
  `city` varchar(255) NOT NULL,
  `number` int NOT NULL,
  `postal_code` int NOT NULL,
  `province` enum('BUENOS_AIRES','CABA','CATAMARCA','CHACO','CHUBUT','CORDOBA','CORRIENTES','ENTRE_RIOS','FORMOSA','JUJUY','LA_PAMPA','LA_RIOJA','MENDOZA','MISIONES','NEUQUEN','RIO_NEGRO','SALTA','SANTA_CRUZ','SANTA_FE','SANTIAGO_DEL_ESTERO','SAN_JUAN','SAN_LUIS','TIERRA_DEL_FUEGO','TUCUMAN') NOT NULL,
  `street` varchar(255) NOT NULL,
  PRIMARY KEY (`id_address`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,'Lanús',123,1824,'BUENOS_AIRES','Calle Falsa'),(2,'CABA',701,1084,'CABA','Avenida de Mayo'),(3,'San Justo',1200,1600,'BUENOS_AIRES','Varela'),(4,'Villa Celina',987,1772,'BUENOS_AIRES','Chavez'),(5,'Villa Madero',3476,1456,'BUENOS_AIRES','Olavarria'),(6,'Villa Madero',2340,1947,'BUENOS_AIRES','Ugarte'),(7,'Villa Celina',1800,1442,'BUENOS_AIRES','Alvarez'),(9,'CIUDAD MADERO',265,1772,'BUENOS_AIRES','Gonzales Chavez'),(10,'Caballito',25300,2345,'CABA','Av. Rivadavia'),(11,'Lanús',123,1824,'BUENOS_AIRES','Calle Falsa'),(15,'Lanús',123,1824,'BUENOS_AIRES','Calle Falsa'),(16,'CABA',4567,1195,'CABA','Avenida Corrientes'),(17,'Salta',850,4400,'SALTA','Avenida Belgrano'),(18,'Salta',850,4400,'SALTA','Avenida Belgrano'),(19,'CABA',742,1425,'CABA','Avenida Siempreviva'),(20,'CABA',742,1425,'CABA','Avenida Siempreviva'),(21,'Buenos Aires',1500,1042,'CABA','Avenida Corrientes'),(22,'Buenos Aires',1500,1042,'CABA','Avenida Corrientes'),(23,'La Plata',123,1900,'BUENOS_AIRES','Calle Falsa'),(24,'CABA',456,1405,'CABA','Calle Verde'),(25,'Rosario',321,2000,'CABA','Avenida Central'),(26,'CABA',789,1427,'CABA','Calle Azul'),(27,'Villa Celina',265,1772,'SALTA','Gonzales Chavez'),(28,'Villa Celina',265,1772,'MENDOZA','Gonzales Chavez'),(29,'Villa Celina',265,1772,'MISIONES','Gonzales Chavez'),(30,'Villa Celina',265,1772,'JUJUY','Gonzales Chavez'),(31,'Villa Celina',2599,1772,'CHUBUT','Giribone'),(32,'Villa Madero',300,1772,'SANTA_CRUZ','Olavarria'),(33,'Villa Celina',265,1772,'BUENOS_AIRES','asdasd'),(34,'Villa Celina',265,1772,'BUENOS_AIRES','Gonzales Chavez'),(35,'Villa Celina',265,1772,'BUENOS_AIRES','Gonzales Chavez'),(36,'Villa Celina',265,1772,'BUENOS_AIRES','Gonzales Chavez'),(37,'Villa Celina',265,1772,'BUENOS_AIRES','Gonzales Chavez'),(38,'Villa Celina',265,1772,'BUENOS_AIRES','Gonzales Chavez'),(39,'Buenos Aires',123,1010,'CABA','Calle Falsa');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbotfaqs`
--

DROP TABLE IF EXISTS `chatbotfaqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatbotfaqs` (
  `id_chatbotfaq` bigint NOT NULL AUTO_INCREMENT,
  `answer` varchar(255) DEFAULT NULL,
  `question` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_chatbotfaq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbotfaqs`
--

LOCK TABLES `chatbotfaqs` WRITE;
/*!40000 ALTER TABLE `chatbotfaqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `chatbotfaqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contract_actions`
--

DROP TABLE IF EXISTS `contract_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_actions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action_date` date NOT NULL,
  `status` enum('CANCELLED','CLOSED','PENDING_STUDENT_SIGNATURE','REFUNDED','SIGNED','DRAFT','PARTIALLY_SIGNED','PENDING_REFUND','REFUND_FAILED') NOT NULL,
  `contract_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjuhkq28ik75fwaxgeo1wo2kwk` (`contract_id`),
  KEY `FK7np185es9kpv0v7ctytqwflmw` (`student_id`),
  CONSTRAINT `FK7np185es9kpv0v7ctytqwflmw` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKjuhkq28ik75fwaxgeo1wo2kwk` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id_contract`)
) ENGINE=InnoDB AUTO_INCREMENT=191 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_actions`
--

LOCK TABLES `contract_actions` WRITE;
/*!40000 ALTER TABLE `contract_actions` DISABLE KEYS */;
INSERT INTO `contract_actions` VALUES (1,'2025-10-03','SIGNED',1,4),(2,'2025-10-03','CLOSED',1,4),(3,'2025-10-03','CANCELLED',2,4),(4,'2025-10-03','SIGNED',4,4),(5,'2025-10-03','CANCELLED',4,4),(6,'2025-10-03','SIGNED',5,4),(8,'2025-10-03','REFUNDED',5,4),(9,'2025-10-03','SIGNED',6,4),(10,'2025-10-03','REFUNDED',6,4),(11,'2025-10-03','CANCELLED',7,4),(12,'2025-10-03','SIGNED',8,4),(13,'2025-10-03','CANCELLED',8,4),(14,'2025-10-03','SIGNED',9,4),(15,'2025-10-03','SIGNED',10,4),(16,'2025-10-03','CANCELLED',10,4),(17,'2025-10-04','SIGNED',11,4),(18,'2025-10-04','REFUNDED',11,4),(19,'2025-10-07','CLOSED',9,4),(20,'2025-10-07','SIGNED',12,4),(21,'2025-10-07','CLOSED',12,4),(22,'2025-10-07','SIGNED',13,4),(23,'2025-10-07','CLOSED',13,4),(24,'2025-10-07','SIGNED',14,4),(25,'2025-10-07','CLOSED',14,4),(26,'2025-10-07','SIGNED',15,4),(27,'2025-10-07','CLOSED',15,4),(28,'2025-10-07','SIGNED',16,11),(29,'2025-10-07','CLOSED',16,11),(30,'2025-10-07','SIGNED',17,11),(31,'2025-10-07','CLOSED',17,11),(32,'2025-10-08','SIGNED',18,9),(33,'2025-10-08','CLOSED',18,9),(34,'2025-10-08','SIGNED',19,9),(35,'2025-10-08','CLOSED',19,9),(36,'2025-10-08','SIGNED',20,9),(37,'2025-10-08','CLOSED',20,9),(38,'2025-10-08','SIGNED',21,9),(39,'2025-10-08','CLOSED',21,9),(40,'2025-10-08','SIGNED',22,9),(41,'2025-10-08','CLOSED',22,9),(42,'2025-10-08','SIGNED',23,9),(43,'2025-10-08','CLOSED',23,9),(44,'2025-10-08','SIGNED',24,9),(45,'2025-10-08','CLOSED',24,9),(46,'2025-10-09','SIGNED',25,9),(47,'2025-10-09','CLOSED',25,9),(48,'2025-10-09','SIGNED',26,9),(49,'2025-10-09','CLOSED',26,9),(50,'2025-10-09','SIGNED',27,9),(51,'2025-10-09','SIGNED',28,9),(52,'2025-10-09','CANCELLED',28,9),(53,'2025-10-09','SIGNED',29,9),(54,'2025-10-10','SIGNED',30,9),(55,'2025-10-10','CLOSED',30,9),(56,'2025-10-10','SIGNED',33,9),(57,'2025-10-10','CLOSED',33,9),(58,'2025-10-10','CANCELLED',35,9),(59,'2025-10-10','SIGNED',36,9),(60,'2025-10-10','REFUNDED',36,9),(61,'2025-10-10','SIGNED',37,9),(62,'2025-10-10','CANCELLED',37,9),(63,'2025-10-10','SIGNED',38,9),(64,'2025-10-10','REFUNDED',38,9),(65,'2025-10-10','SIGNED',39,9),(66,'2025-10-15','SIGNED',45,9),(67,'2025-10-15','SIGNED',46,9),(68,'2025-10-15','CLOSED',45,9),(69,'2025-10-15','CLOSED',46,9),(70,'2025-10-15','CANCELLED',47,9),(71,'2025-10-15','SIGNED',48,9),(72,'2025-10-15','SIGNED',49,9),(73,'2025-10-15','SIGNED',50,9),(74,'2025-10-15','SIGNED',51,9),(75,'2025-10-15','CANCELLED',51,9),(76,'2025-10-15','SIGNED',52,9),(77,'2025-10-15','SIGNED',53,9),(78,'2025-10-23','PARTIALLY_SIGNED',61,9),(79,'2025-10-23','SIGNED',61,9),(80,'2025-10-23','PARTIALLY_SIGNED',62,9),(81,'2025-10-23','SIGNED',62,9),(82,'2025-10-24','PARTIALLY_SIGNED',63,9),(83,'2025-10-24','SIGNED',63,9),(84,'2025-10-25','CANCELLED',61,9),(85,'2025-10-25','CANCELLED',62,9),(86,'2025-10-25','PARTIALLY_SIGNED',64,9),(87,'2025-10-25','SIGNED',64,9),(88,'2025-10-25','REFUNDED',64,9),(89,'2025-10-27','PARTIALLY_SIGNED',65,9),(90,'2025-10-27','SIGNED',65,9),(91,'2025-10-27','PARTIALLY_SIGNED',66,9),(92,'2025-10-27','SIGNED',66,9),(93,'2025-10-28','PARTIALLY_SIGNED',67,9),(94,'2025-10-28','SIGNED',67,9),(95,'2025-10-29','PARTIALLY_SIGNED',69,9),(96,'2025-10-29','SIGNED',69,9),(97,'2025-10-30','CANCELLED',66,9),(98,'2025-11-04','PARTIALLY_SIGNED',70,9),(99,'2025-11-04','SIGNED',70,9),(100,'2025-11-04','CLOSED',70,9),(101,'2025-11-07','PARTIALLY_SIGNED',71,39),(102,'2025-11-07','CANCELLED',71,39),(103,'2025-11-07','PARTIALLY_SIGNED',72,39),(104,'2025-11-07','SIGNED',72,39),(105,'2025-11-07','CANCELLED',72,39),(106,'2025-11-07','PARTIALLY_SIGNED',74,39),(107,'2025-11-07','SIGNED',74,39),(108,'2025-11-07','CLOSED',74,39),(109,'2025-11-07','PARTIALLY_SIGNED',75,39),(110,'2025-11-07','SIGNED',75,39),(111,'2025-11-07','CANCELLED',75,39),(112,'2025-11-07','PARTIALLY_SIGNED',76,39),(113,'2025-11-07','SIGNED',76,39),(114,'2025-11-07','PARTIALLY_SIGNED',73,39),(115,'2025-11-07','SIGNED',73,39),(116,'2025-11-07','CANCELLED',73,39),(117,'2025-11-07','PARTIALLY_SIGNED',77,39),(118,'2025-11-07','SIGNED',77,39),(119,'2025-11-07','CANCELLED',77,39),(120,'2025-11-07','PARTIALLY_SIGNED',78,39),(121,'2025-11-07','SIGNED',78,39),(122,'2025-11-07','PARTIALLY_SIGNED',79,39),(123,'2025-11-07','SIGNED',79,39),(124,'2025-11-07','CANCELLED',79,39),(125,'2025-11-07','PARTIALLY_SIGNED',80,39),(126,'2025-11-07','SIGNED',80,39),(127,'2025-11-08','PARTIALLY_SIGNED',81,39),(128,'2025-11-08','SIGNED',81,39),(129,'2025-11-08','CLOSED',81,39),(130,'2025-11-08','PARTIALLY_SIGNED',82,39),(131,'2025-11-08','SIGNED',82,39),(132,'2025-11-08','CLOSED',82,39),(133,'2025-11-08','PARTIALLY_SIGNED',83,39),(134,'2025-11-08','SIGNED',83,39),(135,'2025-11-08','PARTIALLY_SIGNED',84,39),(136,'2025-11-08','SIGNED',84,39),(137,'2025-11-08','PENDING_REFUND',84,39),(138,'2025-11-08','PARTIALLY_SIGNED',85,39),(139,'2025-11-08','SIGNED',85,39),(140,'2025-11-08','PENDING_REFUND',85,39),(141,'2025-11-08','PARTIALLY_SIGNED',86,39),(142,'2025-11-08','SIGNED',86,39),(143,'2025-11-08','PENDING_REFUND',86,39),(144,'2025-11-08','PARTIALLY_SIGNED',87,39),(145,'2025-11-08','SIGNED',87,39),(146,'2025-11-08','PENDING_REFUND',87,39),(147,'2025-11-08','PARTIALLY_SIGNED',88,39),(148,'2025-11-08','SIGNED',88,39),(149,'2025-11-08','PENDING_REFUND',88,39),(150,'2025-11-08','PARTIALLY_SIGNED',89,39),(151,'2025-11-08','SIGNED',89,39),(152,'2025-11-08','CLOSED',89,39),(153,'2025-11-09','PARTIALLY_SIGNED',90,39),(154,'2025-11-09','SIGNED',90,39),(155,'2025-11-11','PARTIALLY_SIGNED',91,39),(156,'2025-11-11','SIGNED',91,39),(157,'2025-11-11','PARTIALLY_SIGNED',92,39),(158,'2025-11-11','SIGNED',92,39),(159,'2025-11-11','PENDING_REFUND',80,39),(160,'2025-11-11','PENDING_REFUND',92,39),(161,'2025-11-13','PARTIALLY_SIGNED',94,9),(162,'2025-11-13','PARTIALLY_SIGNED',95,9),(163,'2025-11-13','PARTIALLY_SIGNED',96,39),(164,'2025-11-13','CANCELLED',96,39),(165,'2025-11-13','PARTIALLY_SIGNED',97,39),(166,'2025-11-13','CANCELLED',97,39),(167,'2025-11-14','PARTIALLY_SIGNED',98,39),(168,'2025-11-14','SIGNED',98,39),(169,'2025-11-14','PARTIALLY_SIGNED',99,39),(170,'2025-11-14','SIGNED',99,39),(171,'2025-11-14','PARTIALLY_SIGNED',100,39),(172,'2025-11-14','SIGNED',100,39),(173,'2025-11-14','PARTIALLY_SIGNED',101,39),(174,'2025-11-14','SIGNED',101,39),(175,'2025-11-14','PARTIALLY_SIGNED',102,39),(176,'2025-11-14','SIGNED',102,39),(177,'2025-11-14','CLOSED',101,39),(178,'2025-11-14','PENDING_REFUND',98,39),(179,'2025-11-14','PENDING_REFUND',99,39),(180,'2025-11-14','PENDING_REFUND',100,39),(181,'2025-11-14','PARTIALLY_SIGNED',103,39),(182,'2025-11-14','SIGNED',103,39),(183,'2025-11-14','PARTIALLY_SIGNED',104,39),(184,'2025-11-14','SIGNED',104,39),(185,'2025-11-14','PARTIALLY_SIGNED',105,39),(186,'2025-11-14','SIGNED',105,39),(187,'2025-11-14','PARTIALLY_SIGNED',106,39),(188,'2025-11-14','SIGNED',106,39),(189,'2025-11-18','PARTIALLY_SIGNED',108,39),(190,'2025-11-18','SIGNED',108,39);
/*!40000 ALTER TABLE `contract_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id_contract` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL,
  `created_at` date DEFAULT NULL,
  `currency` enum('ARS','CNY','EUR','USD') NOT NULL,
  `profit1year` decimal(38,2) DEFAULT NULL,
  `profit2years` decimal(38,2) DEFAULT NULL,
  `profit3years` decimal(38,2) DEFAULT NULL,
  `status` enum('PENDING_STUDENT_SIGNATURE','SIGNED','CANCELLED','REFUNDED','CLOSED','DRAFT','PARTIALLY_SIGNED','PENDING_REFUND','REFUND_FAILED') NOT NULL,
  `created_by_investor_id` bigint NOT NULL,
  `investment_id` bigint DEFAULT NULL,
  `project_id` bigint NOT NULL,
  `text_title` varchar(255) DEFAULT NULL,
  `description` text,
  `investor_signed` bit(1) NOT NULL,
  `investor_signed_date` date DEFAULT NULL,
  `student_signed` bit(1) NOT NULL,
  `student_signed_date` date DEFAULT NULL,
  PRIMARY KEY (`id_contract`),
  UNIQUE KEY `UKaucfsw8kjbmuxc7ia20a39f0g` (`investment_id`),
  KEY `FKa56wws6ruhba5ymivwi013v9i` (`created_by_investor_id`),
  KEY `FK8i3ky7vbbfg6r6tp7dqemne0a` (`project_id`),
  CONSTRAINT `FK8i3ky7vbbfg6r6tp7dqemne0a` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id_project`),
  CONSTRAINT `FKa56wws6ruhba5ymivwi013v9i` FOREIGN KEY (`created_by_investor_id`) REFERENCES `investors` (`id`),
  CONSTRAINT `FKq67cl65kdmphqactd5q7hjb9e` FOREIGN KEY (`investment_id`) REFERENCES `investments` (`id_investment`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
INSERT INTO `contracts` VALUES (1,25000.00,'2025-10-03','USD',6.00,15.00,25.00,'CLOSED',5,1,2,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(2,5000000.00,'2025-10-03','USD',6.00,15.00,25.00,'CANCELLED',5,NULL,2,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(3,5000000.00,'2025-10-03','USD',6.00,15.00,25.00,'DRAFT',5,NULL,2,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(4,5000000.00,'2025-10-03','USD',6.00,15.00,25.00,'CANCELLED',5,2,2,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(5,128320.00,'2025-10-03','USD',6.00,15.00,25.00,'REFUNDED',5,3,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(6,128320.00,'2025-10-03','USD',6.00,15.00,25.00,'REFUNDED',5,4,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(7,128320.00,'2025-10-03','USD',6.00,15.00,25.00,'CANCELLED',5,NULL,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(8,128320.00,'2025-10-03','USD',6.00,15.00,25.00,'CANCELLED',5,5,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(9,177660.00,'2025-10-03','USD',6.00,15.00,25.00,'CLOSED',5,6,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(10,2903240.00,'2025-10-03','USD',6.00,15.00,25.00,'CANCELLED',5,7,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(11,474733.00,'2025-10-04','USD',6.00,15.00,25.00,'REFUNDED',5,8,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(12,474733.00,'2025-10-07','USD',6.00,15.00,25.00,'CLOSED',5,9,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(13,474733.00,'2025-10-07','USD',6.00,15.00,25.00,'CLOSED',5,10,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(14,4903333.00,'2025-10-07','USD',6.00,15.00,25.00,'CLOSED',5,11,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(15,495333.00,'2025-10-07','USD',6.00,15.00,25.00,'CLOSED',5,12,5,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(16,50500.00,'2025-10-07','USD',10.00,20.00,30.00,'CLOSED',5,13,7,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(17,630000.00,'2025-10-07','USD',10.00,20.00,30.00,'CLOSED',5,14,8,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(18,630000.00,'2025-10-08','USD',10.00,20.00,30.00,'CLOSED',5,15,8,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(19,630000.00,'2025-10-08','USD',10.00,20.00,30.00,'CLOSED',5,16,8,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(20,630000.00,'2025-10-08','USD',10.00,20.00,30.00,'CLOSED',5,17,8,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(21,630000.00,'2025-10-08','USD',10.00,20.00,30.00,'CLOSED',5,18,8,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(22,630000.00,'2025-10-08','USD',10.00,20.00,30.00,'CLOSED',5,19,8,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(23,630000.00,'2025-10-08','USD',10.00,20.00,30.00,'CLOSED',5,20,9,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(24,630000.00,'2025-10-08','USD',10.00,20.00,30.00,'CLOSED',5,21,11,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(25,805230.00,'2025-10-09','USD',15.00,25.00,37.00,'CLOSED',5,22,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(26,553311.00,'2025-10-09','USD',15.00,25.00,37.00,'CLOSED',5,23,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(27,443311.00,'2025-10-09','USD',15.00,25.00,37.00,'SIGNED',5,24,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(28,40091.00,'2025-10-09','USD',15.00,25.00,37.00,'CANCELLED',5,25,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(29,15000.00,'2025-10-09','USD',0.08,0.15,0.25,'SIGNED',5,26,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(30,15000.00,'2025-10-10','USD',8.00,12.00,15.00,'CLOSED',22,27,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(31,8500.00,'2025-10-10','USD',5.00,10.00,18.00,'DRAFT',22,NULL,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(32,3500.00,'2025-10-10','USD',5.00,10.00,18.00,'DRAFT',22,NULL,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(33,2900.00,'2025-10-10','USD',0.04,0.08,0.12,'CLOSED',22,28,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(34,5600.00,'2025-10-10','USD',0.04,0.08,0.12,'CANCELLED',22,NULL,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(35,300.00,'2025-10-10','USD',0.04,0.08,0.12,'CANCELLED',22,NULL,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(36,900.00,'2025-10-10','USD',0.04,0.08,0.12,'REFUNDED',22,29,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(37,8700.00,'2025-10-10','USD',0.04,0.08,0.12,'CANCELLED',22,30,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(38,9900.00,'2025-10-10','USD',0.04,0.08,0.12,'REFUNDED',22,31,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(39,9900.00,'2025-10-10','USD',0.04,0.08,0.12,'SIGNED',22,32,12,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(40,950.00,'2025-10-15','EUR',0.10,0.12,0.15,'DRAFT',22,NULL,14,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(41,950.00,'2025-10-15','EUR',0.10,0.12,0.15,'DRAFT',22,NULL,14,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(42,9500.00,'2025-10-15','EUR',0.10,0.12,0.15,'DRAFT',22,NULL,14,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(43,9500.00,'2025-10-15','USD',0.10,0.12,0.15,'DRAFT',22,NULL,14,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(44,150000.00,'2025-10-15','EUR',0.10,0.12,0.15,'DRAFT',22,NULL,14,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(45,30000.00,'2025-10-15','USD',0.10,0.12,0.15,'CLOSED',22,33,15,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(46,20000.00,'2025-10-15','USD',0.11,0.12,0.15,'SIGNED',22,34,15,'Contrato 46 (Corregido por Admin)','Cláusulas actualizadas por el administrador. Se revierte el estado de \'CLOSED\' a \'SIGNED\' y se corrigen las banderas de firma.',_binary '','2025-10-14',_binary '','2025-10-15'),(47,100.00,'2025-10-15','USD',0.10,0.12,0.15,'CANCELLED',22,NULL,15,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(48,700.00,'2025-10-15','USD',0.10,0.12,0.15,'SIGNED',22,35,16,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(49,700.00,'2025-10-15','USD',0.10,0.12,0.15,'SIGNED',22,36,16,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(50,800.00,'2025-10-15','USD',0.10,0.12,0.15,'SIGNED',22,37,17,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(51,800.00,'2025-10-15','USD',0.10,0.12,0.15,'CANCELLED',22,38,17,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(52,1500.00,'2025-10-15','USD',0.10,0.12,0.15,'SIGNED',22,39,18,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(53,500.00,'2025-10-15','USD',0.10,0.12,0.15,'SIGNED',22,40,18,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(54,50.00,'2025-10-17','USD',0.10,0.12,0.15,'DRAFT',22,NULL,17,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(55,10.00,'2025-10-17','USD',0.10,0.12,0.15,'DRAFT',22,NULL,17,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(56,1000.00,'2025-10-17','EUR',0.10,0.12,0.15,'DRAFT',22,NULL,19,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(57,2000.00,'2025-10-17','EUR',0.10,0.12,0.15,'DRAFT',22,NULL,19,NULL,NULL,_binary '\0',NULL,_binary '\0',NULL),(58,5000.00,'2025-10-17','USD',0.10,0.12,0.15,'DRAFT',22,NULL,19,'Contrato para la Fase Inicial de Desarrollo',NULL,_binary '\0',NULL,_binary '\0',NULL),(59,5500.00,'2025-10-18','USD',0.16,0.25,0.35,'DRAFT',22,NULL,19,'Contrato de Inversión Inicial 2 (Modificado)','<h1>Términos y Condiciones Actualizados</h1><p>Esta es una <b>descripción detallada y corregida</b> del contrato.</p><ul><li>Punto 1 - Revisado</li><li>Punto 2 - Revisado</li><li>Punto 3 - Revisado</li><li><b>Punto 4 - Nueva Cláusula</b></li></ul>',_binary '\0',NULL,_binary '\0',NULL),(60,5000.00,'2025-10-18','USD',0.15,0.25,0.35,'DRAFT',22,NULL,19,'Contrato de Inversión Inicial 3','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '\0',NULL,_binary '\0',NULL),(61,24000.00,'2025-10-23','USD',0.08,0.12,0.13,'CANCELLED',22,41,19,'PRUEBA DE NUEVO FLUJO DE CONTRATOS','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '','2025-10-23',_binary '','2025-10-23'),(62,18000.00,'2025-10-23','USD',0.05,0.09,0.12,'CANCELLED',22,42,19,'OFERTA REVISADA: PRUEBA DE NUEVO FLUJO DE CONTRATOS 2','<h1>Términos y Condiciones Actualizados por Inversor</h1><p>Hemos revisado la propuesta del estudiante y ajustado el monto de inversión y los porcentajes de ganancia para hacerla más atractiva.</p>',_binary '','2025-10-23',_binary '','2025-10-23'),(63,25000.00,'2025-10-24','USD',0.06,0.10,0.13,'SIGNED',22,43,21,'Inversion de prueba analisis de riesgo 1','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '','2025-10-24',_binary '','2025-10-24'),(64,75000.00,'2025-10-25','USD',0.06,0.10,0.13,'REFUNDED',22,44,23,'Inversion de prueba REFUNDED','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '','2025-10-25',_binary '','2025-10-25'),(65,25000.00,'2025-10-27','USD',0.06,0.10,0.13,'SIGNED',22,45,24,'Inversion de prueba DE CONFIRMACION DE ENVÍO DE INVERSION','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '','2025-10-27',_binary '','2025-10-27'),(66,25000.00,'2025-10-27','USD',0.06,0.10,0.13,'CANCELLED',22,46,24,'Inversion de prueba DE CONFIRMACION DE ENVÍO DE INVERSION (camino malo)','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '','2025-10-27',_binary '','2025-10-27'),(67,90000.00,'2025-10-28','USD',0.06,0.10,0.13,'SIGNED',22,47,24,'Inversion de prueba DE CONFIRMACION DE ENVÍO DE INVERSION 2','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '','2025-10-28',_binary '','2025-10-28'),(68,25000.00,'2025-10-29','USD',0.04,0.09,0.10,'CANCELLED',22,NULL,24,'Prueba contrato',NULL,_binary '\0',NULL,_binary '\0',NULL),(69,10000.00,'2025-10-29','USD',0.06,0.10,0.13,'SIGNED',22,48,24,'Inversion de prueba DE CONFIRMACION DE ENVÍO DE INVERSION 3','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '','2025-10-29',_binary '','2025-10-29'),(70,200000.00,'2025-11-04','USD',0.06,0.10,0.13,'CLOSED',22,49,25,'Inversion de prueba DE CURRENTGOAL ACTUALIZACION 04-11-2025','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '','2025-11-04',_binary '','2025-11-04'),(71,100000.00,'2025-11-07','EUR',0.07,0.15,0.20,'CANCELLED',22,NULL,26,'Contrato 1','',_binary '\0',NULL,_binary '\0',NULL),(72,100000.00,'2025-11-07','EUR',0.10,0.15,0.20,'CANCELLED',22,50,26,'Contrato euros','',_binary '','2025-11-07',_binary '','2025-11-07'),(73,20000.00,'2025-11-07','EUR',0.10,0.15,0.20,'CANCELLED',22,54,26,'Contrato 3','<p>							</p>',_binary '','2025-11-07',_binary '','2025-11-07'),(74,20000.00,'2025-11-07','EUR',0.10,0.15,0.20,'CLOSED',22,51,26,'Contrato 5','<p>							</p>',_binary '','2025-11-07',_binary '','2025-11-07'),(75,1000.00,'2025-11-07','USD',0.10,0.15,0.20,'CANCELLED',22,52,26,'Contrato prueba reintentos de enviar inversion','',_binary '','2025-11-07',_binary '','2025-11-07'),(76,2000.00,'2025-11-07','USD',0.10,0.15,0.20,'SIGNED',22,53,26,'Contra para probar reintentos de enviar dinero de inversion','',_binary '','2025-11-07',_binary '','2025-11-07'),(77,5500.00,'2025-11-07','USD',0.10,0.15,0.20,'CANCELLED',22,55,26,'Contrato de prueba de ciclo de reintentos de envio de inversion','',_binary '','2025-11-07',_binary '','2025-11-07'),(78,3230.00,'2025-11-07','USD',0.10,0.15,0.20,'SIGNED',22,56,26,'Nueva prueba','',_binary '','2025-11-07',_binary '','2025-11-07'),(79,6730.00,'2025-11-07','USD',0.10,0.15,0.20,'CANCELLED',22,57,26,'Nueva prueba 2','',_binary '','2025-11-07',_binary '','2025-11-07'),(80,3902.00,'2025-11-07','USD',0.10,0.15,0.20,'PENDING_REFUND',22,58,26,'Contrato para probar si refresca la pagina','',_binary '','2025-11-07',_binary '','2025-11-07'),(81,45000.00,'2025-11-08','USD',0.10,0.15,0.20,'CLOSED',22,59,31,'Contrato final','',_binary '','2025-11-08',_binary '','2025-11-08'),(82,2500.00,'2025-11-08','USD',0.10,0.15,0.20,'CLOSED',22,60,33,'sadasd','',_binary '','2025-11-08',_binary '','2025-11-08'),(83,2000.00,'2025-11-08','USD',0.10,0.15,0.20,'SIGNED',22,61,34,'dasdasd','',_binary '','2025-11-08',_binary '','2025-11-08'),(84,3400.00,'2025-11-08','USD',0.10,0.15,0.20,'PENDING_REFUND',22,62,35,'dfdffdfdd','',_binary '','2025-11-08',_binary '','2025-11-08'),(85,4000.00,'2025-11-08','USD',0.10,0.15,0.20,'REFUNDED',22,63,36,'aasdasdasda','',_binary '','2025-11-08',_binary '','2025-11-08'),(86,5400.00,'2025-11-08','USD',0.10,0.15,0.20,'PENDING_REFUND',22,64,37,'asdasdasasd','',_binary '','2025-11-08',_binary '','2025-11-08'),(87,7200.00,'2025-11-08','USD',0.10,0.15,0.20,'PENDING_REFUND',22,65,38,'fasfsdfa','',_binary '','2025-11-08',_binary '','2025-11-08'),(88,5600.00,'2025-11-08','USD',0.10,0.15,0.20,'REFUNDED',22,66,39,'asdasdasda','',_binary '','2025-11-08',_binary '','2025-11-08'),(89,2400.00,'2025-11-08','USD',0.10,0.15,0.20,'CLOSED',22,67,40,'asdasdasd','',_binary '','2025-11-08',_binary '','2025-11-08'),(90,5000.00,'2025-11-09','USD',0.10,0.15,0.20,'SIGNED',22,68,41,'Contrato para sobrefinanciar','',_binary '','2025-11-09',_binary '','2025-11-09'),(91,3000.00,'2025-11-11','EUR',0.10,0.15,0.20,'SIGNED',22,69,26,'contrato para probar la conversion','',_binary '','2025-11-11',_binary '','2025-11-11'),(92,5000000000.00,'2025-11-11','ARS',0.15,0.25,0.35,'REFUNDED',22,70,26,'Contrato de Inversión Inicial 9','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '','2025-11-11',_binary '','2025-11-11'),(93,5000.00,'2025-11-11','ARS',0.10,0.15,0.20,'DRAFT',22,NULL,32,'Contrato prueba de conversion visualizada al usuario','',_binary '\0',NULL,_binary '\0',NULL),(94,2500.00,'2025-11-13','USD',0.10,0.15,0.20,'CANCELLED',22,NULL,24,'Contrato prueba cancelar en firma parcial','',_binary '\0',NULL,_binary '\0',NULL),(95,1000.00,'2025-11-13','USD',0.10,0.15,0.20,'PARTIALLY_SIGNED',22,NULL,24,'Contrato preuba cancelacion 2','',_binary '','2025-11-13',_binary '\0',NULL),(96,2000.00,'2025-11-13','USD',0.10,0.15,0.20,'CANCELLED',22,NULL,42,'Contrato prueba','',_binary '','2025-11-13',_binary '\0',NULL),(97,4000.00,'2025-11-13','USD',0.10,0.15,0.20,'CANCELLED',22,NULL,42,'asdasd','',_binary '','2025-11-13',_binary '\0',NULL),(98,2000.00,'2025-11-14','USD',0.10,0.15,0.20,'PENDING_REFUND',22,71,42,'Contrato de prueba bug generar ganancia antes de tiempo','',_binary '','2025-11-14',_binary '','2025-11-14'),(99,1000.00,'2025-11-14','USD',0.10,0.15,0.20,'PENDING_REFUND',22,72,42,'vamos otra vez','',_binary '','2025-11-14',_binary '','2025-11-14'),(100,600.00,'2025-11-14','USD',0.10,0.15,0.20,'PENDING_REFUND',22,73,42,'contraot 34','',_binary '','2025-11-14',_binary '','2025-11-14'),(101,150.00,'2025-11-14','USD',0.10,0.15,0.20,'CLOSED',22,74,42,'adasd','',_binary '','2025-11-14',_binary '','2025-11-14'),(102,2000.00,'2025-11-14','USD',0.10,0.15,0.20,'SIGNED',22,75,42,'final','',_binary '','2025-11-14',_binary '','2025-11-14'),(103,3400.00,'2025-11-14','USD',0.10,0.15,0.20,'SIGNED',22,76,44,'prueba 1','',_binary '','2025-11-14',_binary '','2025-11-14'),(104,2000.00,'2025-11-14','USD',0.10,0.15,0.20,'SIGNED',22,77,44,'dfsdf','',_binary '','2025-11-14',_binary '','2025-11-14'),(105,26000.00,'2025-11-14','EUR',0.10,0.15,0.20,'SIGNED',22,78,44,'prueba euros','',_binary '','2025-11-14',_binary '','2025-11-14'),(106,250000.00,'2025-11-14','CNY',0.10,0.15,0.20,'SIGNED',22,79,44,'sdfdsff','',_binary '','2025-11-14',_binary '','2025-11-14'),(107,1000.00,'2025-11-14','ARS',0.10,0.15,0.20,'DRAFT',22,NULL,43,'sasd','',_binary '\0',NULL,_binary '\0',NULL),(108,23000.00,'2025-11-18','USD',0.10,0.15,0.20,'SIGNED',22,80,45,'adasdasd','',_binary '','2025-11-18',_binary '','2025-11-18'),(109,5000.00,'2025-11-26','USD',0.15,0.25,0.35,'DRAFT',22,NULL,47,'Contrato de prueba 26/11','<h1>Términos y Condiciones</h1><p>Esta es una <b>descripción detallada</b> del contrato. Incluye los siguientes puntos:</p><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul>',_binary '\0',NULL,_binary '\0',NULL);
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `earnings`
--

DROP TABLE IF EXISTS `earnings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `earnings` (
  `id_earning` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL,
  `confirmed_at` date DEFAULT NULL,
  `created_at` date DEFAULT NULL,
  `currency` enum('ARS','CNY','EUR','USD') NOT NULL,
  `status` enum('IN_PROGRESS','NOT_RECEIVED','RECEIVED','PENDING_CONFIRMATION') NOT NULL,
  `confirmed_by_id` bigint DEFAULT NULL,
  `generated_by_id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `contract_id` bigint NOT NULL,
  `base_amount` decimal(15,2) NOT NULL,
  `profit_amount` decimal(15,2) NOT NULL,
  `profit_rate` decimal(5,4) NOT NULL,
  `retry_count` int NOT NULL,
  PRIMARY KEY (`id_earning`),
  UNIQUE KEY `UKsen42tsywmt5uaxh3c6t6wk0s` (`contract_id`),
  KEY `FKgwe0ikk4m9e61pudfam0hc6jc` (`confirmed_by_id`),
  KEY `FK5n3hrj0ure4gsk8m9ksyj46bx` (`generated_by_id`),
  KEY `FKrx842vijqaxy87e341ea04j3t` (`project_id`),
  CONSTRAINT `FK5n3hrj0ure4gsk8m9ksyj46bx` FOREIGN KEY (`generated_by_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKbu7nppgxf1a8mhy5ba49sddso` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id_contract`),
  CONSTRAINT `FKgwe0ikk4m9e61pudfam0hc6jc` FOREIGN KEY (`confirmed_by_id`) REFERENCES `investors` (`id`),
  CONSTRAINT `FKrx842vijqaxy87e341ea04j3t` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id_project`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `earnings`
--

LOCK TABLES `earnings` WRITE;
/*!40000 ALTER TABLE `earnings` DISABLE KEYS */;
INSERT INTO `earnings` VALUES (1,2664900.00,'2025-10-07','2025-10-07','USD','RECEIVED',5,4,5,9,0.00,0.00,0.0000,0),(2,569632.95,'2025-10-07','2025-10-07','USD','RECEIVED',5,4,5,15,495333.00,74299.95,0.1500,0),(3,55550.00,NULL,'2025-10-07','USD','IN_PROGRESS',NULL,11,7,16,50500.00,5050.00,0.1000,0),(4,693000.00,'2025-10-07','2025-10-07','USD','RECEIVED',5,11,8,17,630000.00,63000.00,0.1000,0),(5,693000.00,'2025-10-08','2025-10-08','USD','NOT_RECEIVED',5,9,8,18,630000.00,63000.00,0.1000,0),(6,693000.00,'2025-10-08','2025-10-08','USD','RECEIVED',5,9,8,19,630000.00,63000.00,0.1000,0),(7,693000.00,'2025-11-05','2025-10-08','USD','NOT_RECEIVED',5,9,8,20,630000.00,63000.00,0.1000,3),(8,693000.00,'2025-10-08','2025-10-08','USD','NOT_RECEIVED',5,9,8,21,630000.00,63000.00,0.1000,0),(9,693000.00,'2025-10-08','2025-10-08','USD','NOT_RECEIVED',5,9,8,22,630000.00,63000.00,0.1000,0),(10,693000.00,'2025-10-08','2025-10-08','USD','NOT_RECEIVED',5,9,9,23,630000.00,63000.00,0.1000,0),(11,693000.00,'2025-10-08','2025-10-08','USD','RECEIVED',5,9,11,24,630000.00,63000.00,0.1000,0),(12,926014.50,'2025-10-09','2025-10-09','USD','RECEIVED',5,9,12,25,805230.00,120784.50,0.1500,0),(13,636307.65,'2025-10-09','2025-10-09','USD','RECEIVED',5,9,12,26,553311.00,82996.65,0.1500,0),(14,16200.00,NULL,'2025-10-10','USD','IN_PROGRESS',22,9,12,30,15000.00,1200.00,0.0800,0),(15,3016.00,'2025-10-10','2025-10-10','USD','RECEIVED',22,9,12,33,2900.00,116.00,0.0400,0),(16,33000.00,NULL,'2025-10-15','USD','IN_PROGRESS',NULL,9,15,45,30000.00,3000.00,0.1000,0),(17,22000.00,'2025-10-27','2025-10-15','USD','RECEIVED',22,9,15,46,20000.00,2000.00,0.1000,0),(18,212000.00,'2025-11-04','2025-11-04','USD','RECEIVED',22,9,25,70,200000.00,12000.00,0.0600,0),(19,22000.00,'2025-11-07','2025-11-07','EUR','RECEIVED',22,39,26,74,20000.00,2000.00,0.1000,1),(20,49500.00,NULL,'2025-11-08','USD','IN_PROGRESS',NULL,39,31,81,45000.00,4500.00,0.1000,0),(21,2750.00,'2025-11-08','2025-11-08','USD','RECEIVED',22,39,33,82,2500.00,250.00,0.1000,0),(22,2640.00,'2025-11-08','2025-11-08','USD','RECEIVED',22,39,40,89,2400.00,240.00,0.1000,1),(23,165.00,'2025-11-14','2025-11-14','USD','PENDING_CONFIRMATION',NULL,39,42,101,150.00,15.00,0.1000,0);
/*!40000 ALTER TABLE `earnings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investments`
--

DROP TABLE IF EXISTS `investments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `investments` (
  `id_investment` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL,
  `confirmed_at` date DEFAULT NULL,
  `created_at` date DEFAULT NULL,
  `currency` enum('ARS','CNY','EUR','USD') NOT NULL,
  `deleted` bit(1) NOT NULL,
  `deleted_at` date DEFAULT NULL,
  `status` enum('IN_PROGRESS','RECEIVED','NOT_RECEIVED','CANCELLED','PENDING_RETURN','RETURNED','COMPLETED','PENDING_CONFIRMATION','PENDING_REFUND','REFUND_NOT_RECEIVED','REFUND_FAILED') DEFAULT NULL,
  `confirmed_by_student_id` bigint DEFAULT NULL,
  `generated_by_investor_id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `retry_count` int NOT NULL,
  PRIMARY KEY (`id_investment`),
  KEY `FKl6j8utrdkqi3xqbr8box4jhm8` (`confirmed_by_student_id`),
  KEY `FKpge2v4cisj0l7rrfveulgy35x` (`generated_by_investor_id`),
  KEY `FKhn9dehsfw66j02x1ogyu1uaos` (`project_id`),
  CONSTRAINT `FKhn9dehsfw66j02x1ogyu1uaos` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id_project`),
  CONSTRAINT `FKl6j8utrdkqi3xqbr8box4jhm8` FOREIGN KEY (`confirmed_by_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKpge2v4cisj0l7rrfveulgy35x` FOREIGN KEY (`generated_by_investor_id`) REFERENCES `investors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investments`
--

LOCK TABLES `investments` WRITE;
/*!40000 ALTER TABLE `investments` DISABLE KEYS */;
INSERT INTO `investments` VALUES (1,25000.00,'2025-10-03','2025-10-03','USD',_binary '\0',NULL,'RECEIVED',4,5,2,0),(2,2450.00,'2025-10-20','2025-10-03','USD',_binary '\0',NULL,'RECEIVED',4,5,2,0),(3,128320.00,'2025-10-03','2025-10-03','USD',_binary '\0',NULL,'RETURNED',4,5,5,0),(4,128320.00,'2025-10-03','2025-10-03','USD',_binary '\0',NULL,'RETURNED',4,5,5,0),(5,128320.00,NULL,'2025-10-03','USD',_binary '\0',NULL,'CANCELLED',NULL,5,5,0),(6,177660.00,'2025-10-03','2025-10-03','USD',_binary '\0',NULL,'NOT_RECEIVED',4,5,5,0),(7,2903240.00,'2025-10-03','2025-10-03','USD',_binary '\0',NULL,'NOT_RECEIVED',4,5,5,0),(8,474733.00,'2025-10-04','2025-10-04','USD',_binary '\0',NULL,'RETURNED',4,5,5,0),(9,474733.00,'2025-10-07','2025-10-07','USD',_binary '\0',NULL,'RECEIVED',4,5,5,0),(10,474733.00,'2025-10-07','2025-10-07','USD',_binary '\0',NULL,'RECEIVED',4,5,5,0),(11,4903333.00,'2025-10-07','2025-10-07','USD',_binary '\0',NULL,'RECEIVED',4,5,5,0),(12,495333.00,'2025-10-07','2025-10-07','USD',_binary '\0',NULL,'RECEIVED',4,5,5,0),(13,50500.00,'2025-10-25','2025-10-07','USD',_binary '\0',NULL,'NOT_RECEIVED',11,5,7,0),(14,630000.00,'2025-10-07','2025-10-07','USD',_binary '\0',NULL,'RECEIVED',11,5,8,0),(15,630000.00,'2025-10-08','2025-10-08','USD',_binary '\0',NULL,'RECEIVED',9,5,8,0),(16,630000.00,'2025-10-08','2025-10-08','USD',_binary '\0',NULL,'RECEIVED',9,5,8,0),(17,630000.00,'2025-10-08','2025-10-08','USD',_binary '\0',NULL,'RECEIVED',9,5,8,0),(18,630000.00,'2025-10-08','2025-10-08','USD',_binary '\0',NULL,'RECEIVED',9,5,8,0),(19,630000.00,'2025-10-08','2025-10-08','USD',_binary '\0',NULL,'RECEIVED',9,5,8,0),(20,630000.00,'2025-10-08','2025-10-08','USD',_binary '\0',NULL,'RECEIVED',9,5,9,0),(21,630000.00,'2025-10-08','2025-10-08','USD',_binary '\0',NULL,'RECEIVED',9,5,11,0),(22,805230.00,'2025-10-09','2025-10-09','USD',_binary '\0',NULL,'RECEIVED',9,5,12,0),(23,553311.00,'2025-10-09','2025-10-09','USD',_binary '\0',NULL,'COMPLETED',9,5,12,0),(24,443311.00,'2025-10-09','2025-10-09','USD',_binary '\0',NULL,'RECEIVED',9,5,12,0),(25,40091.00,'2025-10-09','2025-10-09','USD',_binary '\0',NULL,'NOT_RECEIVED',9,5,12,0),(26,15000.00,NULL,'2025-10-09','USD',_binary '\0',NULL,'IN_PROGRESS',NULL,5,12,0),(27,15000.00,'2025-10-10','2025-10-10','USD',_binary '\0',NULL,'COMPLETED',9,22,12,0),(28,2900.00,'2025-10-10','2025-10-10','USD',_binary '\0',NULL,'COMPLETED',9,22,12,0),(29,900.00,'2025-10-10','2025-10-10','USD',_binary '\0',NULL,'RETURNED',9,22,12,0),(30,8700.00,'2025-10-10','2025-10-10','USD',_binary '\0',NULL,'CANCELLED',9,22,12,0),(31,9900.00,'2025-10-10','2025-10-10','USD',_binary '\0',NULL,'RETURNED',9,22,12,0),(32,9900.00,NULL,'2025-10-10','USD',_binary '\0',NULL,'IN_PROGRESS',NULL,22,12,0),(33,30000.00,'2025-10-15','2025-10-15','USD',_binary '\0',NULL,'COMPLETED',9,22,15,0),(34,20000.00,'2025-10-15','2025-10-15','USD',_binary '\0',NULL,'COMPLETED',9,22,15,0),(35,700.00,'2025-10-15','2025-10-15','USD',_binary '\0',NULL,'RECEIVED',9,22,16,0),(36,700.00,'2025-10-15','2025-10-15','USD',_binary '\0',NULL,'RECEIVED',9,22,16,0),(37,800.00,'2025-10-25','2025-10-15','USD',_binary '\0',NULL,'PENDING_RETURN',9,22,17,0),(38,800.00,'2025-10-15','2025-10-15','USD',_binary '\0',NULL,'CANCELLED',9,22,17,0),(39,1500.00,'2025-10-15','2025-10-15','USD',_binary '\0',NULL,'RECEIVED',9,22,18,0),(40,500.00,'2025-10-15','2025-10-15','USD',_binary '\0',NULL,'RECEIVED',9,22,18,0),(41,24000.00,'2025-10-25','2025-10-23','USD',_binary '\0',NULL,'CANCELLED',NULL,22,19,0),(42,18000.00,'2025-10-25','2025-10-23','USD',_binary '\0',NULL,'CANCELLED',NULL,22,19,0),(43,25000.00,'2025-10-25','2025-10-24','USD',_binary '\0',NULL,'RETURNED',9,22,21,0),(44,75000.00,'2025-10-25','2025-10-25','USD',_binary '\0',NULL,'RETURNED',9,22,23,0),(45,25000.00,'2025-10-27','2025-10-27','USD',_binary '\0',NULL,'RECEIVED',9,22,24,0),(46,25000.00,'2025-10-30','2025-10-27','USD',_binary '\0',NULL,'NOT_RECEIVED',9,22,24,0),(47,90000.00,'2025-10-28','2025-10-28','USD',_binary '\0',NULL,'RECEIVED',9,22,24,0),(48,10000.00,'2025-10-30','2025-10-29','USD',_binary '\0',NULL,'RECEIVED',9,22,24,0),(49,200000.00,'2025-11-04','2025-11-04','USD',_binary '\0',NULL,'COMPLETED',9,22,25,0),(50,100000.00,'2025-11-07','2025-11-07','EUR',_binary '\0',NULL,'NOT_RECEIVED',39,22,26,0),(51,20000.00,'2025-11-07','2025-11-07','EUR',_binary '\0',NULL,'COMPLETED',39,22,26,0),(52,1000.00,'2025-11-07','2025-11-07','USD',_binary '\0',NULL,'NOT_RECEIVED',39,22,26,0),(53,2000.00,'2025-11-07','2025-11-07','USD',_binary '\0',NULL,'RECEIVED',39,22,26,0),(54,20000.00,'2025-11-07','2025-11-07','EUR',_binary '\0',NULL,'CANCELLED',39,22,26,3),(55,5500.00,'2025-11-07','2025-11-07','USD',_binary '\0',NULL,'CANCELLED',39,22,26,3),(56,3230.00,'2025-11-07','2025-11-07','USD',_binary '\0',NULL,'RECEIVED',39,22,26,0),(57,6730.00,'2025-11-07','2025-11-07','USD',_binary '\0',NULL,'CANCELLED',39,22,26,3),(58,3902.00,'2025-11-07','2025-11-07','USD',_binary '\0',NULL,'PENDING_RETURN',39,22,26,0),(59,45000.00,'2025-11-08','2025-11-08','USD',_binary '\0',NULL,'COMPLETED',39,22,31,0),(60,2500.00,'2025-11-08','2025-11-08','USD',_binary '\0',NULL,'COMPLETED',39,22,33,0),(61,2000.00,'2025-11-08','2025-11-08','USD',_binary '\0',NULL,'RECEIVED',39,22,34,0),(62,3400.00,'2025-11-08','2025-11-08','USD',_binary '\0',NULL,'RETURNED',39,22,35,0),(63,4000.00,'2025-11-08','2025-11-08','USD',_binary '\0',NULL,'RETURNED',39,22,36,0),(64,5400.00,'2025-11-08','2025-11-08','USD',_binary '\0',NULL,'REFUND_FAILED',39,22,37,3),(65,7200.00,'2025-11-08','2025-11-08','USD',_binary '\0',NULL,'PENDING_REFUND',39,22,38,0),(66,5600.00,'2025-11-08','2025-11-08','USD',_binary '\0',NULL,'RETURNED',39,22,39,2),(67,2400.00,'2025-11-08','2025-11-08','USD',_binary '\0',NULL,'COMPLETED',39,22,40,0),(68,5000.00,'2025-11-09','2025-11-09','USD',_binary '\0',NULL,'RECEIVED',39,22,41,0),(69,3000.00,'2025-11-11','2025-11-11','EUR',_binary '\0',NULL,'RECEIVED',39,22,26,0),(70,5000000000.00,'2025-11-11','2025-11-11','ARS',_binary '\0',NULL,'RETURNED',39,22,26,0),(71,2000.00,'2025-11-14','2025-11-14','USD',_binary '\0',NULL,'PENDING_REFUND',39,22,42,0),(72,1000.00,'2025-11-14','2025-11-14','USD',_binary '\0',NULL,'PENDING_REFUND',39,22,42,0),(73,600.00,'2025-11-14','2025-11-14','USD',_binary '\0',NULL,'PENDING_REFUND',39,22,42,0),(74,150.00,'2025-11-14','2025-11-14','USD',_binary '\0',NULL,'COMPLETED',39,22,42,0),(75,2000.00,'2025-11-14','2025-11-14','USD',_binary '\0',NULL,'RECEIVED',39,22,42,0),(76,3400.00,'2025-11-14','2025-11-14','USD',_binary '\0',NULL,'RECEIVED',39,22,44,0),(77,2000.00,'2025-11-14','2025-11-14','USD',_binary '\0',NULL,'RECEIVED',39,22,44,0),(78,26000.00,NULL,'2025-11-14','EUR',_binary '\0',NULL,'IN_PROGRESS',NULL,22,44,0),(79,250000.00,'2025-11-14','2025-11-14','CNY',_binary '\0',NULL,'RECEIVED',39,22,44,0),(80,23000.00,'2025-11-18','2025-11-18','USD',_binary '\0',NULL,'RECEIVED',39,22,45,0);
/*!40000 ALTER TABLE `investments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investors`
--

DROP TABLE IF EXISTS `investors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `investors` (
  `contact_person` varchar(255) NOT NULL,
  `cuit` varchar(11) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `web_site` varchar(100) DEFAULT NULL,
  `id` bigint NOT NULL,
  `address_id` bigint DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKanyy58r47nhva7gml9ejims2x` (`cuit`),
  UNIQUE KEY `UK59gv6a4ga1ru1361n90vud92r` (`address_id`),
  CONSTRAINT `FK9t284so3vpgitl5lhtqg9ssre` FOREIGN KEY (`id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqcnp6s3w126mh5l0p2buagxde` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investors`
--

LOCK TABLES `investors` WRITE;
/*!40000 ALTER TABLE `investors` DISABLE KEYS */;
INSERT INTO `investors` VALUES ('Juan Pérez','30799887766','+541143475000','https://www.bancopatagonia.com.ar',5,2,NULL),('Miguel Lopez','28329222222','121212111','www.bancomacro.com',14,10,NULL),('Ana García','30711223344','+543875550101','https://www.inversionesdelnorte.com',21,17,NULL),('Sofia Beron','30711222444','+543874112233','https://www.inversionesnorte.com.ar',22,18,NULL),('Ana Martínez','30123456789','+5491155558888','https://www.tecnoinversiones.com',24,22,NULL),('Lucas Beron','33434443333','01138250293','www.financieraprueba.com',32,30,NULL),('Lucas Beron','22333222222','01138250293','www.financieraprueba.com',33,31,NULL),('asdasd','22222222222','21312312','',36,34,NULL),('Persona prueba','30123456129','+5491155552222','https://www.finacierapruebapatch.com',41,39,'https://linkedin.com/pruebadequepersista');
/*!40000 ALTER TABLE `investors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_token`
--

DROP TABLE IF EXISTS `password_reset_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expiry_date` datetime(6) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKf90ivichjaokvmovxpnlm5nin` (`user_id`),
  CONSTRAINT `FK83nsrttkwkb6ym0anu051mtxn` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_token`
--

LOCK TABLES `password_reset_token` WRITE;
/*!40000 ALTER TABLE `password_reset_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_token_seq`
--

DROP TABLE IF EXISTS `password_reset_token_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_token_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_token_seq`
--

LOCK TABLES `password_reset_token_seq` WRITE;
/*!40000 ALTER TABLE `password_reset_token_seq` DISABLE KEYS */;
INSERT INTO `password_reset_token_seq` VALUES (201);
/*!40000 ALTER TABLE `password_reset_token_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnry1f3jmc4abb5yvkftlvn6vg` (`permission_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (3,'CREATE'),(4,'DELETE'),(1,'READ'),(2,'UPDATE');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_tags`
--

DROP TABLE IF EXISTS `project_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_tags` (
  `id_project_tag` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_project_tag`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_tags`
--

LOCK TABLES `project_tags` WRITE;
/*!40000 ALTER TABLE `project_tags` DISABLE KEYS */;
INSERT INTO `project_tags` VALUES (1,'TECNOLOGÍA'),(2,'EDUCACIÓN'),(3,'SALUD Y BIENESTAR'),(4,'SOSTENIBILIDAD Y MEDIO AMBIENTE'),(5,'ARTE Y CULTURA'),(6,'FINANCIERO'),(7,'COMERCIO ELECTRÓNICO'),(8,'ALIMENTOS Y BEBIDAS'),(9,'SERVICIOS PROFESIONALES'),(10,'IMPACTO SOCIAL'),(11,'OTROS');
/*!40000 ALTER TABLE `project_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id_project` bigint NOT NULL AUTO_INCREMENT,
  `budget_goal` decimal(38,2) NOT NULL,
  `current_goal` decimal(38,2) NOT NULL,
  `description` varchar(500) NOT NULL,
  `end_date` date DEFAULT NULL,
  `estimated_end_date` date NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `status` varchar(255) NOT NULL,
  `tag_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `modified_at` datetime(6) DEFAULT NULL,
  `owner_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id_project`),
  KEY `FK45bxf5dp9mnugp6p7f8shbymt` (`tag_id`),
  KEY `FKg9jcj16d1bce2kt2ij0yqiion` (`owner_id`),
  CONSTRAINT `FK45bxf5dp9mnugp6p7f8shbymt` FOREIGN KEY (`tag_id`) REFERENCES `project_tags` (`id_project_tag`),
  CONSTRAINT `FKg9jcj16d1bce2kt2ij0yqiion` FOREIGN KEY (`owner_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (2,500000.00,5035000.00,'Investigación sobre nuevas terapias y tratamientos innovadores en medicina para mejorar la calidad de vida de los pacientes.',NULL,'2026-09-24','Proyecto Medicina Avanzada','2025-09-24','IN_PROGRESS',NULL,'2025-09-24 18:05:24.008255',_binary '','2025-09-25 17:58:45.854637',NULL,9),(3,800000.00,178754.67,'Desarrollo de soluciones mecánicas y sistemas inteligentes para optimizar procesos industriales y tecnológicos. Versión actualizada.',NULL,'2026-12-31','Proyecto Ingeniería Mecánica y Sistemas Actualizado','2025-09-24','NOT_FUNDED',NULL,'2025-09-24 18:18:32.255530',_binary '\0',NULL,'2025-09-25 19:49:06.273276',9),(4,150000.00,0.00,'Desarrollo de soluciones innovadoras para optimizar el uso de energías limpias en entornos urbanos y rurales.',NULL,'2026-12-31','Proyecto de Energía Renovable','2025-09-25','NOT_FUNDED',NULL,'2025-09-25 22:35:36.046578',_binary '\0',NULL,NULL,9),(5,150000.00,6348132.00,'Desarrollo de soluciones innovadoras para optimizar el uso de energías limpias en entornos urbanos y rurales.',NULL,'2026-12-31','Proyecto de Energía Eolica','2025-09-25','IN_PROGRESS',NULL,'2025-10-03 21:37:01.258175',_binary '\0',NULL,NULL,9),(6,150000.00,0.00,'Desarrollo de soluciones innovadoras para optimizar el uso de energías limpias en entornos urbanos y rurales.',NULL,'2026-12-31','Proyecto de Energía nUCLEAR','2025-09-25','NOT_FUNDED',NULL,'2025-10-07 16:44:17.127850',_binary '\0',NULL,NULL,9),(7,220000.00,50500.00,'Implementación de sensores IoT y algoritmos predictivos para medir y optimizar la calidad del aire en zonas urbanas.',NULL,'2026-08-30','Sistema de Monitoreo Ambiental Inteligente','2025-10-10','NOT_FUNDED',NULL,'2025-10-07 20:12:49.031848',_binary '\0',NULL,NULL,11),(8,275000.00,3087000.00,'Desarrollo de una aplicación basada en IoT y análisis de datos para optimizar la recolección y reciclaje de residuos urbanos, reduciendo costos y mejorando la sostenibilidad ambiental.','2025-11-07','2026-09-15','Plataforma de Gestión de Residuos Inteligente','2025-11-01','NOT_FUNDED',NULL,'2025-10-07 20:21:47.734953',_binary '\0',NULL,'2025-11-07 04:00:06.348494',11),(9,275000.00,630000.00,'Desarrollo de una aplicación basada en IoT y análisis de datos para optimizar la recolección y reciclaje de residuos urbanos, reduciendo costos y mejorando la sostenibilidad ambiental.','2025-11-07','2026-09-15','PROYECTO DE PRUEBA','2025-11-01','NOT_FUNDED',NULL,'2025-10-08 16:17:32.527641',_binary '\0',NULL,'2025-11-07 04:00:11.052904',9),(10,275000.00,0.00,'Desarrollo de una aplicación basada en IoT y análisis de datos para optimizar la recolección y reciclaje de residuos urbanos, reduciendo costos y mejorando la sostenibilidad ambiental.','2025-11-07','2026-09-15','PROYECTO DE PRUEBA 2','2025-11-01','NOT_FUNDED',NULL,'2025-10-08 21:10:17.978445',_binary '\0',NULL,'2025-11-07 04:00:12.468557',9),(11,275000.00,0.00,'Desarrollo de una aplicación basada en IoT y análisis de datos para optimizar la recolección y reciclaje de residuos urbanos, reduciendo costos y mejorando la sostenibilidad ambiental.','2025-11-07','2026-09-15','PROYECTO DE PRUEBA 3','2025-11-01','NOT_FUNDED',NULL,'2025-10-08 23:18:06.534401',_binary '\0',NULL,'2025-11-07 04:00:13.439916',9),(12,275000.00,452011.00,'Desarrollo de una aplicación basada en IoT y análisis de datos para optimizar la recolección y reciclaje de residuos urbanos, reduciendo costos y mejorando la sostenibilidad ambiental.','2025-11-07','2026-09-15','PROYECTO DE PRUEBA 4','2025-11-01','NOT_FUNDED',NULL,'2025-10-09 16:55:59.935060',_binary '\0',NULL,'2025-11-07 04:00:14.330364',9),(13,275000.00,0.00,'Desarrollo de una aplicación basada en IoT y análisis de datos para optimizar la recolección y reciclaje de residuos urbanos, reduciendo costos y mejorando la sostenibilidad ambiental.','2025-11-07','2026-09-15','PROYECTO DE PRUEBA 5','2025-11-01','NOT_FUNDED',NULL,'2025-10-14 21:27:31.903892',_binary '\0',NULL,'2025-11-07 04:00:15.587056',9),(14,180000.00,0.00,'Diseño y desarrollo de una plataforma e-learning para impartir cursos de programación en tiempo real, con pizarras virtuales, chat integrado y sistemas de evaluación automatizados.',NULL,'2026-11-30','Plataforma Educativa Interactiva','2026-01-15','PENDING_FUNDING',NULL,'2025-10-15 16:58:12.666267',_binary '\0',NULL,NULL,9),(15,50000.00,30000.00,'Vamos a financiar este proyecto hasta el tope.','2025-10-15','2025-11-01','Proyecto de Financiación Total','2024-11-01','COMPLETED',NULL,'2025-10-15 17:42:19.254041',_binary '\0',NULL,'2025-10-15 18:17:48.182425',9),(16,1000.00,1400.00,'Prueba de inversiones simultaneas',NULL,'2025-11-01','Race condition','2024-11-01','IN_PROGRESS',NULL,'2025-10-15 18:28:49.303562',_binary '\0',NULL,NULL,9),(17,1000.00,800.00,'Prueba de inversiones simultaneas',NULL,'2025-11-01','Race condition 2','2024-11-01','NOT_FUNDED',NULL,'2025-10-15 18:49:23.409587',_binary '\0',NULL,NULL,9),(18,2000.00,2000.00,'Prueba de cancelaciones','2025-10-15','2025-11-01','Prueba de cancelacion','2024-11-01','CANCELLED',NULL,'2025-10-15 19:40:50.175884',_binary '\0',NULL,'2025-10-15 19:46:28.806673',9),(19,200000.00,0.00,'Esta es una nueva descripción actualizada por el administrador para verificar la funcionalidad del endpoint.','2024-11-15','2025-11-01','Proyecto (Actualizado por Admin 2)','2024-11-01','CANCELLED',NULL,'2025-10-17 16:57:42.927326',_binary '\0',NULL,NULL,9),(20,15000.00,0.00,'Una aplicación móvil para conectar a estudiantes con tutores especializados en diferentes áreas académicas. El objetivo es facilitar el aprendizaje personalizado.','2025-11-07','2026-11-01','Desarrollo de App Móvil Educativa','2025-11-01','NOT_FUNDED',2,'2025-10-18 15:55:00.982889',_binary '\0',NULL,'2025-11-07 04:00:16.461803',9),(21,50000.00,0.00,'Desarrollo de sensores IoT para optimizar el riego y la nutrición de cultivos. El objetivo es reducir el consumo de agua y aumentar la producción agrícola de forma sostenible.',NULL,'2025-12-31','Innovación Agrotech (Cohete)','2025-01-01','NOT_FUNDED',4,'2025-10-24 20:06:24.592657',_binary '\0',NULL,NULL,9),(22,300000.00,15000.00,'Una plataforma ambiciosa que utiliza IA para crear planes de estudio personalizados. Requiere una inversión significativa en I+D y marketing.',NULL,'2026-08-01','Plataforma IA Educativa Global (Tortuga)','2025-02-01','NOT_FUNDED',2,'2024-10-10 12:00:00.000000',_binary '\0',NULL,NULL,9),(23,120000.00,0.00,'Una plataforma para conectar músicos, compositores y productores. Permitirá la colaboración en proyectos musicales, compartir partituras y recibir feedback de la comunidad.','2025-10-25','2026-06-30','Red Social para Músicos (Delfín)','2025-10-24','NOT_FUNDED',5,'2025-10-25 17:40:08.253751',_binary '\0',NULL,'2025-10-25 18:57:00.761392',9),(24,200000.00,125000.00,'Una plataforma para conectar músicos, compositores y productores. Permitirá la colaboración en proyectos musicales, compartir partituras y recibir feedback de la comunidad.',NULL,'2026-06-30','Red Social para Inversores','2025-12-12','PENDING_FUNDING',5,'2025-10-27 15:13:20.760332',_binary '\0',NULL,NULL,9),(25,200000.00,200000.00,'Una plataforma para conectar músicos, compositores y productores. Permitirá la colaboración en proyectos musicales, compartir partituras y recibir feedback de la comunidad.',NULL,'2026-06-30','Red Social para Inversores 2','2025-12-12','IN_PROGRESS',5,'2025-10-31 17:48:10.329442',_binary '\0',NULL,NULL,9),(26,130000.00,35680.60,'Ropa térmica para perros de la calle','2025-11-11','2026-06-15','Ropa térmica para perros ','2025-12-15','CANCELLED',10,'2025-11-07 17:50:34.619113',_binary '\0',NULL,'2025-11-11 18:04:47.993010',39),(27,30000.00,0.00,'buscamos dinero para financiar a un grupo de artistas callejeros independientes',NULL,'2025-12-22','Proyecto para probar el editar','2025-11-24','PENDING_FUNDING',5,'2025-11-08 03:28:50.050702',_binary '','2025-11-08 16:14:14.123422','2025-11-08 15:25:03.887524',39),(28,14400.00,0.00,'queremos armar carros con motores de cortadoras de pasto',NULL,'2025-11-29','prueba de proyecto para eliminar','2025-11-15','PENDING_FUNDING',11,'2025-11-08 16:25:29.341131',_binary '','2025-11-08 16:26:37.037782',NULL,39),(29,6000.00,0.00,'Computadora nuclear con motor de fision',NULL,'2025-11-30','Computadora nuclear','2025-11-15','PENDING_FUNDING',1,'2025-11-08 16:30:09.871799',_binary '','2025-11-08 16:30:20.038894',NULL,39),(30,6500.00,0.00,'Escopeta con perdigones electricos',NULL,'2025-11-29','Escopeta electrica','2025-11-16','PENDING_FUNDING',11,'2025-11-08 16:34:17.519047',_binary '','2025-11-08 16:34:28.235600',NULL,39),(31,45000.00,45000.00,'Proyecto para financiar escuelas publicas','2025-11-08','2025-11-29','Prueba de marcar proyecto completado','2025-11-14','CANCELLED',2,'2025-11-08 16:47:28.966496',_binary '\0',NULL,'2025-11-08 16:58:40.597562',39),(32,30000.00,0.00,'Proyecto de prueba 01',NULL,'2025-11-22','Proyecto de prueba 01','2025-11-14','PENDING_FUNDING',11,'2025-11-08 17:29:59.895252',_binary '\0',NULL,'2025-11-11 15:54:47.328814',39),(33,2500.00,2500.00,'Proyecto de prueba 02','2025-11-08','2025-11-26','Proyecto de prueba 02','2025-11-14','COMPLETED',11,'2025-11-08 18:27:31.840266',_binary '\0',NULL,'2025-11-08 18:30:18.491421',39),(34,2000.00,2000.00,'Proyecto de prueba 03','2025-11-08','2025-12-20','Proyecto de prueba 03','2025-11-29','CANCELLED',11,'2025-11-08 18:31:56.604780',_binary '\0',NULL,'2025-11-08 18:59:16.151104',39),(35,3400.00,0.00,'Proyecto de prueba 04','2025-11-08','2025-11-30','Proyecto de prueba 04','2025-11-22','CANCELLED',11,'2025-11-08 19:35:35.925017',_binary '\0',NULL,'2025-11-08 19:39:19.478793',39),(36,4000.00,0.00,'Proyecto de prueba 05','2025-11-08','2025-11-28','Proyecto de prueba 05','2025-11-21','CANCELLED',11,'2025-11-08 20:23:45.753231',_binary '\0',NULL,'2025-11-08 20:25:33.788807',39),(37,5400.00,5400.00,'Proyecto de prueba 06','2025-11-08','2025-11-29','Proyecto de prueba 06','2025-11-20','CANCELLED',11,'2025-11-08 20:39:09.332558',_binary '\0',NULL,'2025-11-08 20:41:00.267285',39),(38,7200.00,7200.00,'Proyecto de prueba 07','2025-11-08','2025-11-22','Proyecto de prueba 07','2025-11-16','CANCELLED',11,'2025-11-08 21:12:29.132591',_binary '\0',NULL,'2025-11-08 21:16:57.085465',39),(39,5600.00,0.00,'Proyecto de prueba 08','2025-11-08','2025-11-21','Proyecto de prueba 08','2025-11-21','CANCELLED',11,'2025-11-08 21:33:12.234223',_binary '\0',NULL,'2025-11-08 21:35:06.659283',39),(40,2400.00,2400.00,'Proyecto de prueba 09','2025-11-08','2025-11-23','Proyecto de prueba 09','2025-11-19','COMPLETED',11,'2025-11-08 23:26:37.816067',_binary '\0',NULL,'2025-11-08 23:29:17.698523',39),(41,4000.00,5000.00,'proyecto para probar la sobrefinanciacion',NULL,'2025-11-21','proyecto de prueba de sobrefinanciacion','2025-11-14','IN_PROGRESS',6,'2025-11-09 15:52:11.619305',_binary '\0',NULL,NULL,39),(42,4000.00,5750.00,'Buscamos desarrollar un sistema de predicciones de riesgos para inversionistas','2025-11-14','2025-12-06','Sistema de predicciones de riesgo para inversionistas','2025-11-20','CANCELLED',6,'2025-11-13 16:10:57.568052',_binary '\0',NULL,'2025-11-14 17:42:20.419394',39),(43,2000.00,0.00,'queremos desarrollar productos con materiales reciclables',NULL,'2025-11-28','Productods con materiales reciclables','2025-11-14','PENDING_FUNDING',4,'2025-11-13 16:37:46.255635',_binary '\0',NULL,NULL,39),(44,25000.00,40600.00,'proyecto universitario para aprobar la materia proyecto final',NULL,'2025-11-30','14 de octubre prueba','2025-11-22','IN_PROGRESS',2,'2025-11-14 19:00:19.752311',_binary '\0',NULL,NULL,39),(45,25000.00,23000.00,'vamos a probar el sobrefinanciameniento en el analisis de riesgos',NULL,'2027-07-31','vamos a probar el sobrefinanciamiento','2026-07-30','PENDING_FUNDING',6,'2025-11-18 20:19:02.335469',_binary '\0',NULL,NULL,39),(46,25000.00,0.00,'Proyecto de prueba 10',NULL,'2026-01-23','Proyecto de prueba 10','2025-11-29','PENDING_FUNDING',11,'2025-11-18 21:23:16.690445',_binary '\0',NULL,NULL,39),(47,150000.00,0.00,'Una aplicación móvil que conecta consumidores con productores locales de alimentos orgánicos y productos ecológicos, facilitando la logística de entrega y reduciendo la huella de carbono.',NULL,'2026-11-15','EcoMarket: Mercado Sustentable','2026-03-01','PENDING_FUNDING',4,'2025-11-26 21:58:53.800532',_binary '\0',NULL,NULL,9);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects_documents`
--

DROP TABLE IF EXISTS `projects_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects_documents` (
  `id_project_document` bigint NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `project_id` bigint NOT NULL,
  PRIMARY KEY (`id_project_document`),
  KEY `FK93qmoxc604xkinu963eehaq47` (`project_id`),
  CONSTRAINT `FK93qmoxc604xkinu963eehaq47` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id_project`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects_documents`
--

LOCK TABLES `projects_documents` WRITE;
/*!40000 ALTER TABLE `projects_documents` DISABLE KEYS */;
INSERT INTO `projects_documents` VALUES (1,'Story Map - Proy+ (version 2).pdf','C:\\Users\\lucas/Desktop/projects/files/1758741047926_Story Map - Proy+ (version 2).pdf',3);
/*!40000 ALTER TABLE `projects_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `FKegdk29eiy7mdtefy5c7eirr6e` (`permission_id`),
  CONSTRAINT `FKegdk29eiy7mdtefy5c7eirr6e` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`),
  CONSTRAINT `FKn5fotdgk8d1xvo8nav9uv3muc` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1),(2,1),(3,1),(1,2),(2,2),(3,2),(1,3),(2,3),(3,3);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN'),(2,'INVESTOR'),(3,'STUDENT');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_project`
--

DROP TABLE IF EXISTS `student_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_project` (
  `student_id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  PRIMARY KEY (`student_id`,`project_id`),
  KEY `FKa7cccnoevsnp33m5l59sn434n` (`project_id`),
  CONSTRAINT `FK86y7i7fvkh46b49ecwliymo8a` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKa7cccnoevsnp33m5l59sn434n` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id_project`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_project`
--

LOCK TABLES `student_project` WRITE;
/*!40000 ALTER TABLE `student_project` DISABLE KEYS */;
INSERT INTO `student_project` VALUES (4,2),(8,3),(11,3),(9,4),(15,4),(9,5),(15,5),(9,6),(15,6),(11,7),(13,7),(15,7),(11,8),(13,8),(15,8),(9,9),(13,9),(15,9),(9,10),(13,10),(15,10),(9,11),(13,11),(15,11),(9,12),(13,12),(15,12),(9,13),(13,13),(15,13),(9,14),(13,14),(15,14),(9,15),(9,16),(9,17),(9,18),(9,19),(9,20),(9,21),(9,22),(9,23),(9,24),(9,25),(7,26),(9,26),(39,26),(8,27),(19,28),(39,28),(39,29),(39,30),(39,31),(39,33),(39,34),(39,35),(39,36),(39,37),(39,38),(39,39),(39,40),(39,41),(39,43),(39,44),(39,45),(39,46),(9,47);
/*!40000 ALTER TABLE `student_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `career` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `degree_status` enum('ABANDONED','COMPLETED','IN_PROGRESS','SUSPENDED') NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `dni` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `phone` varchar(50) NOT NULL,
  `university` enum('AUSTRAL','ISALUD','ITBA','TORCUATO_DI_TELLA','UADE','UAI','UAI_RN','UBA','UCALCHA','UCAMI','UCASAL','UCA_SANTA_FE','UCC','UCC_MENDOZA','UCES','UCSE_TUCUMAN','UCU','UNAHUR','UNC','UNCuyo','UNER','UNGS','UNIVERSIDAD_CATOLICA_DE_CORDOBA','UNLAM','UNLP','UNLZ','UNLu','UNMdP','UNNE','UNPAZ','UNR','UNRN','UNSa','UNT','UNaM','USAL','UTN_CORDOBA','UTN_MENDOZA','UTN_SANTA_FE','UTN_TUCUMAN') NOT NULL,
  `id` bigint NOT NULL,
  `address_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcmyptcbd3gj911vn3hhrq7yh` (`dni`),
  UNIQUE KEY `UKopab8dbthaah3udqf9l64u5d7` (`address_id`),
  CONSTRAINT `FK7xqmtv7r2eb5axni3jm0a80su` FOREIGN KEY (`id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKefnng0g6wqmnmuo7tt0kumd5r` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('Medicina','2001-08-20','IN_PROGRESS','Estudiante de medicina comprometida con la salud y la investigación.','342112334','Martina','González','https://www.linkedin.com/in/martina-gonzalez','1199887766','UNLZ',4,1),('Medicina','2001-07-12','IN_PROGRESS','Estudiante de medicina con ganas de seguir aprendiendo.','45293494','Carlos','Lopez','https://www.linkedin.com/in/carlos/','1141414141','UNLAM',7,3),('Ingenieria en Sistemas','1999-01-01','COMPLETED','Ingeniero en Sistemas egresado de la UADE especializado en IA','47939209','Daniel','Perez','https://www.linkedin.com/in/daniel-perez-5aa37919a/','1198765432','UADE',8,4),('Abogacía','1996-07-25','IN_PROGRESS','Estudiante de Derecho por un tiempo, con interés en comprender los fundamentos legales y la estructura del sistema judicial. Durante su formación adquirió conocimientos sobre legislación civil, penal y constitucional, y desarrolló habilidades de análisis crítico y argumentación. Decidió dar un paso al costado en su carrera universitaria para explorar nuevas áreas profesionales y desarrollar sus intereses en otros campos, manteniendo siempre su enfoque en el aprendizaje y el crecimiento personal.','34567876','Juan','Sosa','https://www.linkedin.com/in/usuario-ejemplo123','1186945867','UNLP',9,5),('Medicina','1990-10-31','COMPLETED','Egresado de la carrera de Medicina de la Universidad Abierta Interamericana (UAI), con sólida formación académica y habilidades clínicas para brindar atención integral al paciente. Comprometido con la actualización constante en ciencias de la salud, la ética profesional y la investigación médica. Experiencia en prácticas hospitalarias y comunitarias, con enfoque en diagnóstico, tratamiento y prevención de enfermedades. ','34567898','Esteban','Gutierrez','https://www.linkedin.com/in/testuser001','1164467568','UAI',10,6),('Ingenieria Mecánica','1992-10-30','IN_PROGRESS','Estudiante de Ingeniería Mecánica en el ITBA, apasionado por el diseño y la optimización de sistemas mecánicos. Con sólidos conocimientos en modelado CAD, análisis estructural y dinámica de máquinas. Proactivo, analítico y orientado a la resolución de problemas, con interés en innovación tecnológica y proyectos de ingeniería aplicada.','3862362','Agustin','Suarez','https://www.linkedin.com/in/usuario-ejemplo123','1194949494','ITBA',11,7),('Medicina','2001-12-31','COMPLETED','Estudiante de medicina','292323221','Cesar','Jose','https://www.linkedin.com/in/usuario-ejemplo123','1144544663','ISALUD',13,9),('Medicina','2001-08-20','IN_PROGRESS','Estudiante de medicina comprometido con la salud y la investigación.','6236262','Cristian','Escalante','https://www.linkedin.com/in/martina-gonzalez','119923232','UNLZ',15,11),('Medicina','2001-08-20','IN_PROGRESS','Estudiante de medicina comprometido con la salud y la investigación.','6236321','Lorenzo','Martinez','https://www.linkedin.com/in/lorenzo-martinez','119923232','UNLZ',19,15),('Cirugía General','2001-08-21','IN_PROGRESS','Médico recién graduado. Buscando residencia en cirugía en CABA.','95123456','Lorenzo Anibal','Martinez Russo','https://www.linkedin.com/in/lorenzomartinez','1198765432','UNLZ',20,16),('Arquitectura','1999-05-15','IN_PROGRESS','Estudiante de arquitectura apasionada por el diseño sostenible y la planificación urbana.','9345781','Laura','Gómez','https://www.linkedin.com/in/laura-gomez','114567890','UBA',23,20),('Ingeniería Civil','1994-11-03','COMPLETED','Ingeniero civil interesado en infraestructura y proyectos sustentables.','27894563','Carlos','Martínez','linkedin.com/in/carlos-martinez','1156789012','UNC',25,23),('Diseño Gráfico','1990-08-12','IN_PROGRESS','Apasionada por el diseño visual y la comunicación creativa.','45236789','Ana','Pérez',NULL,'1145567789','UBA',26,24),('Ingeniería Electrónica','1997-02-20','COMPLETED','Ingeniero electrónico con interés en automatización y robótica.','38945612','Diego','Rodríguez','','1167890123','UBA',27,25),('Arquitectura','1992-06-18','IN_PROGRESS','Arquitecta apasionada por el diseño sostenible y la innovación urbana.','45789123','Sofía','López','https://www.linkedin.com/in/sofia-lopez','1145678910','UBA',28,26),('Licenciatura Gestión Tecnológica','2025-11-04','COMPLETED','Egresado con ganas de seguir aprendiendo','17605903','Lucas','Beron','https://www.linkedin.com/in/lucas-beron-von-brand-5aa37919a/','01138250293','TORCUATO_DI_TELLA',29,27),('Licenciatura Gestión Tecnológica','2025-11-04','SUSPENDED','Ex estudiante universitario  ','2222222','Carlos','Acosta','https://www.linkedin.com/in/carlos-acosta-5aa37919a/','01138250293','UNLP',30,28),('Economics','2025-11-04','COMPLETED','Egresado de la licenciatura en economía','2211299','Paul','Cuevas','','113322233','UNPAZ',31,29),('Licenciatura Gestión Tecnológica','2025-11-04','IN_PROGRESS','Estudiante de la carrera','33443222','Lucas','Beron','https://www.linkedin.com/in/lucas-beron-von-brand-5aa37919a/','01138250293','UNIVERSIDAD_CATOLICA_DE_CORDOBA',34,32),('Medicina','2022-01-01','COMPLETED','Egresado de la carrera de medicina','1231231','Santiago','Sosa','','12312312','UNLu',35,33),('Licenciatura Gestión Tecnológica','2002-03-31','SUSPENDED','Ex estudiante de la carrera','33343433','Maximiliano','Ortiz','','33333333','UNLu',37,35),('Economics','2025-11-04','COMPLETED','Egresado de la carrera de economía','39112882','David','Texeira','','22293449','UNAHUR',38,36),('Licenciatura Gestión Tecnológica','2023-12-31','COMPLETED','Egresado en el año 2025','389234823','Oscar','Ibañes','','2323232','UNGS',39,37),('Licenciatura Gestión Tecnológica','2025-09-17','COMPLETED','Egresado en el año 2024','23222232','Jose','Sosa','','12313123','UCES',40,38);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
  CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (3,1),(6,1),(5,2),(14,2),(21,2),(22,2),(24,2),(32,2),(33,2),(36,2),(41,2),(4,3),(7,3),(8,3),(9,3),(10,3),(11,3),(13,3),(15,3),(19,3),(20,3),(23,3),(25,3),(26,3),(27,3),(28,3),(29,3),(30,3),(31,3),(34,3),(35,3),(37,3),(38,3),(39,3),(40,3);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_not_expired` bit(1) DEFAULT NULL,
  `account_not_locked` bit(1) DEFAULT NULL,
  `credential_not_expired` bit(1) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `enabled` bit(1) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,_binary '',_binary '',_binary '','lucasberonvonbrand@gmail.com',_binary '','$2a$10$WfMxFwBV0ZZA/Ii56bSFYex/8v5OBx6yV.LiJ8cJovQZBMHq1gvMm',NULL,'lucas'),(4,_binary '',_binary '',_binary '','martina@gmail.com',_binary '','$2a$10$JrZG4jiG/Gh71IMp5TadGOR7mbnmpz/pl4fRe71JtcZfugza32yOG','https://example.com/foto_martina.png','martina'),(5,_binary '',_binary '',_binary '','recursoshumanos@bancopatagonia.com.ar',_binary '','$2a$10$fkVPRtCdCnFhul1LX1NvYOo39umEpqClpv7Ax9vopPgkzW9kaJGDO','https://example.com/logos/patagonia_logo_nuevo.svg','bancopatagonia'),(6,_binary '',_binary '',_binary '','pruebadavid@example.com',_binary '','$2a$10$wLQ1gsq/awK8jYsYve2MFOwaNFICnC9..Dxrc5SwbVyZPRp18bl8.','https://example.com/foto.jpg','david'),(7,_binary '',_binary '',_binary '','carlos@gmail.com',_binary '','$2a$10$a2PR5dlorkpM5FiSiDFEwe7ujT3s/XrHWpUD0FN9MfBHRStA6btD6',NULL,'carlos'),(8,_binary '',_binary '',_binary '','daniel@gmail.com',_binary '','$2a$10$xpWy0xCjvidSO8BG3IO2texsV8PWnO0uYRG0qCeNe1IoHnB4Qe4k6',NULL,'Daniel'),(9,_binary '',_binary '',_binary '','lucasberonvonbrand@hotmail.com',_binary '','$2a$10$VasfLcJ6hc3Ab8RLHBDS5e5WRsszoK470swCdDDWPW4Bu/Zbr1dsC',NULL,'Juan'),(10,_binary '',_binary '',_binary '','esteban@gmail.com',_binary '','$2a$10$NWLrLiZMG4PyuFv24xppQuRQK1mFV/5cJguDfUMpRaw1.vau0ZNGq',NULL,'Esteban'),(11,_binary '',_binary '',_binary '','agustin@gmail.com',_binary '','$2a$10$2C3LdCralJQvKTPNtMVjUucWnoyUNb0FH/mWjulI4cPDx11xflomG',NULL,'Agustin'),(13,_binary '',_binary '',_binary '','cesarjose@gmail.com',_binary '','$2a$10$1F2ZYNc.n/AcVzLlwhk0huJGojqFN2HB1Lk6p9aB0SIv5IbtZWSEa',NULL,'Cesar'),(14,_binary '',_binary '',_binary '','bancomacro@gmail.com',_binary '','$2a$10$N2XCHdnqzVsozhaWyQP.U.1SCaHz.0IPrAvi.td8O2e67GLRyXWMi',NULL,'BancoMacro'),(15,_binary '',_binary '',_binary '','cristian@gmail.com',_binary '','$2a$10$WeXVBV7Vt2huW8c3VD9fYe3JTf0xF2wG01sZ7DR65PKWZ1rh2UVAS','https://example.com/foto_cristian.png','Cristian'),(19,_binary '',_binary '',_binary '','lorenzo@gmail.com',_binary '','$2a$10$La/hLpqCAiQ/9kmr2KZ/k.iYlZF0o0I/7ki5.FITZY0wuileWvs1m','https://example.com/foto_lorenzo.png','Lorenzo'),(20,_binary '',_binary '',_binary '','lorenzo.martinez.med@email.com',_binary '','$2a$10$G1tqXupuwAgBJQWK88eCvuo7345TlsV9LSC3jfesaTZz0Ubzbp5KC','https://example.com/nueva_foto_lorenzo.jpg','lorenzo.martinez'),(21,_binary '',_binary '',_binary '','info@inversionesnorte.com.ar',_binary '','$2a$10$O35NpySqfstHhLsxiGr7GeoBfY9ibQ2oMMrY43siUsgCO.ymmlHlC','https://example.com/logo_inversiones_norte.png','inversionesnorte'),(22,_binary '',_binary '',_binary '','sofiaberon2016@gmail.com',_binary '','$2a$10$JjiAarnIpO0cizOhpQBVremv.2lOtOCoXFmdy68iZCZ67eINMkR0q','https://example.com/logo_inversiones_norte.png','BancoSofia'),(23,_binary '',_binary '',_binary '','laura.gomez@email.com',_binary '','$2a$10$Uv9CBISf1S2Z3T/Kp1pks.0GiBYV9phR5qL6WTIw.gWdDcQ3eFDnq','https://example.com/foto_laura.png','LauraG'),(24,_binary '',_binary '\0',_binary '','info@tecnoinversiones.com',_binary '','$2a$10$EDt6qLVVvDKg8fx5cpZaGuYOakU8Pk2NO4HTHT/aSPLJLYF3fwG9K','https://example.com/logo_tecno.png','tecno_inversiones_sa'),(25,_binary '',_binary '',_binary '','c.martinez23@example.com',_binary '','$2a$10$f/3/U/lihhyVuM6AUzll9.XVPkYwxi.bAatWwyDOonTIR7Qfwr.VK','https://example.com/foto_carlos.png','CarlosM23'),(26,_binary '',_binary '',_binary '','ana.perez90@example.com',_binary '','$2a$10$gyDosZ4aSjzwAjPM8h31h.NVHk22ZwNGhlGDTZqA.dEPtOiYc9OGq','https://example.com/foto_ana.png','AnaP90'),(27,_binary '',_binary '',_binary '','diego.r77@example.com',_binary '','$2a$10$25adgA244kztFmkH4W3upO5YP/Jg9Nv0CE0oGo5FG0AJfNzm4NHhm','https://example.com/foto_diego.png','DiegoR77'),(28,_binary '',_binary '',_binary '','sofia.l88@example.com',_binary '','$2a$10$f7NV2pplSHiQX1yk8zkX0unxBya.LKXxpSX6IdP0vJ4wJiPMcVTfO','https://example.com/foto_sofia.png','SofiaL88'),(29,_binary '',_binary '',_binary '','lucasberonvonbrand2@gmail.com',_binary '','$2a$10$pRrN3xZiP0ooamyFqQKwnezuXceirHovBU8cqBbBaLV2O5AZjd0qO',NULL,'lucasss'),(30,_binary '',_binary '',_binary '','lucasberonvonb2rand@gmail.com',_binary '','$2a$10$Sqv8YFWkoO912Ssaf1Fr8exGQC/Jhna1Nwtb7s0f23lquCTmvrJYC',NULL,'sssss'),(31,_binary '',_binary '',_binary '','sofi@gmail.com',_binary '','$2a$10$GGA0YB89rcq4gk.GrHkqBueC4Y9qm/qeDAy0Akf4ievwAA8eBhis.',NULL,'soffi'),(32,_binary '',_binary '',_binary '','financiera@gmail.com',_binary '','$2a$10$hVRaILHq0x6yJZ1.3/5z3ePK41ivrAu8USMhZ2AGEkEVuy8tvnMv6',NULL,'financieraprueba'),(33,_binary '',_binary '',_binary '','bancociudad@gmail.com',_binary '\0','$2a$10$xtYFBjDJNHNlD80vGEvSAe0xZyuGuMPfoB569.u6iLPkLyBOUgi.C',NULL,'bancociudad'),(34,_binary '',_binary '',_binary '','lucasestudiante@gmail.com',_binary '\0','$2a$10$.JB1oqE/Vd5wJj6TX49zouGCp3PqVvLMd2xIBg2iwHJQiTTdcaIQ2',NULL,'lucasestudiante'),(35,_binary '',_binary '',_binary '','pruebas@gmail.com',_binary '\0','$2a$10$cu/020E7Ax2m6AGIbfr3WOZKvh3TiprkHT6i2vmyz4.CpUrE6CG/a',NULL,'pruebaestudiante'),(36,_binary '',_binary '',_binary '','pruenaead@gmailc',_binary '\0','$2a$10$jbGPuXo6JFLaPEKGnd3Z1uTAQDZPgYamboD2sSkCJbY.ZPxpj.5vy',NULL,'pruebaeliminar'),(37,_binary '',_binary '',_binary '','pruebadescripcion@gmail.com',_binary '','$2a$10$xvijoEwSa.usHeqqtUeJ..bQ5XNl5B2w.r06TaLm0DV/.0WkUQ0Rm',NULL,'pruebadescripcion'),(38,_binary '',_binary '',_binary '','asb@gmai.com',_binary '','$2a$10$tPTZWxdsU3Yh4KjNSikNo.i.Ap8pID9JYad2L4FEr5/Ecw04ZMntq',NULL,'ultimapruebaestudiante'),(39,_binary '',_binary '',_binary '','lucasprueba@gmail.com',_binary '','$2a$10$CF788rqUAOiw45oSlHvmXe4PeogJnOowXsiXg0WQey9JT/e/Rksp6',NULL,'lucasprueba'),(40,_binary '',_binary '',_binary '','pepitoprueba@gmail.com',_binary '\0','$2a$10$Tw/GjjeaDGHhQuTj9RWXM.ajLa2b3Qan.ne4d8w774LjQqrpUEwIO',NULL,'pepitoprueba'),(41,_binary '',_binary '',_binary '','financierapruebapatch@tecnoinversiones.com',_binary '','$2a$10$ItuPUY3TrpZQq2JQi4W.M.0r8iRgc/BZYfgjWMQ9TWDPDbhEa264W','https://example.com/logo_tecno.png','financierapruebapatch');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'gestor_inversores'
--

--
-- Dumping routines for database 'gestor_inversores'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-29 15:23:43
