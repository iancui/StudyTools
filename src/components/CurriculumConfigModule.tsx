import React, { useState } from 'react';
import { Settings, Plus, Trash2, Download, Upload, RotateCcw, CheckCircle2, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { CurriculumConfig, GradeId, CharacterItem, WordItem } from '../types/chinese';
import { GRADES_LIST } from '../data/curriculum';
import { exportCurriculumAsJSON, importCurriculumFromJSON, resetCurriculumToDefault } from '../utils/curriculumManager';

interface CurriculumConfigModuleProps {
  curriculum: CurriculumConfig;
  onUpdateCurriculum: (newCurriculum: CurriculumConfig) => void;
  selectedGrade: GradeId;
  onSelectGrade: (gradeId: GradeId) => void;
}

export const CurriculumConfigModule: React.FC<CurriculumConfigModuleProps> = ({
  curriculum,
  onUpdateCurriculum,
  selectedGrade,
  onSelectGrade
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'add_char' | 'add_word' | 'json_sync'>('browse');
  const [browseCategory, setBrowseCategory] = useState<'character' | 'word'>('character');

  // Form states for new Character
  const [newChar, setNewChar] = useState({
    char: '',
    pinyin: '',
    radical: '',
    strokeCount: 4,
    strokeOrderHint: '',
    structure: '独体字',
    meanings: '',
    phrases: '',
    exampleSentence: '',
    phoneticTrapType: 'front_nasal' as const,
    phoneticTrapLabel: '',
    phoneticTrapTip: ''
  });

  // Form states for new Word
  const [newWord, setNewWord] = useState({
    word: '',
    pinyin: '',
    pos: '名词',
    definition: '',
    synonyms: '',
    antonyms: '',
    exampleSentence: '',
    culturalNote: ''
  });

  // JSON Import/Export state
  const [jsonText, setJsonText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const gradeChars = curriculum.characters[selectedGrade] || [];
  const gradeWords = curriculum.words[selectedGrade] || [];

  const handleCreateChar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.char.trim() || !newChar.pinyin.trim()) {
      alert('请至少填写汉字和拼音。');
      return;
    }

    const item: CharacterItem = {
      id: `custom-char-${Date.now()}`,
      char: newChar.char.trim(),
      pinyin: newChar.pinyin.trim(),
      radical: newChar.radical.trim() || newChar.char.trim(),
      strokeCount: Number(newChar.strokeCount) || 4,
      strokeOrderHint: newChar.strokeOrderHint.trim() || '先横后竖，从上到下',
      structure: newChar.structure || '独体字',
      meanings: newChar.meanings.split(/[,，、\n]/).map(s => s.trim()).filter(Boolean),
      phrases: newChar.phrases.split(/[,，、\n]/).map(s => s.trim()).filter(Boolean),
      exampleSentence: newChar.exampleSentence.trim() || `这是关于“${newChar.char}”的例句。`,
      phoneticTrap: newChar.phoneticTrapLabel.trim() ? {
        type: newChar.phoneticTrapType,
        label: newChar.phoneticTrapLabel.trim(),
        tip: newChar.phoneticTrapTip.trim() || '注意发音规范'
      } : undefined,
      gradeId: selectedGrade
    };

    const updated = {
      ...curriculum,
      characters: {
        ...curriculum.characters,
        [selectedGrade]: [item, ...(curriculum.characters[selectedGrade] || [])]
      }
    };

    onUpdateCurriculum(updated);
    setNewChar({
      char: '',
      pinyin: '',
      radical: '',
      strokeCount: 4,
      strokeOrderHint: '',
      structure: '独体字',
      meanings: '',
      phrases: '',
      exampleSentence: '',
      phoneticTrapType: 'front_nasal',
      phoneticTrapLabel: '',
      phoneticTrapTip: ''
    });
    setFeedbackMsg({ type: 'success', text: `成功添加生字：“${item.char}” 到 ${GRADES_LIST.find(g => g.id === selectedGrade)?.name}` });
    setActiveSubTab('browse');
  };

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word.trim() || !newWord.pinyin.trim()) {
      alert('请至少填写词语和拼音。');
      return;
    }

    const item: WordItem = {
      id: `custom-word-${Date.now()}`,
      word: newWord.word.trim(),
      pinyin: newWord.pinyin.trim(),
      pos: newWord.pos || '名词',
      definition: newWord.definition.trim() || '暂无释义',
      synonyms: newWord.synonyms.split(/[,，、\n]/).map(s => s.trim()).filter(Boolean),
      antonyms: newWord.antonyms.split(/[,，、\n]/).map(s => s.trim()).filter(Boolean),
      exampleSentence: newWord.exampleSentence.trim() || `运用“${newWord.word}”造句示例。`,
      culturalNote: newWord.culturalNote.trim() || undefined,
      gradeId: selectedGrade
    };

    const updated = {
      ...curriculum,
      words: {
        ...curriculum.words,
        [selectedGrade]: [item, ...(curriculum.words[selectedGrade] || [])]
      }
    };

    onUpdateCurriculum(updated);
    setNewWord({
      word: '',
      pinyin: '',
      pos: '名词',
      definition: '',
      synonyms: '',
      antonyms: '',
      exampleSentence: '',
      culturalNote: ''
    });
    setFeedbackMsg({ type: 'success', text: `成功添加词语：“${item.word}” 到 ${GRADES_LIST.find(g => g.id === selectedGrade)?.name}` });
    setActiveSubTab('browse');
  };

  const handleDeleteChar = (charId: string) => {
    if (!window.confirm('确定要删除此生字吗？')) return;
    const updated = {
      ...curriculum,
      characters: {
        ...curriculum.characters,
        [selectedGrade]: (curriculum.characters[selectedGrade] || []).filter(c => c.id !== charId)
      }
    };
    onUpdateCurriculum(updated);
  };

  const handleDeleteWord = (wordId: string) => {
    if (!window.confirm('确定要删除此词语吗？')) return;
    const updated = {
      ...curriculum,
      words: {
        ...curriculum.words,
        [selectedGrade]: (curriculum.words[selectedGrade] || []).filter(w => w.id !== wordId)
      }
    };
    onUpdateCurriculum(updated);
  };

  const handleExportJSON = () => {
    const json = exportCurriculumAsJSON(curriculum);
    setJsonText(json);
    navigator.clipboard?.writeText(json);
    setFeedbackMsg({ type: 'success', text: '课程数据已导出为 JSON 并自动复制到剪贴板！' });
  };

  const handleImportJSON = () => {
    if (!jsonText.trim()) {
      alert('请先在下方文本框中粘贴课程 JSON 配置。');
      return;
    }
    const res = importCurriculumFromJSON(jsonText);
    if (res.success && res.data) {
      onUpdateCurriculum(res.data);
      setFeedbackMsg({ type: 'success', text: '成功导入并应用课程数据！' });
    } else {
      setFeedbackMsg({ type: 'error', text: res.error || '导入失败' });
    }
  };

  const handleResetDefaults = () => {
    if (!window.confirm('确定要恢复出厂课本初始数据吗？你自定义添加的内容将被清空重置。')) return;
    const def = resetCurriculumToDefault();
    onUpdateCurriculum(def);
    setFeedbackMsg({ type: 'success', text: '已成功重置为标准课本初始化数据！' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D8]">
        <div>
          <h2 className="text-xl font-bold font-serif-sc text-[#24292E] flex items-center gap-2">
            <Settings size={20} className="text-[#B83A2D]" />
            <span>课程数据配置与管理</span>
          </h2>
          <p className="text-xs text-[#57606A] mt-0.5">
            自由增删改查各年级课本内容 · 导入导出自定义题库 · 一键恢复出厂教材
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grade Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8C8273]">配置年级：</span>
            <select
              value={selectedGrade}
              onChange={(e) => onSelectGrade(e.target.value as GradeId)}
              className="bg-white border border-[#DDD7CD] text-[#24292E] font-medium py-1 px-2.5 rounded-lg focus:outline-none focus:border-[#B83A2D]"
            >
              {GRADES_LIST.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between animate-in fade-in duration-150 ${
            feedbackMsg.type === 'success'
              ? 'bg-[#EBF7EE] text-[#16A34A] border border-[#C6E9CC]'
              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-[#8C8273] hover:text-[#24292E] text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E1D8] pb-1 text-xs">
        <button
          onClick={() => setActiveSubTab('browse')}
          className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors border-b-2 ${
            activeSubTab === 'browse'
              ? 'border-[#B83A2D] text-[#B83A2D] bg-white'
              : 'border-transparent text-[#57606A] hover:text-[#24292E]'
          }`}
        >
          查看与删除当前年级数据
        </button>
        <button
          onClick={() => setActiveSubTab('add_char')}
          className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors border-b-2 ${
            activeSubTab === 'add_char'
              ? 'border-[#B83A2D] text-[#B83A2D] bg-white'
              : 'border-transparent text-[#57606A] hover:text-[#24292E]'
          }`}
        >
          + 新增生字（含笔顺/易错音）
        </button>
        <button
          onClick={() => setActiveSubTab('add_word')}
          className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors border-b-2 ${
            activeSubTab === 'add_word'
              ? 'border-[#B83A2D] text-[#B83A2D] bg-white'
              : 'border-transparent text-[#57606A] hover:text-[#24292E]'
          }`}
        >
          + 新增词语/成语
        </button>
        <button
          onClick={() => setActiveSubTab('json_sync')}
          className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors border-b-2 ${
            activeSubTab === 'json_sync'
              ? 'border-[#B83A2D] text-[#B83A2D] bg-white'
              : 'border-transparent text-[#57606A] hover:text-[#24292E]'
          }`}
        >
          导入导出 / 重置数据
        </button>
      </div>

      {/* SUBTAB 1: BROWSE & DELETE */}
      {activeSubTab === 'browse' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBrowseCategory('character')}
              className={`px-3 py-1 text-xs rounded-md ${
                browseCategory === 'character'
                  ? 'bg-[#B83A2D] text-white font-medium'
                  : 'bg-white text-[#57606A] border border-[#DDD7CD]'
              }`}
            >
              生字列表 ({gradeChars.length})
            </button>
            <button
              onClick={() => setBrowseCategory('word')}
              className={`px-3 py-1 text-xs rounded-md ${
                browseCategory === 'word'
                  ? 'bg-[#B83A2D] text-white font-medium'
                  : 'bg-white text-[#57606A] border border-[#DDD7CD]'
              }`}
            >
              词语列表 ({gradeWords.length})
            </button>
          </div>

          {browseCategory === 'character' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {gradeChars.map(item => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E8E3DA] rounded-lg p-3 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded border border-[#B83A2D]/30 mizige-bg flex items-center justify-center font-serif-sc text-xl font-bold text-[#24292E]">
                      {item.char}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-medium text-[#B83A2D]">{item.pinyin}</div>
                      <div className="text-[11px] text-[#8C8273]">部首: {item.radical} · {item.strokeCount}画</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteChar(item.id)}
                    className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors"
                    title="删除此生字"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {browseCategory === 'word' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {gradeWords.map(item => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E8E3DA] rounded-lg p-3 flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <div className="text-sm font-serif-sc font-bold text-[#24292E]">{item.word}</div>
                    <div className="text-xs font-mono text-[#B83A2D]">{item.pinyin} ({item.pos})</div>
                    <div className="text-[11px] text-[#57606A] line-clamp-1 mt-0.5">{item.definition}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteWord(item.id)}
                    className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors shrink-0 ml-2"
                    title="删除此词语"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: ADD CHARACTER FORM */}
      {activeSubTab === 'add_char' && (
        <form onSubmit={handleCreateChar} className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-[#24292E] border-b border-[#F0ECE4] pb-2">
            为 {GRADES_LIST.find(g => g.id === selectedGrade)?.name} 新增生字
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">汉字 *</label>
              <input
                type="text"
                maxLength={2}
                placeholder="例如：春"
                value={newChar.char}
                onChange={e => setNewChar(prev => ({ ...prev, char: e.target.value }))}
                className="w-full text-sm p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">拼音（含声调）*</label>
              <input
                type="text"
                placeholder="例如：chūn"
                value={newChar.pinyin}
                onChange={e => setNewChar(prev => ({ ...prev, pinyin: e.target.value }))}
                className="w-full text-sm p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">部首与画数</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="部首 日"
                  value={newChar.radical}
                  onChange={e => setNewChar(prev => ({ ...prev, radical: e.target.value }))}
                  className="w-1/2 text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
                />
                <input
                  type="number"
                  placeholder="画数"
                  value={newChar.strokeCount}
                  onChange={e => setNewChar(prev => ({ ...prev, strokeCount: Number(e.target.value) }))}
                  className="w-1/2 text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#57606A] mb-1">笔顺书写口诀</label>
            <input
              type="text"
              placeholder="例如：先横后竖，撇捺舒展"
              value={newChar.strokeOrderHint}
              onChange={e => setNewChar(prev => ({ ...prev, strokeOrderHint: e.target.value }))}
              className="w-full text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
            />
          </div>

          {/* Phonetic Trap Settings */}
          <div className="p-3.5 bg-[#FFFBEB] rounded-lg border border-[#FDE68A] space-y-2">
            <span className="text-xs font-bold text-[#92400E]">前后鼻音/平翘舌音易错提醒配置</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="标签，如：前鼻音易错（-en vs -eng）"
                value={newChar.phoneticTrapLabel}
                onChange={e => setNewChar(prev => ({ ...prev, phoneticTrapLabel: e.target.value }))}
                className="text-xs p-2 bg-white rounded border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
              />
              <input
                type="text"
                placeholder="提示语，如：尾音归舌尖，切莫读成后鼻音"
                value={newChar.phoneticTrapTip}
                onChange={e => setNewChar(prev => ({ ...prev, phoneticTrapTip: e.target.value }))}
                className="text-xs p-2 bg-white rounded border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">字义（用顿号或逗号隔开）</label>
              <input
                type="text"
                placeholder="春天、万物复苏、一年的第一季"
                value={newChar.meanings}
                onChange={e => setNewChar(prev => ({ ...prev, meanings: e.target.value }))}
                className="w-full text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">常用组词（用顿号或逗号隔开）</label>
              <input
                type="text"
                placeholder="春光、春风、春分"
                value={newChar.phrases}
                onChange={e => setNewChar(prev => ({ ...prev, phrases: e.target.value }))}
                className="w-full text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#57606A] mb-1">课文例句</label>
            <textarea
              rows={2}
              placeholder="请输入包含该生字的典型课文例句..."
              value={newChar.exampleSentence}
              onChange={e => setNewChar(prev => ({ ...prev, exampleSentence: e.target.value }))}
              className="w-full text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-[#B83A2D] text-white text-xs font-medium rounded-lg hover:bg-[#9E2F23] transition-colors"
          >
            保存并加入该年级生字库
          </button>
        </form>
      )}

      {/* SUBTAB 3: ADD WORD FORM */}
      {activeSubTab === 'add_word' && (
        <form onSubmit={handleCreateWord} className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-[#24292E] border-b border-[#F0ECE4] pb-2">
            为 {GRADES_LIST.find(g => g.id === selectedGrade)?.name} 新增词语或成语
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">词语 / 成语 *</label>
              <input
                type="text"
                placeholder="例如：生机勃勃"
                value={newWord.word}
                onChange={e => setNewWord(prev => ({ ...prev, word: e.target.value }))}
                className="w-full text-sm p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">拼音 *</label>
              <input
                type="text"
                placeholder="shēng jī bó bó"
                value={newWord.pinyin}
                onChange={e => setNewWord(prev => ({ ...prev, pinyin: e.target.value }))}
                className="w-full text-sm p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">词性</label>
              <select
                value={newWord.pos}
                onChange={e => setNewWord(prev => ({ ...prev, pos: e.target.value }))}
                className="w-full text-xs p-2 rounded-lg border border-[#DDD7CD] bg-white focus:outline-none focus:border-[#B83A2D]"
              >
                <option value="名词">名词</option>
                <option value="动词">动词</option>
                <option value="形容词">形容词</option>
                <option value="成语">成语</option>
                <option value="副词">副词</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#57606A] mb-1">释义解释</label>
            <textarea
              rows={2}
              placeholder="详细解释该词的含义..."
              value={newWord.definition}
              onChange={e => setNewWord(prev => ({ ...prev, definition: e.target.value }))}
              className="w-full text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">近义词（用顿号隔开）</label>
              <input
                type="text"
                placeholder="例如：朝气蓬勃、生机盎然"
                value={newWord.synonyms}
                onChange={e => setNewWord(prev => ({ ...prev, synonyms: e.target.value }))}
                className="w-full text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#57606A] mb-1">反义词（用顿号隔开）</label>
              <input
                type="text"
                placeholder="例如：死气沉沉"
                value={newWord.antonyms}
                onChange={e => setNewWord(prev => ({ ...prev, antonyms: e.target.value }))}
                className="w-full text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#57606A] mb-1">造句范例</label>
            <input
              type="text"
              placeholder="春回大地，整座田野展现出生机勃勃的景象。"
              value={newWord.exampleSentence}
              onChange={e => setNewWord(prev => ({ ...prev, exampleSentence: e.target.value }))}
              className="w-full text-xs p-2 rounded-lg border border-[#DDD7CD] focus:outline-none focus:border-[#B83A2D]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-[#B83A2D] text-white text-xs font-medium rounded-lg hover:bg-[#9E2F23] transition-colors"
          >
            保存并加入该年级词语库
          </button>
        </form>
      )}

      {/* SUBTAB 4: JSON IMPORT / EXPORT & RESET */}
      {activeSubTab === 'json_sync' && (
        <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4 max-w-3xl">
          <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#24292E]">JSON 数据备份、导入与出厂重置</h3>
              <p className="text-xs text-[#57606A]">支持在不同设备间迁移同步，或恢复系统内置标准课本库</p>
            </div>

            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] text-xs font-medium rounded-lg hover:bg-[#FEE2E2] transition-colors"
            >
              <RotateCcw size={13} />
              <span>恢复出厂课本数据</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF6EE] text-[#B83A2D] border border-[#B83A2D]/30 text-xs font-medium rounded-lg hover:bg-[#F2ECE0] transition-colors"
            >
              <Download size={13} />
              <span>导出当前所有课程 JSON (并复制)</span>
            </button>
            <button
              onClick={handleImportJSON}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#24292E] text-white text-xs font-medium rounded-lg hover:bg-[#333A42] transition-colors"
            >
              <Upload size={13} />
              <span>导入文本框中的 JSON</span>
            </button>
          </div>

          <div>
            <textarea
              rows={8}
              placeholder="在此粘贴导出的课程数据 JSON 字符串，或点击上方“导出”查看当前数据..."
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              className="w-full p-3 font-mono text-xs border border-[#DDD7CD] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#B83A2D]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
