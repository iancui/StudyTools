# StudyTools / 墨韵中文 项目审查报告

> 审查时间：2026-10-05
> 审查范围：前端 React + Vite、后端 Node.js + TypeScript + Express + MySQL 5.7、GitHub Actions
> 审查方式：静态代码扫描 + IDE TypeScript 诊断（Chat Mode 无法直接执行终端构建）

---

## 1. 当前项目架构

```
StudyTools/
├── .github/workflows/deploy.yml      # GitHub Pages 部署（仅前端）
├── .env.example                       # 仅前端 AI Studio 变量
├── .gitignore                         # 已忽略 .env*、dist、node_modules
├── index.html                         # Vite 入口
├── package.json                       # 前端依赖
├── vite.config.ts                     # base: '/StudyTools/'
├── tsconfig.json                      # 前端 TS 配置（noEmit, jsx: react-jsx）
├── metadata.json                      # AI Studio 元数据遗留
├── bun.lock + package-lock.json       # 双 lockfile（不一致）
│
├── src/                               # 前端源码
│   ├── main.tsx                       # React 19 入口
│   ├── App.tsx                        # 顶层状态 + 路由切换
│   ├── components/                     # 11 个业务组件
│   ├── data/curriculum.ts             # 课程主数据（GRADES_LIST/CHARACTERS_DATA/...）
│   ├── data/grades.ts                 # 仅 re-export GRADES_LIST
│   ├── types/{chinese,progress}.ts    # 类型定义
│   └── utils/{storage,curriculumManager,speech}.ts
│
└── server/                            # 后端
    ├── package.json                   # express5/bcryptjs/mysql2/dotenv/helmet/cors
    ├── tsconfig.json                  # strict, NodeNext, outDir dist
    └── src/
        ├── app.ts                     # helmet + cors + express.json
        ├── server.ts                  # 监听 PORT
        ├── config/{database,auth}.ts  # mysql2 pool / JWT
        ├── controllers/auth.controller.ts
        ├── services/auth.service.ts
        ├── repositories/{user,refresh-token}.repository.ts
        ├── middleware/auth.middleware.ts
        ├── routes/{auth,health}.routes.ts
        └── utils/token.ts             # crypto.randomBytes + sha256
```

**前端**：单页 React 19 应用，所有学习进度持久化在 `localStorage`（key：`moyun_chinese_learning_v1`、`moyun_custom_curriculum_data_v1`），无任何后端调用。
**后端**：Express 5 API，已实现 `/api/auth/register|login|refresh|logout|me` 与 `/api/health`，使用 Bearer JWT Access Token + 数据库存储 Refresh Token 的 sha256 hash。
**前后端边界**：目前完全分离，前端零 API 调用，云同步尚未打通。

---

## 2. 已完成能力

### 前端
- 全学段（g1–g12）课程数据结构（生字/词语/句子/作文/测验）
- 生字、词语、句子、作文、预习、复习、测验、档案、配置 9 大模块
- localStorage 进度持久化 + 自定义课程导入导出
- Web Speech API 中文朗读、笔顺书写、文人进阶与徽章系统

### 后端
- 用户注册（bcryptjs cost=12）、登录、登出、刷新、`/me`
- JWT Access Token（15m）+ Refresh Token（30d，sha256 入库）
- 注册时 `users` + `user_progress` 事务插入
- `requireAuth` 中间件解析 Bearer
- `/api/health` 数据库探活

### 数据库（据用户描述已创建）
- users / user_progress / user_character_progress / user_word_progress / user_sentence_progress / user_wrong_questions / exam_records / essay_practices / checkin_records / user_badges / refresh_tokens

### CI/CD
- GitHub Actions 自动构建前端并部署到 GitHub Pages（`base: '/StudyTools/'`）

---

## 3. 当前存在的问题

### P0 致命（阻塞构建/运行）

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| P0-1 | `server/src/config/auth.ts` 引用 `jsonwebtoken`，但 `server/package.json` 未声明该依赖，`server/node_modules/jsonwebtoken` 也不存在 | server | 后端 `tsc` 必然报 TS2307，`node dist/server.js` 启动即崩，认证全链路不可用 |
| P0-2 | `@types/jsonwebtoken` 同样缺失 | server | TS 类型解析失败，加剧 P0-1 |

### P1 高优先级

