import type { ReactNode } from 'react';
import type { RouteContext } from '../../../router/routes.tsx';
import { GRADES_LIST, CHARACTERS_DATA, WORDS_DATA, SENTENCES_DATA, ESSAYS_DATA, EXAMS_DATA } from '../data/index.ts';

interface ViewProps { ctx: RouteContext }
function Frame({ ctx, title, subtitle, children }: { ctx: RouteContext; title: string; subtitle: string; children?: ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-[#E7EEF8] bg-white p-6 shadow-sm">
        <p className="text-sm text-[#7890B0]">CHINESE · 语文学习</p>
        <h1 className="mt-2 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-[#607797]">{subtitle}</p>
      </div>
      {children}
      <div className="flex flex-wrap gap-2">
        {GRADES_LIST.map((grade) => (
          <span key={grade.id} className="rounded-full border border-[#E7EEF8] bg-white px-3 py-1 text-xs">{grade.name}</span>
        ))}
      </div>
      <button type="button" onClick={() => ctx.navigate('/chinese')} className="text-sm text-blue-700">返回语文首页</button>
    </section>
  );
}
function GradeContent({ ctx, title, subtitle, items }: { ctx: RouteContext; title: string; subtitle: string; items: unknown[] }) {
  return <Frame ctx={ctx} title={title} subtitle={subtitle}>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 36).map((value, index) => {
        const item = value as Record<string, unknown>;
        return <article key={String(item.id || index)} className="rounded-2xl border border-[#E7EEF8] bg-white p-4">
          <h2 className="font-semibold">{String(item.char || item.word || item.title || item.question || '学习内容')}</h2>
          <p className="mt-1 text-xs text-[#607797]">{String(item.pinyin || item.categoryLabel || item.difficulty || '')}</p>
          <p className="mt-2 line-clamp-3 text-sm text-[#526B8D]">{String(item.exampleSentence || item.definition || item.originalText || item.promptText || item.question || '')}</p>
        </article>;
      })}
    </div>
  </Frame>;
}

export function ChineseHomeView({ ctx }: ViewProps) {
  return <Frame ctx={ctx} title="语文学习首页" subtitle="生字 · 词语 · 句子 · 作文 · 预习 · 复习 · 测验">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ['生字学习','/chinese/characters'],['笔顺练习','/chinese/characters/practice'],
        ['词语学习','/chinese/words'],['句子学习','/chinese/sentences'],
        ['作文练习','/chinese/essays'],['预习','/chinese/preview'],
        ['复习','/chinese/review'],['测验','/chinese/exam'],
        ['学习档案','/chinese/archive'],['学习设置','/chinese/settings'],
      ].map(([label,path]) => <button key={path} type="button" onClick={() => ctx.navigate(path)}
        className="rounded-2xl border border-[#E7EEF8] bg-white p-5 text-left shadow-sm hover:bg-[#F4F8FF]">{label}</button>)}
    </div>
  </Frame>;
}
export function ChineseCharactersView({ctx}:ViewProps) { return <GradeContent ctx={ctx} title="生字学习" subtitle="汉字、拼音、部首、笔画与例句" items={CHARACTERS_DATA.g3}/>; }
export function ChineseCharacterPracticeView({ctx}:ViewProps) { return <Frame ctx={ctx} title="笔顺与书写练习" subtitle="书写画布和逐笔反馈接入待完成。"/>; }
export function ChineseWordsView({ctx}:ViewProps) { return <GradeContent ctx={ctx} title="词语学习" subtitle="词义、词性、近反义词与例句" items={WORDS_DATA.g3}/>; }
export function ChineseSentencesView({ctx}:ViewProps) { return <GradeContent ctx={ctx} title="句子学习" subtitle="修辞赏析、文言名句、病句诊治与仿写" items={SENTENCES_DATA.g3}/>; }
export function ChineseEssaysView({ctx}:ViewProps) { return <GradeContent ctx={ctx} title="作文练习" subtitle="审题、提纲、范文与写作记录" items={ESSAYS_DATA.g3}/>; }
export function ChinesePreviewView({ctx}:ViewProps) { return <Frame ctx={ctx} title="课前预习" subtitle="预习流程与服务端记录接线待完成。"/>; }
export function ChineseReviewView({ctx}:ViewProps) { return <Frame ctx={ctx} title="智能复习" subtitle="复习算法与服务端统计接线待完成。"/>; }
export function ChineseExamView({ctx}:ViewProps) { return <GradeContent ctx={ctx} title="单元测验" subtitle="题目展示已接入课程快照；答题交互与提交待完成。" items={EXAMS_DATA.g3}/>; }
export function ChineseArchiveView({ctx}:ViewProps) { return <Frame ctx={ctx} title="学习档案" subtitle="进度、错题、测验和作文记录由学海服务端提供，聚合视图待完成。"/>; }
export function ChineseSettingsView({ctx}:ViewProps) { return <Frame ctx={ctx} title="语文学习设置" subtitle="年级、学期与教材版本设置接线待完成。"/>; }
