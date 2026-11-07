# StudyTools → 学海数据映射

| StudyTools 旧表 | 学海新表 | 映射说明 |
|---|---|---|
| users | 不建表 | 使用学海 users.id VARCHAR(36)，按 username 对账（旧 StudyTools users 表没有 email 字段）；绝不迁移旧用户主键 |
| user_progress | chinese_user_progress | grade、semester、textbook_version、current_lesson_id、total_study_minutes；旧 ink_drops/streak_days/checkin 不导入 |
| 新增学习计时 | chinese_study_sessions + chinese_user_progress.total_study_minutes | session_id 唯一；重复提交不重复累计分钟 |
| moyun_custom_curriculum_data_v1 | 暂不迁移 | 学海尚未确认用户自定义课程的存储/发布模型，需单独备份并另行设计导入 |
| localStorage.previewedItemIds | chinese_preview_records | 从用户显式导出的 per-user localStorage JSON 读取 previewedItemIds 后按 guide_id 导入；旧 DB 只有 preview_count，无具体 ID |
| user_character_progress | chinese_character_progress | (user_id, character_id) 唯一；保留 mastered 与练习统计 |
| user_word_progress | chinese_word_progress | (user_id, word_id) 唯一；保留 mastered 与练习统计 |
| user_sentence_progress | chinese_sentence_progress | (user_id, sentence_id) 唯一；保留 completed 与练习统计 |
| user_wrong_questions | chinese_wrong_questions | 保留题干快照、错/对次数、resolved_at |
| exam_records | chinese_exam_records | score、passed、answers_json、题数与耗时；旧 exam_id 不默认当作 lesson_id，需人工核对后映射 |
| essay_practices | chinese_essay_records | 原文、题目、字数、评分与 feedback JSON |\n| 浏览器 moyun_chinese_learning_v1 | 对应 chinese_* 表 | 只在用户显式导出并通过 --progress-json 提供时迁移预习、掌握 ID、错题、测验与作文；墨滴/签到/徽章排除 |\n| 无旧表（新行为） | chinese_practice_events | 学海侧新增 eventId 幂等事件记录，不从旧表迁移 |\n| 无旧表（新行为） | chinese_preview_records | 预习完成幂等记录；可用旧 previewedItemIds 迁移 |\n| 无旧表（新行为） | chinese_study_sessions | 学习计时会话；旧项目没有可信累计总时长，不回填历史分钟 |
| checkin_records | 不建表 | 全部走学海 /api/points/* |
| user_badges | 不建表 | 全部走学海积分/徽章能力 |
| refresh_tokens | 不建表 | 学海 auth_sessions 已负责会话 |

旧表主键和 user_id 为旧库自增数值类型，学海 user_id 是 VARCHAR(36)，不可直接复制。旧 schema 含破坏性删表定义，不能执行于学海。所有目标表无外键，使用 VARCHAR(64) 业务 ID 和 CREATE TABLE IF NOT EXISTS。

迁移脚本必须先备份旧库；以旧 username 对账学海 users；无唯一匹配、多个匹配或目标用户不存在时跳过并输出审计，不创建学海用户。导入先 dry-run，只报告计划条数与冲突；正式导入用事务、唯一键 upsert、每批记录 checkpoint，避免重复导入和重复积分。
