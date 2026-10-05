import React, { useState, useEffect } from 'react';
import { GradeId, MainTab, LearningMode, CurriculumConfig } from './types/chinese';
import { UserProgress, EssayPracticeRecord, ExamRecord } from './types/progress';
import { GRADES_LIST } from './data/curriculum';
import { getInitialProgress, saveProgress, evaluateBadges } from './utils/storage';
import { loadCurriculum, saveCurriculum } from './utils/curriculumManager';
import { TopBar } from './components/TopBar';
import { CharacterModule } from './components/CharacterModule';
import { WordModule } from './components/WordModule';
import { SentenceModule } from './components/SentenceModule';
import { EssayModule } from './components/EssayModule';
import { PreviewMode } from './components/PreviewMode';
import { ReviewMode } from './components/ReviewMode';
import { ExamMode } from './components/ExamMode';
import { ProgressDashboard } from './components/ProgressDashboard';
import { CurriculumConfigModule } from './components/CurriculumConfigModule';
import { stopSpeech } from './utils/speech';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';

function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(getInitialProgress);
  const [curriculum, setCurriculum] = useState<CurriculumConfig>(loadCurriculum);
  const [activeTab, setActiveTab] = useState<MainTab>('character');
  const [learningMode, setLearningMode] = useState<LearningMode>('learn');

  // Sync progress changes to localStorage and check for badge updates
  useEffect(() => {
    const updatedBadges = evaluateBadges(progress);
    if (updatedBadges.length !== progress.unlockedBadgeIds.length) {
      setProgress(prev => {
        const next = { ...prev, unlockedBadgeIds: updatedBadges };
        saveProgress(next);
        return next;
      });
    } else {
      saveProgress(progress);
    }
  }, [progress]);

  // Clean speech when unmounting or switching tabs
  useEffect(() => {
    return () => stopSpeech();
  }, [activeTab, learningMode, progress.selectedGrade]);

  // Curriculum update handler (save & update state)
  const handleUpdateCurriculum = (newCurriculum: CurriculumConfig) => {
    setCurriculum(newCurriculum);
    saveCurriculum(newCurriculum);
  };

  // Grade selection handler
  const handleSelectGrade = (gradeId: GradeId) => {
    stopSpeech();
    setProgress(prev => ({
      ...prev,
      selectedGrade: gradeId
    }));
  };

  // Check in handler
  const handleCheckIn = () => {
    const todayStr = new Date().toLocaleDateString('zh-CN');
    setProgress(prev => {
      if (prev.checkInHistory.includes(todayStr)) return prev;

      const newHistory = [...prev.checkInHistory, todayStr];
      const newStreak = prev.streakDays + 1;
      const newInk = prev.inkDrops + 20;

      return {
        ...prev,
        lastCheckInDate: todayStr,
        checkInHistory: newHistory,
        streakDays: newStreak,
        inkDrops: newInk
      };
    });
  };

  // Character mastery toggle
  const handleToggleCharMaster = (id: string) => {
    setProgress(prev => {
      const isAlready = prev.masteredCharacterIds.includes(id);
      const newIds = isAlready
        ? prev.masteredCharacterIds.filter(i => i !== id)
        : [...prev.masteredCharacterIds, id];
      const inkDelta = isAlready ? -10 : 10;

      return {
        ...prev,
        masteredCharacterIds: newIds,
        inkDrops: Math.max(0, prev.inkDrops + inkDelta)
      };
    });
  };

  // Word mastery toggle
  const handleToggleWordMaster = (id: string) => {
    setProgress(prev => {
      const isAlready = prev.masteredWordIds.includes(id);
      const newIds = isAlready
        ? prev.masteredWordIds.filter(i => i !== id)
        : [...prev.masteredWordIds, id];
      const inkDelta = isAlready ? -10 : 10;

      return {
        ...prev,
        masteredWordIds: newIds,
        inkDrops: Math.max(0, prev.inkDrops + inkDelta)
      };
    });
  };

  // Sentence completion toggle
  const handleToggleSentence = (id: string) => {
    setProgress(prev => {
      const isAlready = prev.completedSentenceIds.includes(id);
      const newIds = isAlready
        ? prev.completedSentenceIds.filter(i => i !== id)
        : [...prev.completedSentenceIds, id];
      const inkDelta = isAlready ? -15 : 15;

      return {
        ...prev,
        completedSentenceIds: newIds,
        inkDrops: Math.max(0, prev.inkDrops + inkDelta)
      };
    });
  };

  // Save essay draft practice
  const handleSaveEssay = (record: EssayPracticeRecord) => {
    setProgress(prev => ({
      ...prev,
      essayPractices: [record, ...prev.essayPractices],
      inkDrops: prev.inkDrops + 50
    }));
  };

  // Complete preview guide
  const handleCompletePreview = (guideId: string) => {
    setProgress(prev => {
      if (prev.previewedItemIds.includes(guideId)) return prev;
      return {
        ...prev,
        previewedItemIds: [...prev.previewedItemIds, guideId],
        inkDrops: prev.inkDrops + 25
      };
    });
  };

  // Save exam record
  const handleSaveExam = (record: ExamRecord) => {
    setProgress(prev => {
      const inkReward = Math.round(record.score * 0.6);
      return {
        ...prev,
        examHistory: [record, ...prev.examHistory],
        inkDrops: prev.inkDrops + inkReward
      };
    });
  };

  // Add wrong questions to notebook
  const handleAddWrongQuestions = (ids: string[]) => {
    setProgress(prev => {
      const merged = Array.from(new Set([...prev.wrongQuestionIds, ...ids]));
      return {
        ...prev,
        wrongQuestionIds: merged
      };
    });
  };

  // Remove question from wrong questions notebook
  const handleRemoveWrongQuestion = (id: string) => {
    setProgress(prev => ({
      ...prev,
      wrongQuestionIds: prev.wrongQuestionIds.filter(i => i !== id),
      inkDrops: prev.inkDrops + 5
    }));
  };

  const handleEarnInk = (amount: number) => {
    setProgress(prev => ({
      ...prev,
      inkDrops: prev.inkDrops + amount
    }));
  };

  const currentGradeInfo = GRADES_LIST.find(g => g.id === progress.selectedGrade) || GRADES_LIST[0];
  const todayStr = new Date().toLocaleDateString('zh-CN');
  const isCheckedInToday = progress.checkInHistory.includes(todayStr);

  const currentGradeCharacters = curriculum.characters[progress.selectedGrade] || [];
  const currentGradeWords = curriculum.words[progress.selectedGrade] || [];
  const currentGradeSentences = curriculum.sentences[progress.selectedGrade] || [];
  const currentGradeEssays = curriculum.essays[progress.selectedGrade] || [];
  const currentGradeExams = curriculum.exams[progress.selectedGrade] || [];

  // 应用启动时正在恢复登录状态:显示加载页
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] paper-texture">
        <div className="text-center">
          <div className="text-2xl font-bold font-serif-sc text-[#24292E] mb-2">
            墨韵中文
          </div>
          <div className="text-sm text-[#57606A]">正在加载...</div>
        </div>
      </div>
    );
  }

  // 未登录:显示登录/注册页
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleLogout = async () => {
    stopSpeech();
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#24292E] paper-texture">
      {/* Universal Top Bar */}
      <TopBar
        currentGradeId={progress.selectedGrade}
        activeTab={activeTab}
        learningMode={learningMode}
        inkDrops={progress.inkDrops}
        isCheckedInToday={isCheckedInToday}
        onSelectGrade={handleSelectGrade}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setLearningMode('learn');
        }}
        onSelectMode={(mode) => {
          setLearningMode(mode);
        }}
        onCheckIn={handleCheckIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* If in Mode Preview */}
        {learningMode === 'preview' && (
          <PreviewMode
            gradeId={progress.selectedGrade}
            charactersList={currentGradeCharacters}
            wordsList={currentGradeWords}
            previewedItemIds={progress.previewedItemIds}
            onCompletePreview={handleCompletePreview}
          />
        )}

        {/* If in Mode Review */}
        {learningMode === 'review' && (
          <ReviewMode
            gradeId={progress.selectedGrade}
            charactersList={currentGradeCharacters}
            wordsList={currentGradeWords}
            masteredCharIds={progress.masteredCharacterIds}
            masteredWordIds={progress.masteredWordIds}
            onToggleCharMaster={handleToggleCharMaster}
            onToggleWordMaster={handleToggleWordMaster}
            onEarnInk={handleEarnInk}
          />
        )}

        {/* If in Mode Exam */}
        {learningMode === 'exam' && (
          <ExamMode
            gradeId={progress.selectedGrade}
            examsList={currentGradeExams}
            onSaveExamRecord={handleSaveExam}
            onAddWrongQuestions={handleAddWrongQuestions}
          />
        )}

        {/* If in Mode Learn: Switch by Main Tab */}
        {learningMode === 'learn' && (
          <>
            {activeTab === 'character' && (
              <CharacterModule
                gradeId={progress.selectedGrade}
                charactersList={currentGradeCharacters}
                masteredIds={progress.masteredCharacterIds}
                onToggleMaster={handleToggleCharMaster}
              />
            )}

            {activeTab === 'word' && (
              <WordModule
                gradeId={progress.selectedGrade}
                wordsList={currentGradeWords}
                masteredIds={progress.masteredWordIds}
                onToggleMaster={handleToggleWordMaster}
              />
            )}

            {activeTab === 'sentence' && (
              <SentenceModule
                gradeId={progress.selectedGrade}
                sentencesList={currentGradeSentences}
                completedIds={progress.completedSentenceIds}
                onToggleComplete={handleToggleSentence}
              />
            )}

            {activeTab === 'essay' && (
              <EssayModule
                gradeId={progress.selectedGrade}
                essaysList={currentGradeEssays}
                savedPractices={progress.essayPractices}
                onSavePractice={handleSaveEssay}
              />
            )}

            {activeTab === 'records' && (
              <ProgressDashboard
                progress={progress}
                curriculum={curriculum}
                onCheckIn={handleCheckIn}
                onRemoveWrongQuestion={handleRemoveWrongQuestion}
                onSelectGrade={handleSelectGrade}
              />
            )}

            {activeTab === 'settings' && (
              <CurriculumConfigModule
                curriculum={curriculum}
                onUpdateCurriculum={handleUpdateCurriculum}
                selectedGrade={progress.selectedGrade}
                onSelectGrade={handleSelectGrade}
              />
            )}
          </>
        )}
      </main>

      {/* Elegant Footer */}
      <footer className="border-t border-[#E6E1D8] bg-[#F7F4EE] py-6 text-xs text-[#57606A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-sc font-bold text-[#24292E]">墨韵中文</span>
            <span>· 全学段语文素养研习平台</span>
          </div>

          <div className="text-center font-serif-sc text-[#8C8273]">
            “博观而约取，厚积而薄发。”
          </div>

          <div className="flex items-center gap-3">
            <span>涵盖小学、初中、高中课程 · 预习 · 复习 · 测验 · 自定义数据</span>
            <span className="text-[#E6E1D8]">|</span>
            <span className="text-[#24292E]">
              {user?.nickname || user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs border border-[#B83A2D] text-[#B83A2D] rounded hover:bg-[#B83A2D] hover:text-white transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
