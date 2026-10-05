-- 墨韵中文 数据库 Schema 真实结构快照
-- 数据库: moyun_chinese
-- MySQL: 5.7.35
-- 生成方式: SHOW CREATE TABLE 直接回填，未做任何字段调整
-- 生成时间: 2026-10-05
--
-- 重要原则:
--   本文件以实际数据库为唯一事实来源。
--   不要根据前端 TypeScript 类型反推字段。
--   实际 DB 没有的字段,不要添加;实际 DB 已存在的字段,必须保留。
--
-- 注意:
--   本文件含 DROP TABLE IF EXISTS,会清空数据。
--   生产环境禁止直接执行;仅用于新建开发/测试环境或版本对照。
--   首次部署时建议改为 CREATE TABLE IF NOT EXISTS 形态。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- users
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `selected_grade` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_progress
-- ============================================================
DROP TABLE IF EXISTS `user_progress`;
CREATE TABLE `user_progress` (
  `user_id` bigint(20) unsigned NOT NULL,
  `ink_drops` int(11) NOT NULL DEFAULT '0',
  `streak_days` int(11) NOT NULL DEFAULT '0',
  `last_checkin_date` date DEFAULT NULL,
  `preview_count` int(11) NOT NULL DEFAULT '0',
  `mastered_character_count` int(11) NOT NULL DEFAULT '0',
  `mastered_word_count` int(11) NOT NULL DEFAULT '0',
  `completed_sentence_count` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_character_progress
-- ============================================================
DROP TABLE IF EXISTS `user_character_progress`;
CREATE TABLE `user_character_progress` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `character_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_mastered` tinyint(4) NOT NULL DEFAULT '0',
  `practice_count` int(11) NOT NULL DEFAULT '0',
  `correct_count` int(11) NOT NULL DEFAULT '0',
  `wrong_count` int(11) NOT NULL DEFAULT '0',
  `first_learned_at` datetime DEFAULT NULL,
  `last_practiced_at` datetime DEFAULT NULL,
  `mastered_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_character` (`user_id`,`character_id`),
  KEY `idx_user_character_mastered` (`user_id`,`is_mastered`),
  CONSTRAINT `fk_character_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_word_progress
-- ============================================================
DROP TABLE IF EXISTS `user_word_progress`;
CREATE TABLE `user_word_progress` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `word_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_mastered` tinyint(4) NOT NULL DEFAULT '0',
  `practice_count` int(11) NOT NULL DEFAULT '0',
  `correct_count` int(11) NOT NULL DEFAULT '0',
  `wrong_count` int(11) NOT NULL DEFAULT '0',
  `first_learned_at` datetime DEFAULT NULL,
  `last_practiced_at` datetime DEFAULT NULL,
  `mastered_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_word` (`user_id`,`word_id`),
  KEY `idx_user_word_mastered` (`user_id`,`is_mastered`),
  CONSTRAINT `fk_word_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_sentence_progress
-- ============================================================
DROP TABLE IF EXISTS `user_sentence_progress`;
CREATE TABLE `user_sentence_progress` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `sentence_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_completed` tinyint(4) NOT NULL DEFAULT '0',
  `practice_count` int(11) NOT NULL DEFAULT '0',
  `correct_count` int(11) NOT NULL DEFAULT '0',
  `wrong_count` int(11) NOT NULL DEFAULT '0',
  `first_learned_at` datetime DEFAULT NULL,
  `last_practiced_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_sentence` (`user_id`,`sentence_id`),
  KEY `idx_user_sentence_completed` (`user_id`,`is_completed`),
  CONSTRAINT `fk_sentence_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_wrong_questions
-- ============================================================
DROP TABLE IF EXISTS `user_wrong_questions`;
CREATE TABLE `user_wrong_questions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `question_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_content` text COLLATE utf8mb4_unicode_ci,
  `wrong_count` int(11) NOT NULL DEFAULT '1',
  `correct_count` int(11) NOT NULL DEFAULT '0',
  `is_resolved` tinyint(4) NOT NULL DEFAULT '0',
  `first_wrong_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_wrong_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_question` (`user_id`,`question_id`),
  KEY `idx_wrong_questions_user` (`user_id`,`is_resolved`),
  CONSTRAINT `fk_wrong_questions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- exam_records
-- ============================================================
DROP TABLE IF EXISTS `exam_records`;
CREATE TABLE `exam_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `exam_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exam_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_questions` int(11) NOT NULL DEFAULT '0',
  `correct_questions` int(11) NOT NULL DEFAULT '0',
  `wrong_questions` int(11) NOT NULL DEFAULT '0',
  `score` decimal(6,2) NOT NULL DEFAULT '0.00',
  `duration_seconds` int(11) NOT NULL DEFAULT '0',
  `answers` json DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exam_user` (`user_id`,`created_at`),
  CONSTRAINT `fk_exam_records_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- essay_practices
-- ============================================================
DROP TABLE IF EXISTS `essay_practices`;
CREATE TABLE `essay_practices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prompt` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `word_count` int(11) NOT NULL DEFAULT '0',
  `score` decimal(6,2) DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `ai_score` json DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_essay_user` (`user_id`,`created_at`),
  CONSTRAINT `fk_essay_practices_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- checkin_records
-- ============================================================
DROP TABLE IF EXISTS `checkin_records`;
CREATE TABLE `checkin_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `checkin_date` date NOT NULL,
  `ink_drops_earned` int(11) NOT NULL DEFAULT '20',
  `streak_days` int(11) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_checkin_date` (`user_id`,`checkin_date`),
  KEY `idx_checkin_user` (`user_id`,`checkin_date`),
  CONSTRAINT `fk_checkin_records_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_badges
-- ============================================================
DROP TABLE IF EXISTS `user_badges`;
CREATE TABLE `user_badges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `badge_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unlocked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_badge` (`user_id`,`badge_id`),
  KEY `idx_badges_user` (`user_id`),
  CONSTRAINT `fk_user_badges_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- refresh_tokens
-- ============================================================
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token_hash` (`token_hash`),
  KEY `idx_refresh_user` (`user_id`),
  KEY `idx_refresh_expires` (`expires_at`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
