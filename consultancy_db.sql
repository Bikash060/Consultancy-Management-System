-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 29, 2025 at 04:14 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12


-- source venv/bin/activate

-- python3
--exit(0)
--python3 run.py

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `consultancy_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `counselor_id` int(11) NOT NULL,
  `university` varchar(200) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `course` varchar(200) DEFAULT NULL,
  `intake` varchar(50) DEFAULT NULL,
  `status` enum('DOCUMENT_COLLECTION','APPLICATION_SUBMITTED','OFFER_RECEIVED','VISA_LODGED','VISA_APPROVED','VISA_REJECTED') DEFAULT NULL,
  `offer_letter_path` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `client_id`, `counselor_id`, `university`, `country`, `course`, `intake`, `status`, `offer_letter_path`, `created_at`, `updated_at`) VALUES
(1, 8, 5, 'University of Melbourne', 'Australia', 'Master of Information Technology', 'Feb 2025', 'VISA_APPROVED', NULL, '2025-11-07 16:20:28', '2025-12-26 16:20:28'),
(2, 9, 6, 'University of Manchester', 'United Kingdom', 'MBA', 'Sep 2025', 'OFFER_RECEIVED', NULL, '2025-10-05 16:20:28', '2025-12-26 16:20:28'),
(3, 10, 5, 'University of Toronto', 'Canada', 'Master of Engineering', 'Jan 2025', 'VISA_LODGED', NULL, '2025-11-26 16:20:28', '2025-12-26 16:20:28'),
(4, 11, 7, 'Monash University', 'Australia', 'Master of Nursing', 'Jul 2025', 'APPLICATION_SUBMITTED', NULL, '2025-10-23 16:20:28', '2025-12-26 16:20:28'),
(5, 12, 6, 'New York University', 'United States', 'Master of Finance', 'Aug 2025', 'DOCUMENT_COLLECTION', NULL, '2025-10-27 16:20:28', '2025-12-26 16:20:28'),
(6, 13, 7, 'Auckland University of Technology', 'New Zealand', 'Master of Hospitality Management', 'Feb 2025', 'VISA_APPROVED', NULL, '2025-10-04 16:20:28', '2025-12-26 16:20:28'),
(7, 14, 5, 'University of Queensland', 'Australia', 'Master of Agricultural Science', 'Feb 2025', 'VISA_REJECTED', NULL, '2025-10-31 16:20:28', '2025-12-26 16:20:28'),
(8, 15, 6, 'University of Leeds', 'United Kingdom', 'Master of Arts in Media Studies', 'Sep 2025', 'OFFER_RECEIVED', NULL, '2025-09-27 16:20:28', '2025-12-26 16:20:28'),
(9, 8, 5, 'University of British Columbia', 'Canada', 'Master of Computer Science', 'Sep 2025', 'DOCUMENT_COLLECTION', NULL, '2025-10-15 16:20:28', '2025-12-26 16:20:28'),
(10, 9, 7, 'University of Sydney', 'Australia', 'MBA', 'Feb 2025', 'VISA_LODGED', NULL, '2025-10-18 16:20:28', '2025-12-26 16:20:28');

-- --------------------------------------------------------

--
-- Table structure for table `application_stages`
--

CREATE TABLE `application_stages` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `stage_name` varchar(100) NOT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `application_stages`
--

INSERT INTO `application_stages` (`id`, `application_id`, `stage_name`, `status`, `notes`, `completed_at`) VALUES
(1, 1, 'Document Collection', 'COMPLETED', 'Stage notes for Document Collection', '2025-12-21 16:20:28'),
(2, 1, 'Application Submitted', 'COMPLETED', 'Stage notes for Application Submitted', '2025-11-29 16:20:28'),
(3, 1, 'Offer Letter', 'COMPLETED', 'Stage notes for Offer Letter', '2025-12-20 16:20:28'),
(4, 1, 'Visa Lodged', 'COMPLETED', 'Stage notes for Visa Lodged', '2025-12-25 16:20:28'),
(5, 1, 'Visa Decision', 'IN_PROGRESS', NULL, NULL),
(6, 2, 'Document Collection', 'COMPLETED', 'Stage notes for Document Collection', '2025-12-10 16:20:28'),
(7, 2, 'Application Submitted', 'COMPLETED', 'Stage notes for Application Submitted', '2025-12-21 16:20:28'),
(8, 2, 'Offer Letter', 'IN_PROGRESS', NULL, NULL),
(9, 2, 'Visa Lodged', 'PENDING', NULL, NULL),
(10, 2, 'Visa Decision', 'PENDING', NULL, NULL),
(11, 3, 'Document Collection', 'COMPLETED', 'Stage notes for Document Collection', '2025-12-12 16:20:28'),
(12, 3, 'Application Submitted', 'COMPLETED', 'Stage notes for Application Submitted', '2025-11-27 16:20:28'),
(13, 3, 'Offer Letter', 'COMPLETED', 'Stage notes for Offer Letter', '2025-12-18 16:20:28'),
(14, 3, 'Visa Lodged', 'IN_PROGRESS', NULL, NULL),
(15, 3, 'Visa Decision', 'PENDING', NULL, NULL),
(16, 4, 'Document Collection', 'COMPLETED', 'Stage notes for Document Collection', '2025-11-28 16:20:28'),
(17, 4, 'Application Submitted', 'IN_PROGRESS', NULL, NULL),
(18, 4, 'Offer Letter', 'PENDING', NULL, NULL),
(19, 4, 'Visa Lodged', 'PENDING', NULL, NULL),
(20, 4, 'Visa Decision', 'PENDING', NULL, NULL),
(21, 5, 'Document Collection', 'IN_PROGRESS', NULL, NULL),
(22, 5, 'Application Submitted', 'PENDING', NULL, NULL),
(23, 5, 'Offer Letter', 'PENDING', NULL, NULL),
(24, 5, 'Visa Lodged', 'PENDING', NULL, NULL),
(25, 5, 'Visa Decision', 'PENDING', NULL, NULL),
(26, 6, 'Document Collection', 'COMPLETED', 'Stage notes for Document Collection', '2025-12-05 16:20:28'),
(27, 6, 'Application Submitted', 'COMPLETED', 'Stage notes for Application Submitted', '2025-11-27 16:20:28'),
(28, 6, 'Offer Letter', 'COMPLETED', 'Stage notes for Offer Letter', '2025-12-17 16:20:28'),
(29, 6, 'Visa Lodged', 'COMPLETED', 'Stage notes for Visa Lodged', '2025-12-22 16:20:28'),
(30, 6, 'Visa Decision', 'IN_PROGRESS', NULL, NULL),
(31, 7, 'Document Collection', 'COMPLETED', 'Stage notes for Document Collection', '2025-12-22 16:20:28'),
(32, 7, 'Application Submitted', 'COMPLETED', 'Stage notes for Application Submitted', '2025-11-27 16:20:28'),
(33, 7, 'Offer Letter', 'COMPLETED', 'Stage notes for Offer Letter', '2025-12-22 16:20:28'),
(34, 7, 'Visa Lodged', 'COMPLETED', 'Stage notes for Visa Lodged', '2025-12-23 16:20:28'),
(35, 7, 'Visa Decision', 'COMPLETED', 'Stage notes for Visa Decision', '2025-12-09 16:20:28'),
(36, 8, 'Document Collection', 'COMPLETED', 'Stage notes for Document Collection', '2025-12-01 16:20:28'),
(37, 8, 'Application Submitted', 'COMPLETED', 'Stage notes for Application Submitted', '2025-11-28 16:20:28'),
(38, 8, 'Offer Letter', 'IN_PROGRESS', NULL, NULL),
(39, 8, 'Visa Lodged', 'PENDING', NULL, NULL),
(40, 8, 'Visa Decision', 'PENDING', NULL, NULL),
(41, 9, 'Document Collection', 'IN_PROGRESS', NULL, NULL),
(42, 9, 'Application Submitted', 'PENDING', NULL, NULL),
(43, 9, 'Offer Letter', 'PENDING', NULL, NULL),
(44, 9, 'Visa Lodged', 'PENDING', NULL, NULL),
(45, 9, 'Visa Decision', 'PENDING', NULL, NULL),
(46, 10, 'Document Collection', 'COMPLETED', 'Stage notes for Document Collection', '2025-11-28 16:20:28'),
(47, 10, 'Application Submitted', 'COMPLETED', 'Stage notes for Application Submitted', '2025-12-10 16:20:28'),
(48, 10, 'Offer Letter', 'COMPLETED', 'Stage notes for Offer Letter', '2025-11-28 16:20:28'),
(49, 10, 'Visa Lodged', 'IN_PROGRESS', NULL, NULL),
(50, 10, 'Visa Decision', 'PENDING', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `counselor_id` int(11) NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `type` enum('ONLINE','OFFLINE') DEFAULT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','COMPLETED','CANCELLED') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `client_id`, `counselor_id`, `scheduled_at`, `type`, `status`, `notes`, `created_at`) VALUES
(1, 10, 7, '2025-10-30 16:20:29', 'ONLINE', 'COMPLETED', 'Initial consultation', '2025-12-26 16:20:29'),
(2, 12, 5, '2025-11-28 16:20:29', 'ONLINE', 'COMPLETED', 'Application follow-up', '2025-12-26 16:20:29'),
(3, 12, 6, '2025-11-14 16:20:29', 'OFFLINE', 'COMPLETED', 'Initial consultation', '2025-12-26 16:20:29'),
(4, 11, 7, '2025-10-28 16:20:29', 'ONLINE', 'COMPLETED', 'Pre-departure briefing', '2025-12-26 16:20:29'),
(5, 13, 6, '2025-11-26 16:20:29', 'OFFLINE', 'COMPLETED', 'Application follow-up', '2025-12-26 16:20:29'),
(6, 13, 6, '2025-11-06 16:20:29', 'OFFLINE', 'COMPLETED', 'Pre-departure briefing', '2025-12-26 16:20:29'),
(7, 13, 6, '2025-11-01 16:20:29', 'ONLINE', 'COMPLETED', 'Visa guidance meeting', '2025-12-26 16:20:29'),
(8, 12, 6, '2025-11-26 16:20:29', 'OFFLINE', 'COMPLETED', 'Pre-departure briefing', '2025-12-26 16:20:29'),
(9, 11, 5, '2025-11-03 16:20:29', 'ONLINE', 'COMPLETED', 'Application follow-up', '2025-12-26 16:20:29'),
(10, 12, 7, '2025-11-23 16:20:29', 'OFFLINE', 'COMPLETED', 'Pre-departure briefing', '2025-12-26 16:20:29'),
(11, 8, 5, '2025-12-26 10:00:00', 'ONLINE', 'ACCEPTED', 'Scheduled consultation', '2025-12-26 16:20:29'),
(12, 9, 6, '2025-12-26 12:00:00', 'ONLINE', 'ACCEPTED', 'Scheduled consultation', '2025-12-26 16:20:29'),
(13, 10, 7, '2025-12-26 14:00:00', 'ONLINE', 'ACCEPTED', 'Scheduled consultation', '2025-12-26 16:20:29'),
(14, 14, 5, '2026-01-10 03:20:29', 'OFFLINE', 'ACCEPTED', NULL, '2025-12-26 16:20:29'),
(15, 12, 7, '2026-01-06 01:20:29', 'ONLINE', 'ACCEPTED', 'University selection discussion', '2025-12-26 16:20:29'),
(16, 14, 6, '2026-01-06 09:20:29', 'OFFLINE', 'PENDING', 'University selection discussion', '2025-12-26 16:20:29'),
(17, 13, 7, '2026-01-09 06:20:29', 'ONLINE', 'PENDING', NULL, '2025-12-26 16:20:29'),
(18, 9, 6, '2025-12-29 04:20:29', 'ONLINE', 'PENDING', NULL, '2025-12-26 16:20:29'),
(19, 15, 7, '2025-12-28 08:20:29', 'OFFLINE', 'PENDING', 'University selection discussion', '2025-12-26 16:20:29'),
(20, 10, 7, '2025-12-31 04:20:29', 'ONLINE', 'ACCEPTED', 'Document collection', '2025-12-26 16:20:29'),
(21, 12, 6, '2026-01-01 09:20:29', 'OFFLINE', 'ACCEPTED', 'Application review', '2025-12-26 16:20:29');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('PASSPORT','TRANSCRIPT','SOP','BANK_STATEMENT','RECOMMENDATION','CERTIFICATE','OTHER') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `status` enum('PENDING','VERIFIED','REJECTED','NEEDS_CORRECTION') DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `uploaded_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `user_id`, `type`, `file_name`, `file_path`, `status`, `comments`, `uploaded_at`, `verified_at`, `verified_by`) VALUES
(4, 8, 'BANK_STATEMENT', 'ram_bank_statement.pdf', '/uploads/documents/8/bank_statement.pdf', 'VERIFIED', 'Document looks good', '2025-12-04 16:20:29', '2025-12-22 16:20:29', NULL),
(5, 8, 'CERTIFICATE', 'ram_english_certificate.pdf', '/uploads/documents/8/english_certificate.pdf', 'PENDING', NULL, '2025-12-21 16:20:29', NULL, NULL),
(6, 8, 'SOP', 'ram_statement_of_purpose.pdf', '/uploads/documents/8/statement_of_purpose.pdf', 'NEEDS_CORRECTION', 'Please resubmit', '2025-11-28 16:20:29', NULL, NULL),
(7, 8, 'RECOMMENDATION', 'ram_recommendation_letter.pdf', '/uploads/documents/8/recommendation_letter.pdf', 'NEEDS_CORRECTION', 'Please resubmit', '2025-12-17 16:20:29', NULL, NULL),
(8, 9, 'BANK_STATEMENT', 'sita_bank_statement.pdf', '/uploads/documents/9/bank_statement.pdf', 'PENDING', NULL, '2025-10-29 16:20:29', NULL, NULL),
(9, 9, 'PASSPORT', 'sita_passport.pdf', '/uploads/documents/9/passport.pdf', 'VERIFIED', 'Document looks good', '2025-12-13 16:20:29', '2025-12-22 16:20:29', NULL),
(10, 9, 'TRANSCRIPT', 'sita_academic_transcript.pdf', '/uploads/documents/9/academic_transcript.pdf', 'VERIFIED', 'Document looks good', '2025-11-17 16:20:29', '2025-12-24 16:20:29', NULL),
(11, 9, 'SOP', 'sita_statement_of_purpose.pdf', '/uploads/documents/9/statement_of_purpose.pdf', 'VERIFIED', 'Document looks good', '2025-10-31 16:20:29', '2025-12-23 16:20:29', NULL),
(12, 9, 'RECOMMENDATION', 'sita_recommendation_letter.pdf', '/uploads/documents/9/recommendation_letter.pdf', 'VERIFIED', 'Document looks good', '2025-11-22 16:20:29', '2025-12-23 16:20:29', NULL),
(13, 9, 'CERTIFICATE', 'sita_english_certificate.pdf', '/uploads/documents/9/english_certificate.pdf', 'NEEDS_CORRECTION', 'Please resubmit', '2025-11-02 16:20:29', NULL, NULL),
(14, 10, 'SOP', 'hari_statement_of_purpose.pdf', '/uploads/documents/10/statement_of_purpose.pdf', 'NEEDS_CORRECTION', 'Please resubmit', '2025-10-28 16:20:29', NULL, NULL),
(15, 10, 'TRANSCRIPT', 'hari_academic_transcript.pdf', '/uploads/documents/10/academic_transcript.pdf', 'NEEDS_CORRECTION', 'Please resubmit', '2025-11-30 16:20:29', NULL, NULL),
(16, 10, 'RECOMMENDATION', 'hari_recommendation_letter.pdf', '/uploads/documents/10/recommendation_letter.pdf', 'VERIFIED', 'Document looks good', '2025-11-09 16:20:29', '2025-12-25 16:20:29', NULL),
(17, 11, 'RECOMMENDATION', 'maya_recommendation_letter.pdf', '/uploads/documents/11/recommendation_letter.pdf', 'PENDING', NULL, '2025-11-10 16:20:29', NULL, NULL),
(18, 11, 'SOP', 'maya_statement_of_purpose.pdf', '/uploads/documents/11/statement_of_purpose.pdf', 'PENDING', NULL, '2025-10-31 16:20:29', NULL, NULL),
(19, 11, 'PASSPORT', 'maya_passport.pdf', '/uploads/documents/11/passport.pdf', 'PENDING', NULL, '2025-11-29 16:20:29', NULL, NULL),
(20, 12, 'SOP', 'bikash_statement_of_purpose.pdf', '/uploads/documents/12/statement_of_purpose.pdf', 'VERIFIED', 'Document looks good', '2025-12-10 16:20:29', '2025-12-24 16:20:29', NULL),
(21, 12, 'CERTIFICATE', 'bikash_english_certificate.pdf', '/uploads/documents/12/english_certificate.pdf', 'NEEDS_CORRECTION', 'Please resubmit', '2025-10-29 16:20:29', NULL, NULL),
(22, 12, 'RECOMMENDATION', 'bikash_recommendation_letter.pdf', '/uploads/documents/12/recommendation_letter.pdf', 'PENDING', NULL, '2025-11-09 16:20:29', NULL, NULL),
(23, 12, 'BANK_STATEMENT', 'bikash_bank_statement.pdf', '/uploads/documents/12/bank_statement.pdf', 'VERIFIED', 'Document looks good', '2025-10-29 16:20:29', '2025-12-25 16:20:29', NULL),
(24, 13, 'SOP', 'anita_statement_of_purpose.pdf', '/uploads/documents/13/statement_of_purpose.pdf', 'VERIFIED', 'Document looks good', '2025-10-28 16:20:29', '2025-12-23 16:20:29', NULL),
(25, 13, 'PASSPORT', 'anita_passport.pdf', '/uploads/documents/13/passport.pdf', 'VERIFIED', 'Document looks good', '2025-11-10 16:20:29', '2025-12-22 16:20:29', NULL),
(26, 13, 'TRANSCRIPT', 'anita_academic_transcript.pdf', '/uploads/documents/13/academic_transcript.pdf', 'VERIFIED', 'Document looks good', '2025-11-07 16:20:29', '2025-12-25 16:20:29', NULL),
(27, 13, 'RECOMMENDATION', 'anita_recommendation_letter.pdf', '/uploads/documents/13/recommendation_letter.pdf', 'NEEDS_CORRECTION', 'Please resubmit', '2025-11-11 16:20:29', NULL, NULL),
(28, 14, 'BANK_STATEMENT', 'sunil_bank_statement.pdf', '/uploads/documents/14/bank_statement.pdf', 'VERIFIED', 'Document looks good', '2025-11-08 16:20:29', '2025-12-24 16:20:29', NULL),
(29, 14, 'TRANSCRIPT', 'sunil_academic_transcript.pdf', '/uploads/documents/14/academic_transcript.pdf', 'VERIFIED', 'Document looks good', '2025-12-05 16:20:29', '2025-12-23 16:20:29', NULL),
(30, 14, 'SOP', 'sunil_statement_of_purpose.pdf', '/uploads/documents/14/statement_of_purpose.pdf', 'NEEDS_CORRECTION', 'Please resubmit', '2025-11-12 16:20:29', NULL, NULL),
(31, 14, 'PASSPORT', 'sunil_passport.pdf', '/uploads/documents/14/passport.pdf', 'NEEDS_CORRECTION', 'Please resubmit', '2025-11-12 16:20:29', NULL, NULL),
(32, 15, 'RECOMMENDATION', 'gita_recommendation_letter.pdf', '/uploads/documents/15/recommendation_letter.pdf', 'VERIFIED', 'Document looks good', '2025-11-18 16:20:29', '2025-12-23 16:20:29', NULL),
(33, 15, 'PASSPORT', 'gita_passport.pdf', '/uploads/documents/15/passport.pdf', 'VERIFIED', 'Document looks good', '2025-11-06 16:20:29', '2025-12-24 16:20:29', NULL),
(34, 15, 'TRANSCRIPT', 'gita_academic_transcript.pdf', '/uploads/documents/15/academic_transcript.pdf', 'VERIFIED', 'Document looks good', '2025-12-08 16:20:29', '2025-12-25 16:20:29', NULL),
(35, 15, 'CERTIFICATE', 'gita_english_certificate.pdf', '/uploads/documents/15/english_certificate.pdf', 'VERIFIED', 'Document looks good', '2025-12-01 16:20:29', '2025-12-24 16:20:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `internal_notes`
--

CREATE TABLE `internal_notes` (
  `id` int(11) NOT NULL,
  `counselor_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `note` text NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `internal_notes`
--

INSERT INTO `internal_notes` (`id`, `counselor_id`, `client_id`, `note`, `created_at`) VALUES
(1, 7, 8, 'Financial documents need verification.', '2025-11-10 16:20:29'),
(2, 7, 9, 'All documents collected, ready for submission.', '2025-11-30 16:20:29'),
(3, 7, 9, 'Client prefers online meetings.', '2025-10-27 16:20:29'),
(4, 7, 9, 'Good academic background, strong candidate.', '2025-11-03 16:20:29'),
(5, 5, 10, 'Good academic background, strong candidate.', '2025-11-10 16:20:29'),
(6, 5, 10, 'Consider recommending alternative universities.', '2025-11-11 16:20:29'),
(7, 6, 11, 'Follow up required on missing documents.', '2025-12-20 16:20:29'),
(8, 6, 11, 'Consider recommending alternative universities.', '2025-12-23 16:20:29'),
(9, 6, 11, 'Visa interview preparation needed.', '2025-11-10 16:20:29'),
(10, 5, 12, 'Financial documents need verification.', '2025-11-06 16:20:29'),
(11, 5, 12, 'Client prefers online meetings.', '2025-11-09 16:20:29'),
(12, 5, 13, 'All documents collected, ready for submission.', '2025-11-15 16:20:29'),
(13, 5, 13, 'Consider recommending alternative universities.', '2025-12-18 16:20:29'),
(14, 5, 13, 'Financial documents need verification.', '2025-11-26 16:20:29'),
(15, 7, 14, 'Financial documents need verification.', '2025-11-14 16:20:29'),
(16, 7, 14, 'Follow up required on missing documents.', '2025-11-17 16:20:29'),
(17, 7, 15, 'All documents collected, ready for submission.', '2025-11-17 16:20:29'),
(18, 7, 15, 'Client prefers online meetings.', '2025-12-25 16:20:29');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `content`, `is_read`, `sent_at`) VALUES
(1, 8, 5, 'I need to reschedule my appointment.', 1, '2025-11-28 13:20:29'),
(2, 5, 8, 'No problem. What time works better for you?', 1, '2025-12-22 06:20:29'),
(3, 8, 5, 'Your appointment is confirmed for tomorrow at 10 AM.', 0, '2025-11-29 10:20:29'),
(4, 5, 8, 'Your appointment is confirmed for tomorrow at 10 AM.', 0, '2025-11-27 02:20:29'),
(5, 9, 6, 'You\'re welcome! Feel free to reach out if you have questions.', 1, '2025-12-20 16:20:29'),
(6, 6, 9, 'I need to reschedule my appointment.', 1, '2025-11-26 11:20:29'),
(7, 9, 6, 'We should have an update within 2-3 business days.', 1, '2025-12-02 22:20:29'),
(8, 6, 9, 'Your appointment is confirmed for tomorrow at 10 AM.', 1, '2025-11-25 18:20:29'),
(9, 9, 6, 'I need to reschedule my appointment.', 1, '2025-12-12 11:20:29'),
(10, 6, 9, 'You\'re welcome! Feel free to reach out if you have questions.', 1, '2025-11-27 10:20:29'),
(11, 9, 6, 'You\'re welcome! Feel free to reach out if you have questions.', 0, '2025-12-11 16:20:29'),
(12, 6, 9, 'Your appointment is confirmed for tomorrow at 10 AM.', 0, '2025-12-10 15:20:29'),
(13, 10, 5, 'Thank you for the update. When can I expect the next step?', 1, '2025-12-06 02:20:29'),
(14, 5, 10, 'Great! I\'ll review it today and let you know.', 0, '2025-12-15 06:20:29'),
(15, 10, 5, 'I have uploaded my bank statement. Please verify.', 0, '2025-12-19 06:20:29'),
(16, 11, 5, 'Great! I\'ll review it today and let you know.', 1, '2025-12-19 04:20:29'),
(17, 5, 11, 'Is there anything else I need to submit?', 0, '2025-12-01 21:20:29'),
(18, 11, 5, 'Hello! I wanted to check on my application status.', 0, '2025-12-11 00:20:29'),
(19, 12, 5, 'Your file is complete. We\'ll proceed with the application.', 1, '2025-12-14 22:20:29'),
(20, 5, 12, 'I have uploaded my bank statement. Please verify.', 1, '2025-12-16 23:20:29'),
(21, 12, 5, 'Is there anything else I need to submit?', 1, '2025-12-17 07:20:29'),
(22, 5, 12, 'We should have an update within 2-3 business days.', 1, '2025-12-01 11:20:29'),
(23, 12, 5, 'Great! I\'ll review it today and let you know.', 1, '2025-12-09 00:20:29'),
(24, 5, 12, 'I have uploaded my bank statement. Please verify.', 1, '2025-12-20 22:20:29'),
(25, 12, 5, 'Is there anything else I need to submit?', 0, '2025-12-11 00:20:29'),
(26, 5, 12, 'Thank you for your help!', 0, '2025-12-10 13:20:29');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 3, 'Payment Due', 'Your application fee payment is due.', 1, '2025-12-19 16:20:29'),
(2, 3, 'Document Request', 'Please upload your missing documents.', 0, '2025-12-17 16:20:29'),
(3, 3, 'Document Verified', 'Your document has been verified successfully.', 0, '2025-12-25 16:20:29'),
(4, 3, 'New Message', 'You have received a new message from your counselor.', 1, '2025-12-21 16:20:29'),
(5, 3, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 1, '2025-12-12 16:20:29'),
(6, 4, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 1, '2025-12-20 16:20:29'),
(7, 4, 'Payment Due', 'Your application fee payment is due.', 1, '2025-12-22 16:20:29'),
(8, 4, 'New Message', 'You have received a new message from your counselor.', 1, '2025-12-26 16:20:29'),
(9, 4, 'Application Update', 'Your application status has been updated.', 1, '2025-12-17 16:20:29'),
(10, 4, 'Document Verified', 'Your document has been verified successfully.', 0, '2025-12-13 16:20:29'),
(11, 5, 'Document Verified', 'Your document has been verified successfully.', 0, '2025-12-20 16:20:29'),
(12, 5, 'Application Update', 'Your application status has been updated.', 0, '2025-12-19 16:20:29'),
(13, 5, 'New Message', 'You have received a new message from your counselor.', 1, '2025-12-19 16:20:29'),
(14, 5, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 0, '2025-12-12 16:20:29'),
(15, 5, 'Payment Due', 'Your application fee payment is due.', 1, '2025-12-24 16:20:29'),
(16, 6, 'Document Verified', 'Your document has been verified successfully.', 1, '2025-12-25 16:20:29'),
(17, 6, 'Payment Due', 'Your application fee payment is due.', 1, '2025-12-15 16:20:29'),
(18, 6, 'New Message', 'You have received a new message from your counselor.', 1, '2025-12-14 16:20:29'),
(19, 6, 'Document Request', 'Please upload your missing documents.', 0, '2025-12-15 16:20:29'),
(20, 7, 'New Message', 'You have received a new message from your counselor.', 1, '2025-12-26 16:20:29'),
(21, 7, 'Document Request', 'Please upload your missing documents.', 1, '2025-12-24 16:20:29'),
(22, 7, 'Document Verified', 'Your document has been verified successfully.', 1, '2025-12-16 16:20:29'),
(23, 7, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 1, '2025-12-12 16:20:29'),
(24, 7, 'Payment Due', 'Your application fee payment is due.', 1, '2025-12-13 16:20:29'),
(25, 8, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 0, '2025-12-15 16:20:29'),
(26, 8, 'Document Request', 'Please upload your missing documents.', 1, '2025-12-16 16:20:29'),
(27, 9, 'Payment Due', 'Your application fee payment is due.', 0, '2025-12-24 16:20:29'),
(28, 9, 'New Message', 'You have received a new message from your counselor.', 0, '2025-12-18 16:20:29'),
(29, 10, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 1, '2025-12-18 16:20:29'),
(30, 10, 'Document Request', 'Please upload your missing documents.', 1, '2025-12-17 16:20:29'),
(31, 11, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 1, '2025-12-15 16:20:29'),
(32, 11, 'Document Verified', 'Your document has been verified successfully.', 1, '2025-12-17 16:20:29'),
(33, 11, 'Application Update', 'Your application status has been updated.', 1, '2025-12-15 16:20:29'),
(34, 11, 'Document Request', 'Please upload your missing documents.', 0, '2025-12-20 16:20:29'),
(35, 12, 'Document Verified', 'Your document has been verified successfully.', 1, '2025-12-18 16:20:29'),
(36, 12, 'Application Update', 'Your application status has been updated.', 0, '2025-12-13 16:20:29'),
(37, 12, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 1, '2025-12-21 16:20:29'),
(38, 13, 'Application Update', 'Your application status has been updated.', 0, '2025-12-23 16:20:29'),
(39, 13, 'New Message', 'You have received a new message from your counselor.', 1, '2025-12-12 16:20:29'),
(40, 13, 'Document Request', 'Please upload your missing documents.', 1, '2025-12-26 16:20:29'),
(41, 13, 'Payment Due', 'Your application fee payment is due.', 0, '2025-12-22 16:20:29'),
(42, 13, 'Document Verified', 'Your document has been verified successfully.', 0, '2025-12-22 16:20:29'),
(43, 14, 'Application Update', 'Your application status has been updated.', 1, '2025-12-22 16:20:29'),
(44, 14, 'Document Request', 'Please upload your missing documents.', 0, '2025-12-17 16:20:29'),
(45, 14, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 1, '2025-12-24 16:20:29'),
(46, 14, 'New Message', 'You have received a new message from your counselor.', 0, '2025-12-17 16:20:29'),
(47, 14, 'Payment Due', 'Your application fee payment is due.', 1, '2025-12-20 16:20:29'),
(48, 15, 'Document Request', 'Please upload your missing documents.', 1, '2025-12-12 16:20:29'),
(49, 15, 'Payment Due', 'Your application fee payment is due.', 1, '2025-12-24 16:20:29'),
(50, 15, 'Appointment Reminder', 'You have an appointment scheduled for tomorrow.', 0, '2025-12-12 16:20:29'),
(51, 15, 'Application Update', 'Your application status has been updated.', 0, '2025-12-23 16:20:29');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `type` enum('STUDENT_FEE','COMMISSION') NOT NULL,
  `status` enum('PENDING','PAID','CANCELLED') DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `application_id`, `amount`, `type`, `status`, `description`, `payment_date`, `created_at`) VALUES
(1, 1, 1500.00, 'STUDENT_FEE', 'PAID', 'Application processing fee', '2025-12-17 16:20:29', '2025-12-26 16:20:29'),
(2, 1, 4000.00, 'COMMISSION', 'PAID', 'University commission', '2025-12-20 16:20:29', '2025-12-26 16:20:29'),
(3, 2, 1500.00, 'STUDENT_FEE', 'PAID', 'Application processing fee', '2025-12-17 16:20:29', '2025-12-26 16:20:29'),
(4, 2, 5000.00, 'COMMISSION', 'PENDING', 'University commission', NULL, '2025-12-26 16:20:29'),
(5, 3, 750.00, 'STUDENT_FEE', 'PAID', 'Application processing fee', '2025-12-01 16:20:29', '2025-12-26 16:20:29'),
(6, 4, 500.00, 'STUDENT_FEE', 'PAID', 'Application processing fee', '2025-12-08 16:20:29', '2025-12-26 16:20:29'),
(7, 5, 1500.00, 'STUDENT_FEE', 'PENDING', 'Application processing fee', NULL, '2025-12-26 16:20:29'),
(8, 6, 1500.00, 'STUDENT_FEE', 'PAID', 'Application processing fee', '2025-12-13 16:20:29', '2025-12-26 16:20:29'),
(9, 6, 4000.00, 'COMMISSION', 'PAID', 'University commission', '2025-12-24 16:20:29', '2025-12-26 16:20:29'),
(10, 7, 500.00, 'STUDENT_FEE', 'PENDING', 'Application processing fee', NULL, '2025-12-26 16:20:29'),
(11, 8, 750.00, 'STUDENT_FEE', 'PAID', 'Application processing fee', '2025-12-09 16:20:29', '2025-12-26 16:20:29'),
(12, 8, 2000.00, 'COMMISSION', 'PENDING', 'University commission', NULL, '2025-12-26 16:20:29'),
(13, 9, 500.00, 'STUDENT_FEE', 'PENDING', 'Application processing fee', NULL, '2025-12-26 16:20:29'),
(14, 10, 1000.00, 'STUDENT_FEE', 'PAID', 'Application processing fee', '2025-12-11 16:20:29', '2025-12-26 16:20:29');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `education_background` text DEFAULT NULL,
  `preferred_country` varchar(100) DEFAULT NULL,
  `preferred_course` varchar(200) DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `passport_number` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `first_name`, `last_name`, `date_of_birth`, `address`, `education_background`, `preferred_country`, `preferred_course`, `budget`, `passport_number`) VALUES
(2, 3, 'System', 'Admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 4, 'Office', 'Manager', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 5, 'Sarah', 'Johnson', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 6, 'Rajesh', 'Sharma', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 7, 'Priya', 'Thapa', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 8, 'Ram', 'Shrestha', '1998-05-15', 'Kathmandu, Nepal', 'Bachelor in Computer Science', 'Australia', 'Master of Information Technology', 25000.00, 'NP12345678'),
(8, 9, 'Sita', 'Gurung', '1999-08-22', 'Pokhara, Nepal', 'Bachelor in Business Administration', 'UK', 'MBA', 30000.00, 'NP23456789'),
(9, 10, 'Hari', 'KC', '1997-03-10', 'Lalitpur, Nepal', 'Bachelor in Engineering', 'Canada', 'Master of Engineering', 35000.00, 'NP34567890'),
(10, 11, 'Maya', 'Tamang', '2000-11-05', 'Bhaktapur, Nepal', 'Bachelor in Nursing', 'Australia', 'Master of Nursing', 28000.00, 'NP45678901'),
(11, 12, 'Bikash', 'Rai', '1996-07-20', 'Dharan, Nepal', 'Bachelor in Commerce', 'USA', 'Master of Finance', 45000.00, 'NP56789012'),
(12, 13, 'Anita', 'Magar', '1998-12-08', 'Butwal, Nepal', 'Bachelor in Hotel Management', 'New Zealand', 'Master of Hospitality Management', 22000.00, 'NP67890123'),
(13, 14, 'Sunil', 'Bhandari', '1999-04-25', 'Chitwan, Nepal', 'Bachelor in Agriculture', 'Australia', 'Master of Agricultural Science', 26000.00, 'NP78901234'),
(14, 15, 'Gita', 'Poudel', '1997-09-12', 'Biratnagar, Nepal', 'Bachelor in Arts', 'UK', 'Master of Arts in Media Studies', 32000.00, 'NP89012345');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(120) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('CLIENT','COUNSELOR','ADMIN') NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'admin@consultancy.com', NULL, '$2b$12$AeERKd6.4Kp7ZjK0YluVm.oSuooUseQ/wLwdhMysulAEsqOI5JEwe', 'ADMIN', 1, '2025-12-26 16:20:25', '2025-12-26 16:20:25'),
(4, 'manager@consultancy.com', NULL, '$2b$12$XTcyAbkYbnCgfHBbSremVO7vp3wMWo8c7GQAeVvpvGp4cm5Dz3HRu', 'ADMIN', 1, '2025-12-26 16:20:25', '2025-12-26 16:20:25'),
(5, 'sarah.johnson@consultancy.com', '+977-9841234567', '$2b$12$C6WZwu13vEK3R8hGNymB5enouu0oZ13DxqZ6nb5W6GTdneTcTNcBG', 'COUNSELOR', 1, '2025-12-26 16:20:25', '2025-12-26 16:20:25'),
(6, 'rajesh.sharma@consultancy.com', '+977-9851234567', '$2b$12$y29ASqC9FxkyypcYnqptBOHak5bBe2cSq1qjPh10ho9LQKGGJoxfW', 'COUNSELOR', 1, '2025-12-26 16:20:25', '2025-12-26 16:20:25'),
(7, 'priya.thapa@consultancy.com', '+977-9861234567', '$2b$12$7Q3fZY9WBOgBkSq0.TOBQOVO1p5Y/l7Mz37NupaNSgWf7rPCWM2R.', 'COUNSELOR', 1, '2025-12-26 16:20:26', '2025-12-26 16:20:26'),
(8, 'ram.shrestha@gmail.com', '+977-9801234567', '$2b$12$MJRdKt65ruEA78NnWNmYRuMO58v54FUvjpMyrFE1mnhDEokgadf6m', 'CLIENT', 1, '2025-12-26 16:20:26', '2025-12-26 16:20:26'),
(9, 'sita.gurung@gmail.com', '+977-9811234567', '$2b$12$mVPYe5mItMCb0D765jiF7u6rvakdvsB2RaZbMRfs4Fz.KbB6EbIN6', 'CLIENT', 1, '2025-12-26 16:20:26', '2025-12-26 16:20:26'),
(10, 'hari.kc@gmail.com', '+977-9821234567', '$2b$12$ydjsppcK5ktUFkAIZ6eGbuMXdswplH9vNSbKT7orAKr10Xb3.PQyq', 'CLIENT', 1, '2025-12-26 16:20:27', '2025-12-26 16:20:27'),
(11, 'maya.tamang@gmail.com', '+977-9831234567', '$2b$12$Jrh3ZkeuZMmyCcIiaAq/yO05rwqRDQHLxwSuROAILJzY23FiKmmMi', 'CLIENT', 1, '2025-12-26 16:20:27', '2025-12-26 16:20:27'),
(12, 'bikash.rai@gmail.com', '+977-9841234568', '$2b$12$Xh9IMMhKWDhUi02ROeqgiOoWGSnLAFgs4hOStqmkaW0fckF8nEseW', 'CLIENT', 1, '2025-12-26 16:20:27', '2025-12-26 16:20:27'),
(13, 'anita.magar@gmail.com', '+977-9851234568', '$2b$12$VwtwvclcTVbZaDAQjQluR.Dv7MuGtmHecaIcPGSKkJvDhXgtRtuC2', 'CLIENT', 1, '2025-12-26 16:20:28', '2025-12-26 16:20:28'),
(14, 'sunil.bhandari@gmail.com', '+977-9861234568', '$2b$12$J8DOJMZ9/f6Yx3X7yIWAH.O0TMGIyY7JjMvc2vWU0S9tcFi/kcpva', 'CLIENT', 1, '2025-12-26 16:20:28', '2025-12-26 16:20:28'),
(15, 'gita.poudel@gmail.com', '+977-9871234567', '$2b$12$PFDx6IZX3FFUdO2JPxDGruH39Om8D/qhbKEXAfES0sH.PynI3FUt6', 'CLIENT', 1, '2025-12-26 16:20:28', '2025-12-26 16:20:28');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `counselor_id` (`counselor_id`);

--
-- Indexes for table `application_stages`
--
ALTER TABLE `application_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `counselor_id` (`counselor_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `verified_by` (`verified_by`);

--
-- Indexes for table `internal_notes`
--
ALTER TABLE `internal_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `counselor_id` (`counselor_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_users_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `application_stages`
--
ALTER TABLE `application_stages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `internal_notes`
--
ALTER TABLE `internal_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `application_stages`
--
ALTER TABLE `application_stages`
  ADD CONSTRAINT `application_stages_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`);

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `internal_notes`
--
ALTER TABLE `internal_notes`
  ADD CONSTRAINT `internal_notes_ibfk_1` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `internal_notes_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`);

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
