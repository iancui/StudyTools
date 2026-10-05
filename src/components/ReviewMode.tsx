import React, { useState, useMemo } from 'react';
import { RotateCw, Volume2, CheckCircle2, HelpCircle, Layers, Headphones, Sparkles, Shuffle, CheckSquare, ArrowRight, BookOpen, Calendar, ListFilter, Camera, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GradeId, CharacterItem, WordItem, SentenceItem, MainTab } from '../types/chinese';
import { speakChinese } from '../utils/speech';
import { LessonDTO } from '../api/textbook';
import {
  ReviewScope,
  ReviewQuestion,
  AnswerRecord,
  buildReviewQuestions,
  summarizeReviewSession,
  previewReviewScope,
  questionTypeLabel,
} from '../utils/reviewAlgorithm';

// 工单 14: 复习范围类型重新定义在 utils/reviewAlgorithm.ts, 这里 re-export.
// 新增 'today' (今日复习), 优先级最高: 已到复习时间 + 最近答错 + 尚未掌握.
export type { ReviewScope } from '../utils/reviewAlgorithm';

interface ReviewModeProps {
  gradeId: GradeId;
  charactersList: CharacterItem[];
  wordsList: WordItem[];
  // 工单 10: 教材模式下传入句子列表, 用于复习统计与展示.
  // 原 curriculum 模式不传, 默认空数组.
  sentencesList?: SentenceItem[];
  masteredCharIds: string[];
  masteredWordIds: string[];
  // 工单 10: 句子完成进度
  completedSentenceIds?: string[];
  onToggleCharMaster: (id: string) => void;
  onToggleWordMaster: (id: string) => void;
  // 工单 10: 句子完成切换 (与 App.tsx handleToggleSentence 一致)
  onToggleSentenceComplete?: (id: string) => void;
  onEarnInk: (amount: number) => void;
  // 工单 10: 教材模式下传课文标题 + 进入学习模块入口
  lessonTitle?: string;
  onEnterLearn?: (tab: MainTab) => void;
  // 工单 13: 复习范围选择. App.tsx 根据 scope 重新计算并传入
  // charactersList/wordsList/sentencesList, 范围变化会真正影响复习内容.
  reviewScope?: ReviewScope;
  onSelectReviewScope?: (scope: ReviewScope) => void;
  // 课程列表 + 用户多选的 lessonIds (用于 "选择课程" 模式 UI)
  lessons?: LessonDTO[];
  selectedLessonIds?: string[];
  onSelectLessonIds?: (ids: string[]) => void;
  // 多课数据加载状态 (期中/期末/多选会触发额外加载)
  scopeLoading?: boolean;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({
  gradeId,
  charactersList,
  wordsList,
  sentencesList = [],
  masteredCharIds,
  masteredWordIds,
  completedSentenceIds = [],
  onToggleCharMaster,
  onToggleWordMaster,
  onToggleSentenceComplete,
  onEarnInk,
  lessonTitle,
  onEnterLearn,
  reviewScope = 'current_lesson',
  onSelectReviewScope,
  lessons = [],
  selectedLessonIds = [],
  onSelectLessonIds,
  scopeLoading = false,
}) => {
  // 工单 14: 新增 'smart' 子页签作为默认入口, 使用 reviewAlgorithm.ts
  // 生成的混合题型 (看字回忆拼音 / 看拼音回忆字 / 听音选字 / 词语识别 / 句子填空).
  // 原 flashcard / dictation / needs_work 子页签保留, 不影响已有功能.
  const [reviewTab, setReviewTab] = useState<'smart' | 'flashcard' | 'dictation' | 'needs_work'>('smart');

  // 多选课程勾选切换 (仅在 "选择课程" 模式下使用)
  const handleToggleLesson = (id: string) => {
    if (!onSelectLessonIds) return;
    const next = selectedLessonIds.includes(id)
      ? selectedLessonIds.filter((x) => x !== id)
      : [...selectedLessonIds, id];
    onSelectLessonIds(next);
  };

  // Random and selection filter
  const [sampleCount, setSampleCount] = useState<number | 'all'>('all');
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // All available review cards
  const baseCards = useMemo(() => [
    ...charactersList.map(c => ({
      type: 'char' as const,
      id: c.id,
      main: c.char,
      sub: c.pinyin,
      detail: c.meanings.join('；'),
      example: c.exampleSentence,
      isMastered: masteredCharIds.includes(c.id),
      phoneticTrap: c.phoneticTrap
    })),
    ...wordsList.map(w => ({
      type: 'word' as const,
      id: w.id,
      main: w.word,
      sub: w.pinyin,
      detail: w.definition,
      example: w.exampleSentence,
      isMastered: masteredWordIds.includes(w.id),
      phoneticTrap: undefined
    }))
  ], [charactersList, wordsList, masteredCharIds, masteredWordIds]);

  // Sampled cards
  const activeCards = useMemo(() => {
    if (sampleCount === 'all') return baseCards;
    const count = Math.min(Number(sampleCount), baseCards.length);
    const shuffled = [...baseCards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, [baseCards, sampleCount, shuffleSeed]);

  // Sampled dictation characters
  const activeDictationCharacters = useMemo(() => {
    if (sampleCount === 'all') return charactersList;
    const count = Math.min(Number(sampleCount), charactersList.length);
    const shuffled = [...charactersList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, [charactersList, sampleCount, shuffleSeed]);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const currentCard = activeCards[cardIndex] || activeCards[0];

  // Dictation state
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationFeedback, setDictationFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [dictationScore, setDictationScore] = useState(0);
  const [dictationFinished, setDictationFinished] = useState(false);

  const activeDictationItem = activeDictationCharacters[dictationIndex] || activeDictationCharacters[0];

  const handleNextFlashcard = () => {
    setFlipped(false);
    setCardIndex((prev) => (prev + 1) % (activeCards.length || 1));
  };

  const handlePrevFlashcard = () => {
    setFlipped(false);
    setCardIndex((prev) => (prev - 1 + activeCards.length) % (activeCards.length || 1));
  };

  const checkDictation = () => {
    if (!activeDictationItem) return;
    const cleanInput = dictationInput.trim();
    const isCharMatch = cleanInput === activeDictationItem.char;
    const isPinyinMatch = cleanInput.toLowerCase() === activeDictationItem.pinyin.toLowerCase();

    if (isCharMatch || isPinyinMatch) {
      setDictationFeedback('correct');
      setDictationScore(prev => prev + 1);
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.6 }
      });
    } else {
      setDictationFeedback('wrong');
    }
  };

  const nextDictationQuestion = () => {
    setDictationFeedback(null);
    setDictationInput('');
    if (dictationIndex < activeDictationCharacters.length - 1) {
      setDictationIndex(prev => prev + 1);
    } else {
      setDictationFinished(true);
      onEarnInk(30);
    }
  };

  const resetDictation = () => {
    setDictationIndex(0);
    setDictationInput('');
    setDictationFeedback(null);
    setDictationScore(0);
    setDictationFinished(false);
  };

  const handleShuffleCards = (count: number | 'all') => {
    setSampleCount(count);
    setCardIndex(0);
    setFlipped(false);
    resetDictation();
    setShuffleSeed(Date.now());
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D8]">
        <div>
          <h2 className="text-xl font-bold font-serif-sc text-[#24292E]">
            温故知新 · 智能复习巩固
          </h2>
          <p className="text-xs text-[#57606A] mt-0.5">
            抽认卡记忆 · 盲听字词听写 · 重点错题攻关
          </p>
        </div>

        <div className="flex items-center p-1 bg-[#EBE7DF] rounded-lg overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setReviewTab('smart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              reviewTab === 'smart'
                ? 'bg-white text-[#24292E] shadow-xs'
                : 'text-[#57606A] hover:text-[#24292E]'
            }`}
          >
            <Sparkles size={13} />
            <span>智能复习</span>
          </button>
          <button
            onClick={() => setReviewTab('flashcard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              reviewTab === 'flashcard'
                ? 'bg-white text-[#24292E] shadow-xs'
                : 'text-[#57606A] hover:text-[#24292E]'
            }`}
          >
            <Layers size={13} />
            <span>抽认卡模式</span>
          </button>
          <button
            onClick={() => setReviewTab('dictation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              reviewTab === 'dictation'
                ? 'bg-white text-[#24292E] shadow-xs'
                : 'text-[#57606A] hover:text-[#24292E]'
            }`}
          >
            <Headphones size={13} />
            <span>听写测试</span>
          </button>
          <button
            onClick={() => setReviewTab('needs_work')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              reviewTab === 'needs_work'
                ? 'bg-white text-[#24292E] shadow-xs'
                : 'text-[#57606A] hover:text-[#24292E]'
            }`}
          >
            <HelpCircle size={13} />
            <span>待巩固清单</span>
          </button>
        </div>
      </div>

