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
import { useProgressSync } from './hooks/useProgressSync';
import { useDetailedProgressSync } from './hooks/useDetailedProgressSync';
// 工单 06: 教材数据接入 (三年级上册第 1~5 课)
import { useTextbookLessons, useTextbookLessonContent } from './hooks/useTextbook';
import { LessonSelector } from './components/LessonSelector';

function AppContent() {
  const { isAuthenticated, isLoading, user, logout, accessToken } = useAuth();
  // 工单 12: 学习进度按用户隔离. useState 初始化用匿名函数包装
  // getInitialProgress (此时还没有 user, 走全局 key); 下面 useEffect
  // 会在 user.id 变化时重新读取该用户专属的 localStorage.
  const [progress, setProgress] = useState<UserProgress>(() => getInitialProgress());
  const [curriculum, setCurriculum] = useState<CurriculumConfig>(loadCurriculum);
  const [activeTab, setActiveTab] = useState<MainTab>('character');
  // 工单 12: 登录后默认进入"学习首页" (home), 而不是直接进 learn.
  const [learningMode, setLearningMode] = useState<LearningMode>('home');
  // 工单 06: 教材课程选择 (三年级上册第 1~5 课)
  // null 表示未选择课程, 走原 curriculum 本地数据
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // 工单 12: 用户身份变化 (登录/登出/切换账号) 时, 重新加载该用户
  // 专属的 localStorage 进度. 这样 A 登出后 B 登录不会看到 A 的数据,
  // 新注册用户也不会继承旧账号的本地缓存.
  useEffect(() => {
    setProgress(getInitialProgress(user?.id));
    // 切换账号后回到学习首页, 避免停留在上一个账号的最后一个模式
    if (isAuthenticated) {
      setLearningMode('home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthenticated]);

  // 学习进度云同步: 登录后从服务器恢复摘要, 学习时防抖 PUT 上传.
  // 内部全部 try/catch, 云端失败不影响本地学习.
  useProgressSync({ progress, setProgress });

  // 详细学习记录同步: 生字/词语/句子三个数组的云端同步.
  // 与 useProgressSync 互补, 仅处理 masteredCharacterIds /
  // masteredWordIds / completedSentenceIds 三个 ID 数组.
  useDetailedProgressSync({ progress, setProgress });

  // 工单 06: 三年级时加载教材课程列表, 切换年级时清空课程选择
  const { lessons: textbookLessons, loading: lessonsLoading, error: lessonsError } =
    useTextbookLessons(progress.selectedGrade);
  const { data: lessonContent, loading: contentLoading, error: contentError } =
    useTextbookLessonContent(selectedLessonId);

  // 切换年级时重置课程选择 (避免上一个年级的 lessonId 残留)
  useEffect(() => {
    setSelectedLessonId(null);
  }, [progress.selectedGrade]);

  // Sync progress changes to localStorage and check for badge updates
  useEffect(() => {
    const updatedBadges = evaluateBadges(progress);
    if (updatedBadges.length !== progress.unlockedBadgeIds.length) {
      setProgress(prev => {
        const next = { ...prev, unlockedBadgeIds: updatedBadges };
        saveProgress(next, user?.id);
        return next;
      });
    } else {
      saveProgress(progress, user?.id);
    }
  }, [progress, user?.id]);

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

  // 工单 06: 三年级 + 选中某课时, 用教材 API 的真实数据覆盖
  // currentGrade* 数组, 让现有 CharacterModule / WordModule /
  // SentenceModule 直接渲染数据库内容. 其他年级或未选课时走原 curriculum.
  const usingTextbook = progress.selectedGrade === 'g3' && selectedLessonId !== null;
  const displayCharacters = usingTextbook ? lessonContent.characters : currentGradeCharacters;
  const displayWords = usingTextbook ? lessonContent.words : currentGradeWords;
  const displaySentences = usingTextbook ? lessonContent.sentences : currentGradeSentences;

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
        {/* 工单 12: 学习首页 (登录后默认入口). 只保留 3 个简单入口按钮,
            不做大 Dashboard. 用户从这里进入预习/学习/复习. 测验从复习
            或学习流程进入, 不在首页突出显示. */}
        {learningMode === 'home' && (
          <section className="space-y-5">
            <div className="text-center py-4">
              <h1 className="text-3xl font-bold font-serif-sc text-[#24292E] mb-2">
                墨韵中文
              </h1>
              <p className="text-sm text-[#57606A]">今天学什么？</p>
            </div>

            {/* 当前教材 / 课文信息 */}
            <div className="bg-white border border-[#E6E1D8] rounded-xl p-4 text-center text-sm">
              {progress.selectedGrade === 'g3' && selectedLessonId && lessonContent.lesson ? (
                <>
                  <div className="text-[#8C8273] text-xs mb-1">当前教材</div>
                  <div className="font-serif-sc font-bold text-[#24292E]">
                    {currentGradeInfo.name} · {lessonContent.lesson.title}
                  </div>
                </>
              ) : progress.selectedGrade === 'g3' && textbookLessons.length > 0 ? (
                <>
                  <div className="text-[#8C8273] text-xs mb-1">当前教材</div>
                  <div className="font-serif-sc font-bold text-[#24292E]">
                    {currentGradeInfo.name}
                  </div>
                  <div className="text-xs text-[#B83A2D] mt-1">请选择课文</div>
                </>
              ) : (
                <>
                  <div className="text-[#8C8273] text-xs mb-1">当前教材</div>
                  <div className="text-[#B83A2D]">请选择教材</div>
                </>
              )}
            </div>

            {/* 3 个入口按钮 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setLearningMode('preview')}
                className="bg-white border border-[#E6E1D8] rounded-xl p-5 text-left hover:border-[#B83A2D] hover:shadow-sm transition-all"
              >
                <div className="font-serif-sc font-bold text-[#24292E] text-base mb-1">预习</div>
                <div className="text-xs text-[#57606A]">开始今天的预习</div>
              </button>
              <button
                onClick={() => {
                  setLearningMode('learn');
                  setActiveTab('character');
                }}
                className="bg-white border border-[#E6E1D8] rounded-xl p-5 text-left hover:border-[#B83A2D] hover:shadow-sm transition-all"
              >
                <div className="font-serif-sc font-bold text-[#24292E] text-base mb-1">学习</div>
                <div className="text-xs text-[#57606A]">继续学习</div>
              </button>
              <button
                onClick={() => setLearningMode('review')}
                className="bg-white border border-[#E6E1D8] rounded-xl p-5 text-left hover:border-[#B83A2D] hover:shadow-sm transition-all"
              >
                <div className="font-serif-sc font-bold text-[#24292E] text-base mb-1">复习</div>
                <div className="text-xs text-[#57606A]">复习已经学过的内容</div>
              </button>
            </div>

            {/* 选中教材但未选课文时, 显示课程选择器入口 */}
            {progress.selectedGrade === 'g3' && !selectedLessonId && (
              <div className="bg-[#FAF8F4] border border-[#E6E1D8] rounded-xl p-4 text-center text-xs text-[#57606A]">
                点击下方"学习"或"预习"后可在顶部选择具体课文
              </div>
            )}
          </section>
        )}

        {/* If in Mode Preview */}
        {learningMode === 'preview' && (
          <PreviewMode
            gradeId={progress.selectedGrade}
            // 工单 09: 三年级选中教材课程时, 预习页用数据库教材内容;
            // 其他年级或未选课时回退到原 curriculum 数据.
            charactersList={usingTextbook ? displayCharacters : currentGradeCharacters}
            wordsList={usingTextbook ? displayWords : currentGradeWords}
            sentencesList={usingTextbook ? displaySentences : undefined}
            previewedItemIds={progress.previewedItemIds}
            onCompletePreview={handleCompletePreview}
            // 工单 09: 教材模式下传课文标题 + 提供进入学习模块入口
            lessonTitle={usingTextbook ? lessonContent.lesson?.title : undefined}
            onEnterLearn={usingTextbook ? (tab) => {
              setActiveTab(tab);
              setLearningMode('learn');
            } : undefined}
          />
        )}

        {/* If in Mode Review */}
        {learningMode === 'review' && (
          <ReviewMode
            gradeId={progress.selectedGrade}
            // 工单 10: 三年级选中教材课程时, 复习页用数据库教材内容;
            // 其他年级或未选课时回退到原 curriculum 数据.
            charactersList={usingTextbook ? displayCharacters : currentGradeCharacters}
            wordsList={usingTextbook ? displayWords : currentGradeWords}
            sentencesList={usingTextbook ? displaySentences : undefined}
            masteredCharIds={progress.masteredCharacterIds}
            masteredWordIds={progress.masteredWordIds}
            completedSentenceIds={progress.completedSentenceIds}
            onToggleCharMaster={handleToggleCharMaster}
            onToggleWordMaster={handleToggleWordMaster}
            onToggleSentenceComplete={handleToggleSentence}
            onEarnInk={handleEarnInk}
            // 工单 10: 教材模式下传课文标题 + 提供进入学习模块入口
            lessonTitle={usingTextbook ? lessonContent.lesson?.title : undefined}
            onEnterLearn={usingTextbook ? (tab) => {
              setActiveTab(tab);
              setLearningMode('learn');
            } : undefined}
          />
        )}

        {/* If in Mode Exam */}
        {learningMode === 'exam' && (
          <ExamMode
            gradeId={progress.selectedGrade}
            examsList={currentGradeExams}
            onSaveExamRecord={handleSaveExam}
            onAddWrongQuestions={handleAddWrongQuestions}
            // 工单 11: 三年级选中教材课程时, 测验页用数据库教材内容自动
            // 生成 3 类选择题, 其他年级或未选课时回退到原 curriculum exams.
            usingTextbook={usingTextbook}
            lessonTitle={usingTextbook ? lessonContent.lesson?.title : undefined}
            textbookCharacters={usingTextbook ? displayCharacters : []}
            textbookWords={usingTextbook ? displayWords : []}
            textbookSentences={usingTextbook ? displaySentences : []}
            // 干扰项来源池 (来自 curriculum g3, 仅取字符串不带 ID)
            distractorPinyinPool={
              usingTextbook
                ? currentGradeCharacters
                    .map((c) => c.pinyin)
                    .filter((p): p is string => !!p)
                : []
            }
            distractorWordPool={
              usingTextbook
                ? currentGradeWords.map((w) => w.word)
                : []
            }
            distractorSentencePool={
              usingTextbook
                ? currentGradeSentences.map((s) => s.originalText)
                : []
            }
            // 服务器保存到 exam_records 表
            accessToken={usingTextbook ? accessToken : null}
            onReturnToReview={
              usingTextbook
                ? () => setLearningMode('review')
                : undefined
            }
          />
        )}

        {/* If in Mode Learn: Switch by Main Tab */}
        {learningMode === 'learn' && (
          <>
            {/* 工单 06: 教材课程选择器 (仅三年级显示) */}
            {progress.selectedGrade === 'g3' && (
              <LessonSelector
                lessons={textbookLessons}
                loading={lessonsLoading}
                error={lessonsError}
                selectedLessonId={selectedLessonId}
                onSelectLesson={setSelectedLessonId}
              />
            )}

            {/* 工单 06: 教材内容加载提示 (选中课程后才显示) */}
            {usingTextbook && contentLoading && (
              <div className="p-4 text-center text-xs text-[#57606A] bg-[#FAF8F5] border border-[#E6E1D8] rounded-xl">
                正在加载教材内容...
              </div>
            )}
            {usingTextbook && contentError && (
              <div className="p-4 text-center text-xs text-[#B83A2D] bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl">
                教材内容加载失败: {contentError}
              </div>
            )}

            {activeTab === 'character' && (
              <CharacterModule
                gradeId={progress.selectedGrade}
                charactersList={displayCharacters}
                masteredIds={progress.masteredCharacterIds}
                onToggleMaster={handleToggleCharMaster}
              />
            )}

            {activeTab === 'word' && (
              <WordModule
                gradeId={progress.selectedGrade}
                wordsList={displayWords}
                masteredIds={progress.masteredWordIds}
                onToggleMaster={handleToggleWordMaster}
              />
            )}

            {activeTab === 'sentence' && (
              <SentenceModule
                gradeId={progress.selectedGrade}
                sentencesList={displaySentences}
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
