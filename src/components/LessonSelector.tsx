// 墨韵中文 前端 教材课程选择器
// ============================================================
//
// 工单 06: 让用户在三年级上册的 5 个课程间切换.
// 只在三年级 learn 模式下显示 (由 App.tsx 控制显示条件).
//
// 不引入新依赖, 仅用 React + 已有图标库 lucide-react.
// 不修改 user_progress / 登录 / 数据库.
// 选中课程后, App.tsx 调用 useTextbookLessonContent hook
// 加载该课的 chars/words/sentences, 并覆盖传给现有
// CharacterModule / WordModule / SentenceModule 的数据.

import React from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { LessonDTO } from "../api/textbook";

interface LessonSelectorProps {
  lessons: LessonDTO[];
  loading: boolean;
  error: string | null;
  selectedLessonId: string | null;
  onSelectLesson: (id: string | null) => void;
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  lessons,
  loading,
  error,
  selectedLessonId,
  onSelectLesson,
}) => {
  // 加载中: 简单 loading 提示
  if (loading) {
    return (
      <div className="p-4 text-center text-xs text-[#57606A] bg-[#FAF8F5] border border-[#E6E1D8] rounded-xl">
        正在加载课程列表...
      </div>
    );
  }

  // 加载失败: 简单错误提示 (不阻塞后续内容渲染)
  if (error) {
    return (
      <div className="p-4 text-center text-xs text-[#B83A2D] bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl">
        课程列表加载失败: {error}
      </div>
    );
  }

  // 没有课程数据: 不显示选择器 (返回 null, 后面的 Module 会走
  // 原 curriculum 本地数据)
  if (lessons.length === 0) return null;

  const selected = lessons.find((l) => l.id === selectedLessonId);

  return (
    <div className="bg-white border border-[#E6E1D8] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[#B83A2D]" />
          <h3 className="text-sm font-bold font-serif-sc text-[#24292E]">
            教材课程选择
          </h3>
          <span className="text-xs text-[#8C8273]">
            · 三年级上册 (人教版 2025秋季)
          </span>
        </div>
        {selected && (
          <button
            onClick={() => onSelectLesson(null)}
            className="text-xs text-[#57606A] hover:text-[#B83A2D] hover:underline"
          >
            返回默认课程
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {lessons.map((lesson) => {
          const active = lesson.id === selectedLessonId;
          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
                active
                  ? "bg-[#B83A2D] text-white border-[#B83A2D] font-medium"
                  : "bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border-[#DDD7CD]"
              }`}
              title={`第 ${lesson.lessonNo} 课 · ${lesson.lessonType}`}
            >
              <span className="font-mono mr-1">L{lesson.lessonNo}</span>
              {lesson.title}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex items-center gap-2 text-xs text-[#57606A] pt-2 border-t border-[#F0ECE4]">
          <ChevronDown size={13} className="text-[#B83A2D]" />
          <span>
            当前: 《<strong className="text-[#24292E]">{selected.title}</strong>》
            · 单元 {selected.unitNo} · 课型 {selected.lessonType}
          </span>
        </div>
      )}
    </div>
  );
};