      {/* 工单 13: 复习范围选择. 仅在教材模式 (有 lessons + onSelectReviewScope) 下显示.
          选择的范围会真正影响复习内容 (App.tsx 重新拉取并传入对应数据). */}
      {typeof onSelectReviewScope === 'function' && lessons.length > 0 && (
        <div className="bg-white border border-[#E6E1D8] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ListFilter size={15} className="text-[#B83A2D]" />
            <h3 className="text-sm font-bold font-serif-sc text-[#24292E]">
              复习范围
            </h3>
            <span className="text-xs text-[#8C8273]">
              · 选择范围后, 生字 / 词语 / 句子会严格按所选课程过滤
            </span>
          </div>

          {/* 工单 14: 5 个范围按钮 (今日复习优先级最高, 排第一). */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {([
              { id: 'today', label: '今日复习', icon: <Sparkles size={13} /> },
              { id: 'current_lesson', label: '当前课程', icon: <BookOpen size={13} /> },
              { id: 'selected', label: '选择课程', icon: <CheckSquare size={13} /> },
              { id: 'midterm', label: '期中复习', icon: <Calendar size={13} /> },
              { id: 'final', label: '期末复习', icon: <Layers size={13} /> },
            ] as { id: ReviewScope; label: string; icon: React.ReactNode }[]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => onSelectReviewScope(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  reviewScope === opt.id
                    ? 'bg-[#B83A2D] text-white'
                    : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* "选择课程" 模式: 显示课程勾选列表 */}
          {reviewScope === 'selected' && (
            <div className="pt-3 border-t border-[#F0ECE4]">
              <div className="text-xs text-[#57606A] mb-2">
                勾选要复习的课程 (可多选):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lessons.map((l) => {
                  const checked = selectedLessonIds.includes(l.id);
                  return (
                    <label
                      key={l.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                        checked
                          ? 'bg-[#FAF6EE] border-[#B83A2D] text-[#24292E]'
                          : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#57606A] hover:bg-[#F2ECE0]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleLesson(l.id)}
                        className="accent-[#B83A2D]"
                      />
                      <span className="font-mono">L{l.lessonNo}</span>
                      <span className="font-serif-sc">{l.title}</span>
                    </label>
                  );
                })}
              </div>
              <div className="text-[11px] text-[#8C8273] mt-2">
                已选 {selectedLessonIds.length} / {lessons.length} 课
              </div>
            </div>
          )}

          {/* 工单 14: 今日复习说明. */}
          {reviewScope === 'today' && (
            <div className="text-[11px] text-[#57606A] bg-[#FAF8F5] p-2 rounded border border-[#EDE7DC]">
              复习范围: 已到复习时间的内容 + 最近答错的内容 + 尚未掌握的内容. 系统会按"主动回忆 + 间隔复习 + 错误优先 + 混合练习"自动出题.
            </div>
          )}

          {/* 期中复习说明 */}
          {reviewScope === 'midterm' && (
            <div className="text-[11px] text-[#57606A] bg-[#FAF8F5] p-2 rounded border border-[#EDE7DC]">
              复习范围: 本学期前半段课程 (共 {Math.ceil(lessons.length / 2)} 课).
              加载完成后, 下方复习内容会按这些课程过滤.
            </div>
          )}
          {reviewScope === 'final' && (
            <div className="text-[11px] text-[#57606A] bg-[#FAF8F5] p-2 rounded border border-[#EDE7DC]">
              复习范围: 本学期全部课程 (共 {lessons.length} 课).
            </div>
          )}

          {/* 多课数据加载状态 */}
          {scopeLoading && (
            <div className="text-xs text-[#57606A] bg-[#FAF8F5] p-2 rounded border border-[#E6E1D8]">
              正在加载所选课程的内容...
            </div>
          )}
        </div>
      )}

      {/* 工单 10: 教材模式下展示课文复习概览 (课文名称 + 三类进度统计 + 进入学习入口) */}
      {typeof onEnterLearn === 'function' && lessonTitle && (
        <TextbookReviewOverview
          lessonTitle={lessonTitle}
          charactersList={charactersList}
          wordsList={wordsList}
          sentencesList={sentencesList}
          masteredCharIds={masteredCharIds}
          masteredWordIds={masteredWordIds}
          completedSentenceIds={completedSentenceIds}
          onEnterLearn={onEnterLearn}
        />
      )}

      {/* Select / Random Subset Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-white border border-[#E8E3DA] rounded-xl text-xs">
        <span className="text-[#8C8273] font-medium flex items-center gap-1">
          <Shuffle size={13} /> 复习量定制：
        </span>
        <button
          onClick={() => handleShuffleCards('all')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            sampleCount === 'all'
              ? 'bg-[#B83A2D] text-white font-medium'
              : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
          }`}
        >
          全部项目 ({baseCards.length})
        </button>
        <button
          onClick={() => handleShuffleCards(3)}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            sampleCount === 3
              ? 'bg-[#B83A2D] text-white font-medium'
              : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
          }`}
        >
          随机 3 题
        </button>
        <button
          onClick={() => handleShuffleCards(5)}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            sampleCount === 5
              ? 'bg-[#B83A2D] text-white font-medium'
              : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
          }`}
        >
          随机 5 题
        </button>

        {sampleCount !== 'all' && (
          <button
            onClick={() => {
              setShuffleSeed(Date.now());
              setCardIndex(0);
              resetDictation();
            }}
            className="px-2 py-1 bg-[#FAF6EE] text-[#B83A2D] rounded-md border border-[#B83A2D]/30 hover:bg-[#F2ECE0] flex items-center gap-1 ml-auto"
          >
            <Shuffle size={12} /> 重新随机抽选
          </button>
        )}
      </div>

      {/* SUB-TAB 0: SMART REVIEW (工单 14, 默认入口) */}
      {reviewTab === 'smart' && (
        <SmartReviewFlow
          reviewScope={reviewScope}
          charactersList={charactersList}
          wordsList={wordsList}
          sentencesList={sentencesList}
          masteredCharIds={masteredCharIds}
          masteredWordIds={masteredWordIds}
          completedSentenceIds={completedSentenceIds}
          onEarnInk={onEarnInk}
          onToggleCharMaster={onToggleCharMaster}
          onToggleWordMaster={onToggleWordMaster}
        />
      )}

      {/* SUB-TAB 1: MEMORY FLASHCARD */}
      {reviewTab === 'flashcard' && currentCard && (
        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          <div className="text-xs text-[#57606A]">
            当前第 {cardIndex + 1} / {activeCards.length} 项 · 点击卡片翻面自测
          </div>

          <div
            onClick={() => setFlipped(!flipped)}
            className="w-full max-w-md h-84 bg-white border border-[#DDD7CD] rounded-2xl p-8 shadow-sm cursor-pointer hover:shadow-md transition-all relative flex flex-col justify-between select-none"
          >
            <div className="flex items-center justify-between text-xs text-[#8C8273]">
              <span>
                {currentCard.type === 'char' ? '【生字卡】' : '【词语卡】'} · {flipped ? '背面详解' : '正面记忆'}
              </span>
              <span className="flex items-center gap-1 text-[#B83A2D]">
                <RotateCw size={12} /> 翻面
              </span>
            </div>

            {!flipped ? (
              <div className="text-center my-auto space-y-3">
                <div
                  className={`mx-auto rounded-lg border border-[#B83A2D]/30 mizige-bg flex items-center justify-center font-serif-sc font-bold text-[#24292E] shadow-inner ${
                    currentCard.type === 'char' ? 'w-28 h-28 text-6xl' : 'px-6 py-4 text-3xl'
                  }`}
                >
                  {currentCard.main}
                </div>
                <div className="text-sm font-mono text-[#B83A2D]">{currentCard.sub}</div>

                {currentCard.phoneticTrap && (
                  <span className="inline-block text-[11px] bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full font-medium">
                    ⚠️ {currentCard.phoneticTrap.label}
                  </span>
                )}

                <div className="pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakChinese(currentCard.main);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EE] text-xs text-[#B83A2D] hover:bg-[#F2ECE0]"
                  >
                    <Volume2 size={13} /> 听发音
                  </button>
                </div>
              </div>
            ) : (
              <div className="my-auto space-y-3 text-left">
                <div>
                  <h4 className="text-xs font-semibold text-[#8C8273]">释义与内涵</h4>
                  <p className="text-sm text-[#24292E] mt-1 leading-relaxed">
                    {currentCard.detail}
                  </p>
                </div>

                {currentCard.phoneticTrap && (
                  <div className="p-2 rounded bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E]">
                    <strong>发音警示：</strong> {currentCard.phoneticTrap.tip}
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-[#8C8273]">语境例句</h4>
                  <p className="text-xs text-[#24292E] font-serif-sc mt-1 italic bg-[#FAF8F5] p-2.5 rounded border-l-2 border-[#B83A2D]">
                    “{currentCard.example}”
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE4]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentCard.type === 'char') {
                    onToggleCharMaster(currentCard.id);
                  } else {
                    onToggleWordMaster(currentCard.id);
                  }
                }}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  currentCard.isMastered
                    ? 'text-[#16A34A] bg-[#EBF7EE]'
                    : 'text-[#57606A] bg-[#F4F1EA] hover:text-[#24292E]'
                }`}
              >
                {currentCard.isMastered ? '✓ 已掌握' : '标记掌握'}
              </button>

              <span className="text-xs text-[#A8A196]">
                {cardIndex + 1} / {activeCards.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevFlashcard}
              className="px-4 py-2 text-xs font-medium text-[#24292E] bg-white border border-[#DDD7CD] rounded-lg hover:bg-[#F6F4EE] transition-colors"
            >
              ← 上一张
            </button>
            <button
              onClick={() => setFlipped(!flipped)}
              className="px-4 py-2 text-xs font-medium text-[#B83A2D] bg-[#FAF6EE] border border-[#B83A2D]/30 rounded-lg hover:bg-[#F2ECE0] transition-colors"
            >
              翻转卡片
            </button>
            <button
              onClick={handleNextFlashcard}
              className="px-4 py-2 text-xs font-medium text-[#24292E] bg-white border border-[#DDD7CD] rounded-lg hover:bg-[#F6F4EE] transition-colors"
            >
              下一张 →
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DICTATION TEST */}
      {reviewTab === 'dictation' && (
        <div className="bg-white border border-[#E8E3DA] rounded-xl p-8 shadow-xs max-w-xl mx-auto space-y-6">
          {!dictationFinished ? (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-between text-xs text-[#57606A]">
                <span>生字盲听听写</span>
                <span className="font-mono">
                  第 {dictationIndex + 1} / {activeDictationCharacters.length} 题
                </span>
              </div>

              <div className="py-4 space-y-2">
                <button
                  onClick={() => speakChinese(activeDictationItem.char)}
                  className="w-20 h-20 mx-auto rounded-full bg-[#FAF6EE] text-[#B83A2D] hover:bg-[#F2ECE0] border-2 border-[#B83A2D]/30 flex items-center justify-center transition-transform hover:scale-105 shadow-inner"
                  title="点击播放发音"
                >
                  <Volume2 size={36} />
                </button>
                <p className="text-xs text-[#8C8273]">
                  点击播放语音（可反复收听）
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EDE7DC] text-xs text-[#57606A] text-left">
                <strong>语境提示：</strong>“{activeDictationItem.exampleSentence.replace(activeDictationItem.char, '___')}”
              </div>

              {activeDictationItem.phoneticTrap && (
                <div className="text-[11px] text-[#92400E] bg-[#FFFBEB] p-2 rounded border border-[#FDE68A]">
                  💡 提醒：{activeDictationItem.phoneticTrap.label}
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="请输入听到的汉字或拼音..."
                  value={dictationInput}
                  disabled={dictationFeedback !== null}
                  onChange={(e) => setDictationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !dictationFeedback) {
                      checkDictation();
                    }
                  }}
                  className="w-full text-center text-lg font-serif-sc py-2.5 px-4 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D] text-[#24292E] bg-white placeholder-[#A8A196]"
                />

                {dictationFeedback === null ? (
                  <button
                    onClick={checkDictation}
                    disabled={!dictationInput.trim()}
                    className="w-full py-2.5 bg-[#B83A2D] text-white text-xs font-medium rounded-lg hover:bg-[#9E2F23] disabled:opacity-40 transition-colors"
                  >
                    核对答案
                  </button>
                ) : (
                  <div className="space-y-3">
                    {dictationFeedback === 'correct' ? (
                      <div className="p-3 rounded-lg bg-[#EBF7EE] text-[#16A34A] text-xs flex items-center justify-center gap-1.5 font-medium">
                        <CheckCircle2 size={16} />
                        <span>回答正确！字：{activeDictationItem.char}（{activeDictationItem.pinyin}）</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-[#FEF2F2] text-[#DC2626] text-xs space-y-1">
                        <p className="font-semibold">回答需巩固！</p>
                        <p>正确汉字是：<strong>{activeDictationItem.char}</strong>（拼音：{activeDictationItem.pinyin}）</p>
                      </div>
                    )}

                    <button
                      onClick={nextDictationQuestion}
                      className="w-full py-2.5 bg-[#24292E] text-white text-xs font-medium rounded-lg hover:bg-[#333A42] transition-colors"
                    >
                      {dictationIndex < activeDictationCharacters.length - 1 ? '下一题 →' : '查看听写成绩'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF6EE] text-[#B83A2D] flex items-center justify-center">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold font-serif-sc text-[#24292E]">
                听写测试完成！
              </h3>
              <p className="text-sm text-[#57606A]">
                本次得分：<strong className="text-[#B83A2D] text-lg">{dictationScore}</strong> / {activeDictationCharacters.length}
              </p>
              <p className="text-xs text-[#16A34A]">
                已为你奖励 +30 墨滴学分！
              </p>
              <button
                onClick={resetDictation}
                className="px-6 py-2.5 bg-[#B83A2D] text-white text-xs font-medium rounded-lg hover:bg-[#9E2F23] transition-colors"
              >
                再练一次
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: NEEDS WORK LIST */}
      {reviewTab === 'needs_work' && (
        <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#24292E]">
            待巩固生字与词语清单
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {charactersList
              .filter(c => !masteredCharIds.includes(c.id))
              .map(c => (
                <div
                  key={c.id}
                  className="p-3 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded border border-[#B83A2D]/30 mizige-bg flex items-center justify-center font-serif-sc text-xl font-bold text-[#24292E]">
                      {c.char}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-medium text-[#B83A2D]">{c.pinyin}</div>
                      <div className="text-[11px] text-[#8C8273]">{c.phrases[0]}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleCharMaster(c.id)}
                    className="text-xs px-2 py-1 bg-white border border-[#DDD7CD] hover:border-[#16A34A] hover:text-[#16A34A] rounded text-[#57606A] transition-colors"
                  >
                    标为掌握
                  </button>
                </div>
              ))}
          </div>

          {charactersList.every(c => masteredCharIds.includes(c.id)) && (
            <div className="p-8 text-center text-xs text-[#16A34A] bg-[#EBF7EE] rounded-lg">
              🎉 太棒了！当前年级所有核心生字你已经全部标记掌握！
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------
// 工单 14: SmartReviewFlow - 智能复习流 (默认入口)
// ------------------------------------------------------------
// 阶段:
//   1) preview: 选定范围后显示 "X 个生字 / X 个词语 / X 个句子 / X 分钟" + [开始复习]
//   2) in-progress: 按顺序显示 buildReviewQuestions 生成的混合题型, 记录 AnswerRecord
//   3) finished: 显示正确数 / 错误数 / 需要再复习 / 学习建议
//
// 算法逻辑全部委托给 utils/reviewAlgorithm.ts, 本组件只负责 UI 与状态.
// ------------------------------------------------------------

interface SmartReviewFlowProps {
  reviewScope: ReviewScope;
  charactersList: CharacterItem[];
  wordsList: WordItem[];
  sentencesList: SentenceItem[];
  masteredCharIds: string[];
  masteredWordIds: string[];
  completedSentenceIds: string[];
  onEarnInk: (amount: number) => void;
  onToggleCharMaster: (id: string) => void;
  onToggleWordMaster: (id: string) => void;
}

type SmartPhase = 'preview' | 'in_progress' | 'finished';

const SmartReviewFlow: React.FC<SmartReviewFlowProps> = ({
  reviewScope,
  charactersList,
  wordsList,
  sentencesList,
  masteredCharIds,
  masteredWordIds,
  completedSentenceIds,
  onEarnInk,
  onToggleCharMaster,
}) => {
  const [phase, setPhase] = useState<SmartPhase>('preview');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // 第一版无 wrongIds 数据 (没有独立的"错题本"), 暂时用"未掌握"作近似.
  // 这样 shouldReviewItem 会把所有未掌握 + 未完成的项目都视为需要今日复习.
  const wrongIds: string[] = useMemo(() => [], []);

  // 范围预览 (X 个生字 / X 个词语 / X 个句子 / X 分钟)
  const scopePreview = useMemo(
    () =>
      previewReviewScope({
        characters: charactersList,
        words: wordsList,
        sentences: sentencesList,
        masteredCharIds,
        masteredWordIds,
        completedSentenceIds,
        wrongIds,
      }),
    [
      charactersList,
      wordsList,
      sentencesList,
      masteredCharIds,
      masteredWordIds,
      completedSentenceIds,
      wrongIds,
    ]
  );

  // 当前选定范围应复习的题目 (混合题型 + 错题优先 + 未掌握优先)
  const questions = useMemo<ReviewQuestion[]>(() => {
    // today 范围: shouldReviewItem 筛选后只保留需要复习的
    // 其他范围 (current_lesson / selected / midterm / final): App.tsx 已经按
    // 范围重新拉取并传入 charactersList / wordsList / sentencesList, 这里直接出题.
    return buildReviewQuestions({
      characters: charactersList,
      words: wordsList,
      sentences: sentencesList,
      masteredCharIds,
      masteredWordIds,
      completedSentenceIds,
      wrongIds,
      maxQuestions: reviewScope === 'today' ? 15 : 20,
    });
  }, [
    charactersList,
    wordsList,
    sentencesList,
    masteredCharIds,
    masteredWordIds,
    completedSentenceIds,
    wrongIds,
    reviewScope,
  ]);

  const currentQ = questions[currentIdx];

  // 开始复习
  const handleStart = () => {
    if (questions.length === 0) return;
    setPhase('in_progress');
    setCurrentIdx(0);
    setRecords([]);
    setUserAnswer('');
    setFeedback(null);
  };

  // 提交答案
  const handleSubmit = () => {
    if (!currentQ || feedback !== null) return;
    const clean = userAnswer.trim().toLowerCase();
    const ans = currentQ.answer.trim().toLowerCase();
    const isCorrect = clean !== '' && clean === ans;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setRecords((prev) => [
      ...prev,
      { question: currentQ, userAnswer: userAnswer.trim(), isCorrect },
    ]);
    if (isCorrect) {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setUserAnswer('');
      setFeedback(null);
    } else {
      // 全部完成
      setPhase('finished');
      onEarnInk(40);
    }
  };

  // 重置
  const handleRestart = () => {
    setPhase('preview');
    setCurrentIdx(0);
    setRecords([]);
    setUserAnswer('');
    setFeedback(null);
  };

  // 阶段 1: preview
  if (phase === 'preview') {
    const totalItems =
      scopePreview.charCount + scopePreview.wordCount + scopePreview.sentenceCount;
    return (
      <div className="bg-white border border-[#E6E1D8] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0ECE4]">
          <Sparkles size={16} className="text-[#B83A2D]" />
          <h3 className="text-base font-bold font-serif-sc text-[#24292E]">
            本次复习
          </h3>
          <span className="text-xs text-[#8C8273]">· 系统自动出题</span>
        </div>

        {totalItems === 0 ? (
          <div className="p-6 text-center text-xs text-[#57606A] bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg">
            当前范围没有需要复习的内容, 可以休息一下, 或者切换其他范围.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-[#FAF6EE] border border-[#ECD9BF]">
                <div className="text-2xl font-bold font-mono text-[#B83A2D]">
                  {scopePreview.charCount}
                </div>
                <div className="text-[10px] text-[#57606A]">生字</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#EBF7EE] border border-[#C6E9CC]">
                <div className="text-2xl font-bold font-mono text-[#1B4D3E]">
                  {scopePreview.wordCount}
                </div>
                <div className="text-[10px] text-[#57606A]">词语</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#FAF8F5] border border-[#DDD7CD]">
                <div className="text-2xl font-bold font-mono text-[#92400E]">
                  {scopePreview.sentenceCount}
                </div>
                <div className="text-[10px] text-[#57606A]">句子</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#57606A] bg-[#FAF8F5] p-3 rounded-lg border border-[#EDE7DC]">
              <span>预计约 {scopePreview.estimatedMinutes} 分钟</span>
              <span>共 {questions.length} 题 · 混合题型</span>
            </div>

            <button
              onClick={handleStart}
              disabled={questions.length === 0}
              className="w-full py-3 bg-[#B83A2D] text-white text-sm font-medium rounded-lg hover:bg-[#9E2F23] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={16} />
              <span>开始复习</span>
            </button>
          </>
        )}
      </div>
    );
  }

  // 阶段 2: in_progress
  if (phase === 'in_progress' && currentQ) {
    const isChoice = Array.isArray(currentQ.options) && currentQ.options.length > 0;
    return (
      <div className="bg-white border border-[#E6E1D8] rounded-xl p-6 shadow-xs space-y-5">
        {/* 进度条 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#57606A]">
            <span>{questionTypeLabel(currentQ.type)}</span>
            <span className="font-mono">
              第 {currentIdx + 1} / {questions.length} 题
            </span>
          </div>
          <div className="h-1.5 bg-[#F0ECE4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B83A2D] transition-all"
              style={{
                width: `${((currentIdx) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* 题目 */}
        <div className="space-y-4">
          <div className="text-center py-6">
            {currentQ.type === 'audio_to_char' ? (
              <button
                onClick={() => currentQ.audioText && speakChinese(currentQ.audioText)}
                className="w-20 h-20 mx-auto rounded-full bg-[#FAF6EE] text-[#B83A2D] hover:bg-[#F2ECE0] border-2 border-[#B83A2D]/30 flex items-center justify-center transition-transform hover:scale-105 shadow-inner"
                title="点击播放发音"
              >
                <Volume2 size={36} />
              </button>
            ) : (
              <div className="font-serif-sc font-bold text-[#24292E] text-4xl">
                {currentQ.prompt}
              </div>
            )}
            {currentQ.hint && (
              <div className="text-xs text-[#8C8273] mt-3 italic">
                提示: {currentQ.hint}
              </div>
            )}
          </div>

          {/* 答题区 */}
          {isChoice ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currentQ.options!.map((opt) => {
                const selected = userAnswer === opt;
                const isCorrectOpt = opt === currentQ.answer;
                const showResult = feedback !== null;
                return (
                  <button
                    key={opt}
                    onClick={() => feedback === null && setUserAnswer(opt)}
                    disabled={showResult}
                    className={`py-3 rounded-lg border text-2xl font-serif-sc font-bold transition-colors ${
                      showResult && isCorrectOpt
                        ? 'bg-[#EBF7EE] border-[#16A34A] text-[#16A34A]'
                        : showResult && selected && !isCorrectOpt
                        ? 'bg-[#FEF2F2] border-[#B83A2D] text-[#B83A2D]'
                        : selected
                        ? 'bg-[#FAF6EE] border-[#B83A2D] text-[#24292E]'
                        : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#57606A] hover:bg-[#F2ECE0]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              placeholder="请输入答案..."
              value={userAnswer}
              disabled={feedback !== null}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !feedback && userAnswer.trim()) {
                  handleSubmit();
                }
              }}
              className="w-full text-center text-lg font-serif-sc py-2.5 px-4 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D] text-[#24292E] bg-white placeholder-[#A8A196]"
            />
          )}

          {/* 反馈 */}
          {feedback === null ? (
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="w-full py-2.5 bg-[#B83A2D] text-white text-xs font-medium rounded-lg hover:bg-[#9E2F23] disabled:opacity-40 transition-colors"
            >
              提交答案
            </button>
          ) : (
            <div className="space-y-3">
              {feedback === 'correct' ? (
                <div className="p-3 rounded-lg bg-[#EBF7EE] text-[#16A34A] text-xs flex items-center justify-center gap-1.5 font-medium">
                  <CheckCircle2 size={16} />
                  <span>回答正确!</span>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#FEF2F2] text-[#B83A2D] text-xs space-y-1">
                  <p className="font-semibold">回答需巩固!</p>
                  <p>正确答案: {currentQ.answer}</p>
                </div>
              )}
              <button
                onClick={handleNext}
                className="w-full py-2.5 bg-[#24292E] text-white text-xs font-medium rounded-lg hover:bg-[#333A42] transition-colors"
              >
                {currentIdx < questions.length - 1 ? '下一题 →' : '查看本次成绩'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 阶段 3: finished
  if (phase === 'finished') {
    const summary = summarizeReviewSession(records);
    const correctRate =
      summary.total > 0
        ? Math.round((summary.correctCount / summary.total) * 100)
        : 0;

    return (
      <div className="bg-white border border-[#E6E1D8] rounded-xl p-6 shadow-xs space-y-5">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF6EE] text-[#B83A2D] flex items-center justify-center mb-3">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold font-serif-sc text-[#24292E]">
            复习完成!
          </h3>
          <p className="text-xs text-[#57606A] mt-1">
            共 {summary.total} 题 · 正确率 {correctRate}%
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-[#EBF7EE] border border-[#C6E9CC]">
            <div className="text-2xl font-bold font-mono text-[#16A34A]">
              {summary.correctCount}
            </div>
            <div className="text-[10px] text-[#57606A]">正确</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5]">
            <div className="text-2xl font-bold font-mono text-[#B83A2D]">
              {summary.wrongCount}
            </div>
            <div className="text-[10px] text-[#57606A]">错误</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#FAF6EE] border border-[#ECD9BF]">
            <div className="text-2xl font-bold font-mono text-[#92400E]">
              {summary.wrongItems.length}
            </div>
            <div className="text-[10px] text-[#57606A]">需要再复习</div>
          </div>
        </div>

        {/* 学习建议 */}
        <div className="text-xs text-[#57606A] bg-[#FAF8F5] p-3 rounded-lg border border-[#EDE7DC]">
          <strong>学习建议: </strong>{summary.suggestion}
        </div>

        {/* 需要再复习的题目列表 */}
        {summary.wrongItems.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[#B83A2D]">需要再复习</div>
            <div className="flex flex-wrap gap-1.5">
              {summary.wrongItems.slice(0, 12).map((w, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs font-serif-sc font-bold bg-[#FAF8F5] border border-[#DDD7CD] rounded text-[#24292E]"
                >
                  {w.prompt}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleRestart}
            className="flex-1 py-2.5 bg-[#B83A2D] text-white text-xs font-medium rounded-lg hover:bg-[#9E2F23] transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCw size={14} />
            <span>再练一次</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// ------------------------------------------------------------
// 工单 10: 教材复习概览卡片
// ------------------------------------------------------------
// 显示当前教材课程的复习统计: 课文名称 + 生字/词语/句子 已掌握/待复习 数量.
// 复习统计严格按当前教材课程的 ID 过滤, 不会因为用户掌握了
// 原 curriculum (c-g3-*) 而误统计教材生字为已掌握.
// "待复习"定义: 教材内容 ID 不在用户对应 progress 数组中.
// ------------------------------------------------------------

interface TextbookReviewOverviewProps {
  lessonTitle: string;
  charactersList: CharacterItem[];
  wordsList: WordItem[];
  sentencesList: SentenceItem[];
  masteredCharIds: string[];
  masteredWordIds: string[];
  completedSentenceIds: string[];
  onEnterLearn: (tab: MainTab) => void;
}

function TextbookReviewOverview({
  lessonTitle,
  charactersList,
  wordsList,
  sentencesList,
  masteredCharIds,
  masteredWordIds,
  completedSentenceIds,
  onEnterLearn,
}: TextbookReviewOverviewProps) {
  // 严格按当前教材课程的 ID 过滤 (不依赖 c-g3-* / w-g3-* / s-g3-* 等原 curriculum ID)
  const charMastered = charactersList.filter(c => masteredCharIds.includes(c.id)).length;
  const charTotal = charactersList.length;
  const charPending = charTotal - charMastered;

  const wordMastered = wordsList.filter(w => masteredWordIds.includes(w.id)).length;
  const wordTotal = wordsList.length;
  const wordPending = wordTotal - wordMastered;

  const sentCompleted = sentencesList.filter(s => completedSentenceIds.includes(s.id)).length;
  const sentTotal = sentencesList.length;
  const sentPending = sentTotal - sentCompleted;

  const totalMastered = charMastered + wordMastered + sentCompleted;
  const totalItems = charTotal + wordTotal + sentTotal;
  const overallPct = totalItems > 0 ? Math.round((totalMastered / totalItems) * 100) : 0;

  // 预览待复习内容 (前 3 条)
  const pendingChars = charactersList.filter(c => !masteredCharIds.includes(c.id)).slice(0, 3);
  const pendingWords = wordsList.filter(w => !masteredWordIds.includes(w.id)).slice(0, 3);
  const pendingSents = sentencesList.filter(s => !completedSentenceIds.includes(s.id)).slice(0, 3);

  const cards: { tab: MainTab; label: string; total: number; mastered: number; pending: number; pendingPreview: { id: string; text: string; sub?: string }[]; color: string; }[] = [
    {
      tab: 'character', label: '生字', total: charTotal, mastered: charMastered, pending: charPending,
      pendingPreview: pendingChars.map(c => ({ id: c.id, text: c.char, sub: c.pinyin })),
      color: '#B83A2D',
    },
    {
      tab: 'word', label: '词语', total: wordTotal, mastered: wordMastered, pending: wordPending,
      pendingPreview: pendingWords.map(w => ({ id: w.id, text: w.word, sub: w.pinyin })),
      color: '#1B4D3E',
    },
    {
      tab: 'sentence', label: '句子', total: sentTotal, mastered: sentCompleted, pending: sentPending,
      pendingPreview: pendingSents.map(s => ({ id: s.id, text: s.originalText })),
      color: '#92400E',
    },
  ];

  return (
    <div className="bg-white border border-[#E8E3DA] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header: 课文名称 + 总体进度 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE4]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#1B4D3E] bg-[#EBF7EE] px-2.5 py-0.5 rounded border border-[#C6E9CC]">
              教材复习
            </span>
            <h3 className="text-lg font-bold font-serif-sc text-[#24292E]">
              {lessonTitle}
            </h3>
          </div>
          <p className="text-xs text-[#57606A] mt-1">
            按本课实际内容统计, 只包含本课的生字、词语与句子
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-[#8C8273]">总体进度</div>
            <div className="text-lg font-bold font-mono text-[#B83A2D]">
              {totalMastered}/{totalItems}
            </div>
          </div>
          <div className="w-16 h-16 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EFECE6" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" stroke="#B83A2D" strokeWidth="3"
                strokeDasharray={`${(overallPct / 100) * 97.4} 97.4`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#24292E]">
              {overallPct}%
            </div>
          </div>
        </div>
      </div>

      {/* 三类复习统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map(card => (
          <div
            key={card.tab}
            className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EDE7DD] space-y-3 flex flex-col"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: card.color }}
                />
                <span className="text-sm font-bold text-[#24292E]">{card.label}</span>
              </div>
              <span className="text-xs font-mono text-[#57606A]">
                <span className="font-bold text-[#16A34A]">{card.mastered}</span>
                <span className="text-[#A8A196]"> / {card.total}</span>
              </span>
            </div>

            {/* 进度条 */}
            <div className="h-1.5 bg-[#EFECE6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${card.total > 0 ? (card.mastered / card.total) * 100 : 0}%`,
                  backgroundColor: card.color,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#16A34A]">已掌握 {card.mastered}</span>
              <span className="text-[#B83A2D]">待复习 {card.pending}</span>
            </div>

            {/* 待复习预览 */}
            {card.pendingPreview.length > 0 && (
              <div className="pt-2 border-t border-[#E6DFD1] space-y-1">
                <div className="text-[11px] text-[#8C8273]">待复习预览：</div>
                {card.pendingPreview.map(p => (
                  <div key={p.id} className="text-xs text-[#24292E] flex items-center gap-1.5">
                    <span className="font-serif-sc font-medium truncate">{p.text}</span>
                    {p.sub && <span className="text-[#8C8273] font-mono text-[10px] shrink-0">{p.sub}</span>}
                  </div>
                ))}
                {card.pending > card.pendingPreview.length && (
                  <div className="text-[11px] text-[#A8A196]">
                    ...还有 {card.pending - card.pendingPreview.length} 条
                  </div>
                )}
              </div>
            )}

            {/* 进入复习入口 */}
            <button
              onClick={() => onEnterLearn(card.tab)}
              className="mt-auto flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: card.color }}
            >
              复习{card.label} <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
