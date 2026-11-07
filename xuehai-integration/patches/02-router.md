# Patch 02 — 注册语文路由

**目标文件：** `apps/web/src/router/routes.tsx`

1. 在 `RouteLayout` 联合类型增加 `'chinese'`。
2. 在 `getRouteSubject(path)` 中增加：

```ts
if (path === '/chinese' || path.startsWith('/chinese/')) return 'chinese';
```

3. 在 imports 中从本集成包的命名导出文件导入：

```ts
import {
  ChineseHomeView,
  ChineseCharactersView,
  ChineseCharacterPracticeView,
  ChineseWordsView,
  ChineseSentencesView,
  ChineseEssaysView,
  ChinesePreviewView,
  ChineseReviewView,
  ChineseExamView,
  ChineseArchiveView,
  ChineseSettingsView,
} from '../features/chinese/views/index.tsx';
```

4. 在 shared/admin 判断之后、英语兜底之前增加：

```ts
if (path === '/chinese' || path.startsWith('/chinese/')) {
  return { layout: 'chinese', subject: 'chinese', element: renderChineseView(path, ctx) };
}
```

5. 在现有 render helper 附近增加：

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

**说明：** 现有 RouteContext 的真实类型/变量以目标文件为准；不要重写其他路由分支。页面统一通过 `ctx.navigate` 跳转。
