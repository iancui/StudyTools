# 验收清单与当前自检结果

## 8 条静态自检

1. **依赖**：未新增第三方依赖；未修改 package.json/锁文件。通过（Git diff 范围核对）。
2. **旧目录**：未修改 StudyTools 原有 src/、server/。通过（本分支变更均在 xuehai-integration/）。
3. **认证**：未创建旧 users/JWT/refresh-token 认证实现。通过（集成包不包含这些模块）。
4. **进度真源**：旧 localStorage 仅作为迁移输入；运行时 API 通过学海 linguastep_token 认证，进度由服务端保存。部分通过：API 客户端已定义，服务端路由/存储仍待完成。
5. **SQL 安全**：021_chinese.sql 仅 CREATE TABLE IF NOT EXISTS；无 DROP TABLE、无外键；用户 ID VARCHAR(36)。通过（静态检查）。
6. **参数化 SQL**：目标 DB 层尚未交付，因此无法验收。未通过/待实现。
7. **路由与响应**：API 契约及 routes 注册 patch 已交付；目标 routes/chinese.ts / controllers 尚未实现。未通过/待实现。
8. **文档与人工验收**：本文件列出 5 步人工验收；因学海目标仓库不可访问，未执行。未通过/待执行。

## 5 步人工验收

1. 备份旧 StudyTools 数据库与 localStorage 导出 JSON；在测试库执行 021_chinese.sql。
2. 启动学海 pnpm workspace，确认 web/server/shared 全部构建通过。
3. 登录学海账号，打开 /chinese，确认语文学科入口、年级和课程内容可见。
4. 完成一课测验并达到 70 分，确认仅由学海积分服务发放 +1；同课重复提交不重复发分。
5. 使用家长账号查看已绑定孩子的语文进度，确认 FamilyService.assertStudentOwned 生效。

## 本次未运行

当前会话只拥有 StudyTools 仓库；没有学海目标仓库源码、数据库连接和运行环境。因此未运行 pnpm build、SQL migration、API 集成测试或上述人工验收。不得将“静态检查”描述为构建/运行通过。
