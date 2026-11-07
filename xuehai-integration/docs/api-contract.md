# 语文 API 契约草案

所有路径挂在 `/api` 下，最终以学海 `registerChineseRoutes(apiRouter)` 注册为准。所有路由在全局 `authMiddleware` 之后执行；user_id 一律来自 `req.user!.id`。

统一成功包：`{ code: 200, message: 'success', data }`。业务错误设置 `err.status = 400` 并交给 `next(e)`。

| 方法 | 路径 | 用途 | 积分 |
|---|---|---|---|
| GET | /api/chinese/progress | 获取年级、学期、教材版本、当前课次、累计学习分钟 | 无 |
| PUT | /api/chinese/progress | 更新学习配置/分钟 | 无 |
| GET | /api/chinese/characters | 生字进度列表 | 无 |
| PUT | /api/chinese/characters | 批量保存 masteredIds | 无 |
| POST | /api/chinese/characters/practice | 记录一次生字练习 | 无 |
| GET | /api/chinese/words | 词语进度列表 | 无 |
| PUT | /api/chinese/words | 批量保存 masteredIds | 无 |
| POST | /api/chinese/words/practice | 记录一次词语练习 | 无 |
| GET | /api/chinese/sentences | 句子进度列表 | 无 |
| PUT | /api/chinese/sentences | 批量保存 completedIds | 无 |
| POST | /api/chinese/sentences/practice | 记录一次句子练习 | 无 |
| GET | /api/chinese/wrong-questions | 错题列表 | 无 |
| POST | /api/chinese/wrong-questions | 新增/更新错题 | 无 |
| GET | /api/chinese/exams | 测验记录列表 | 无 |
| POST | /api/chinese/exams | 保存测验记录；按课次首次达 70 分调用学海积分 | 条件发 1 点 |
| GET | /api/chinese/essays | 作文记录列表 | 无 |
| POST | /api/chinese/essays | 保存作文及批改 JSON | 无 |

## 积分规则

仅测验达标发分：某课测验 score >= 70 时调用 `db.awardPoints(userId, 'CHINESE_QUIZ:<lessonId>', 'chinese:quiz:<lessonId>:first', 1, remark)`。每课永久 sourceKey 去重；scene 按学海规则每日去重。预习、复习、练习、作文均不发分。响应 data 中包含 pointsAward 原样结构。

## 请求字段

- 进度更新：`grade`、`semester`、`textbookVersion`、`currentLessonId`、`studyMinutesDelta`。
- 详细进度：字符/词语使用 `{ masteredIds: string[] }`；句子使用 `{ completedIds: string[] }`。
- 练习事件：`{ itemId: string, result: 'correct' | 'wrong' }`。
- 测验：`{ lessonId, score, totalQuestions, correctQuestions, durationSeconds, answers }`。
- 作文：`{ essayId, title, prompt, content, feedback }`。

此表是按本次契约定义的接入目标；后续实现端点数量必须与 `routes/chinese.ts` 实际注册数一致。
