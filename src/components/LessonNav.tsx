// 墨韵中文 前端 课程内导航条
// ============================================================
//
// 工单 13: 进入某一课后, 在学习模块顶部显示当前课程标题 +
// 上一课/下一课 + 生字/词语/句子切换.
//
// 设计原则:
//   1. 不修改现有 LessonSelector, CharacterModule 等组件.
//   2. 切换生字/词语/句子时不会重新选择课程 (只是切换 activeTab).
//   3. 切换上一课/下一课时, 由 App.tsx 修改 selectedLessonId,
//      useTextbookLessonContent 会自动加载新课程数据;
//      activeTab 不变 (例如正在句子就仍是句子), 不会把用户踢回首页.
//   4. 第一课时禁用"上一课", 最后一课时禁用"下一课".
//   5. 窄屏可横向滚动, 不挤压学习内容.

import React from "react";
import { ChevronLeft, ChevronRight, Type, BookText, AlignLeft } from "lucide-react";
import { MainTab } from "../types/chinese";
import { LessonDTO } from "../api/textbook";

interface LessonNavProps {
  lesson: LessonDTO;
  lessons: LessonDTO[];
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onSelectLessonId: (id: string) => void;
}

export const LessonNav: React.FC<LessonNavProps> = ({
  lesson,
  lessons,
  activeTab,
  onSelectTab,
  onSelectLessonId,
}) => {
  // 当前课程在列表中的索引 (按 lessonNo 排序后)
  const sorted = [...lessons].sort(
    (a, b) => a.lessonNo - b.lessonNo
  );
  const currentIndex = sorted.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < sorted.length - 1
      ? sorted[currentIndex + 1]
      : null;

  // 学习类型切换按钮 (生字/词语/句子). 切换不会重新选课.
  const typeButtons: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "character",
      label: "生字",
      icon: <Type size={13} />,
    },
    {
      id: "word",
      label: "词语",
      icon: <BookText size={13} />,
    },
    {
      id: "sentence",
      label: "句子",
      icon: <AlignLeft size={13} />,
    },
  ];

  return (
    <div className="bg-white border border-[#E6E1D8] rounded-xl p-3 sm:p-4 space-y-3">
      {/* 第一行: 上一课 / 当前课程标题 / 下一课 */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => prevLesson && onSelectLessonId(prevLesson.id)}
          disabled={!prevLesson}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors shrink-0 ${
            prevLesson
              ? "bg-[#FAF8F5] text-[#24292E] border-[#DDD7CD] hover:bg-[#F2ECE0] hover:border-[#B83A2D]"
              : "bg-[#F7F4EE] text-[#A8A196] border-[#E6E1D8] cursor-not-allowed"
          }`}
          title={prevLesson ? `上一课: ${prevLesson.title}` : "已是第一课"}
        >
          <ChevronLeft size={13} />
          <span className="hidden sm:inline">上一课</span>
        </button>

        <div className="flex-1 text-center min-w-0">
          <div className="text-[11px] text-[#8C8273]">
            第 {lesson.lessonNo} 课 · 单元 {lesson.unitNo}
          </div>
          <div className="font-serif-sc font-bold text-[#24292E] text-sm sm:text-base truncate">
            {lesson.title}
          </div>
        </div>

        <button
          onClick={() => nextLesson && onSelectLessonId(nextLesson.id)}
          disabled={!nextLesson}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors shrink-0 ${
            nextLesson
              ? "bg-[#FAF8F5] text-[#24292E] border-[#DDD7CD] hover:bg-[#F2ECE0] hover:border-[#B83A2D]"
              : "bg-[#F7F4EE] text-[#A8A196] border-[#E6E1D8] cursor-not-allowed"
          }`}
          title={nextLesson ? `下一课: ${nextLesson.title}` : "已是最后一课"}
        >
          <span className="hidden sm:inline">下一课</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* 第二行: 生字 / 词语 / 句子 切换 (切换不会重新选课) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide border-t border-[#F0ECE4] pt-3">
        <span className="text-[11px] text-[#8C8273] whitespace-nowrap shrink-0 mr-1">
          当前学习:
        </span>
        {typeButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => onSelectTab(btn.id)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === btn.id
                ? "bg-[#B83A2D] text-white"
                : "bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]"
            }`}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
