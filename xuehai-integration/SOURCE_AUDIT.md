# 源码审计（基于 GitHub main 分支）

审计对象：`iancui/StudyTools`，分支 `main`，基线 commit `4a1496cb05b5708bbb318fce3b0a00c0ed788b91`。

## 课程数据

`src/data/curriculum.ts`（65,534 字符）导出：

- `GRADES_LIST`
- `CHARACTERS_DATA`
- `WORDS_DATA`
- `SENTENCES_DATA`
- `ESSAYS_DATA`
- `EXAMS_DATA`
- `PREVIEW_GUIDES`
- `DEFAULT_CURRICULUM`

课程类型定义在 `src/types/chinese.ts`：GradeId 为 g1–g12；内容实体均有稳定 string id 和 gradeId。汉字、词语、句子、作文、测验五类内容字段分别按源类型保留。课程导出不得把用户行为状态混入静态内容。

## 进度模型

`src/types/progress.ts` 的 UserProgress 包含：
- 学习状态：previewedItemIds、masteredCharacterIds、masteredWordIds、completedSentenceIds；
- 错题与测验：wrongQuestionIds、examHistory；
- 作文：essayPractices；
- 详细统计：detailedCharStats、detailedWordStats、detailedSentenceStats（可选）。

同一类型还含旧系统专属字段：inkDrops、streakDays、lastCheckInDate、checkInHistory、unlockedBadgeIds。它们不得被本集成包迁移或重建为学海功能。selectedGrade / selectedSemester 是偏好字段，只有学海明确提供对应偏好字段时才映射。

## 旧存储与 API

- `src/utils/storage.ts`：localStorage key 为 `moyun_chinese_learning_v1`；按旧数值 userId 添加 `:user:<id>` 后缀。
- `src/api/progress.ts`：摘要 GET/PUT `/progress`，字段为 inkDrops、streakDays、lastCheckinDate、previewCount、masteredCharacterCount、masteredWordCount、completedSentenceCount。
- `src/api/detailedProgress.ts`：详细 GET/PUT `/progress/characters`、`/progress/words`、`/progress/sentences`，承载内容 ID 和练习统计。
- `server/src/app.ts` 注册旧认证、进度、教材、考试、作文、英语等路由。旧认证不得接入学海。

## 旧数据库快照

`server/migrations/schema.sql` 包含 users、user_progress、user_character_progress、user_word_progress、user_sentence_progress、user_wrong_questions、exam_records、essay_practices、checkin_records、user_badges、refresh_tokens。

重要事实：
- 旧 users 主键与关联字段为旧库自增数值类型；
- schema 快照包含可能删除已有数据的定义，不能在生产环境直接执行；
- 外键指向旧 users 表；
- 旧进度摘要表混有墨滴、连续签到等学海不应接管的字段。

因此不复制旧 users / auth / check-in / badges / refresh_tokens 结构，不把旧库数值型 user_id 直接写入学海。宿主 user_id 的真实类型须以学海 schema 为准。

## 依赖

根 package.json 已有 React、Vite、TypeScript、Express 等依赖。本集成目录不新增 npm 包、不改 package.json/lockfile。
