import React, { useState, useMemo, useRef } from 'react';
import { Volume2, CheckCircle2, Circle, PenTool, Sparkles, X, ChevronRight, BookOpen, Shuffle, AlertTriangle, ListFilter, CheckSquare } from 'lucide-react';
import { CharacterItem, GradeId } from '../types/chinese';
import { speakChinese, speakChar, speakPinyin } from '../utils/speech';
import { HandwritingCanvas } from './HandwritingCanvas';
import { CharacterPractice } from './CharacterPractice';
import { useAuth } from '../contexts/AuthContext';
import { recordCharacterPractice } from '../api/practice';

interface CharacterModuleProps {
  gradeId: GradeId;
  charactersList: CharacterItem[];
  masteredIds: string[];
  onToggleMaster: (id: string) => void;
}

export const CharacterModule: React.FC<CharacterModuleProps> = ({
  gradeId,
  charactersList,
  masteredIds,
  onToggleMaster
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(charactersList[0]?.id || '');
  const [showCanvasModal, setShowCanvasModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Selection and Random Modes
  const [randomCount, setRandomCount] = useState<number | 'all'>('all');
  const [shuffledSeed, setShuffledSeed] = useState(0);
  const [onlyPhoneticTrap, setOnlyPhoneticTrap] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectModeActive, setSelectModeActive] = useState(false);

  // 工单 15: 防重复计数 - 记录正在上报的 itemId, 同一 itemId 在
  // 上一次请求未完成前不会再次发起. 不放进 useEffect, 只在用户
  // 明确点击 "标为已掌握" / "练好" 时触发, 所以 StrictMode 也不会
  // 重复调用 (StrictMode 只会双调用 render 与 effect, 不会双调用
  // 事件 handler).
  const { accessToken } = useAuth();
  const inFlightCharRef = useRef<Set<string>>(new Set());

  const handleToggleMasterWithPractice = (id: string) => {
    // 判断方向: 之前未掌握 → 现在标为掌握 (一次正确练习).
    // 之前已掌握 → 现在取消掌握 (撤销, 不算练习, 不上报).
    const isBecomingMastered = !masteredIds.includes(id);

    // 先调用原有逻辑 (更新 mastered 数组 + 墨滴)
    onToggleMaster(id);

    // 工单 15: 上报练习事件. 失败不阻断学习, 不抛错给 UI.
    if (isBecomingMastered && accessToken && !inFlightCharRef.current.has(id)) {
      inFlightCharRef.current.add(id);
      recordCharacterPractice(accessToken, { itemId: id, result: 'correct' })
        .catch((err) => {
          console.warn('记录生字练习失败, 不影响学习:', err);
        })
        .finally(() => {
          inFlightCharRef.current.delete(id);
        });
    }
  };

  // Compute displayed list based on filters and random selection
  const displayedCharacters = useMemo(() => {
    let list = [...charactersList];

    if (onlyPhoneticTrap) {
      list = list.filter(c => !!c.phoneticTrap);
    }

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      list = list.filter(c =>
        c.char.includes(q) ||
        c.pinyin.toLowerCase().includes(q) ||
        c.meanings.some(m => m.includes(q))
      );
    }

    if (selectModeActive && selectedIds.length > 0) {
      list = list.filter(c => selectedIds.includes(c.id));
    }

    if (randomCount !== 'all') {
      // Deterministic shuffle with seed
      const count = Math.min(Number(randomCount), list.length);
      const shuffled = [...list].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

    return list;
  }, [charactersList, onlyPhoneticTrap, filterQuery, selectModeActive, selectedIds, randomCount, shuffledSeed]);

  const activeChar = charactersList.find(c => c.id === selectedCharId) || displayedCharacters[0] || charactersList[0];
  const isMastered = activeChar ? masteredIds.includes(activeChar.id) : false;

  const handleRandomPick = (count: number | 'all') => {
    setSelectModeActive(false);
    setRandomCount(count);
    setShuffledSeed(Date.now());
  };

  const toggleSelectChar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D8]">
        <div>
          <h2 className="text-xl font-bold font-serif-sc text-[#24292E] flex items-center gap-2">
            <span>生字识写与探微</span>
          </h2>
          <p className="text-xs text-[#57606A] mt-0.5">
            共 {charactersList.length} 个生字 · 当前展示 {displayedCharacters.length} 个 · 已掌握 {charactersList.filter(c => masteredIds.includes(c.id)).length} 个
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索汉字或拼音..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-[#DDD7CD] rounded-md focus:outline-none focus:border-[#B83A2D] text-[#24292E] placeholder-[#8C8273] w-40"
          />
        </div>
      </div>

      {/* Select Specific / Random Count Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-[#E8E3DA] rounded-xl text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#8C8273] font-medium mr-1 flex items-center gap-1">
            <Shuffle size={13} /> 抽样学习：
          </span>
          <button
            onClick={() => handleRandomPick('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              randomCount === 'all' && !selectModeActive
                ? 'bg-[#B83A2D] text-white font-medium'
                : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
            }`}
          >
            全部 ({charactersList.length})
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
          <button
            onClick={() => handleRandomPick(5)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              randomCount === 5 && !selectModeActive
                ? 'bg-[#B83A2D] text-white font-medium'
                : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
            }`}
          >
            随机 5 个
          </button>

          {/* Re-shuffle trigger if random is active */}
          {randomCount !== 'all' && (
            <button
              onClick={() => setShuffledSeed(Date.now())}
              className="px-2 py-1 bg-[#FAF6EE] text-[#B83A2D] rounded-md border border-[#B83A2D]/30 hover:bg-[#F2ECE0] flex items-center gap-1"
              title="换一批随机生字"
            >
              <Shuffle size={12} /> 换一批
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Only Phonetic Trap filter */}
          <button
            onClick={() => setOnlyPhoneticTrap(!onlyPhoneticTrap)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              onlyPhoneticTrap
                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B] font-medium'
                : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border border-[#DDD7CD]'
            }`}
          >
            <AlertTriangle size={13} className="text-[#D97706]" />
            <span>仅看前后鼻音/易错字</span>
          </button>

          {/* Select Mode Switch */}
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
            <span>{selectModeActive ? `自定义勾选中 (${selectedIds.length})` : '自选指定字'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Character Cards List */}
        <div className="lg:col-span-4 space-y-2 max-h-[620px] overflow-y-auto pr-1">
          {displayedCharacters.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8C8273] bg-white border border-[#E6E1D8] rounded-xl">
              没有找到符合条件的生字
            </div>
          ) : (
            displayedCharacters.map((item) => {
              const mastered = masteredIds.includes(item.id);
              const isSelected = activeChar?.id === item.id;
              const isCheckedInSelectMode = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCharId(item.id)}
                  className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-[#B83A2D] shadow-sm ring-1 ring-[#B83A2D]/20'
                      : 'bg-white/80 border-[#E8E3DA] hover:border-[#CFC7B9] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {selectModeActive && (
                      <input
                        type="checkbox"
                        checked={isCheckedInSelectMode}
                        onChange={(e) => toggleSelectChar(item.id, e as any)}
                        className="rounded text-[#B83A2D] focus:ring-[#B83A2D] h-4 w-4"
                      />
                    )}

                    <div className="w-12 h-12 rounded border border-[#B83A2D]/30 mizige-bg flex items-center justify-center font-serif-sc text-2xl font-bold text-[#24292E]">
                      {item.char}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-medium text-[#B83A2D]">{item.pinyin}</span>
                        {item.phoneticTrap && (
                          <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.2 rounded font-medium">
                            易错
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#57606A] mt-0.5 line-clamp-1">
                        {item.phrases.slice(0, 2).join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {mastered ? (
                      <span className="text-[11px] text-[#16A34A] font-medium flex items-center gap-1">
                        <CheckCircle2 size={13} /> 已掌握
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#8C8273]">待巩固</span>
                    )}
                    <ChevronRight size={14} className="text-[#A8A196]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Character Exploration & Stroke Order / Phonetic Traps */}
        {activeChar && (
          <div className="lg:col-span-8 bg-white border border-[#E6E1D8] rounded-xl p-6 shadow-xs space-y-6">
            {/* Header with Tianzige, Pronunciation, Quick Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#F0ECE4]">
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 rounded-lg border-2 border-[#B83A2D]/40 mizige-bg flex items-center justify-center font-serif-sc text-6xl font-bold text-[#24292E] shadow-inner">
                  {activeChar.char}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-serif-sc text-[#B83A2D] tracking-wide">
                      {activeChar.pinyin}
                    </span>
                    {/* 工单 14: 朗读生字只朗读目标汉字本身, 不带拼音/释义/按钮文本.
                        朗读拼音单独走 speakPinyin, 与汉字朗读分开. */}
                    <button
                      onClick={() => speakChar(activeChar.char)}
                      className="p-1.5 rounded-full bg-[#FAF6EE] text-[#B83A2D] hover:bg-[#F2ECE0] transition-colors"
                      title="朗读生字"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      onClick={() => speakPinyin(activeChar.pinyin)}
                      className="p-1.5 rounded-full bg-[#FAF6EE] text-[#1B4D3E] hover:bg-[#EBF7EE] transition-colors"
                      title="朗读拼音"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#57606A] mt-2">
                    <span>部首：<strong className="text-[#24292E]">{activeChar.radical}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>笔画：<strong className="text-[#24292E]">{activeChar.strokeCount}画</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>结构：<strong className="text-[#24292E]">{activeChar.structure}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setShowCanvasModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#24292E] bg-[#F4F1EA] hover:bg-[#EAE4D8] border border-[#DDD7CD] rounded-lg transition-colors"
                >
                  <PenTool size={14} className="text-[#B83A2D]" />
                  <span>米字格临摹</span>
                </button>

                <button
                  onClick={() => handleToggleMasterWithPractice(activeChar.id)}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isMastered
                      ? 'bg-[#EBF7EE] text-[#16A34A] border border-[#C6E9CC]'
                      : 'bg-[#B83A2D] text-white hover:bg-[#9E2F23]'
                  }`}
                >
                  {isMastered ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>已掌握 (+10墨滴)</span>
                    </>
                  ) : (
                    <>
                      <Circle size={14} />
                      <span>标为已掌握</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 工单 16: 生字练一练 (看拼音写汉字 -> 精确匹配 -> 上报 practice) */}
            {activeChar && (
              <CharacterPractice character={activeChar} />
            )}

            {/* STROKE ORDER DECOMPOSITION (笔顺全部分解与指引) */}
            <div className="bg-[#FAF8F5] border border-[#EDE7DC] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#24292E] flex items-center gap-1.5">
                  <PenTool size={13} className="text-[#B83A2D]" />
                  <span>规范笔顺分解与运笔规律</span>
                </span>
                <span className="text-xs text-[#8C8273]">
                  共 {activeChar.strokeCount} 笔
                </span>
              </div>

              {/* Stroke steps badges */}
              {activeChar.strokeOrderSteps && activeChar.strokeOrderSteps.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {activeChar.strokeOrderSteps.map((stroke, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center bg-white border border-[#DDD7CD] rounded-lg p-2 min-w-[42px] shadow-2xs"
                    >
                      <span className="text-[10px] text-[#8C8273] font-mono mb-1">
                        第{idx + 1}笔
                      </span>
                      <span className="font-serif-sc text-lg font-bold text-[#B83A2D]">
                        {stroke}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#57606A] leading-relaxed">
                <strong className="text-[#24292E]">书写口诀：</strong> {activeChar.strokeOrderHint}
              </p>
            </div>

            {/* PHONETIC TRAP (前后鼻音、平翘舌音易错提醒) */}
            {activeChar.phoneticTrap && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[#92400E] font-bold text-xs">
                  <AlertTriangle size={15} className="text-[#D97706]" />
                  <span>{activeChar.phoneticTrap.label}</span>
                </div>

                <p className="text-xs text-[#78350F] leading-relaxed">
                  {activeChar.phoneticTrap.tip}
                </p>

                {activeChar.phoneticTrap.contrastPair && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#FCD34D]/50 text-xs">
                    {/* Correct Sound */}
                    <div className="p-2 rounded bg-white/80 border border-[#86EFAC] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#16A34A] font-bold block">✓ 正确标准音</span>
                        <span className="font-bold text-[#24292E]">{activeChar.phoneticTrap.contrastPair.correctWord}</span>
                        <span className="text-[#16A34A] font-mono ml-1">({activeChar.phoneticTrap.contrastPair.correctPinyin})</span>
                      </div>
                      <button
                        onClick={() => speakChinese(activeChar.phoneticTrap?.contrastPair?.correctWord || activeChar.char)}
                        className="p-1 rounded bg-[#EBF7EE] text-[#16A34A] hover:bg-[#DCFCE7]"
                        title="朗读正确发音"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>

                    {/* Confusing Sound */}
                    <div className="p-2 rounded bg-white/80 border border-[#FCA5A5] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#DC2626] font-bold block">✗ 易混淆误读音</span>
                        <span className="font-bold text-[#24292E]">{activeChar.phoneticTrap.contrastPair.confusingWord}</span>
                        <span className="text-[#DC2626] font-mono ml-1">({activeChar.phoneticTrap.contrastPair.confusingPinyin})</span>
                      </div>
                      <button
                        onClick={() => speakChinese(activeChar.phoneticTrap?.contrastPair?.confusingWord || '')}
                        className="p-1 rounded bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
                        title="朗读对比词发音"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Meanings */}
            <div>
              <h4 className="text-xs font-bold text-[#24292E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#B83A2D]" />
                <span>字义详解</span>
              </h4>
              <div className="space-y-1.5">
                {activeChar.meanings.map((meaning, idx) => (
                  <div key={idx} className="text-xs text-[#333C48] flex items-start gap-2">
                    <span className="text-[#B83A2D] font-mono text-[11px]">{idx + 1}.</span>
                    <span>{meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Phrases */}
            <div>
              <h4 className="text-xs font-bold text-[#24292E] uppercase tracking-wider mb-2">
                组词造词
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeChar.phrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => speakChinese(phrase)}
                    className="group flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#FAF7F2] hover:bg-[#F2ECE0] border border-[#E4DDD1] rounded-md text-[#24292E] transition-colors"
                  >
                    <span>{phrase}</span>
                    <Volume2 size={12} className="text-[#A8A196] group-hover:text-[#B83A2D]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Example sentence */}
            <div className="bg-[#FAF8F5] border-l-3 border-[#B83A2D] p-3.5 rounded-r-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8C8273]">课文典范例句</span>
                <button
                  onClick={() => speakChinese(activeChar.exampleSentence)}
                  className="text-xs text-[#B83A2D] flex items-center gap-1 hover:underline"
                >
                  <Volume2 size={13} />
                  <span>朗读例句</span>
                </button>
              </div>
              <p className="text-xs text-[#24292E] leading-relaxed font-serif-sc">
                “{activeChar.exampleSentence}”
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Handwriting Canvas Modal */}
      {showCanvasModal && activeChar && (
        <div className="fixed inset-0 z-50 bg-[#24292E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E6E1D8] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE4] mb-5">
              <div>
                <h3 className="font-serif-sc text-lg font-bold text-[#24292E] flex items-center gap-2">
                  <span>米字格书写临摹 · “{activeChar.char}”</span>
                </h3>
                <p className="text-xs text-[#57606A] mt-0.5">
                  拼音：{activeChar.pinyin} · 笔画：{activeChar.strokeCount}画 · 笔顺：{activeChar.strokeOrderHint}
                </p>
              </div>
              <button
                onClick={() => setShowCanvasModal(false)}
                className="p-1 rounded-md text-[#8C8273] hover:text-[#24292E] hover:bg-[#F2ECE0]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <HandwritingCanvas
                targetChar={activeChar.char}
                pinyin={activeChar.pinyin}
                onMastered={() => {
                  handleToggleMasterWithPractice(activeChar.id);
                  setTimeout(() => setShowCanvasModal(false), 800);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