| # | 问题 | 位置 | 说明 |
|---|------|------|------|
| P1-1 | 仓库无任何 `.sql` 迁移文件 | 全仓库 | 数据库 schema 未版本化，无法复现环境，新开发者无法启动 |
| P1-2 | 缺少 `server/.env.example` | server | 没人知道需要 `DB_HOST/DB_USER/DB_PASSWORD/DB_NAME/JWT_ACCESS_SECRET/PORT/DB_CONNECTION_LIMIT` |
| P1-3 | CORS `origin: true` + `credentials: true` | server/src/app.ts | 允许任意站点携带凭证发起请求，CSRF/Token 泄露风险 |
| P1-4 | `/api/auth/login`、`/register` 无限流 | server | 暴力破解、注册轰炸风险 |
| P1-5 | `express.json()` 无 body 大小限制 | server/src/app.ts | 大 payload DoS 风险 |
| P1-6 | `JWT_ACCESS_SECRET` 仅在调用时校验，启动时不校验 | server/src/config/auth.ts | 配置缺失时报错时机晚，定位困难 |
| P1-7 | Refresh Token 不轮换 | server/src/services/auth.service.ts `refreshAccessToken` | 被盗后无法检测，违反 OAuth 安全最佳实践 |
| P1-8 | 前端零 API 集成 | src/ | 后端虽已搭好，云同步这一核心目标完全未连接 |
| P1-9 | GitHub Actions 不构建 server | .github/workflows/deploy.yml | 后端类型错误不会在 CI 暴露，回归风险高 |
| P1-10 | `findUserByUsername` 用 `pool.query`，`createRefreshToken` 用 `pool.execute`，风格不一致 | server/src/repositories/*.ts | 维护成本与潜在 prepared statement 行为差异 |

### P2 中优先级

| # | 问题 | 位置 |
|---|------|------|
| P2-1 | `storage.ts` 导入 `EssayPracticeRecord`、`ExamRecord` 但未直接使用 | src/utils/storage.ts |
| P2-2 | `UserProgress.todayStudyMinutes`、`lastStudyTimestamp` 在 App.tsx 中从不更新 | src/types/progress.ts、src/App.tsx |
| P2-3 | 前端 `package.json` 仍残留 `express`、`@google/genai` 依赖（AI Studio 遗留） | package.json |
| P2-4 | `vite.config.ts` 仍保留 `DISABLE_HMR` 的 AI Studio 特殊逻辑 | vite.config.ts |
| P2-5 | `metadata.json` 标注 `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`，与当前架构不符 | 根目录 |
| P2-6 | 同时存在 `bun.lock` 与 `package-lock.json`，包管理器未统一 | 根目录 |
| P2-7 | `auth.controller.ts` 格式极度稀疏（每参数独占一行），与全仓库风格不符 | server/src/controllers/auth.controller.ts |
| P2-8 | 无输入验证库（zod/joi），仅 service 层手工 trim/length 校验 | server |
| P2-9 | 无全局错误处理中间件，错误处理散落在每个 controller | server/src/app.ts |
| P2-10 | 无请求日志中间件（morgan/winston） | server |
| P2-11 | 密码策略过弱（仅 6 位，无复杂度） | server/src/services/auth.service.ts |
| P2-12 | `registerUser` 未校验用户名字符集 | server/src/services/auth.service.ts |
| P2-13 | 登录时 `createRefreshToken` 不在事务中 | server/src/services/auth.service.ts |
| P2-14 | `data/grades.ts` 仅为 re-export，冗余 | src/data/grades.ts |
| P2-15 | 前后端均无测试文件（无 `.test.ts`/`.spec.ts`） | 全仓库 |

### P3 低优先级

| # | 问题 | 位置 |
|---|------|------|
| P3-1 | `App.tsx` 在 `setProgress` updater 内调用 `saveProgress`，副作用写在渲染阶段 | src/App.tsx |
| P3-2 | `index.html` 无 favicon | 根目录 |
| P3-3 | `server/package.json` 的 `"main": "index.js"` 指向不存在的文件 | server/package.json |
| P3-4 | 前端 `tsconfig.json` 无 `include`，隐式包含全目录 | tsconfig.json |
| P3-5 | `main.tsx` 用 `import App from './App.tsx'`，依赖 `allowImportingTsExtensions`，非标准 | src/main.tsx |
| P3-6 | Footer 文案硬编码 | src/App.tsx |
| P3-7 | 无 PWA manifest | 根目录 |
| P3-8 | `helmet` 默认 CSP 对纯 API 无害但对前端无意义 | server/src/app.ts |

---

## 4. 安全问题

1. **CORS 过宽**：`origin: true, credentials: true`，任意域名可携带凭证调用 API。虽然使用 Bearer Token（非 Cookie），CSRF 风险降低，但仍应配置白名单。
2. **无限流**：登录/注册接口可被暴力枚举，建议接入 `express-rate-limit`。
3. **Refresh Token 不轮换**：被盗后无法检测，建议 refresh 时下发新 token 并撤销旧 token（必要时检测重用）。
4. **密码策略弱**：仅 6 位长度，建议至少 8 位 + 复杂度。
5. **JWT Secret 启动不校验**：应启动时即 fail-fast。
6. **无 Helmet 之外的安全头定制**：默认值可用，但未针对 API 调优。
7. **敏感信息**：`.gitignore` 已正确排除 `.env*`（保留 `.env.example`）、`server/.env`，未发现密钥硬编码。
8. **错误信息泄露**：`console.error(error)` 直接打印，部分错误对象可能含敏感栈，生产环境建议脱敏。

---

## 5. 数据库问题

1. **Schema 未纳入版本控制**：无 `migrations/` 或 `schema.sql`，无法复现。
2. **MySQL 5.7 兼容性**：当前 SQL（`utf8mb4`、`NOW()`、`LIMIT 1`、参数化占位符）均兼容 5.7，无风险。
3. **事务使用不完整**：仅 `createUser` 用事务；登录写 refresh_tokens、refresh 时撤销旧 token 等未事务化。
4. **`user_progress` 插入仅给 `user_id`**：若 schema 中 `selected_grade` 等字段为 NOT NULL 无默认值，注册会失败（需对照 schema 确认）。
5. **`pool.query` vs `pool.execute`**：建议统一为 `execute`（参数化更严格）。
6. **无连接错误处理**：DB 不可用时 `pool` 在请求时才报错，建议启动探活 + 健康检查。
7. **无索引信息**：`refresh_tokens.token_hash`、`users.username` 应有唯一索引，但无 schema 无法确认。
8. **字段映射重叠**：`users.selected_grade` 与 `user_progress` 表的 `selected_grade` 可能冗余，需明确单一来源。

---

## 6. 前后端问题

1. **前端零 API 调用**：`src/` 中无 `fetch`/`axios`/API client，云同步未实现。
2. **localStorage 与 DB schema 不对齐**：`UserProgress` 字段（`inkDrops`/`streakDays`/`checkInHistory`/`masteredCharacterIds` 等）需映射到 `user_progress`+`user_character_progress` 等多表，目前无任何映射代码。
3. **认证状态未在前端管理**：无 AuthContext、无 token 存储、无 `Authorization` 头注入。
4. **Vite base 配置正确**：`/StudyTools/` 与 GitHub Pages 一致。
5. **前端构建仅做类型检查**：`lint: tsc --noEmit`，但 `tsconfig` 无 `include`，可能误检 server 文件。
6. **AI Studio 遗留**：`@google/genai`、`metadata.json`、`DISABLE_HMR` 等遗留代码与当前架构不符。

---

## 7. 当前技术债务

| 类别 | 内容 |
|------|------|
| 阻塞性 | server 缺 `jsonwebtoken` 依赖（P0） |
| 版本化 | DB schema 未入库 |
| 一致性 | `pool.query`/`pool.execute` 混用；前后端 Express 版本不同（前端残留 express 4.x，后端 express 5.x） |
| 遗留代码 | AI Studio 相关依赖、metadata、DISABLE_HMR |
| 死字段 | `todayStudyMinutes`、`lastStudyTimestamp` |
| 死导入 | `storage.ts` 的 `EssayPracticeRecord`、`ExamRecord` |
| 测试缺失 | 无任何单元/集成测试，无测试框架配置 |
| 文档缺失 | 根目录无 README，server 无 .env.example |
| CI 不全 | 仅前端 CI，后端无 CI |
| 包管理 | `bun.lock` 与 `package-lock.json` 并存 |

---

## 8. 推荐开发路线

```
阶段 0（立即，0.5 天）
  修复 P0：补 jsonwebtoken 依赖，server 能 build/start

阶段 1（1 周）
  - DB schema.sql 入库 + server/.env.example
  - server CI（GitHub Actions 增加 server build job）
  - 限流 + CORS 白名单 + body size 限制
  - JWT_ACCESS_SECRET 启动校验
  - Refresh Token 轮换

阶段 2（2 周）
  - 前端 API client + AuthContext + token 持久化
  - 登录/注册页面接入 /api/auth/*
  - 进度同步：localStorage ↔ /api/progress（首次拉取 + 增量推送）

阶段 3（2 周）
  - 多设备同步冲突解决（last-write-wins 或时间戳合并）
  - 离线队列（IndexedDB 暂存未同步变更）
  - 后端 progress/character/word/sentence repositories 补齐

阶段 4（后续）
  - AI 能力（作文批改、生字讲解）接入 @google/genai 或国产 LLM
  - PWA / 移动端适配
  - 测试体系（Vitest + Supertest）
```

---

## 9. 第一阶段应该马上做什么

1. **修复 P0-1 / P0-2**：在 `server/package.json` 添加 `"jsonwebtoken": "^9.0.2"` 与 `"@types/jsonwebtoken": "^9.0.7"`，执行 `cd server && npm install`，再 `npm run build` 验证。
2. **新增 `server/.env.example`**：列出 `PORT`、`DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`、`DB_CONNECTION_LIMIT`、`JWT_ACCESS_SECRET` 占位。
3. **新增 `server/migrations/schema.sql` 或 `server/db/schema.sql`**：将 11 张表的 DDL 入库，含索引与外键。

---

## 10. 暂时不要做什么

1. 不要大规模重构 `auth.controller.ts` 的格式（先让构建通过）。
2. 不要替换 Express 5 → 4 或反向（保持现状，先稳定）。
3. 不要引入 Prisma/TypeORM 等 ORM（当前 mysql2 + 手写 SQL 足够，避免迁移成本）。
4. 不要引入 zod/joi 等验证库（除非限流/CORS 修完后确认需要）。
5. 不要先做 AI 能力（云同步未通，AI 无落地场景）。
6. 不要前端引入状态管理库（Redux/Zustand），当前单组件树状态足够。
7. 不要更换包管理器（先解决 bun.lock/package-lock.json 二选一即可，不急）。
8. 不要删除任何看似废弃的字段（`todayStudyMinutes` 等）除非确认无用。