# Patch 03 — 增加语文学科独立外壳

**目标文件：** `apps/web/src/App.tsx`

在 imports 中增加：

```tsx
import { ChineseShell } from './features/chinese/ChineseShell.tsx';
```

在现有根据 `ResolvedRoute.layout` 选择外壳的 switch/if 分支中增加：

```tsx
case 'chinese':
  return (
    <ChineseShell
      user={routeContext.user}
      navigate={routeContext.navigate}
    >
      {resolved.element}
    </ChineseShell>
  );
```

其中 `routeContext` / `resolved` 替换为 App.tsx 当前 layout renderer 中的实际变量名；不要改动其它 layout。外壳只负责语文导航、页脚和身份展示；不得创建登录页、不得保存 token、不得覆盖全局 AuthModal。未登录时触发 `linguastep:auth-required` 并展示「请先登录」占位。
