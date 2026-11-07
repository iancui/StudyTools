# Patch 04 — 学科入口与学科偏好

## A. 学科偏好

**目标文件：** `apps/web/src/utils/subjectPreference.ts`

将学科联合类型替换为：

```ts
export type SubjectKey = 'english' | 'math' | 'chinese';

const SUBJECT_KEYS: readonly SubjectKey[] = ['english', 'math', 'chinese'];

function isSubjectKey(value: unknown): value is SubjectKey {
  return typeof value === 'string' && SUBJECT_KEYS.includes(value as SubjectKey);
}

const SUBJECT_HOME_ROUTES: Record<SubjectKey, string> = {
  english: '/',
  math: '/math',
  chinese: '/chinese',
};

export function getSubjectHomeRoute(subject: SubjectKey): string {
  return SUBJECT_HOME_ROUTES[subject];
}
```

在原有 `getDefaultSubject`、`setDefaultSubject`、`getActiveSubjectContext` 中，将 subject 类型统一改为 `SubjectKey`，并使用 `isSubjectKey` 校验读出的值；其余现有逻辑、默认值、学科偏好存储键和用户选择均保持不变。**不要整文件替换**，因为本次未读取学海原文件，无法安全复写其存储实现。

## B. 学科选择页

**目标文件：** `apps/web/src/features/shared/views/SubjectSelectView.tsx`

先在 imports 中增加（按目标文件实际相对目录核对）：

```tsx
import { SubjectEntryCard } from '../../../components/SubjectEntryCard.tsx';
```

然后在数学卡片之后、卡片列表结束之前插入：

```tsx
<SubjectEntryCard
  title="语文"
  subtitle="生字 · 词语 · 句子 · 作文"
  onClick={() => navigate('/chinese')}
/>
```

组件源文件已交付：`xuehai-integration/web/components/SubjectEntryCard.tsx`。

## C. 顶栏与用户身份

语文外壳用户区域显示 `user.nickname || user.username`；当 `accountType === 'PARENT'` 显示「家长」徽章；当 `roles.includes('ADMIN')` 或 `role === 'ADMIN'` 显示「ADMIN」徽章。样式复用学海现有用户标识组件，不另造身份模型。
