# StudyTools → 学海语文学科模块

本目录是独立语文学科集成包。StudyTools 原有 `src/`、`server/` 保留不动；所有本次新增和优化均位于 `xuehai-integration/`。

## 本次已补足的功能

### 前端学习流程
- 生字学习：年级切换（服务端保存）、拼音/部首/字义/组词/例句、朗读、掌握状态、练习结果记录。
- 笔顺练习：目标字淡水印米字格、鼠标/触屏书写、清空重写、逐笔提示和自我检查；不伪称具备手写识别。
- 词语学习：释义、词性、近反义词、例句、朗读和练习反馈。
- 句子学习：修辞/文言/病句/仿写分类、答案提示、仿写保存和完成记录。
- 作文练习：提纲、范文、写作编辑、字数/段落/句末标点自检；明确标记为规则自检，不冒充 AI 批改。
- 预习：分步骤导读、思考提示、完成状态服务端保存。
- 复习：按是否掌握、练习正确率、错误次数和最近练习时间计算复习间隔，逾期内容优先；错题可标记解决。
- 测验：前后端同源 175 道年级题库，稳定选题与选项洗牌，服务端独立核验答案，返回逐题反馈并自动归档错题；浏览器包不含标准答案和解析。
- 学习档案：汇总当前年级掌握率、测验平均分/达标率、预习、错题、作文和累计学习分钟；错题显示作答与参考答案。
- 学习计时：服务端 sessionId 幂等，单次最多 240 分钟，不发积分。
- 首次引导：只使用 `xuehai:chinese:tour:v1` 保存是否看过引导。

### 服务端与安全
- 21 个语文 API 端点，所有用户身份来自学海 `req.user!.id`；年级变更同步保存，失败时保留原年级并显示提示。
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

- `web/features/chinese/data/curriculum.json`：约 144 KB，12 个年级、95 条旧课程内容记录，包含字符、词语、句子、作文和预习导读；测验题目仅保留题干与选项，不包含 correctAnswer/explanation。
- `web/features/chinese/data/curriculum.data.ts`：源项目兼容类型化快照，供当前页面直接使用。
- `web/features/chinese/data/examBank.ts` 与 `server/data/chineseExamBank.ts`：前端公开题库仅含题干与选项，服务端保留 175 道可信答案与解析；两端题目 ID 和选项一致。
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

1. **先备份两套数据库**，备份文件放在仓库外的安全位置：

```bash
mysqldump -h "$STUDYTOOLS_DB_HOST" -P "${STUDYTOOLS_DB_PORT:-3306}" -u "$STUDYTOOLS_DB_USER" -p "$STUDYTOOLS_DB_NAME" > studytools-before-xuehai.sql
mysqldump -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p "$DB_NAME" > xuehai-before-chinese.sql
```

2. **只在学海测试库执行新表迁移**（确认 DB_NAME 指向测试库）：

```bash
mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p "$DB_NAME" < database/migrations/021_chinese.sql
```

3. 确认目标学海用户已存在，并能通过旧用户名唯一匹配；脚本不会创建学海用户。旧 StudyTools users 表没有 email 字段，因此当前只使用 username 对账。
4. 配置 `STUDYTOOLS_DB_*` 和学海 `DB_*` 环境变量。
5. 如需迁移旧浏览器进度，先导出旧 localStorage 中 `moyun_chinese_learning_v1:user:<旧用户数值ID>` 对应的 JSON value，汇总成以完整 key 为属性名的 JSON 文件，再附加 `--progress-json=/安全路径/legacy-progress.json`。匿名全局 key 无法自动关联用户；旧自定义课程 key `moyun_custom_curriculum_data_v1` 需要单独备份，待学海确认课程管理模型后处理。
6. **先运行 dry-run**。在 `apps/server/` 目录执行（脚本使用该项目已安装的 mysql2）：

```bash
node database/legacy-import/import-studytools.mjs
# 如需包含显式导出的浏览器进度：
node database/legacy-import/import-studytools.mjs --progress-json=/安全路径/legacy-progress.json
```

7. 检查每个用户的匹配状态和各类记录数量。出现未匹配或多重匹配时，先人工解决账号映射；不要自动创建学海账号。
8. 只有备份、用户映射和记录数量核对通过后，才执行正式导入：

```bash
node database/legacy-import/import-studytools.mjs --apply --confirm
# 如需包含浏览器进度：
node database/legacy-import/import-studytools.mjs --progress-json=/安全路径/legacy-progress.json --apply --confirm
```

脚本按用户事务导入并使用唯一键防重；不迁移旧积分/签到/徽章，不调用 awardPoints。若导入中途失败，先检查该用户事务是否回滚，再修复原因后重试。

## 五份宿主 Patch

- `patches/01-shared-subjects.md`：三学科共享模型。
- `patches/02-router.md`：11 个语文路由和命名页面导出。
- `patches/03-app-layout.md`：语文独立外壳。
- `patches/04-subject-entry.md`：学科选择卡片、顶栏身份、学科偏好。
- `patches/05-server-register.md`：在全局鉴权之后注册语文路由。

## 静态验证

仓库内新增不依赖第三方库的检查脚本：

```bash
node xuehai-integration/scripts/verify-chinese.mjs
```

脚本核对前后端题库 ID/选项、前端无答案泄露、确定性洗牌、课程 JSON、SQL 约束、路由数量和幂等表。当前会话没有可运行的仓库工作区，因此脚本已添加但尚未执行。

## 尚未完成与验收限制

真正的手写识别、AI 作文批改、正式课次积分映射、家长统计聚合和学海端到端测试尚未完成。当前会话没有学海仓库源码、数据库连接或运行环境，因此未运行 `pnpm build`、`tsc`、SQL migration 或真实 API 测试。请不要把静态审查结果当作构建通过或可上线证明。

回滚：关闭 PR，或在学海侧删除复制的语文模块文件和新增迁移（仅在尚未产生业务数据时）；不删除 StudyTools 原有目录。
