import React, { useState, useMemo, useRef } from 'react';
import { Volume2, CheckCircle2, Circle, RotateCw, Sparkles, BookOpen, Layers, Shuffle, CheckSquare } from 'lucide-react';
import { WordItem, GradeId } from '../types/chinese';
import { speakChinese } from '../utils/speech';
import { useAuth } from '../contexts/AuthContext';
import { recordWordPractice } from '../api/practice';
import { WordPractice } from './WordPractice';

interface WordModuleProps {
  gradeId: GradeId;
  wordsList: WordItem[];
  masteredIds: string[];
  onToggleMaster: (id: string) => void;
}

export const WordModule: React.FC<WordModuleProps> = ({
  gradeId,
  wordsList,
  masteredIds,
  onToggleMaster
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'flashcard'>('list');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Random and selection states
  const [randomCount, setRandomCount] = useState<number | 'all'>('all');
  const [shuffledSeed, setShuffledSeed] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectModeActive, setSelectModeActive] = useState(false);

  // 工单 15: 防重复计数 (与 CharacterModule 同策略). 不放进
  // useEffect, 只在用户点击 "标为已掌握" / flashcard "打卡掌握"
  // 时触发.
  const { accessToken } = useAuth();
  const inFlightWordRef = useRef<Set<string>>(new Set());

  const handleToggleMasterWithPractice = (id: string) => {
    const isBecomingMastered = !masteredIds.includes(id);
    onToggleMaster(id);

    if (isBecomingMastered && accessToken && !inFlightWordRef.current.has(id)) {
      inFlightWordRef.current.add(id);
      recordWordPractice(accessToken, { itemId: id, result: 'correct' })
        .catch((err) => {
          console.warn('记录词语练习失败, 不影响学习:', err);
        })
        .finally(() => {
          inFlightWordRef.current.delete(id);
        });
    }
  };

  // Compute displayed words
  const displayedWords = useMemo(() => {
    let list = [...wordsList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(w =>
        w.word.includes(q) ||
        w.pinyin.toLowerCase().includes(q) ||
        w.definition.includes(q)
      );
    }

    if (selectModeActive && selectedIds.length > 0) {
      list = list.filter(w => selectedIds.includes(w.id));
    }

    if (randomCount !== 'all') {
      const count = Math.min(Number(randomCount), list.length);
      const shuffled = [...list].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

    return list;
  }, [wordsList, searchQuery, selectModeActive, selectedIds, randomCount, shuffledSeed]);

  const activeCardWord = displayedWords[currentCardIndex] || displayedWords[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % (displayedWords.length || 1));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + displayedWords.length) % (displayedWords.length || 1));
  };

  const handleRandomPick = (count: number | 'all') => {
    setSelectModeActive(false);
    setRandomCount(count);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShuffledSeed(Date.now());
  };

  const toggleSelectWord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and View Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D8]">
        <div>
          <h2 className="text-xl font-bold font-serif-sc text-[#24292E] flex items-center gap-2">
            <span>精品词语与成语积累</span>
          </h2>
          <p className="text-xs text-[#57606A] mt-0.5">
            共 {wordsList.length} 条词语 · 当前展示 {displayedWords.length} 条 · 已掌握 {wordsList.filter(w => masteredIds.includes(w.id)).length} 条
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-[#EBE7DF] rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              <BookOpen size={13} />
              <span>全览清单</span>
            </button>
            <button
              onClick={() => setViewMode('flashcard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'flashcard'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              <Layers size={13} />
              <span>抽认卡模式</span>
            </button>
          </div>
        </div>
      </div>

      {/* Select / Random Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-[#E8E3DA] rounded-xl text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#8C8273] font-medium mr-1 flex items-center gap-1">
            <Shuffle size={13} /> 抽样词语：
          </span>
          <button
            onClick={() => handleRandomPick('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              randomCount === 'all' && !selectModeActive
                ? 'bg-[#B83A2D] text-white font-medium'
                : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
            }`}
          >
            全部 ({wordsList.length})
          </button>
          <button
            onClick={() => handleRandomPick(2)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              randomCount === 2 && !selectModeActive
                ? 'bg-[#B83A2D] text-white font-medium'
                : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
            }`}
          >
            随机 2 个
          </button>
          <button
            onClick={() => handleRandomPick(3)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              randomCount === 3 && !selectModeActive
                ? 'bg-[#B83A2D] text-white font-medium'
                : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
            }`}
          >
            随机 3 个
          </button>

          {randomCount !== 'all' && (
            <button
              onClick={() => setShuffledSeed(Date.now())}
              className="px-2 py-1 bg-[#FAF6EE] text-[#B83A2D] rounded-md border border-[#B83A2D]/30 hover:bg-[#F2ECE0] flex items-center gap-1"
            >
              <Shuffle size={12} /> 换一批
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索词语或成语..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 text-xs bg-white border border-[#DDD7CD] rounded-md focus:outline-none focus:border-[#B83A2D] text-[#24292E] placeholder-[#8C8273] w-36"
          />

          <button
            onClick={() => {
              setSelectModeActive(!selectModeActive);
              if (!selectModeActive) {
                setRandomCount('all');
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              selectModeActive
                ? 'bg-[#24292E] text-white font-medium'
                : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
            }`}
          >
            <CheckSquare size={13} />
            <span>{selectModeActive ? `自选 (${selectedIds.length})` : '自选指定词'}</span>
          </button>
        </div>
      </div>

      {/* List Mode */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedWords.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-xs text-[#8C8273] bg-white border border-[#E6E1D8] rounded-xl">
              没有找到符合条件的词语
            </div>
          ) : (
            displayedWords.map((item) => {
              const isMastered = masteredIds.includes(item.id);
              const isCheckedInSelect = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#E8E3DA] rounded-xl p-5 shadow-xs hover:border-[#D1C9BC] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        {selectModeActive && (
                          <input
                            type="checkbox"
                            checked={isCheckedInSelect}
                            onChange={(e) => toggleSelectWord(item.id, e as any)}
                            className="rounded text-[#B83A2D] focus:ring-[#B83A2D] h-4 w-4 mt-1"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold font-serif-sc text-[#24292E] tracking-wide">
                              {item.word}
                            </h3>
                            <button
                              onClick={() => speakChinese(item.word)}
                              className="p-1 rounded-full text-[#B83A2D] hover:bg-[#FAF6EE] transition-colors"
                              title="朗读发音"
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#57606A]">
                            <span className="font-mono text-[#B83A2D]">{item.pinyin}</span>
                            <span aria-hidden="true">·</span>
                            <span>词性：{item.pos}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleMasterWithPractice(item.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors ${
                          isMastered
                            ? 'bg-[#EBF7EE] text-[#16A34A] border border-[#C6E9CC]'
                            : 'bg-[#F4F1EA] text-[#57606A] hover:text-[#24292E] border border-[#DDD7CD]'
                        }`}
                      >
                        {isMastered ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>已掌握</span>
                          </>
                        ) : (
                          <>
                            <Circle size={13} />
                            <span>打卡掌握</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#333C48] leading-relaxed">
                      {item.definition}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF8F4] p-2.5 rounded-lg border border-[#EDE7DD]">
                      <div>
                        <span className="text-[#8C8273] font-medium mr-1.5">近义词：</span>
                        <span className="text-[#24292E] font-medium">
                          {item.synonyms.join('、') || '暂无'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C8273] font-medium mr-1.5">反义词：</span>
                        <span className="text-[#24292E] font-medium">
                          {item.antonyms.join('、') || '暂无'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#8C8273]">
                        <span>例句造句</span>
                        <button
                          onClick={() => speakChinese(item.exampleSentence)}
                          className="hover:text-[#B83A2D] flex items-center gap-1"
                        >
                          <Volume2 size={12} /> 读例句
                        </button>
                      </div>
                      <p className="text-xs text-[#24292E] font-serif-sc bg-[#FAF8F5] p-2.5 rounded border-l-2 border-[#B83A2D]">
                        “{item.exampleSentence}”
                      </p>
                    </div>

                    {item.culturalNote && (
                      <div className="flex items-start gap-1.5 text-xs text-[#6B5A3E] bg-[#FFFBEB] p-2 rounded border border-[#FDE68A]">
                        <Sparkles size={13} className="text-[#D97706] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong className="text-[#92400E]">文化溯源：</strong> {item.culturalNote}
                        </span>
                      </div>
                    )}

                    {/* 工单 16: 词语练一练 (四选一选拼音 -> 上报 practice) */}
                    <WordPractice word={item} courseWords={wordsList} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Flashcard Mode */}
      {viewMode === 'flashcard' && activeCardWord && (
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <div className="text-xs text-[#57606A]">
            卡片 {currentCardIndex + 1} / {displayedWords.length} · 点击卡片翻转查看释义与例句
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-md h-80 bg-white border border-[#DDD7CD] rounded-2xl p-8 shadow-sm cursor-pointer hover:shadow-md transition-all relative flex flex-col justify-between select-none"
          >
            <div className="flex items-center justify-between text-xs text-[#8C8273]">
              <span className="font-mono">{isFlipped ? '【背面 · 详解】' : '【正面 · 词语】'}</span>
              <span className="flex items-center gap-1 text-[#B83A2D]">
                <RotateCw size={12} /> 点击卡片翻面
              </span>
            </div>

            {!isFlipped ? (
              <div className="text-center my-auto space-y-3">
                <h3 className="text-4xl font-serif-sc font-bold text-[#24292E] tracking-wider">
                  {activeCardWord.word}
                </h3>
                <p className="text-lg font-mono text-[#B83A2D]">{activeCardWord.pinyin}</p>
                <p className="text-xs text-[#8C8273]">词性：{activeCardWord.pos}</p>
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakChinese(activeCardWord.word);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6EE] text-xs text-[#B83A2D] hover:bg-[#F2ECE0]"
                  >
                    <Volume2 size={14} /> 聆听发音
                  </button>
                </div>
              </div>
            ) : (
              <div className="my-auto space-y-3 text-left">
                <div>
                  <h4 className="text-xs font-semibold text-[#8C8273]">词义解析</h4>
                  <p className="text-sm text-[#24292E] mt-1 leading-relaxed">
                    {activeCardWord.definition}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF8F4] p-2.5 rounded-lg border border-[#EDE7DD]">
                  <div>
                    <span className="text-[#8C8273]">近义词：</span>
                    <span className="text-[#24292E]">{activeCardWord.synonyms.join('、') || '暂无'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8273]">反义词：</span>
                    <span className="text-[#24292E]">{activeCardWord.antonyms.join('、') || '暂无'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-[#8C8273]">造句范例</h4>
                  <p className="text-xs text-[#24292E] font-serif-sc mt-1 italic">
                    “{activeCardWord.exampleSentence}”
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE4]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMasterWithPractice(activeCardWord.id);
                }}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  masteredIds.includes(activeCardWord.id)
                    ? 'text-[#16A34A] bg-[#EBF7EE]'
                    : 'text-[#57606A] bg-[#F4F1EA] hover:text-[#24292E]'
                }`}
              >
                {masteredIds.includes(activeCardWord.id) ? '✓ 已记熟' : '标为熟记'}
              </button>

              <span className="text-xs text-[#A8A196]">
                {currentCardIndex + 1} / {displayedWords.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevCard}
              className="px-4 py-2 text-xs font-medium text-[#24292E] bg-white border border-[#DDD7CD] rounded-lg hover:bg-[#F6F4EE] transition-colors"
            >
              ← 上一张
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 text-xs font-medium text-[#B83A2D] bg-[#FAF6EE] border border-[#B83A2D]/30 rounded-lg hover:bg-[#F2ECE0] transition-colors"
            >
              翻转卡片
            </button>
            <button
              onClick={handleNextCard}
              className="px-4 py-2 text-xs font-medium text-[#24292E] bg-white border border-[#DDD7CD] rounded-lg hover:bg-[#F6F4EE] transition-colors"
            >
              下一张 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
