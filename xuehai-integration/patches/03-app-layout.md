# Patch 03 — 增加语文学科独立外壳

**目标文件：** `apps/web/src/App.tsx`

在现有 layout renderer（根据 ResolvedRoute.layout 选择页面外壳的位置）增加 `chinese` 分支：

```tsx
case 'chinese':
  return <ChineseShell user={routeContext.user}>{resolved.element}</ChineseShell>;
```

在 imports 中增加：

```tsx
import { ChineseShell } from './features/chinese/ChineseShell.tsx';
```

从本集成包复制 `web/features/chinese/ChineseShell.tsx` 至目标路径。外壳只负责语文导航、页脚和用户身份展示；不得创建登录页、不得存储 token、不得覆盖全局 AuthModal。未登录时触发全局 `linguastep:auth-required` 事件并显示“请先登录”占位。

**注意：** 学海 App.tsx 未提供给本任务，不能给出整文件替换内容；只在现有 layout switch 中增加上述 case，保留其它 layout。
