# 验收与自检

## 静态自检（本集成目录）

1. [ ] 不新增 npm 依赖，package.json 与锁文件保持不变。
2. [ ] 原有 `src/` 与 `server/` 不改动。
3. [ ] 不新增 users/auth/refresh-token 表或认证路由。
4. [ ] 不把学习进度写入 localStorage；仅允许 linguastep_token、引导标记、学科偏好和 UI 状态。
5. [ ] 积分、签到、连续签到、徽章、会员字段不进入迁移 snapshot。
6. [ ] 课程 JSON 覆盖 12 年级；稳定新 ID 与 legacyId 对照；课程 quiz 与前端题库均不包含 correctAnswer/explanation；未导入旧积分等级/徽章配置。
7. [ ] API 请求统一经 web/features/chinese/api.ts，路由固定为 /api/chinese/...；会话沿用学海 token。服务端/前端可信题库 ID 必须一致。
8. [ ] 迁移计划是纯函数，无 DB IO；目标 userId 必须由学海认证流程提供。
9. [ ] 运行 `node xuehai-integration/scripts/verify-chinese.mjs`，确认前端不包含题库标准答案、选项洗牌稳定、课程 JSON 与 SQL 约束正确。

## 宿主接入验收（接入后执行）

- 学海登录用户可以打开语文模块；未授权请求被学海拒绝。
- 用户 A/B 数据隔离由服务端验证，客户端不能指定或覆盖 userId。
- 课程列表与五类学习模块数据可读；JSON 导出为 12 年级兼容课程包，sourceId/legacyId 保留旧内容 ID。
- 生字/词语/句子学习状态可保存并跨设备恢复；练习事件具备 eventId 幂等。
- 错题、考试、作文数据按本模块 DTO 保存；复习队列按正确率与间隔到期排序。
- 断网/超时错误按学海统一错误策略显示；不得静默丢失。
- 重复导入不会重复创建记录；练习/测验/错题/计时事件可安全重试；同一测验重试不会重复建档或重复累计错题。
- 不影响其他学科路由、鉴权、导航和学习进度。

## 尚未执行

由于当前运行环境不能克隆并执行仓库依赖安装，未运行 npm build / tsc / lint / unit tests，也未对学海做集成测试。提交的源代码需在具备项目工作区后完成构建验证。
