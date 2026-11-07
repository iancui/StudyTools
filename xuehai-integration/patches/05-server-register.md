# Patch 05 — 注册语文后端路由

**目标文件：** `apps/server/src/backend/routes/index.ts`

在现有 math routes import 附近增加：

```ts
import { registerChineseRoutes } from './chinese.ts';
```

在鉴权中间件已经挂载、且现有 `registerMathRoutes(apiRouter)` 之后，`registerAdminRoutes(apiRouter)` 之前增加：

```ts
// 语文学习域：生字、词语、句子、作文、预习、复习、测验
registerChineseRoutes(apiRouter);
```

**不得**把注册调用放到 `apiRouter.use(authMiddleware)` 之前；不得在语文路由/Controller 再解析 token。学海 `req.user!.id` 是唯一用户身份来源。

路由实现复制到 `apps/server/src/backend/routes/chinese.ts`。所有 SQL 只能位于 `apps/server/src/backend/db/chineseStorage.ts`；Controller 使用类 + 静态方法，异常统一 `next(e)`。
