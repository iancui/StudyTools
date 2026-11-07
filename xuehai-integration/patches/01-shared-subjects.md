# Patch 01 — 扩展共享学科模型

**目标文件：** `packages/shared/src/index.ts`

将原有 Subject 常量和类型区替换为以下完整片段；保留同文件中的通用 `counterKey`、`parseCounterKey`、`SubjectSummary` 等逻辑，不增加学科专属分支。

```ts
export const SUBJECTS = ['english', 'math', 'chinese'] as const;
export type Subject = (typeof SUBJECTS)[number];
export type RouteSubject = Subject | 'shared';

export const SUBJECT_LABELS: Record<Subject, string> = {
  english: '英语',
  math: '数学',
  chinese: '语文',
};

export const SUBJECT_PATHS: Record<Subject, string> = {
  english: '/',
  math: '/math',
  chinese: '/chinese',
};
```

**验收：** TypeScript 的 Subject 联合类型包含三学科；RouteSubject 仍允许 shared；既有 counter key 编码/解析逻辑不变。
