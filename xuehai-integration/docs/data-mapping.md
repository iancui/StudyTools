# StudyTools → 学海数据映射

| StudyTools 旧表 | 学海新表 | 映射说明 |
|---|---|---|
| users | 不建表 | 使用学海 users.id VARCHAR(36)，按 username/email 对账；绝不迁移旧用户主键 |
| user_progress | chinese_user_progress | grade、semester、textbook_version、current_lesson_id、total_study_minutes；旧 ink_drops/streak_days/checkin 不导入 |
| user_character_progress | chinese_character_progress | (user_id, character_id) 唯一；保留 mastered 与练习统计 |
| user_word_progress | chinese_word_progress | (user_id, word_id) 唯一；保留 mastered 与练习统计 |
| user_sentence_progress | chinese_sentence_progress | (user_id, sentence_id) 唯一；保留 completed 与练习统计 |
| user_wrong_questions | chinese_wrong_questions | 保留题干快照、错/对次数、resolved_at |
| exam_records | chinese_exam_records | score、passed、answers_json、题数与耗时；旧 exam_id 不默认当作 lesson_id，需人工核对后映射 |
| essay_practices | chinese_essay_records | 原文、题目、字数、评分与 feedback JSON |
| checkin_records | 不建表 | 全部走学海 /api/points/* |
| user_badges | 不建表 | 全部走学海积分/徽章能力 |
| refresh_tokens | 不建表 | 学海 auth_sessions 已负责会话 |

旧表主键和 user_id 为旧库自增数值类型，学海 user_id 是 VARCHAR(36)，不可直接复制。旧 schema 含破坏性删表定义，不能执行于学海。所有目标表无外键，使用 VARCHAR(64) 业务 ID 和 CREATE TABLE IF NOT EXISTS。

迁移脚本必须先备份旧库；以旧 username/email 对账学海 users；无唯一匹配、多个匹配或目标用户不存在时跳过并输出审计，不创建学海用户。导入先 dry-run，只报告计划条数与冲突；正式导入用事务、唯一键 upsert、每批记录 checkpoint，避免重复导入和重复积分。
