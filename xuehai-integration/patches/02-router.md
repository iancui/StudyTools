# Patch 02 — 注册语文路由

**目标文件：** `apps/web/src/router/routes.tsx`

1. 在 `RouteLayout` 联合类型末尾增加 `'chinese'`。
2. 在 `getRouteSubject(path)` 中增加以下判断，放在英语默认分支之前：

```ts
if (path === '/chinese' || path.startsWith('/chinese/')) return 'chinese';
```

3. 从本集成包复制页面到 `apps/web/src/features/chinese/views/` 后，在 routes.tsx 顶部按命名导出导入：

```ts
import { ChineseHomeView } from '../features/chinese/views/ChineseHomeView.tsx';
import { ChineseCharactersView } from '../features/chinese/views/ChineseCharactersView.tsx';
import { ChineseCharacterPracticeView } from '../features/chinese/views/ChineseCharacterPracticeView.tsx';
import { ChineseWordsView } from '../features/chinese/views/ChineseWordsView.tsx';
import { ChineseSentencesView } from '../features/chinese/views/ChineseSentencesView.tsx';
import { ChineseEssaysView } from '../features/chinese/views/ChineseEssaysView.tsx';
import { ChinesePreviewView } from '../features/chinese/views/ChinesePreviewView.tsx';
import { ChineseReviewView } from '../features/chinese/views/ChineseReviewView.tsx';
import { ChineseExamView } from '../features/chinese/views/ChineseExamView.tsx';
import { ChineseArchiveView } from '../features/chinese/views/ChineseArchiveView.tsx';
import { ChineseSettingsView } from '../features/chinese/views/ChineseSettingsView.tsx';
```

4. 在 shared/admin 路由判断之后、英语兜底之前增加：

```ts
if (path === '/chinese' || path.startsWith('/chinese/')) {
  return { layout: 'chinese', subject: 'chinese', element: renderChineseView(path, ctx) };
}
```

5. 在文件中（紧邻现有 `renderAdminView` 等 render helper）增加完整路由映射：

```tsx
function renderChineseView(path: string, ctx: RouteContext): React.ReactNode {
  if (path === '/chinese' || path === '/chinese/') return <ChineseHomeView ctx={ctx} />;
  if (path === '/chinese/characters') return <ChineseCharactersView ctx={ctx} />;
  if (path === '/chinese/characters/practice') return <ChineseCharacterPracticeView ctx={ctx} />;
  if (path === '/chinese/words') return <ChineseWordsView ctx={ctx} />;
  if (path === '/chinese/sentences') return <ChineseSentencesView ctx={ctx} />;
  if (path === '/chinese/essays') return <ChineseEssaysView ctx={ctx} />;
  if (path === '/chinese/preview') return <ChinesePreviewView ctx={ctx} />;
  if (path === '/chinese/review') return <ChineseReviewView ctx={ctx} />;
  if (path === '/chinese/exam') return <ChineseExamView ctx={ctx} />;
  if (path === '/chinese/archive') return <ChineseArchiveView ctx={ctx} />;
  if (path === '/chinese/settings') return <ChineseSettingsView ctx={ctx} />;
  return <ChineseHomeView ctx={ctx} />;
}
```

**说明：** 不重写 resolveRoute/getRouteSubject 其余逻辑；路径跳转统一使用 ctx.navigate。
