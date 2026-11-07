# 学习数据映射表（不预设学海表名）

| StudyTools 字段 | 学习语义 | 本包处理 | 宿主侧要求 |
|---|---|---|---|
| previewedItemIds | 已预习内容 ID | 保留 string[] | 确认是否持久化 |
| masteredCharacterIds | 已掌握汉字 ID | 保留 string[] | 用户维度隔离 |
| masteredWordIds | 已掌握词语 ID | 保留 string[] | 用户维度隔离 |
| completedSentenceIds | 已完成句子 ID | 保留 string[] | 用户维度隔离 |
| wrongQuestionIds | 错题 ID | 保留 string[] | 确认题库版本与 ID 稳定性 |
| examHistory | 测验记录 | 保留记录对象 | 确认目标 DTO/隐私/保留期 |
| essayPractices | 作文练习 | 保留记录对象 | 确认目标 DTO/内容存储政策 |
| detailed*Stats | 练习次数、正误数、最近练习时间 | 保留对象映射 | 确认目标统计结构 |
| selectedGrade / selectedSemester | UI 偏好 | 不自动导入 | 学海确认偏好字段后再映射 |
| inkDrops / streakDays / check-in | 旧积分与签到 | 明确排除 | 学海积分/签到服务唯一负责 |
| unlockedBadgeIds | 旧徽章 | 明确排除 | 学海徽章服务唯一负责 |
| legacy userId | 旧 users.id | 仅来源审计 | 由受信任流程映射学海用户 |

## 数据库迁移约束
未取得学海目标数据库 schema，故不生成 SQL。旧 schema 含 DROP TABLE、旧 users 外键和 unsigned BIGINT user_id，不得在学海执行或复用。目标表名、列、主键类型、索引、租户策略、事务和幂等键必须以学海真实 schema/API 为准。
