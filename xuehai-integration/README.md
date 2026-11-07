# 墨韵中文 × 学海集成包

本目录是与宿主项目隔离的集成边界。原项目 `src/`、`server/` 不在本次提交中修改；不新增依赖。

## 已核实的源项目事实

- 课程数据来自 `src/data/curriculum.ts`，导出年级、汉字、词语、句子、作文、测验和默认课程配置。
- 核心类型位于 `src/types/chinese.ts`、`src/types/progress.ts`。
- 旧浏览器存储键为 `moyun_chinese_learning_v1`，并可按旧用户数值 ID 分区。
- 旧 API 进度摘要：`GET/PUT /api/progress`。
- 旧详细进度：`/api/progress/characters`、`/api/progress/words`、`/api/progress/sentences`。
- 旧数据库快照位于 `server/migrations/schema.sql`，其中用户主键和进度 user_id 为 unsigned BIGINT；该结构不能直接迁入学海。

详见 [SOURCE_AUDIT.md](./SOURCE_AUDIT.md)。

## 宿主边界

学海是身份、会话、用户 ID、权限、积分、签到、会员及数据持久化的唯一权威系统。本集成包：

- 不创建登录、注册、JWT、refresh-token 或用户表；
- 不实现积分、签到、连续签到、徽章奖励或会员等级；
- 不读取/写入 localStorage；
- 不将旧系统的用户数值 ID 当作学海 user_id；
- 不创建/修改 `src/` 或 `server/`；
- 不假设学海路由、数据库表名或响应包装格式。宿主必须显式注入请求函数和路由映射。

## 接入

1. 将本目录复制到学海仓库。
2. 从 `src/curriculum.ts` 导入课程快照；课程内容保持源 ID，不重编号。
3. 在学海已认证的服务端/客户端请求层注入 `HostRequest`，由学海负责会话与权限。
4. 将学海已确认的 API 路由传入 `createMoyunApi`；不得直接复用旧系统认证路由。
5. 用 `src/migration.ts` 做纯内存 dry-run，先输出映射统计和冲突；确认后再调用学海正式写入流程。
6. 对照 `PATCHSET.md` 和 `VERIFY.md` 完成宿主侧接线与验收。

## 当前阻塞

学海目标仓库的文件树、API 路由定义、统一响应 DTO、用户 ID 类型和 SQL schema 尚未提供/核实。因此本包不生成会假定这些事实的宿主端补丁或可直接执行的 SQL。对应的五类接入点和待确认项列在 `PATCHSET.md`。
