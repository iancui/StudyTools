-- 墨韵中文 英语辞书模块 V1 数据表
-- ============================================================
-- 工单: 英语学习 V1 - 辞书基础
--
-- 重要原则:
--   - english_dictionaries / english_words 是新增的独立英语表,
--     不修改任何现有中文业务表 (users / user_progress / textbook_*
--     / exam_records / essay_practices 等).
--   - 不修改 auth / progress / exam / textbook API.
--   - 辞书是用户私有数据, english_dictionaries.user_id 强制非空,
--     并加外键 ON DELETE CASCADE 跟随 users 删除.
--   - english_words.dictionary_id 跟随 english_dictionaries 删除.
--   - 同一辞书内 word 去重 (UNIQUE KEY uk_dict_word).
--
-- 注意:
--   本文件含 DROP TABLE IF EXISTS, 会清空英语辞书数据.
--   生产环境禁止直接执行; 仅用于新建开发/测试环境或版本对照.
--   首次部署时建议改为 CREATE TABLE IF NOT EXISTS 形态.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- english_dictionaries: 英语辞书
-- ============================================================
DROP TABLE IF EXISTS `english_dictionaries`;
CREATE TABLE `english_dictionaries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `word_count` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dict_user` (`user_id`,`created_at`),
  CONSTRAINT `fk_english_dictionaries_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- english_words: 英语单词
-- ============================================================
DROP TABLE IF EXISTS `english_words`;
CREATE TABLE `english_words` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `dictionary_id` bigint(20) unsigned NOT NULL,
  `word` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meaning` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phonetic` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pos` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phonics` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dict_word` (`dictionary_id`,`word`),
  KEY `idx_words_dict` (`dictionary_id`,`sort_order`),
  CONSTRAINT `fk_english_words_dictionary` FOREIGN KEY (`dictionary_id`) REFERENCES `english_dictionaries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
