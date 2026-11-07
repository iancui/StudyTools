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
| POST | /api/chinese/study-sessions | 保存一次学习计时会话；sessionId 幂等，单次最多 240 分钟 | 无 |
| GET | /api/chinese/previews | 已完成预习记录 | 无 |
| POST | /api/chinese/previews | 标记导读完成 | 无 |
| GET | /api/chinese/wrong-questions | 错题列表 | 无 |
| POST | /api/chinese/wrong-questions | 新增/更新错题 | 无 |
| POST | /api/chinese/wrong-questions/resolve | 将指定错题标记为已解决 | 无 |
| GET | /api/chinese/exams | 测验记录列表 | 无 |
| POST | /api/chinese/exams | 保存测验记录；服务端按可信题库核验答案 | 服务端核验通过且达标后才发 1 点；当前年级综合题库可核验，但尚无正式 lessonId 映射，暂不发分 |
| GET | /api/chinese/essays | 作文记录列表 | 无 |
| POST | /api/chinese/essays | 保存作文及批改 JSON | 无 |

## 积分规则

仅测验达标发分：某课测验由服务端核验且 score >= 70 时调用 `db.awardPoints(userId, 'CHINESE_QUIZ:<lessonId>', 'chinese:quiz:<lessonId>:first', 1, remark)`。每课永久 sourceKey 去重；scene 按学海规则每日去重。预习、复习、练习、作文均不发分。响应 data 中包含 pointsAward 原样结构。

## 请求字段

- 进度更新：`grade`、`semester`、`textbookVersion`、`currentLessonId`、`studyMinutesDelta`。
- 详细进度：字符/词语使用 `{ masteredIds: string[] }`；句子使用 `{ completedIds: string[] }`。
- 练习事件：`{ itemId: string, eventId: string, result: 'correct' | 'wrong' }`；eventId 用于服务端幂等。
- 测验：`{ lessonId, requestId, score, totalQuestions, correctQuestions, durationSeconds, answers }`。requestId 用于防止重复提交；服务端必须以可信题库重算分数后才可发积分。练习事件为 `{ itemId, eventId, result }`，eventId 全局唯一（用户范围内）。
- 作文：`{ essayId, title, prompt, content, feedback }`。

此表是按本次契约定义的接入目标；后续实现端点数量必须与 `routes/chinese.ts` 实际注册数一致。
