import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, Volume2, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GradeId, CharacterItem, WordItem } from '../types/chinese';
import { PREVIEW_GUIDES } from '../data/curriculum';
import { speakChinese } from '../utils/speech';

interface PreviewModeProps {
  gradeId: GradeId;
  charactersList?: CharacterItem[];
  wordsList?: WordItem[];
  previewedItemIds: string[];
  onCompletePreview: (guideId: string) => void;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({
  gradeId,
  charactersList = [],
  wordsList = [],
  previewedItemIds,
  onCompletePreview
}) => {
  const guide = PREVIEW_GUIDES[gradeId] || PREVIEW_GUIDES['g3'];
  const characters = charactersList;
  const words = wordsList;

  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const isCompleted = previewedItemIds.includes(`prev-${gradeId}`);

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleFinish = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#B83A2D', '#D97706', '#16A34A', '#24292E']
    });
    onCompletePreview(`prev-${gradeId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1B4D3E] bg-[#EBF7EE] px-2.5 py-0.5 rounded border border-[#C6E9CC]">
              课前三步预习法
            </span>
            <h2 className="text-xl font-bold font-serif-sc text-[#24292E]">
              {guide.lessonTitle}
            </h2>
          </div>
          <p className="text-xs text-[#57606A] mt-1">
            字词初探 · 要点先知 · 思考探究 · 做好充分课前储备
          </p>
        </div>

        <button
          onClick={handleFinish}
          disabled={isCompleted}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            isCompleted
              ? 'bg-[#EBF7EE] text-[#16A34A] border border-[#C6E9CC]'
              : 'bg-[#B83A2D] text-white hover:bg-[#9E2F23] shadow-xs'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={14} />
              <span>已完成本单元预习 (+25墨滴)</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              <span>打卡完成预习 (+25墨滴)</span>
            </>
          )}
        </button>
      </div>

      {/* STEP 1: CHARACTERS & WORDS QUICK READ */}
      <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#FAF6EE] text-[#B83A2D] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-serif-sc text-base font-bold text-[#24292E]">
              声韵字词早知道（点击听音）
            </h3>
          </div>
          <span className="text-xs text-[#8C8273]">
            重点感知生字拼音、声调与规范组词
          </span>
        </div>

        {/* Characters Bar */}
        <div>
          <span className="text-xs font-semibold text-[#8C8273] block mb-2">本课生字：</span>
          <div className="flex flex-wrap gap-2.5">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => speakChinese(`${c.char}，${c.pinyin}`)}
                className="group flex items-center gap-2 p-2 rounded-lg bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#B83A2D] hover:bg-white transition-all"
                title="点击朗读汉字与读音"
              >
                <div className="w-8 h-8 rounded border border-[#B83A2D]/30 mizige-bg flex items-center justify-center font-serif-sc text-lg font-bold text-[#24292E]">
                  {c.char}
                </div>
                <div className="text-left">
                  <div className="text-xs font-mono font-medium text-[#B83A2D]">{c.pinyin}</div>
                  <div className="text-[11px] text-[#8C8273]">{c.radical}部</div>
                </div>
                <Volume2 size={12} className="text-[#A8A196] group-hover:text-[#B83A2D] ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Words Bar */}
        <div>
          <span className="text-xs font-semibold text-[#8C8273] block mb-2">核心词汇：</span>
          <div className="flex flex-wrap gap-2">
            {words.map((w) => (
              <button
                key={w.id}
                onClick={() => speakChinese(w.word)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#B83A2D] hover:bg-white text-xs text-[#24292E] transition-all"
              >
                <span className="font-semibold">{w.word}</span>
                <span className="text-[#8C8273] font-mono text-[11px]">{w.pinyin}</span>
                <Volume2 size={12} className="text-[#A8A196] group-hover:text-[#B83A2D]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 2: GUIDED OVERVIEW STEPS */}
      <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE4] pb-3">
          <span className="w-5 h-5 rounded-full bg-[#FAF6EE] text-[#B83A2D] text-xs font-bold flex items-center justify-center">
            2
          </span>
          <h3 className="font-serif-sc text-base font-bold text-[#24292E]">
            文本泛读与要点导引
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guide.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EDE7DD] space-y-2 flex flex-col justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-[#24292E] flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#D97706]" />
                  <span>{step.title}</span>
                </h4>
                <p className="text-xs text-[#57606A] mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E6DFD1] space-y-1">
                <span className="text-[11px] font-semibold text-[#8C8273]">核心关注点：</span>
                <ul className="text-xs text-[#24292E] space-y-0.5">
                  {step.keyPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1">
                      <span className="text-[#B83A2D] font-bold">·</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 3: GUIDED QUESTIONS WITH SELF-REVEAL */}
      <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE4] pb-3">
          <span className="w-5 h-5 rounded-full bg-[#FAF6EE] text-[#B83A2D] text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h3 className="font-serif-sc text-base font-bold text-[#24292E]">
            课前探究思考题（尝试自我作答）
          </h3>
        </div>

        <div className="space-y-3">
          {guide.questions.map((q, idx) => {
            const isOpen = !!expandedQuestions[idx];

            return (
              <div
                key={idx}
                className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EDE7DD] space-y-2 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2">
                    <HelpCircle size={15} className="text-[#B83A2D] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-semibold text-[#24292E] leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleQuestion(idx)}
                    className="flex items-center gap-1 text-xs text-[#57606A] hover:text-[#B83A2D] shrink-0"
                  >
                    <span>{isOpen ? '收起解析' : '思考提示'}</span>
                    {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-2 pt-2 border-t border-[#E6DFD1] text-xs text-[#6B5A3E] bg-[#FFFBEB] p-2.5 rounded animate-in fade-in duration-150">
                    <strong className="text-[#92400E]">探究点拨：</strong> {q.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
