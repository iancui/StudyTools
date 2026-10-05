import React, { useState, useRef } from 'react';
import { Volume2, CheckCircle2, Circle, Eye, EyeOff, Sparkles, BookOpen, PenLine, Loader2 } from 'lucide-react';
import { SentenceItem, GradeId } from '../types/chinese';
import { speakChinese } from '../utils/speech';
import { useAuth } from '../contexts/AuthContext';
import { saveEssayPractice, SavedEssayPracticeDTO } from '../api/essay';
import { recordSentencePractice } from '../api/practice';

// 工单 12: 单条仿写提交后的批改结果 (本地状态, 按 sentenceId 索引)
interface GradingState {
  loading: boolean;
  result: SavedEssayPracticeDTO | null;
  error: string | null;
}

interface SentenceModuleProps {
  gradeId: GradeId;
  sentencesList?: SentenceItem[];
  completedIds: string[];
  onToggleComplete: (id: string) => void;
}

export const SentenceModule: React.FC<SentenceModuleProps> = ({
  gradeId,
  sentencesList = [],
  completedIds,
  onToggleComplete
}) => {
  const sentences = sentencesList;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  // 工单 12: 每条句子独立的提交 / 批改状态
  const [grading, setGrading] = useState<Record<string, GradingState>>({});
  const { accessToken } = useAuth();

  // 工单 15: 防重复计数. 同一条 sentence 在一次提交中只允许触发一次
  // practice 上报, 不放进会重复执行的 useEffect.
  const inFlightSentenceRef = useRef<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: '全部句式' },
    { id: 'rhetoric', label: '修辞赏析' },
    { id: 'classical', label: '文言名句' },
    { id: 'error_correction', label: '病句诊治' },
    { id: 'imitation', label: '经典仿写' }
  ];

  const filteredSentences = sentences.filter(s =>
    selectedCategory === 'all' ? true : s.category === selectedCategory
  );

  const toggleAnswerReveal = (id: string) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 工单 12: 提交仿写到后端 POST /api/essays/practices.
  // 后端做规则批改并写入 essay_practices, 返回 score/feedback.
  // accessToken 必须存在, userId 由后端从 JWT 解析 (不信任客户端).
  const handleSubmitImitation = async (item: SentenceItem) => {
    const content = (userInputs[item.id] || '').trim();
    if (!content) {
      setGrading(prev => ({
        ...prev,
        [item.id]: { loading: false, result: null, error: '请先输入仿写内容' }
      }));
      return;
    }
    if (!accessToken) {
      setGrading(prev => ({
        ...prev,
        [item.id]: { loading: false, result: null, error: '未登录, 无法提交仿写' }
      }));
      return;
    }

    setGrading(prev => ({
      ...prev,
      [item.id]: { loading: true, result: null, error: null }
    }));

    try {
      const result = await saveEssayPractice(accessToken, {
        title: item.title || '句子仿写',
        prompt: `${item.originalText}\n${item.practicePrompt || ''}`,
        content,
      });
      setGrading(prev => ({
        ...prev,
        [item.id]: { loading: false, result, error: null }
      }));
      // 提交成功后自动标记该句为已完成 (+15 墨滴)
      if (!completedIds.includes(item.id)) {
        onToggleComplete(item.id);
      }

      // 工单 15: 句子仿写提交被视作一次真实练习. 后端规则批改返回 score,
      // 60 分及以上视为 "correct", 否则 "wrong". 上报失败不阻断学习流程,
      // 也不影响上面已经设置好的 grading/完成状态. 同一条 sentence 一次提交
      // 只允许触发一次 practice, 防止 StrictMode / 重复渲染重复计数.
      if (!inFlightSentenceRef.current.has(item.id)) {
        inFlightSentenceRef.current.add(item.id);
        const practiceResult = result.score >= 60 ? 'correct' : 'wrong';
        recordSentencePractice(accessToken, { itemId: item.id, result: practiceResult })
          .catch((err) => {
            console.warn('记录句子练习失败, 不影响学习:', err);
          })
          .finally(() => {
            inFlightSentenceRef.current.delete(item.id);
          });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '提交失败';
      setGrading(prev => ({
        ...prev,
        [item.id]: { loading: false, result: null, error: msg }
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D8]">
        <div>
          <h2 className="text-xl font-bold font-serif-sc text-[#24292E] flex items-center gap-2">
            <span>句子锤炼 · 修辞与文言</span>
          </h2>
          <p className="text-xs text-[#57606A] mt-0.5">
            精研修辞手法、文言名句、病句修改与经典仿写 · 已演练 {sentences.filter(s => completedIds.includes(s.id)).length} / {sentences.length}
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#B83A2D] text-white shadow-xs'
                  : 'bg-white text-[#57606A] hover:bg-[#F2EDE2] border border-[#DDD7CD]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sentence Cards List */}
      <div className="space-y-5">
        {filteredSentences.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8C8273] bg-white border border-[#E6E1D8] rounded-xl">
            当前分类下暂无专门条目，建议切换到“全部句式”查看。
          </div>
        ) : (
          filteredSentences.map((item) => {
            const isCompleted = completedIds.includes(item.id);
            const isRevealed = !!revealedAnswers[item.id];
            const currentInput = userInputs[item.id] || '';

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4 hover:border-[#D1C9BC] transition-all"
              >
                {/* Header: Category Badge & Status */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#B83A2D] bg-[#FAF6EE] px-2.5 py-0.5 rounded border border-[#B83A2D]/20">
                        {item.categoryLabel}
                      </span>
                      <h3 className="text-base font-bold font-serif-sc text-[#24292E]">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleComplete(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      isCompleted
                        ? 'bg-[#EBF7EE] text-[#16A34A] border border-[#C6E9CC]'
                        : 'bg-[#F4F1EA] text-[#57606A] hover:text-[#24292E] border border-[#DDD7CD]'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>已完成 (+15墨滴)</span>
                      </>
                    ) : (
                      <>
                        <Circle size={13} />
                        <span>标记完成</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Original Sentence Display with audio */}
                <div className="bg-[#FAF8F4] border-l-3 border-[#B83A2D] p-4 rounded-r-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8C8273] uppercase tracking-wider">
                      典范原句
                    </span>
                    <button
                      onClick={() => speakChinese(item.originalText)}
                      className="text-xs text-[#B83A2D] flex items-center gap-1 hover:underline"
                      title="朗读原句"
                    >
                      <Volume2 size={14} />
                      <span>朗诵原句</span>
                    </button>
                  </div>
                  <p className="font-serif-sc text-sm sm:text-base text-[#24292E] leading-relaxed font-semibold">
                    “{item.originalText}”
                  </p>
                </div>

                {/* Modern Translation for Classical Chinese if present */}
                {item.modernTranslation && (
                  <div className="bg-[#F6F8FA] p-3 rounded-lg border border-[#E1E4E8] text-xs space-y-1">
                    <span className="font-semibold text-[#57606A]">现代汉语译文：</span>
                    <p className="text-[#24292E] leading-relaxed">
                      {item.modernTranslation}
                    </p>
                  </div>
                )}

                {/* Analysis & Rhetorical Devices */}
                <div className="space-y-2 text-xs text-[#333C48] leading-relaxed">
                  <div className="flex items-start gap-2">
                    <BookOpen size={14} className="text-[#B83A2D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#24292E]">句法剖析与鉴赏：</strong>
                      <span className="ml-1 text-[#47515F]">{item.analysis}</span>
                    </div>
                  </div>

                  {item.keyDevices && item.keyDevices.length > 0 && (
                    <div className="flex items-center gap-2 pl-5 pt-1">
                      <span className="text-[#8C8273]">核心手法：</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.keyDevices.map((device, idx) => (
                          <span
                            key={idx}
                            className="bg-[#FAF7F2] text-[#6B5A3E] border border-[#E5DECF] px-2 py-0.5 rounded text-[11px]"
                          >
                            {device}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Practice Arena */}
                <div className="pt-3 border-t border-[#F0ECE4] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#24292E] flex items-center gap-1.5">
                      <PenLine size={13} className="text-[#B83A2D]" />
                      <span>实战练兵与仿写</span>
                    </span>
                    <button
                      onClick={() => toggleAnswerReveal(item.id)}
                      className="text-xs text-[#57606A] hover:text-[#24292E] flex items-center gap-1"
                    >
                      {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{isRevealed ? '收起参考答案' : '查看参考答案'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#57606A] bg-[#FAF8F5] p-2.5 rounded border border-[#EDE7DC]">
                    <strong>题目：</strong>{item.practicePrompt}
                  </p>

                  {/* Input area for user trial */}
                  <div>
                    <textarea
                      rows={2}
                      value={currentInput}
                      onChange={(e) =>
                        setUserInputs(prev => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder="在此输入你的仿写或作答（自主演练）..."
                      className="w-full text-xs p-2.5 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D] bg-white text-[#24292E] placeholder-[#8C8273]"
                    />
                  </div>

                  {/* 工单 12: 提交按钮 + 批改结果显示 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSubmitImitation(item)}
                      disabled={grading[item.id]?.loading === true}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#B83A2D] text-white hover:bg-[#A33225] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {grading[item.id]?.loading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>提交批改中...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>提交仿写并批改</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-[#8C8273]">
                      提交后会生成评分和学习建议
                    </span>
                  </div>

                  {grading[item.id]?.error && (
                    <div className="text-xs text-[#B83A2D] bg-[#FEF2F2] border border-[#FCA5A5] rounded p-2">
                      {grading[item.id]?.error}
                    </div>
                  )}

                  {grading[item.id]?.result && (
                    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[#15803D] font-semibold">
                          <CheckCircle2 size={13} />
                          <span>批改结果</span>
                        </div>
                        <div className="text-[#24292E] font-bold font-serif-sc">
                          得分: {grading[item.id]?.result?.score}
                        </div>
                      </div>
                      <div className="text-[#47515F] leading-relaxed">
                        <strong>反馈:</strong> {grading[item.id]?.result?.feedback}
                      </div>
                      <div className="text-[11px] text-[#8C8273]">
                        字数: {grading[item.id]?.result?.wordCount}
                      </div>
                    </div>
                  )}

                  {/* Model Answer Reveal */}
                  {isRevealed && (
                    <div className="bg-[#FAF6EE] border border-[#ECD9BF] rounded-lg p-3 text-xs space-y-1 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 text-[#92400E] font-semibold">
                        <Sparkles size={13} />
                        <span>参考范例与解析</span>
                      </div>
                      <p className="text-[#78350F] whitespace-pre-line leading-relaxed font-serif-sc">
                        {item.practiceAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
