import React from 'react';
import { GradeId, MainTab, LearningMode } from '../types/chinese';
import { GRADES_LIST } from '../data/curriculum';
import { getCurrentScholarRank } from '../utils/storage';
import { ChevronDown, Calendar, Sparkles } from 'lucide-react';

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

  const navLinks: { id: MainTab; label: string }[] = [
    { id: 'character', label: '生字' },
    { id: 'word', label: '词语' },
    { id: 'sentence', label: '句子' },
    { id: 'essay', label: '作文' },
    { id: 'records', label: '档案' },
    { id: 'settings', label: '配置' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E1D8]">
      {/* Universal Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            // 工单 12: 点击 logo 回到"学习首页"
            onSelectMode('home');
          }}
          className="text-lg font-bold tracking-tight text-[#24292E] font-serif-sc whitespace-nowrap shrink-0 hover:text-[#B83A2D] transition-colors"
        >
          墨韵中文
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        {/* 工单 13: 窄屏不再 display:none, 改为横向滚动并隐藏滚动条, 保证生字/词语/句子/作文/档案/配置始终可操作 */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-[#57606A] overflow-x-auto scrollbar-hide -mx-1 px-1">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`hover:text-[#24292E] transition-colors whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'text-[#B83A2D] font-bold border-b-2 border-[#B83A2D] py-1'
                  : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Grade Selector Dropdown */}
          <div className="relative">
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
            <span className="font-serif-sc font-bold">{currentRank.title}</span>
            <span className="text-[#8C8273]">·</span>
            <span className="font-mono text-[#B83A2D] font-bold">{inkDrops}墨</span>
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar: Mode Switcher (预习、学习、复习、考试) */}
      <div className="border-t border-[#EDE7DD] bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          {/* Learning Mode Switcher */}
          {/* 工单 13: 窄屏改为横向滚动, 不再 wrap 挤压学习内容; 新增 "首页" 按钮便于回到学习首页 */}
          <div className="flex items-center gap-1 p-0.5 bg-[#EFECE6] rounded-lg text-xs overflow-x-auto scrollbar-hide max-w-full">
            <button
              onClick={() => onSelectMode('home')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                learningMode === 'home'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              🏠 首页
            </button>
            <button
              onClick={() => onSelectMode('learn')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                learningMode === 'learn'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              📖 系统精读
            </button>
            <button
              onClick={() => onSelectMode('preview')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                learningMode === 'preview'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              🌱 预习导学
            </button>
            <button
              onClick={() => onSelectMode('review')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                learningMode === 'review'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              🔄 温故复习
            </button>
            <button
              onClick={() => onSelectMode('exam')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                learningMode === 'exam'
                  ? 'bg-white text-[#24292E] shadow-xs'
                  : 'text-[#57606A] hover:text-[#24292E]'
              }`}
            >
              📝 模拟测验
            </button>
          </div>

          {/* Active Grade & Theme Subtitle */}
          {/* 工单 13: 窄屏隐藏副标题, 避免与 mode 切换器争夺宽度 */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#57606A]">
            <span className="font-semibold text-[#24292E]">{currentGrade.name}</span>
            <span aria-hidden="true">·</span>
            <span>{currentGrade.stageName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-serif-sc text-[#8C8273]">{currentGrade.theme}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
