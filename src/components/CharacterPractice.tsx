// 墨韵中文 工单 16 - 生字练一练
// ============================================================
//
// 设计原则 (工单 16 严格限制):
//   - 只做文本输入 -> 精确匹配 character.char (trim 后 ===)
//   - 不做 OCR / AI / 手写识别 / 图片识别 / 后端识别
//   - 答对/答错分别调用 POST /api/progress/characters/practice 一次
//   - 一次题目只允许上报一次 (hasAnswered 本地控制)
//   - 答对不会自动 isMastered, 练习与掌握完全独立
//   - 失败不阻断学习 (调用方 try/catch + console.warn)

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCw, Volume2 } from 'lucide-react';
import { CharacterItem } from '../types/chinese';
import { speakChar, speakPinyin } from '../utils/speech';
import { useAuth } from '../contexts/AuthContext';
import { recordCharacterPractice } from '../api/practice';

interface CharacterPracticeProps {
  character: CharacterItem;
}

type Status = 'pending' | 'correct' | 'wrong';

/**
 * 生字练一练:
 *   显示拼音 -> 用户输入汉字 -> 精确匹配 -> 上报 practice event
 */
export const CharacterPractice: React.FC<CharacterPracticeProps> = ({
  character,
}) => {
  const { accessToken } = useAuth();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('pending');
  // 工单 16: 一次题目只上报一次. 用户提交答案后, 该 ref 锁定当前题目.
  // 切换 character 或点击 "再练一次" 时重置.
  const [hasAnswered, setHasAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 切换生字时重置状态 (使用 key 重新挂载也行, 这里直接重置)
  useEffect(() => {
    setInput('');
    setStatus('pending');
    setHasAnswered(false);
    setSubmitting(false);
  }, [character.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    // 工单 16: 已经答过本题目, 不允许重复计数
    if (hasAnswered) return;
    if (!input.trim()) return;

    const isCorrect = input.trim() === character.char;
    setStatus(isCorrect ? 'correct' : 'wrong');
    setHasAnswered(true);

    // 上报练习事件, 失败不阻断学习, 也不影响已经显示的判定
    if (accessToken) {
      setSubmitting(true);
      recordCharacterPractice(accessToken, {
        itemId: character.id,
        result: isCorrect ? 'correct' : 'wrong',
      })
        .catch((err) => {
          console.warn('记录生字练习失败, 不影响学习:', err);
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  const handleRetry = () => {
    setInput('');
    setStatus('pending');
    setHasAnswered(false);
  };

  const disabled = submitting || hasAnswered;

  return (
    <div className="bg-white border border-[#E8E3DA] rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#24292E] flex items-center gap-1.5">
          <span className="text-[#B83A2D]">练一练</span>
          <span className="text-[#8C8273] font-normal">看拼音写汉字</span>
        </span>
        <span className="text-[10px] text-[#8C8273]">
          仅记录练习次数, 不会自动标为掌握
        </span>
      </div>

      {/* 题目: 拼音 */}
      <div className="flex items-center justify-center gap-3 py-2">
        <span className="text-3xl font-mono text-[#B83A2D] tracking-wider">
          {character.pinyin}
        </span>
        <button
          type="button"
          onClick={() => speakPinyin(character.pinyin)}
          className="p-1.5 rounded-full bg-[#FAF6EE] text-[#1B4D3E] hover:bg-[#EBF7EE] transition-colors"
          title="朗读拼音"
        >
          <Volume2 size={14} />
        </button>
      </div>
      <p className="text-center text-xs text-[#57606A]">请写出这个字</p>

      {/* 输入与判定 */}
      {status === 'pending' ? (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            maxLength={4}
            disabled={disabled}
            placeholder="输入汉字"
            className="w-32 text-center text-2xl font-serif-sc py-2 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#B83A2D] text-[#24292E]"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="px-4 py-1.5 text-xs font-medium text-white bg-[#B83A2D] hover:bg-[#9E2F23] rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            确定
          </button>
        </form>
      ) : status === 'correct' ? (
        <div className="flex flex-col items-center gap-2 py-1">
          <div className="flex items-center gap-1.5 text-[#16A34A] text-sm font-medium">
            <CheckCircle2 size={16} />
            <span>回答正确</span>
          </div>
          <div className="text-3xl font-serif-sc font-bold text-[#24292E]">
            {character.char}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8C8273]">
            <span>拼音：{character.pinyin}</span>
            <button
              type="button"
              onClick={() => speakChar(character.char)}
              className="p-1 rounded-full hover:bg-[#FAF6EE] text-[#B83A2D]"
              title="朗读生字"
            >
              <Volume2 size={12} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#24292E] bg-[#F4F1EA] hover:bg-[#EAE4D8] border border-[#DDD7CD] rounded-md transition-colors"
          >
            <RotateCw size={12} />
            <span>再练一次</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-1">
          <div className="flex items-center gap-1.5 text-[#B83A2D] text-sm font-medium">
            <XCircle size={16} />
            <span>再想一想</span>
          </div>
          <div className="text-xs text-[#57606A]">
            你的答案：
            <span className="line-through text-[#8C8273]">{input}</span>
          </div>
          <div className="text-xs text-[#8C8273]">
            正确答案：
            <span className="font-serif-sc font-bold text-[#16A34A] text-lg ml-1">
              {character.char}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#B83A2D] hover:bg-[#9E2F23] rounded-md transition-colors"
          >
            <RotateCw size={12} />
            <span>再练一次</span>
          </button>
        </div>
      )}
    </div>
  );
};
