import React, { useState, useMemo } from 'react';
import { RotateCw, Volume2, CheckCircle2, HelpCircle, Layers, Headphones, Sparkles, Shuffle, CheckSquare, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GradeId, CharacterItem, WordItem, SentenceItem, MainTab } from '../types/chinese';
import { speakChinese } from '../utils/speech';

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
}) => {
  const [reviewTab, setReviewTab] = useState<'flashcard' | 'dictation' | 'needs_work'>('flashcard');

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

        <div className="flex items-center p-1 bg-[#EBE7DF] rounded-lg">
          <button
            onClick={() => setReviewTab('flashcard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
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
            按本课实际教材内容统计 · 严格按 ID 过滤, 不混入原 curriculum 数据
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
