// 墨韵中文 工单 16 - 词语练一练
// ============================================================
//
// 设计原则 (工单 16 严格限制):
//   - 题型: 给词语, 四选一选出正确拼音
//   - 正确答案来自当前 word.pinyin
//   - 干扰项从同课其他词语的拼音中抽取 (同 gradeId, 同课教材数据集合),
//     不混入其他课/旧 curriculum/其他年级/随机全局数据
//   - 答对/答错分别调用 POST /api/progress/words/practice 一次
//   - 一次题目只允许上报一次 (hasAnswered 本地控制)
//   - 答对不会自动 isMastered, 练习与掌握完全独立
//   - 失败不阻断学习 (调用方 try/catch + console.warn)

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCw, Volume2 } from 'lucide-react';
import { WordItem } from '../types/chinese';
import { speakChinese } from '../utils/speech';
import { useAuth } from '../contexts/AuthContext';
import { recordWordPractice } from '../api/practice';

interface WordPracticeProps {
  /** 当前要练习的词语 */
  word: WordItem;
  /** 当前课程所有词语, 用于抽取干扰拼音 */
  courseWords: WordItem[];
}

type Status = 'pending' | 'correct' | 'wrong';

/**
 * 生成四选一选项:
 *   - 正确答案 = word.pinyin
 *   - 三个干扰项从 courseWords (排除自己, 排除相同拼音) 中随机抽取
 *   - 不足 3 个时, 用 "无" 占位, 保证 4 个选项
 *   - 最后洗牌
 */
function buildOptions(word: WordItem, courseWords: WordItem[]): string[] {
  const correct = word.pinyin;
  // 候选干扰拼音: 同课其他词语, 去重, 排除正确答案
  const candidates = Array.from(
    new Set(
      courseWords
        .filter((w) => w.id !== word.id && w.pinyin !== correct)
        .map((w) => w.pinyin)
    )
  );
  // Fisher-Yates 洗牌取前 3 个
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const distractors: string[] = [];
  for (const p of shuffled) {
    if (distractors.length >= 3) break;
    distractors.push(p);
  }
  while (distractors.length < 3) {
    distractors.push('——');
  }
  const options = [correct, ...distractors.slice(0, 3)];
  // 洗牌最终选项
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

/**
 * 词语练一练: 给词语, 选出正确拼音.
 */
export const WordPractice: React.FC<WordPracticeProps> = ({
  word,
  courseWords,
}) => {
  const { accessToken } = useAuth();
  const [options, setOptions] = useState<string[]>(() =>
    buildOptions(word, courseWords)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('pending');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 切换词语时重新生成选项 + 重置状态
  useEffect(() => {
    setOptions(buildOptions(word, courseWords));
    setSelected(null);
    setStatus('pending');
    setHasAnswered(false);
    setSubmitting(false);
  }, [word.id, courseWords]);

  const handleSelect = (option: string) => {
    if (submitting) return;
    // 工单 16: 已经答过本题目, 不允许重复计数
    if (hasAnswered) return;

    setSelected(option);
    const isCorrect = option === word.pinyin;
    setStatus(isCorrect ? 'correct' : 'wrong');
    setHasAnswered(true);

    if (accessToken) {
      setSubmitting(true);
      recordWordPractice(accessToken, {
        itemId: word.id,
        result: isCorrect ? 'correct' : 'wrong',
      })
        .catch((err) => {
          console.warn('记录词语练习失败, 不影响学习:', err);
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  const handleRetry = () => {
    setOptions(buildOptions(word, courseWords));
    setSelected(null);
    setStatus('pending');
    setHasAnswered(false);
  };

  const optionLabel = (idx: number) =>
    ['A', 'B', 'C', 'D'][idx] ?? String(idx + 1);

  return (
    <div className="bg-white border border-[#E8E3DA] rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#24292E] flex items-center gap-1.5">
          <span className="text-[#B83A2D]">练一练</span>
          <span className="text-[#8C8273] font-normal">选出正确读音</span>
        </span>
        <span className="text-[10px] text-[#8C8273]">
          仅记录练习次数, 不会自动标为掌握
        </span>
      </div>

      {/* 题目: 词语 */}
      <div className="flex items-center justify-center gap-3 py-2">
        <span className="text-3xl font-serif-sc font-bold text-[#24292E] tracking-wider">
          {word.word}
        </span>
        <button
          type="button"
          onClick={() => speakChinese(word.word)}
          className="p-1.5 rounded-full bg-[#FAF6EE] text-[#B83A2D] hover:bg-[#F2ECE0] transition-colors"
          title="聆听词语"
        >
          <Volume2 size={14} />
        </button>
      </div>
      <p className="text-center text-xs text-[#57606A]">正确读音是？</p>

      {/* 选项 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          const isCorrectOption = opt === word.pinyin;
          // 判定后高亮: 正确答案绿色, 用户选错的红色
          let optionClass =
            'bg-[#FAF8F5] text-[#24292E] border-[#DDD7CD] hover:bg-[#F2ECE0] hover:border-[#B83A2D]';
          if (hasAnswered) {
            if (isCorrectOption) {
              optionClass =
                'bg-[#EBF7EE] text-[#16A34A] border-[#C6E9CC]';
            } else if (isSelected) {
              optionClass =
                'bg-[#FEF2F2] text-[#B83A2D] border-[#FECACA]';
            } else {
              optionClass =
                'bg-[#FAF8F5] text-[#8C8273] border-[#EDE7DC] opacity-60';
            }
          }
          return (
            <button
              key={`${opt}-${idx}`}
              type="button"
              disabled={hasAnswered || submitting}
              onClick={() => handleSelect(opt)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-mono text-left border rounded-lg transition-colors ${optionClass}`}
            >
              <span className="text-xs font-bold opacity-70">
                {optionLabel(idx)}.
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* 判定反馈 */}
      {status === 'correct' && (
        <div className="flex items-center justify-center gap-1.5 text-[#16A34A] text-sm font-medium">
          <CheckCircle2 size={16} />
          <span>答对了</span>
        </div>
      )}
      {status === 'wrong' && (
        <div className="flex flex-col items-center gap-1.5 text-sm">
          <div className="flex items-center gap-1.5 text-[#B83A2D] font-medium">
            <XCircle size={16} />
            <span>再想一想</span>
          </div>
          <div className="text-xs text-[#57606A]">
            正确答案：
            <span className="font-mono text-[#16A34A] font-bold ml-1">
              {word.pinyin}
            </span>
          </div>
        </div>
      )}

      {hasAnswered && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#24292E] bg-[#F4F1EA] hover:bg-[#EAE4D8] border border-[#DDD7CD] rounded-md transition-colors"
          >
            <RotateCw size={12} />
            <span>再练一次</span>
          </button>
        </div>
      )}
    </div>
  );
};
