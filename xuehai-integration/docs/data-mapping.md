# StudyTools → 学海数据映射

| StudyTools 旧数据 | 学海新表 | 映射说明 |
|---|---|---|
| users | 不建表 | 使用学海 users.id VARCHAR(36)，按 username 唯一对账；绝不迁移旧用户主键 |
| user_progress | chinese_user_progress | 迁移 selected_grade；semester 从显式导出的本地 selectedSemester 映射；旧表无累计分钟字段，不回填 total_study_minutes |
| localStorage.previewedItemIds | chinese_preview_records | 仅接受 `prev-g1` 至 `prev-g12` 这类旧预习导读 ID；其他内容 ID 不当作预习记录 |
| user_character_progress | chinese_character_progress | (user_id, character_id) 唯一；保留 mastered 与练习统计 |
| user_word_progress | chinese_word_progress | (user_id, word_id) 唯一；保留 mastered 与练习统计 |
| user_sentence_progress | chinese_sentence_progress | (user_id, sentence_id) 唯一；保留 completed 与练习统计 |
| user_wrong_questions | chinese_wrong_questions | 保留题干快照、错/对次数、resolved_at |
| localStorage.wrongQuestionIds | chinese_wrong_questions | 只在用户显式导出并传入 --progress-json 时导入 ID；无题干快照的记录标记为 legacy |
| exam_records | chinese_exam_records | grade、score、answers_json、题数与耗时；历史记录 passed 设为 false，不补发积分；旧 exam_id 不默认当作 lesson_id |
| localStorage.examHistory | chinese_exam_records | 仅当旧 DB 没有测验记录时作为补充来源导入；历史导入不发积分 |
| essay_practices | chinese_essay_records | 原文、题目、字数、评分与 feedback JSON |
| localStorage.essayPractices | chinese_essay_records | 仅当旧 DB 没有作文记录时作为补充来源导入 |
| moyun_custom_curriculum_data_v1 | 暂不迁移 | 学海尚未确认用户自定义课程的存储/发布模型，需单独备份并另行设计导入 |
| checkin_records | 不建表 | 签到、连续天数和奖励全部走学海 points 服务 |
| user_badges | 不建表 | 旧徽章不导入，避免绕过学海奖励规则 |
| refresh_tokens | 不建表 | 学海 auth_sessions 已负责会话 |

## 学海新增的行为表（不是旧表映射）

- `chinese_practice_events`：练习 eventId 幂等记录。
- `chinese_preview_records`：预习完成记录；唯一键为 user_id + guide_id。
- `chinese_study_sessions`：计时 sessionId 幂等记录，旧项目没有可信累计总时长，不回填历史分钟。

旧库用户 ID 是自增数值类型，学海 user_id 是 VARCHAR(36)，不可直接复制。旧 schema 含破坏性删表定义，不能执行于学海。所有目标表无外键，使用 VARCHAR(64) 业务 ID 和 CREATE TABLE IF NOT EXISTS。

迁移脚本必须先备份旧库；以旧 username 对账学海 users；无唯一匹配、多个匹配或目标用户不存在时跳过并输出审计，不创建学海用户。先 dry-run 检查记录数量和冲突；正式导入按用户事务和唯一键 upsert，重试不会重复创建记录，也不会补发历史积分。当前脚本没有单独 checkpoint 表，恢复粒度为每个用户事务。
