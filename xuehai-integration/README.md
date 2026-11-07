# StudyTools → 学海语文学科集成包

本目录按用户提供的学海技术契约组织。源项目 `src/`、`server/` 保留不动；所有新增文件均在 `xuehai-integration/`。

## 已生成的交付

- `patches/01-shared-subjects.md` 至 `05-server-register.md`：学海 5 个宿主接入补丁说明。
- `web/features/chinese/api.ts`：本学科唯一 API 层，读取学海 `linguastep_token`，统一响应、401、友好错误和积分动画事件。
- `web/features/chinese/ChineseShell.tsx`、`views/index.tsx`：语文外壳和页面路由组件骨架。
- `web/features/chinese/data/**`：从旧项目课程模块提取的类型与静态数据 TypeScript 快照，稳定课程 ID 保留。
- `server/routes/chinese.ts`、`controllers/chineseController.ts`、`services/chineseService.ts`、`db/chineseStorage.ts`：后端分层；SQL 集中在 chineseStorage。
- `server/data/chineseExamBank.ts`：服务端可信题库，服务端独立核验选择题/填空题答案，避免客户端伪造分数。
- 预习完成记录和练习事件具备服务端持久化与幂等保护。
- `database/migrations/021_chinese.sql`：独立语文表，CREATE TABLE IF NOT EXISTS、VARCHAR(36) user_id、无外键、不包含破坏性删表语句。
- `database/legacy-import/import-studytools.mjs`：默认 dry-run；正式执行需同时传 `--apply --confirm`。
- `docs/api-contract.md`、`docs/data-mapping.md`、`docs/acceptance.md`：端点、字段映射和验收说明。

## 复制到学海

| 本目录路径 | 学海目标路径 |
|---|---|
| `web/features/chinese/**` | `apps/web/src/features/chinese/**` |
| `server/routes/chinese.ts` | `apps/server/src/backend/routes/chinese.ts` |
| `server/controllers/**` | `apps/server/src/backend/controllers/**` |
| `server/services/**` | `apps/server/src/backend/services/**` |
| `server/db/chineseStorage.ts` | `apps/server/src/backend/db/chineseStorage.ts` |
| `database/migrations/021_chinese.sql` | `apps/server/database/migrations/021_chinese.sql`（按学海现有迁移目录核对） |
| `database/legacy-import/**` | `apps/server/database/legacy-import/**` |

然后按 patches 中的五项修改 shared、router、App layout、subject entry/preference 和 routes/index.ts。

## 身份、进度和积分边界

- 不创建登录/注册/会话；所有后端 userId 从学海 `req.user!.id` 获取。
- 前端只使用学海 `linguastep_token`；本地不保存学习进度。
- 墨滴、签到、连续签到、旧徽章全部不迁移。
- 只有**服务端核验通过**、达到 70 分且绑定正式 lessonId 时，后端才允许调用 `db.awardPoints`；sourceKey 为 `chinese:quiz:<lessonId>:first`。当前年级题库已复制到服务端并核验；但源题库没有正式 lessonId 映射，因此成绩可核验保存，暂不发积分。
- 预习、复习、练习、作文不发分。
- 历史迁移只按用户名/可用邮箱对账学海用户，不创建用户；默认 dry-run，不发积分。

## 数据迁移操作

1. 分别备份 StudyTools 旧 MySQL 数据库、学海数据库。
2. 导出旧用户与进度数据；确认目标学海用户已存在，且 username/email 唯一匹配。
3. 配置 `STUDYTOOLS_DB_*` 与学海 `DB_*` 环境变量。
4. 先执行 `node xuehai-integration/database/legacy-import/import-studytools.mjs`，检查每个用户的映射状态和记录数量。
5. 只有核对通过后才执行 `node .../import-studytools.mjs --apply --confirm`；脚本按用户事务导入、按唯一键 upsert，不迁移旧积分/签到/徽章，不调用 awardPoints。

## 当前限制

学海仓库源码未提供给本次会话，因此不能验证目标路由、`getDbPool()`、`db.awardPoints()` 实际签名、users 表字段、tsconfig 路径和现有 layout renderer。页面目前为导航/内容浏览骨架；笔顺画布、完整练习交互、作文批改 UI、预习/复习算法接线、档案聚合、课程 JSON 文件（当前为 TS 快照）、端到端测试仍需后续完成。不要将本包视为已经在学海构建通过的最终发布版。

回滚方式：关闭 PR 或删除学海侧复制的 `features/chinese`、语文后端文件及 `021_chinese.sql`（仅在迁移尚未产生数据时）；不删除 StudyTools 原有目录。
