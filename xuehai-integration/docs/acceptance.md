# 验收清单与当前自检结果

## 8 条静态自检

1. **依赖**：未新增第三方依赖；未修改 package.json/锁文件。通过（变更均限于 xuehai-integration）。
2. **旧目录**：未修改 StudyTools 原有 src/、server/。通过（分支变更均在新增目录）。
3. **认证**：未创建旧 users/JWT/refresh-token 认证实现；web API 使用学海 linguastep_token，服务端从 req.user!.id 取身份。通过（静态检查）。
4. **进度真源**：没有在语文运行时写入 localStorage 学习进度；只保留学海 token。历史迁移读取由用户显式导出的旧数据，不自动读取浏览器存储。通过（静态检查）。
5. **SQL 安全**：021_chinese.sql 仅 CREATE TABLE IF NOT EXISTS；不含破坏性删表语句、无外键；user_id VARCHAR(36)，业务 id VARCHAR(64)。通过（静态检查）。
6. **参数化 SQL**：chineseStorage.ts 使用 mysql2 execute 参数占位符；动态表名/列名仅来自代码内固定资源白名单。通过（静态检查，未连真实数据库）。
7. **路由与响应**：routes/chinese.ts 注册 21 个端点；Controller 统一返回 { code: 200, message: 'success', data }，异常 next(e)。通过（静态核对）；尚未接入学海 routes/index.ts，需应用 patch 05。
8. **文档与人工验收**：5 个宿主 patch 文件、API 契约、数据映射和 5 步人工验收文档已交付。人工验收未执行，目标仓库未提供。部分通过。

## 5 步人工验收（待学海仓库执行）

1. 备份 StudyTools 旧 MySQL 数据库、旧浏览器进度导出 JSON 与学海数据库；在学海测试库执行 021_chinese.sql。
2. 配置两套数据库环境变量，运行 import-studytools.mjs dry-run，检查用户名映射和每类记录数量；核对后再加 --apply --confirm。
3. 启动学海 pnpm workspace，确认 shared、web、server 构建通过；应用五份 patch 后打开 /chinese。
4. 接入服务端可信题库后，完成一课测验并达到 70 分，确认学海积分服务仅发 +1；同一 requestId 重试不重复建记录，同课重复达标不重复发分。当前版本成绩由服务端题库核验；因尚未关联正式课次，暂不发积分。练习、错题、作文、测验、预习和计时请求均带幂等键。学习计时重复提交同一 sessionId 不应重复增加分钟。
5. 使用家长账号查看绑定孩子的语文进度，确认 FamilyService.assertStudentOwned 生效。

## 未运行

本次没有学海仓库源码、数据库连接和运行环境；未运行 pnpm build、tsc、SQL migration、API 集成测试或上述人工验收。StudyTools 原仓库也未执行 npm build。不得将静态检查描述为构建或运行通过。

## 已知未完成

- 页面已具备基础交互学习闭环：生字/词语练习、句子仿写、笔顺画布自我检查、预习、错题解决、间隔复习、175 道服务端核验题库、逐题反馈、作文自检、学习计时和档案；真正的手写识别、AI 作文批改、按正式课次发积分、家长聚合视图尚未完成。
- 课程数据已抽取为 TypeScript 运行时快照及 `web/features/chinese/data/curriculum.json`（约 149KB）；JSON 为 12 年级、95 条内容记录，保留 legacyId；按源项目年级分类保存，没有伪造 semester/lesson 映射。
- 家长聚合视图依赖学海 FamilyService 与权限策略，尚未实现。
- 学科偏好 patch 需在真实 subjectPreference.ts 中保留原有存储键后合并；目标文件内容未提供，不能安全生成整文件替换。
