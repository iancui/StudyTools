# 学海接入 Patch 清单（5 项）

本仓库未包含学海代码，因此下列是**接入补丁的精确职责与契约**，不是伪造的可应用 unified diff。只有拿到学海目标仓库和真实文件后，才能生成逐文件 patch。

## Patch 1 — 学科注册与导航

宿主新增 Chinese / 语文学科入口，路由加载隔离的墨韵中文模块。不得改写宿主全局路由约定或覆盖其他学科。需确认：学科 registry 文件、route loader、权限声明、菜单配置。

## Patch 2 — 课程内容适配

从 `xuehai-integration/src/curriculum.ts` 导出 g1–g12 课程快照；源课程 ID 保持不变。宿主把课程视为只读内容，不把用户进度嵌入课程对象。需确认：学海课程实体 DTO、内容缓存与版本字段。

## Patch 3 — 身份与 API 适配

通过 `web/features/chinese/api.ts` 使用学海 linguastep_token 和统一响应包。学海服务端从 AuthenticatedRequest.req.user.id 确定 userId。禁止把旧 StudyTools token、refresh token、users 表、登录页或旧 user ID 带入学海。需确认：全局 401 事件、响应包和 DTO 与学海现有 client 保持一致。

## Patch 4 — 学习数据持久化与积分边界

只映射学习行为数组、错题、考试/作文记录及可兼容的详细练习统计。学海积分、签到、连续签到、徽章、会员全部由学海服务端负责；客户端不能自行加分。需确认：学海学习记录表、事务边界、幂等键、数据保留政策、积分事件 API。

## Patch 5 — 历史数据导入与发布

用 `createMigrationPlan` 先 dry-run，再由学海服务端执行已授权用户的数据导入。旧 ID 仅用于人工/服务端映射，不能等同目标 userId。先小批量试迁、核对数量、可回滚，再开放全量导入。需确认：旧账号与学海账号的映射流程、重复记录策略、导入审计表和回滚方案。

## 目标端文件

学海侧必须先检查真实仓库，按实际架构落位。不得在未读目标仓库时预先指定或覆盖文件名。所有适配源文件可从本目录复制；本次提交不会修改源项目既有 `src/`、`server/`。
