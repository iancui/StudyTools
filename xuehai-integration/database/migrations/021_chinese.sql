-- 学海语文学科独立业务表
-- MySQL 5.7/8；不创建用户表、不建外键、不改写 points/auth/通用进度表。
-- 所有业务 ID 由服务端 randomUUID() 生成；用户 ID 沿用 users.id VARCHAR(36)。

CREATE TABLE IF NOT EXISTS chinese_user_progress (
  user_id VARCHAR(36) NOT NULL PRIMARY KEY,
  grade VARCHAR(16) NOT NULL DEFAULT 'g3',
  semester VARCHAR(8) NOT NULL DEFAULT 's1',
  textbook_version VARCHAR(64) NOT NULL DEFAULT 'default',
  current_lesson_id VARCHAR(64) NULL,
  total_study_minutes INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chinese_character_progress (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  character_id VARCHAR(100) NOT NULL,
  is_mastered TINYINT(1) NOT NULL DEFAULT 0,
  practice_count INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  first_learned_at DATETIME NULL,
  last_practiced_at DATETIME NULL,
  mastered_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_chinese_character_user_item (user_id, character_id),
  KEY idx_chinese_character_user_mastered (user_id, is_mastered)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chinese_word_progress (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  word_id VARCHAR(100) NOT NULL,
  is_mastered TINYINT(1) NOT NULL DEFAULT 0,
  practice_count INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  first_learned_at DATETIME NULL,
  last_practiced_at DATETIME NULL,
  mastered_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_chinese_word_user_item (user_id, word_id),
  KEY idx_chinese_word_user_mastered (user_id, is_mastered)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chinese_sentence_progress (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  sentence_id VARCHAR(100) NOT NULL,
  is_completed TINYINT(1) NOT NULL DEFAULT 0,
  practice_count INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  first_learned_at DATETIME NULL,
  last_practiced_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_chinese_sentence_user_item (user_id, sentence_id),
  KEY idx_chinese_sentence_user_completed (user_id, is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chinese_wrong_questions (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(100) NOT NULL,
  question_type VARCHAR(32) NOT NULL,
  question_content TEXT NULL,
  wrong_count INT NOT NULL DEFAULT 1,
  correct_count INT NOT NULL DEFAULT 0,
  is_resolved TINYINT(1) NOT NULL DEFAULT 0,
  first_wrong_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_wrong_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_chinese_wrong_user_question (user_id, question_id),
  KEY idx_chinese_wrong_user_resolved (user_id, is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chinese_exam_records (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  lesson_id VARCHAR(64) NULL,
  score DECIMAL(6,2) NOT NULL DEFAULT 0,
  passed TINYINT(1) NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  correct_questions INT NOT NULL DEFAULT 0,
  duration_seconds INT NOT NULL DEFAULT 0,
  answers_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_chinese_exam_user_created (user_id, created_at),
  KEY idx_chinese_exam_user_lesson (user_id, lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chinese_essay_records (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  essay_id VARCHAR(100) NULL,
  title VARCHAR(200) NULL,
  prompt TEXT NULL,
  content LONGTEXT NOT NULL,
  word_count INT NOT NULL DEFAULT 0,
  score DECIMAL(6,2) NULL,
  feedback_json JSON NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_chinese_essay_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
