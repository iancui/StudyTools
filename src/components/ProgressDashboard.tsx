import React from 'react';
import { Award, Flame, Calendar, BookOpen, Trash2, CheckCircle2, Clock, Sparkles, Feather, Sun, Trophy, PenTool } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProgress } from '../types/progress';
import { GradeId, ExamQuestion, CurriculumConfig } from '../types/chinese';
import { SCHOLAR_RANKS, SYSTEM_BADGES } from '../data/curriculum';
import { getCurrentScholarRank, getNextScholarRank } from '../utils/storage';

interface ProgressDashboardProps {
  progress: UserProgress;
  curriculum?: CurriculumConfig;
  onCheckIn: () => void;
  onRemoveWrongQuestion: (id: string) => void;
  onSelectGrade: (gradeId: GradeId) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  curriculum,
  onCheckIn,
  onRemoveWrongQuestion,
  onSelectGrade
}) => {
  const currentRank = getCurrentScholarRank(progress.inkDrops);
  const nextRank = getNextScholarRank(progress.inkDrops);

  const characters = curriculum?.characters[progress.selectedGrade] || [];
  const words = curriculum?.words[progress.selectedGrade] || [];
  const sentences = curriculum?.sentences[progress.selectedGrade] || [];

  const charMasteredCount = characters.filter(c => progress.masteredCharacterIds.includes(c.id)).length;
  const wordMasteredCount = words.filter(w => progress.masteredWordIds.includes(w.id)).length;
  const sentenceDoneCount = sentences.filter(s => progress.completedSentenceIds.includes(s.id)).length;

  const totalGradeItems = characters.length + words.length + sentences.length;
  const completedGradeItems = charMasteredCount + wordMasteredCount + sentenceDoneCount;
  const gradePercent = totalGradeItems > 0 ? Math.round((completedGradeItems / totalGradeItems) * 100) : 0;

  // Next rank progress percentage
  const inkInCurrentTier = progress.inkDrops - currentRank.minInk;
  const tierSpread = (nextRank ? nextRank.minInk : currentRank.maxInk) - currentRank.minInk;
  const rankPercent = Math.min(100, Math.max(0, Math.round((inkInCurrentTier / (tierSpread || 1)) * 100)));

  // Today checkin status
  const todayStr = new Date().toLocaleDateString('zh-CN');
  const isCheckedInToday = progress.checkInHistory.includes(todayStr);

  // All wrong questions data across curriculum
  const allExamQuestions: ExamQuestion[] = curriculum ? Object.values(curriculum.exams).flat() : [];
  const wrongQuestions = allExamQuestions.filter(q => progress.wrongQuestionIds.includes(q.id));

  const handleManualCheckIn = () => {
    if (isCheckedInToday) return;
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#B83A2D', '#D97706', '#16A34A', '#24292E']
    });
    onCheckIn();
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun size={18} />;
      case 'Flame': return <Flame size={18} />;
      case 'Award': return <Award size={18} />;
      case 'BookOpen': return <BookOpen size={18} />;
      case 'Sparkles': return <Sparkles size={18} />;
      case 'PenTool': return <PenTool size={18} />;
      case 'Trophy': return <Trophy size={18} />;
      case 'Feather': return <Feather size={18} />;
      default: return <Award size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Scholar Rank & Ink Droplets Card */}
      <div className="bg-white border border-[#E8E3DA] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Traditional Seal Stamp Image */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE7DD]">
            <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-[#B83A2D]/30 shadow-xs mb-2">
              <img
                src="/src/assets/images/seal_scholar_rank_1791102588306.jpg"
                alt="文人印章"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif-sc font-bold text-base text-[#24292E]">
              {currentRank.title}
            </span>
            <span className="text-[11px] text-[#8C8273]">文人品阶</span>
          </div>

          {/* Rank Description & Progress */}
          <div className="md:col-span-9 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold font-serif-sc text-[#24292E]">
                    {currentRank.title}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#B83A2D] font-medium border border-[#B83A2D]/20">
                    当前积分：{progress.inkDrops} 墨滴
                  </span>
                </div>
                <p className="text-xs text-[#57606A] mt-1">
                  {currentRank.desc}
                </p>
              </div>

              {/* Check-In CTA Button */}
              <button
                onClick={handleManualCheckIn}
                disabled={isCheckedInToday}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all shadow-xs ${
                  isCheckedInToday
                    ? 'bg-[#EBF7EE] text-[#16A34A] border border-[#C6E9CC]'
                    : 'bg-[#B83A2D] text-white hover:bg-[#9E2F23]'
                }`}
              >
                <Calendar size={15} />
                <span>{isCheckedInToday ? '今日已签到' : '每日晨诵打卡 (+20墨滴)'}</span>
              </button>
            </div>

            {/* Rank Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-[#57606A]">
                <span>晋升下一品阶：{nextRank ? nextRank.title : '已达最高宗师境'}</span>
                <span className="font-mono">
                  {progress.inkDrops} / {nextRank ? nextRank.minInk : currentRank.maxInk} 墨滴
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#EDE8DE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#B83A2D] to-[#D97706] rounded-full transition-all duration-500"
                  style={{ width: `${rankPercent}%` }}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#F0ECE4] text-xs">
              <div>
                <span className="text-[#8C8273]">连续打卡</span>
                <p className="text-sm font-bold font-mono text-[#24292E] flex items-center gap-1 mt-0.5">
                  <Flame size={14} className="text-[#EA580C]" />
                  <span>{progress.streakDays} 天</span>
                </p>
              </div>
              <div>
                <span className="text-[#8C8273]">已掌握生字</span>
                <p className="text-sm font-bold font-mono text-[#24292E] mt-0.5">
                  {progress.masteredCharacterIds.length} 个
                </p>
              </div>
              <div>
                <span className="text-[#8C8273]">已掌握词汇</span>
                <p className="text-sm font-bold font-mono text-[#24292E] mt-0.5">
                  {progress.masteredWordIds.length} 条
                </p>
              </div>
              <div>
                <span className="text-[#8C8273]">参与测验</span>
                <p className="text-sm font-bold font-mono text-[#24292E] mt-0.5">
                  {progress.examHistory.length} 次
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Grade Completion & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Grade Completion Overview */}
        <div className="lg:col-span-5 bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
            <h3 className="font-serif-sc text-base font-bold text-[#24292E]">
              当前学段掌握度
            </h3>
            <span className="text-xs font-mono font-bold text-[#B83A2D]">
              {gradePercent}% 完成
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[#57606A]">
                <span>生字掌握</span>
                <span className="font-mono">{charMasteredCount} / {characters.length}</span>
              </div>
              <div className="w-full h-2 bg-[#EDE8DE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B83A2D] rounded-full transition-all"
                  style={{ width: `${characters.length ? (charMasteredCount / characters.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[#57606A]">
                <span>精品词汇</span>
                <span className="font-mono">{wordMasteredCount} / {words.length}</span>
              </div>
              <div className="w-full h-2 bg-[#EDE8DE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#16A34A] rounded-full transition-all"
                  style={{ width: `${words.length ? (wordMasteredCount / words.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[#57606A]">
                <span>句子实战演练</span>
                <span className="font-mono">{sentenceDoneCount} / {sentences.length}</span>
              </div>
              <div className="w-full h-2 bg-[#EDE8DE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D97706] rounded-full transition-all"
                  style={{ width: `${sentences.length ? (sentenceDoneCount / sentences.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[#57606A]">
                <span>作文习作练习</span>
                <span className="font-mono">{progress.essayPractices.length} 篇已评析</span>
              </div>
              <div className="w-full h-2 bg-[#EDE8DE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9333EA] rounded-full transition-all"
                  style={{ width: `${Math.min(100, progress.essayPractices.length * 50)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Achievement Badges Gallery */}
        <div className="lg:col-span-7 bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
            <h3 className="font-serif-sc text-base font-bold text-[#24292E] flex items-center gap-2">
              <Award size={16} className="text-[#B83A2D]" />
              <span>文苑成就徽章室</span>
            </h3>
            <span className="text-xs text-[#57606A]">
              已解锁 {progress.unlockedBadgeIds.length} / {SYSTEM_BADGES.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SYSTEM_BADGES.map((b) => {
              const isUnlocked = progress.unlockedBadgeIds.includes(b.id);

              return (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[110px] ${
                    isUnlocked
                      ? 'bg-[#FAF6EE] border-[#B83A2D]/30 shadow-xs'
                      : 'bg-[#F9F8F6] border-[#E8E3DA] opacity-50 grayscale'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                      isUnlocked
                        ? 'bg-white text-[#B83A2D] shadow-xs'
                        : 'bg-[#E5DFD4] text-[#8C8273]'
                    }`}
                  >
                    {getBadgeIcon(b.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#24292E]">{b.name}</h4>
                    <p className="text-[10px] text-[#57606A] mt-0.5 line-clamp-2 leading-tight">
                      {b.desc}
                    </p>
                  </div>
                  {isUnlocked && (
                    <span className="text-[10px] text-[#16A34A] font-medium mt-1">
                      ✓ 已佩戴
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WRONG QUESTION NOTEBOOK (错题本) */}
      <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
          <div>
            <h3 className="font-serif-sc text-base font-bold text-[#24292E] flex items-center gap-2">
              <span>错题回顾本（靶向巩固）</span>
            </h3>
            <p className="text-xs text-[#57606A] mt-0.5">
              测验中答错的题目会自动收录在此，弄懂后可点击“已掌握”移出
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-[#B83A2D]">
            共 {wrongQuestions.length} 道待消化错题
          </span>
        </div>

        {wrongQuestions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#16A34A] bg-[#EBF7EE] rounded-lg">
            🎉 错题本暂无待攻克题目！继续在“模拟测验”中检验自己的真实水准吧。
          </div>
        ) : (
          <div className="space-y-3">
            {wrongQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EDE7DD] space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-[#24292E] leading-relaxed">
                    {q.question}
                  </p>
                  <button
                    onClick={() => onRemoveWrongQuestion(q.id)}
                    className="flex items-center gap-1 text-[11px] text-[#16A34A] hover:underline shrink-0"
                  >
                    <CheckCircle2 size={13} />
                    <span>已搞懂移除</span>
                  </button>
                </div>

                <div className="p-2.5 rounded bg-[#FAF6EE] border border-[#ECD9BF] text-[#78350F] space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-[#92400E]">
                    <Sparkles size={12} />
                    <span>正确答案与要点：</span>
                  </div>
                  <p>{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
