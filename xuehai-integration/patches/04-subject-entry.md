# Patch 04 — 学科入口与学科偏好

## A. 学科偏好

**目标文件：** `apps/web/src/utils/subjectPreference.ts`

将 SubjectKey 扩展为：

```ts
export type SubjectKey = 'english' | 'math' | 'chinese';
```

在现有 `getSubjectHomeRoute` 的映射中增加 `chinese: '/chinese'`；`getDefaultSubject`、`setDefaultSubject`、`getActiveSubjectContext` 的类型改为 SubjectKey 并沿用现有存储键/校验方式。不要重置用户原有英语/数学偏好。

## B. 学科选择页

**目标文件：** `apps/web/src/features/shared/views/SubjectSelectView.tsx`

在数学卡片之后、卡片列表结束之前插入第三张卡片；外层 className/组件结构沿用相邻卡片：

```tsx
<SubjectEntryCard
  title="语文"
  subtitle="生字 · 词语 · 句子 · 作文"
  onClick={() => navigate('/chinese')}
/>
```

## C. 顶栏与用户身份

语文外壳用户区域显示 `user.nickname || user.username`；当 `accountType === 'PARENT'` 显示「家长」徽章；当 `roles.includes('ADMIN')` 或 `role === 'ADMIN'` 显示「ADMIN」徽章。样式复用学海现有用户标识组件，不另造身份模型。
