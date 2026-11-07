# StudyTools → 学海语文学科模块

本目录是独立语文学科集成包。StudyTools 原有 `src/`、`server/` 保留不动；所有本次新增和优化均位于 `xuehai-integration/`。

## 本次已补足的功能

### 前端学习流程
- 生字学习：年级切换、拼音/部首/字义/组词/例句、朗读、掌握状态、练习结果记录。
- 笔顺练习：米字格画布、清空重写、逐笔提示和自我检查；不伪称具备手写识别。
- 词语学习：释义、词性、近反义词、例句、朗读和练习反馈。
- 句子学习：修辞/文言/病句/仿写分类、答案提示、仿写保存和完成记录。
- 作文练习：提纲、范文、写作编辑、字数/段落/句末标点自检；明确标记为规则自检，不冒充 AI 批改。
- 预习：分步骤导读、思考提示、完成状态服务端保存。
- 复习：按是否掌握、练习正确率、错误次数和最近练习时间计算复习间隔，逾期内容优先；错题可标记解决。
- 测验：前后端同源 175 道年级题库，稳定选题与选项洗牌，服务端独立核验答案、逐题反馈和错题入库。
- 学习档案：汇总掌握状态、预习、错题、测验、作文和累计学习分钟。
- 学习计时：服务端 sessionId 幂等，单次最多 240 分钟，不发积分。
- 首次引导：只使用 `xuehai:chinese:tour:v1` 保存是否看过引导。

### 服务端与安全
- 21 个语文 API 端点，所有用户身份来自学海 `req.user!.id`。
- 所有 SQL 集中于 `server/db/chineseStorage.ts`，参数化执行。
- 练习事件、测验、作文、错题、预习和计时均有幂等键/唯一键保护。
- 旧墨滴、签到、连续签到、徽章、旧用户和 refresh token 不迁移。
- 测验答案由服务端可信题库核验；当前题库是年级综合题，尚未映射真实 lessonId，因此暂不发积分。

## 交付文件与复制位置

| 本目录路径 | 学海目标路径 |
|---|---|
| `web/features/chinese/**` | `apps/web/src/features/chinese/**` |
| `web/components/SubjectEntryCard.tsx` | `apps/web/src/components/SubjectEntryCard.tsx` |
| `server/routes/chinese.ts` | `apps/server/src/backend/routes/chinese.ts` |
| `server/controllers/**` | `apps/server/src/backend/controllers/**` |
| `server/services/**` | `apps/server/src/backend/services/**` |
| `server/db/chineseStorage.ts` | `apps/server/src/backend/db/chineseStorage.ts` |
| `server/data/chineseExamBank.ts` | `apps/server/src/backend/data/chineseExamBank.ts` |
| `database/migrations/021_chinese.sql` | 学海现有迁移目录中的 `021_chinese.sql` |
| `database/legacy-import/import-studytools.mjs` | `apps/server/database/legacy-import/import-studytools.mjs` |

另需手工合并 `patches/01-shared-subjects.md` 至 `05-server-register.md`，分别修改 shared 学科模型、路由、App layout、学科入口/偏好和后端 routes/index.ts。

## 课程数据

- `web/features/chinese/data/curriculum.json`：约 149 KB，12 个年级、95 条旧课程内容记录，JSON 包含字符、词语、句子、作文、题库和预习导读。
- `web/features/chinese/data/curriculum.data.ts`：源项目兼容类型化快照，供当前页面直接使用。
- `web/features/chinese/data/examBank.ts` 与 `server/data/chineseExamBank.ts`：前后端同源 175 道可信题目。
- JSON 中的新内容 ID 按 `g{grade}-s1-l01-{c/w/s/e/q}{序号}` 生成，并保留 `legacyId`；当前页面的进度 API 仍使用旧内容 ID，以免破坏已有学习记录。
- 旧数据没有可靠的上下册和课次划分，因此 JSON 里的 `s1/l01` 是兼容性课程包 ID，不代表已核实的真实教材课次；不得用它自动发放学海积分。

## 身份、进度与积分边界

- 不创建登录、注册、会话或用户表；所有后端 userId 从学海认证中间件提供的 `req.user!.id` 获取。
- 前端只读取学海 `linguastep_token`；学习进度不写入 localStorage。
- 旧墨滴、签到、连续签到和徽章全部排除。
- 学海积分规则保持：某课测验由服务端核验且达到 70 分后，才可调用 `db.awardPoints`，scene 为 `CHINESE_QUIZ:<lessonId>`，sourceKey 为 `chinese:quiz:<lessonId>:first`。
- 当前旧题库是年级题库而非正式课次题库，无法证明 lessonId，因此目前只保存核验成绩，不发积分。待学海确认教材课次映射后再启用奖励。
- 预习、复习、练习、作文和学习计时不发积分。

## 历史数据迁移

1. 先备份旧 StudyTools 数据库、旧浏览器进度导出文件和学海数据库。
2. 在学海测试库执行 `021_chinese.sql`。
3. 确认学海目标用户已存在，并能通过旧用户名唯一匹配；脚本不会创建学海用户。
4. 配置 `STUDYTOOLS_DB_*` 和学海 `DB_*` 环境变量。
5. 默认 dry-run：

```bash
cd apps/server
node database/legacy-import/import-studytools.mjs
```

6. 如需迁移浏览器进度，先导出旧 localStorage 中 `moyun_chinese_learning_v1:user:<旧用户数值ID>` 对应的 JSON value，汇总为以完整 key 为属性名的 JSON 文件，再附加 `--progress-json=/安全路径/legacy-progress.json`。匿名全局 key 无法自动关联用户；旧自定义课程 key `moyun_custom_curriculum_data_v1` 需要单独备份，待学海确认课程管理模型后处理。
7. 检查 dry-run 的用户匹配、冲突和记录数量。只有备份、映射和数量核对通过后，才执行：

```bash
node database/legacy-import/import-studytools.mjs --apply --confirm
# 如需包含浏览器进度：
node database/legacy-import/import-studytools.mjs --progress-json=/安全路径/legacy-progress.json --apply --confirm
```

脚本按用户事务导入并使用唯一键防重；不迁移旧积分/签到/徽章，不调用 awardPoints。

## 五份宿主 Patch

- `patches/01-shared-subjects.md`：三学科共享模型。
- `patches/02-router.md`：11 个语文路由和命名页面导出。
- `patches/03-app-layout.md`：语文独立外壳。
- `patches/04-subject-entry.md`：学科选择卡片、顶栏身份、学科偏好。
- `patches/05-server-register.md`：在全局鉴权之后注册语文路由。

## 尚未完成与验收限制

真正的手写识别、AI 作文批改、正式课次积分映射、家长统计聚合和学海端到端测试尚未完成。当前会话没有学海仓库源码、数据库连接或运行环境，因此未运行 `pnpm build`、`tsc`、SQL migration 或真实 API 测试。请不要把静态审查结果当作构建通过或可上线证明。

回滚：关闭 PR，或在学海侧删除复制的语文模块文件和新增迁移（仅在尚未产生业务数据时）；不删除 StudyTools 原有目录。
