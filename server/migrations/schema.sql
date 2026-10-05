-- 墨韵中文 数据库 Schema
-- 兼容 MySQL 5.7 / utf8mb4 / utf8mb4_unicode_ci / InnoDB
-- 字段来源说明：
--   users / user_progress(user_id) / refresh_tokens  : 从 server 源码确认
--   其余 8 表                                       : 从前端 UserProgress 类型反推

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(72) NOT NULL,
  `nickname` VARCHAR(50) NULL,
  `avatar_url` VARCHAR(512) NULL,
  `selected_grade` VARCHAR(8) NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_progress
--   createUser() 中 INSERT user_progress (user_id) VALUES (?)
--   所以除 user_id 外字段均允许 NULL 或有默认值
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_progress` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `selected_grade` VARCHAR(8) NULL,
  `ink_drops` INT UNSIGNED NOT NULL DEFAULT 0,
  `streak_days` INT UNSIGNED NOT NULL DEFAULT 0,
  `last_checkin_date` VARCHAR(20) NULL,
  `today_study_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
  `last_study_timestamp` BIGINT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_progress_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_character_progress  (masteredCharacterIds / previewedItemIds)
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_character_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `character_id` VARCHAR(64) NOT NULL,
  `is_mastered` TINYINT(1) NOT NULL DEFAULT 0,
  `is_previewed` TINYINT(1) NOT NULL DEFAULT 0,
  `mastered_at` DATETIME NULL,
  `previewed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_char` (`user_id`, `character_id`),
  CONSTRAINT `fk_ucp_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_word_progress  (masteredWordIds / previewedItemIds)
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_word_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `word_id` VARCHAR(64) NOT NULL,
  `is_mastered` TINYINT(1) NOT NULL DEFAULT 0,
  `is_previewed` TINYINT(1) NOT NULL DEFAULT 0,
  `mastered_at` DATETIME NULL,
  `previewed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_word` (`user_id`, `word_id`),
  CONSTRAINT `fk_uwp_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_sentence_progress  (completedSentenceIds)
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_sentence_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `sentence_id` VARCHAR(64) NOT NULL,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `completed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_sentence` (`user_id`, `sentence_id`),
  CONSTRAINT `fk_usp_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_wrong_questions  (wrongQuestionIds)
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_wrong_questions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `question_id` VARCHAR(64) NOT NULL,
  `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `removed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_question` (`user_id`, `question_id`),
  CONSTRAINT `fk_uwq_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- exam_records  (ExamRecord)
-- ============================================================
CREATE TABLE IF NOT EXISTS `exam_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `external_id` VARCHAR(64) NOT NULL,
  `grade_id` VARCHAR(8) NULL,
  `score` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `total_score` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `accuracy` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `exam_date` VARCHAR(20) NULL,
  `time_spent_seconds` INT UNSIGNED NOT NULL DEFAULT 0,
  `wrong_question_ids` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_exam_external` (`user_id`, `external_id`),
  KEY `idx_exam_user_date` (`user_id`, `exam_date`),
  CONSTRAINT `fk_er_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- essay_practices  (EssayPracticeRecord)
-- ============================================================
CREATE TABLE IF NOT EXISTS `essay_practices` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `external_id` VARCHAR(64) NOT NULL,
  `essay_id` VARCHAR(64) NULL,
  `grade_id` VARCHAR(8) NULL,
  `title` VARCHAR(255) NULL,
  `content` MEDIUMTEXT NULL,
  `practice_date` VARCHAR(20) NULL,
  `score` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `word_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `feedback_overview` TEXT NULL,
  `feedback_highlights` JSON NULL,
  `feedback_suggestions` JSON NULL,
  `feedback_good_words` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_essay_external` (`user_id`, `external_id`),
  KEY `idx_essay_user_date` (`user_id`, `practice_date`),
  CONSTRAINT `fk_ep_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- checkin_records  (checkInHistory)
-- ============================================================
CREATE TABLE IF NOT EXISTS `checkin_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `checkin_date` VARCHAR(20) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_checkin_date` (`user_id`, `checkin_date`),
  CONSTRAINT `fk_cr_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- user_badges  (unlockedBadgeIds)
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_badges` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `badge_id` VARCHAR(64) NOT NULL,
  `unlocked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_badge` (`user_id`, `badge_id`),
  CONSTRAINT `fk_ub_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- refresh_tokens
--   token_hash 为 sha256 hex (64 位小写)，使用 ascii_bin 区分大小写
-- ============================================================
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refresh_token_hash` (`token_hash`),
  KEY `idx_refresh_user` (`user_id`),
  KEY `idx_refresh_expires` (`expires_at`),
  CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
