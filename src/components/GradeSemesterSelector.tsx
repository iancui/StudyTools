// 墨韵中文 前端 首页"年级 + 学期"教材选择器 (工单 14)
// ============================================================
//
// 目标:
//   - 首页可以直接选年级 + 学期, 然后看到对应教材课程列表.
//   - 不只针对三年级写死 UI, 任何年级/学期都可用.
//   - 某年级/学期暂无数据库教材数据时, 显示友好"暂无课程"状态.
//
// 不修改数据库, 不修改登录/同步/鉴权逻辑. 仅作为首页 UI 入口.

import React from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { GRADES_LIST } from "../data/curriculum";
import { GradeId, SchoolSection } from "../types/chinese";
import { LessonDTO } from "../api/textbook";

export type Semester = "上册" | "下册";

interface GradeSemesterSelectorProps {
  /** 当前选中的年级. */
  gradeId: GradeId;
  /** 当前选中的学期. */
  semester: Semester;
  /** 当前教材的课程列表 (按 grade + semester 已加载好). */
  lessons: LessonDTO[];
  lessonsLoading: boolean;
  lessonsError: string | null;
  /** 已选中的课程 ID. */
  selectedLessonId: string | null;
  onSelectGrade: (gradeId: GradeId) => void;
  onSelectSemester: (semester: Semester) => void;
  onSelectLesson: (lessonId: string) => void;
  /** 进入学习模式入口. */
  onEnterLearn?: () => void;
}

const SECTIONS: { id: SchoolSection; label: string }[] = [
  { id: "primary", label: "小学" },
  { id: "middle", label: "初中" },
  { id: "high", label: "高中" },
];

export const GradeSemesterSelector: React.FC<GradeSemesterSelectorProps> = ({
  gradeId,
  semester,
  lessons,
  lessonsLoading,
  lessonsError,
  selectedLessonId,
  onSelectGrade,
  onSelectSemester,
  onSelectLesson,
  onEnterLearn,
}) => {
  // 按 section 分组年级
  const grouped = SECTIONS.map((s) => ({
    ...s,
    grades: GRADES_LIST.filter((g) => g.section === s.id),
  }));

  return (
    <div className="bg-white border border-[#E6E1D8] rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#F0ECE4]">
        <BookOpen size={16} className="text-[#B83A2D]" />
        <h3 className="text-sm font-bold font-serif-sc text-[#24292E]">
          选择教材
        </h3>
        <span className="text-xs text-[#8C8273]">
          · 先选年级, 再选学期, 进入对应课程
        </span>
      </div>

      {/* 年级选择 (按学段分组) */}
      <div className="space-y-2.5">
        {grouped.map((sec) => (
          <div key={sec.id} className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#8C8273] uppercase tracking-wider">
              {sec.label}阶段
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sec.grades.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onSelectGrade(g.id)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    gradeId === g.id
                      ? "bg-[#B83A2D] text-white border-[#B83A2D] font-medium"
                      : "bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border-[#DDD7CD]"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 学期选择 */}
      <div className="space-y-1.5 pt-2 border-t border-[#F0ECE4]">
        <div className="text-[11px] font-bold text-[#8C8273] uppercase tracking-wider">
          学期
        </div>
        <div className="flex gap-1.5">
          {(["上册", "下册"] as Semester[]).map((s) => (
            <button
              key={s}
              onClick={() => onSelectSemester(s)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                semester === s
                  ? "bg-[#B83A2D] text-white border-[#B83A2D] font-medium"
                  : "bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border-[#DDD7CD]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 课程列表 */}
      <div className="pt-3 border-t border-[#F0ECE4] space-y-2">
        <div className="text-[11px] font-bold text-[#8C8273] uppercase tracking-wider">
          课程列表
        </div>

        {lessonsLoading && (
          <div className="p-3 text-center text-xs text-[#57606A] bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg">
            正在加载课程...
          </div>
        )}

        {lessonsError && (
          <div className="p-3 text-center text-xs text-[#B83A2D] bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
            课程加载失败: {lessonsError}
          </div>
        )}

        {!lessonsLoading && !lessonsError && lessons.length === 0 && (
          <div className="p-4 text-center text-xs text-[#8C8273] bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg">
            该年级 / 学期暂无课程内容, 请选择其他组合
          </div>
        )}

        {!lessonsLoading && !lessonsError && lessons.length > 0 && (
          <div className="space-y-1.5">
            {[...lessons]
              .sort((a, b) => a.lessonNo - b.lessonNo)
              .map((l) => {
                const active = l.id === selectedLessonId;
                return (
                  <button
                    key={l.id}
                    onClick={() => onSelectLesson(l.id)}
                    className={`w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      active
                        ? "bg-[#FAF6EE] border-[#B83A2D] text-[#24292E]"
                        : "bg-[#FAF8F5] border-[#DDD7CD] text-[#57606A] hover:bg-[#F2ECE0]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[#B83A2D] shrink-0">
                        第{l.lessonNo}课
                      </span>
                      <span className="font-serif-sc font-medium truncate">
                        《{l.title}》
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-[#8C8273]">
                        单元 {l.unitNo}
                      </span>
                      {active && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEnterLearn?.();
                          }}
                          className="px-2 py-0.5 text-[10px] bg-[#B83A2D] text-white rounded hover:bg-[#9E2F23]"
                        >
                          进入学习
                        </button>
                      )}
                      <ChevronRight size={12} className="text-[#A8A196]" />
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
