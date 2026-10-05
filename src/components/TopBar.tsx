import React, { useEffect, useRef, useState } from 'react';
import { GradeId, MainTab, LearningMode } from '../types/chinese';
import { GRADES_LIST } from '../data/curriculum';
import { getCurrentScholarRank } from '../utils/storage';
import { ChevronDown, Menu, X, Sparkles } from 'lucide-react';

interface TopBarProps {
  currentGradeId: GradeId;
  activeTab: MainTab;
  learningMode: LearningMode;
  inkDrops: number;
  isCheckedInToday: boolean;
  onSelectGrade: (gradeId: GradeId) => void;
  onSelectTab: (tab: MainTab) => void;
  onSelectMode: (mode: LearningMode) => void;
  onCheckIn: () => void;
}

// 工单 14: 窄屏导航改为"汉堡菜单 + 抽屉", 不再依赖横向滚动.
// - 桌面 (>= md): 保持原顶部水平导航.
// - 窄屏 (< md): 顶部只保留 Logo + 墨滴 + 菜单按钮; 点击菜单按钮
//   打开下拉抽屉, 完整列出所有入口 (首页/预习/学习/复习/测验/档案/配置),
//   当前入口有明显选中状态, 点击入口或外部关闭.
export const TopBar: React.FC<TopBarProps> = ({
  currentGradeId,
  activeTab,
  learningMode,
  inkDrops,
  isCheckedInToday,
  onSelectGrade,
  onSelectTab,
  onSelectMode,
  onCheckIn
}) => {
  const currentGrade = GRADES_LIST.find(g => g.id === currentGradeId) || GRADES_LIST[0];
  const currentRank = getCurrentScholarRank(inkDrops);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 点击菜单外部关闭抽屉
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  // 选中入口后关闭菜单
  const handleSelectMode = (mode: LearningMode) => {
    onSelectMode(mode);
    setMenuOpen(false);
  };
  const handleSelectTab = (tab: MainTab) => {
    onSelectTab(tab);
    setMenuOpen(false);
  };

  const navLinks: { id: MainTab; label: string }[] = [
    { id: 'character', label: '生字' },
    { id: 'word', label: '词语' },
    { id: 'sentence', label: '句子' },
    { id: 'essay', label: '作文' },
    { id: 'records', label: '档案' },
    { id: 'settings', label: '配置' }
  ];

  // 学习模式入口 (窄屏抽屉里完整列出)
  const modeEntries: { id: LearningMode; label: string; icon: string }[] = [
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'preview', label: '预习', icon: '🌱' },
    { id: 'learn', label: '学习', icon: '📖' },
    { id: 'review', label: '复习', icon: '🔄' },
    { id: 'exam', label: '测验', icon: '📝' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E1D8]">
      {/* Universal Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectMode('home');
          }}
          className="text-lg font-bold tracking-tight text-[#24292E] font-serif-sc whitespace-nowrap shrink-0 hover:text-[#B83A2D] transition-colors"
        >
          墨韵中文
        </a>

        {/* Zone 2: Desktop horizontal nav (md and up) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#57606A]">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`hover:text-[#24292E] transition-colors whitespace-nowrap ${
                activeTab === item.id && learningMode === 'learn'
                  ? 'text-[#B83A2D] font-bold border-b-2 border-[#B83A2D] py-1'
                  : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Grade Selector Dropdown (desktop only here; mobile shows in menu) */}
          <div className="relative hidden md:block">
            <select
              value={currentGradeId}
              onChange={(e) => onSelectGrade(e.target.value as GradeId)}
              className="appearance-none bg-white border border-[#DDD7CD] hover:border-[#B83A2D] text-[#24292E] text-xs font-medium py-1.5 pl-3 pr-7 rounded-lg cursor-pointer focus:outline-none focus:border-[#B83A2D] transition-colors"
            >
              <optgroup label="小学阶段 (1-6年级)">
                {GRADES_LIST.filter(g => g.section === 'primary').map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </optgroup>
              <optgroup label="初中阶段 (7-9年级)">
                {GRADES_LIST.filter(g => g.section === 'middle').map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </optgroup>
              <optgroup label="高中阶段 (高一至高三)">
                {GRADES_LIST.filter(g => g.section === 'high').map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </optgroup>
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C8273] pointer-events-none" />
          </div>

          {/* Scholar Rank / Ink Counter Badge Button */}
          <button
            onClick={() => onSelectTab('records')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#24292E] bg-[#FAF6EE] border border-[#B83A2D]/30 rounded-lg hover:bg-[#F2ECE0] transition-colors whitespace-nowrap"
            title="查看文人品阶与积分"
          >
            <Sparkles size={13} className="text-[#B83A2D]" />
            <span className="font-serif-sc font-bold hidden sm:inline">{currentRank.title}</span>
            <span className="text-[#8C8273] hidden sm:inline">·</span>
            <span className="font-mono text-[#B83A2D] font-bold">{inkDrops}墨</span>
          </button>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[#DDD7CD] bg-white text-[#24292E] hover:bg-[#F2ECE0] transition-colors"
            aria-label="打开导航菜单"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar: Mode Switcher (desktop only; mobile uses menu) */}
      <div className="hidden md:block border-t border-[#EDE7DD] bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-[#EFECE6] rounded-lg text-xs">
            <button
              onClick={() => onSelectMode('home')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                learningMode === 'home'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              🏠 首页
            </button>
            <button
              onClick={() => onSelectMode('learn')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                learningMode === 'learn'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              📖 系统精读
            </button>
            <button
              onClick={() => onSelectMode('preview')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                learningMode === 'preview'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              🌱 预习导学
            </button>
            <button
              onClick={() => onSelectMode('review')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                learningMode === 'review'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              🔄 温故复习
            </button>
            <button
              onClick={() => onSelectMode('exam')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                learningMode === 'exam'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              📝 模拟测验
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#57606A]">
            <span className="font-semibold text-[#24292E]">{currentGrade.name}</span>
            <span aria-hidden="true">·</span>
            <span>{currentGrade.stageName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-serif-sc text-[#8C8273]">{currentGrade.theme}</span>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute top-14 right-0 mt-px w-72 max-w-[90vw] bg-white border border-[#E6E1D8] shadow-lg rounded-b-xl z-50"
        >
          <div className="p-3 space-y-3">
            {/* 学习模式入口 */}
            <div>
              <div className="text-[11px] font-bold text-[#8C8273] uppercase tracking-wider mb-1.5 px-1">
                学习入口
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {modeEntries.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMode(m.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                      learningMode === m.id
                        ? 'bg-[#B83A2D] text-white border-[#B83A2D]'
                        : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border-[#DDD7CD]'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 学习模块 (生字/词语/句子/作文/档案/配置) */}
            <div>
              <div className="text-[11px] font-bold text-[#8C8273] uppercase tracking-wider mb-1.5 px-1">
                学习模块
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {navLinks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${
                      activeTab === item.id && learningMode === 'learn'
                        ? 'bg-[#B83A2D] text-white border-[#B83A2D] font-bold'
                        : 'bg-[#FAF8F5] text-[#57606A] hover:bg-[#F2ECE0] border-[#DDD7CD]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 年级选择 */}
            <div>
              <div className="text-[11px] font-bold text-[#8C8273] uppercase tracking-wider mb-1.5 px-1">
                当前年级
              </div>
              <select
                value={currentGradeId}
                onChange={(e) => {
                  onSelectGrade(e.target.value as GradeId);
                  setMenuOpen(false);
                }}
                className="w-full appearance-none bg-white border border-[#DDD7CD] hover:border-[#B83A2D] text-[#24292E] text-xs font-medium py-2 pl-3 pr-7 rounded-lg cursor-pointer focus:outline-none focus:border-[#B83A2D] transition-colors"
              >
                <optgroup label="小学阶段 (1-6年级)">
                  {GRADES_LIST.filter(g => g.section === 'primary').map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </optgroup>
                <optgroup label="初中阶段 (7-9年级)">
                  {GRADES_LIST.filter(g => g.section === 'middle').map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </optgroup>
                <optgroup label="高中阶段 (高一至高三)">
                  {GRADES_LIST.filter(g => g.section === 'high').map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
