import React, { useState, useEffect, useMemo } from 'react';
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
// 工单: 英语学习 V1 - 辞书基础
import { EnglishModule } from './components/EnglishModule';
import { stopSpeech } from './utils/speech';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';
import { useProgressSync } from './hooks/useProgressSync';
import { useDetailedProgressSync } from './hooks/useDetailedProgressSync';
// 工单 06: 教材数据接入 (三年级上册第 1~5 课)
import { useTextbookLessons, useTextbookLessonContent, useTextbookMultiLessonsContent } from './hooks/useTextbook';
import { LessonSelector } from './components/LessonSelector';
import { LessonNav } from './components/LessonNav';
import { PhotoReview } from './components/PhotoReview';
import type { ReviewScope } from './components/ReviewMode';
import { midtermLessonIds, finalLessonIds } from './utils/reviewAlgorithm';
// 工单 18.5: Semester 类型不再从 GradeSemesterSelector 导入, 改为内联
// 类型别名 (首页不再使用独立选择器, 学期改为 TopBar 紧凑切换).
type Semester = '上册' | '下册';

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
  // 工单 18.5: selectedSemester 不再使用本地 useState, 改为长期保存
  // 在 UserProgress (localStorage). 登录后从该用户专属 localStorage 恢复,
  // 不会每次进首页都要求重新选择. 切换时只更新 progress, 不动其他进度数据.

  // 工单 13: 复习范围选择.
  // - current_lesson: 只复习当前正在学习的课程
  // - selected:       用户多选课程
  // - midterm:        期中复习 (前半段课程)
  // - final:          期末复习 (本学期全部课程)
  const [reviewScope, setReviewScope] = useState<ReviewScope>('current_lesson');
  const [reviewSelectedLessonIds, setReviewSelectedLessonIds] = useState<string[]>([]);

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
  // 工单 14: 新增学期参数, 首页选年级+学期后自动加载对应课程列表.
  // 工单 18.5: selectedSemester 从 progress 读取 (长期配置), 不再是
  //            本地 useState, 登录后从 localStorage 恢复.
  const { lessons: textbookLessons, loading: lessonsLoading, error: lessonsError } =
    useTextbookLessons(progress.selectedGrade, progress.selectedSemester);
  const { data: lessonContent, loading: contentLoading, error: contentError } =
    useTextbookLessonContent(selectedLessonId);

  // 工单 13: 复习范围选择 - 根据 scope 计算 lessonIds, 调用
  // useTextbookMultiLessonsContent 拉取多课数据. lessonIds 在变化时
  // 会自动重新拉取, 选择的范围会真正影响复习内容 (不只是改标题).
  // - current_lesson: 不需要额外拉取, 复用单课 lessonContent
  // - selected:       用户多选的 lessonIds
  // - midterm:        课程列表前半段 (用工具函数, 未来可改为教材定义)
  // - final:          课程列表全部 (用工具函数)
  // - today:          不拉取新数据, 由 ReviewMode 用复习算法在已有数据内筛选
  const reviewLessonIds = useMemo<string[]>(() => {
    if (progress.selectedGrade !== 'g3' || textbookLessons.length === 0) return [];
    if (reviewScope === 'current_lesson' || reviewScope === 'today') return [];
    if (reviewScope === 'selected') return reviewSelectedLessonIds;
    if (reviewScope === 'midterm') return midtermLessonIds(textbookLessons);
    if (reviewScope === 'final') return finalLessonIds(textbookLessons);
    return [];
  }, [progress.selectedGrade, textbookLessons, reviewScope, reviewSelectedLessonIds]);

  // 只有需要多课数据时才启用 hook. current_lesson 复用单课数据.
  const reviewMulti = useTextbookMultiLessonsContent(reviewLessonIds);

  // 工单 18.5: 切换年级或学期时重置课程选择 (避免上一个年级/学期的
  // lessonId 残留, 显示旧课程). 不清空任何学习进度数据.
  useEffect(() => {
    setSelectedLessonId(null);
  }, [progress.selectedGrade, progress.selectedSemester]);

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
    // 工单 14/18.5: 切换年级时清空已选课程, 避免遗留选中旧课程.
    // 工单 18.5: 只更新 progress.selectedGrade, 不动其他进度数据
    // (masteredCharacterIds / inkDrops / streakDays 等保持不变).
    setSelectedLessonId(null);
    setProgress(prev => ({
      ...prev,
      selectedGrade: gradeId
    }));
  };

  // 工单 14/18.5: 切换学期时也清空已选课程, 并写入 progress (长期保存).
  const handleSelectSemester = (s: Semester) => {
    stopSpeech();
    setSelectedLessonId(null);
    setProgress(prev => ({
      ...prev,
      selectedSemester: s
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

  // 工单 13: 复习范围数据. 在三年级教材模式下:
  // - current_lesson: 复用 lessonContent (单课, 与 learn 模式一致)
  // - selected / midterm / final: 用 reviewMulti.data (多课聚合)
  // 其他年级或非教材模式: 回退到 curriculum 数据.
  const reviewUsingTextbook = progress.selectedGrade === 'g3';
  const reviewDisplayCharacters = reviewUsingTextbook
    ? (reviewScope === 'current_lesson' && selectedLessonId
        ? lessonContent.characters
        : reviewMulti.data.characters)
    : currentGradeCharacters;
  const reviewDisplayWords = reviewUsingTextbook
    ? (reviewScope === 'current_lesson' && selectedLessonId
        ? lessonContent.words
        : reviewMulti.data.words)
    : currentGradeWords;
  const reviewDisplaySentences = reviewUsingTextbook
    ? (reviewScope === 'current_lesson' && selectedLessonId
        ? lessonContent.sentences
        : reviewMulti.data.sentences)
    : currentGradeSentences;
  // 复习概览标题: 多课时显示"X 课范围", 单课时显示课文名
  const reviewLessonTitle = reviewUsingTextbook
    ? (reviewScope === 'current_lesson' && lessonContent.lesson
        ? lessonContent.lesson.title
        : (reviewMulti.data.lesson
            ? `多课复习: ${reviewMulti.data.lesson.title} 等`
            : (reviewScope === 'final'
                ? '期末复习范围'
                : reviewScope === 'midterm'
                  ? '期中复习范围'
                  : reviewScope === 'selected'
                    ? '自定义范围复习'
                    : undefined)))
    : undefined;

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
        // 工单 18.5: 学期属于长期配置, 与年级一起在 TopBar 紧凑切换.
        currentSemester={progress.selectedSemester}
        activeTab={activeTab}
        learningMode={learningMode}
        inkDrops={progress.inkDrops}
        isCheckedInToday={isCheckedInToday}
        onSelectGrade={handleSelectGrade}
        onSelectSemester={handleSelectSemester}
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
              {/* 工单 18.5: 首页只展示当前年级/学期 (只读), 不可修改.
                  修改入口在 TopBar, 避免每次进首页都要重新选择. */}
              <p className="text-xs text-[#8C8273] mt-1">
                当前课程：{GRADES_LIST.find(g => g.id === progress.selectedGrade)?.name ?? ''} · {progress.selectedSemester}
              </p>
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

            {/* 工单 14: 拍照复习生字入口 (优先放在生字学习/复习相关位置) */}
            {usingTextbook && displayCharacters.length > 0 && (
              <PhotoReview
                charactersList={displayCharacters}
                masteredIds={progress.masteredCharacterIds}
                onComplete={() => {
                  setActiveTab('character');
                  setLearningMode('learn');
                }}
              />
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
            // 工单 13: 改为按 reviewScope 重新计算数据, 范围变化会真正影响复习内容.
            charactersList={reviewUsingTextbook ? reviewDisplayCharacters : currentGradeCharacters}
            wordsList={reviewUsingTextbook ? reviewDisplayWords : currentGradeWords}
            sentencesList={reviewUsingTextbook ? reviewDisplaySentences : undefined}
            masteredCharIds={progress.masteredCharacterIds}
            masteredWordIds={progress.masteredWordIds}
            completedSentenceIds={progress.completedSentenceIds}
            onToggleCharMaster={handleToggleCharMaster}
            onToggleWordMaster={handleToggleWordMaster}
            onToggleSentenceComplete={handleToggleSentence}
            onEarnInk={handleEarnInk}
            // 工单 10: 教材模式下传课文标题 + 提供进入学习模块入口
            lessonTitle={reviewUsingTextbook ? reviewLessonTitle : undefined}
            onEnterLearn={reviewUsingTextbook ? (tab) => {
              setActiveTab(tab);
              setLearningMode('learn');
            } : undefined}
            // 工单 13: 复习范围选择 props (仅三年级教材模式才提供)
            reviewScope={reviewScope}
            onSelectReviewScope={
              reviewUsingTextbook
                ? (scope) => {
                    setReviewScope(scope);
                    // 切换到"选择课程"时, 默认勾选当前已选课程, 方便用户继续操作
                    if (scope === 'selected' && selectedLessonId && reviewSelectedLessonIds.length === 0) {
                      setReviewSelectedLessonIds([selectedLessonId]);
                    }
                  }
                : undefined
            }
            lessons={reviewUsingTextbook ? textbookLessons : []}
            selectedLessonIds={reviewSelectedLessonIds}
            onSelectLessonIds={
              reviewUsingTextbook ? setReviewSelectedLessonIds : undefined
            }
            scopeLoading={reviewUsingTextbook ? reviewMulti.loading : false}
            // 工单 17: 把 useDetailedProgressSync 从服务器 DTO 同步到的
            // 详细统计 (practiceCount / correctCount / wrongCount /
            // lastPracticedAt) 透传给 ReviewMode, 由其切换到
            // buildDataDrivenReviewQuestions 进行数据驱动排序.
            // 未登录或服务器无数据时为 undefined, ReviewMode 自动回退.
            detailedCharStats={progress.detailedCharStats}
            detailedWordStats={progress.detailedWordStats}
            detailedSentenceStats={progress.detailedSentenceStats}
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

        {/* 工单: 英语学习 V1 - 辞书基础. 独立的英语入口, 与中文学习逻辑分开. */}
        {learningMode === 'english' && (
          <EnglishModule />
        )}

        {/* If in Mode Learn: Switch by Main Tab */}
        {learningMode === 'learn' && (
          <>
            {/* 工单 13: 课程学习模式优化.
                - 选中课程后, 在顶部固定显示当前课程标题 + 上一课/下一课 + 生字/词语/句子切换.
                - 切换生字/词语/句子不会重新选择课程.
                - 切换上一课/下一课后保持当前 activeTab 不变 (例如正在句子就仍是句子). */}

            {/* 教材课程选择器 (仅三年级显示). 在窄屏可横向滚动. */}
            {progress.selectedGrade === 'g3' && (
              <LessonSelector
                lessons={textbookLessons}
                loading={lessonsLoading}
                error={lessonsError}
                selectedLessonId={selectedLessonId}
                onSelectLesson={setSelectedLessonId}
              />
            )}

            {/* 工单 13: 课程内导航条 (仅当选中了某课才显示). */}
            {usingTextbook && lessonContent.lesson && (
              <LessonNav
                lesson={lessonContent.lesson}
                lessons={textbookLessons}
                activeTab={activeTab}
                onSelectTab={(tab) => setActiveTab(tab)}
                onSelectLessonId={(id) => setSelectedLessonId(id)}
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

            {/* 工单 13: 当处于教材学习模式但还没选课时, 给出引导提示 */}
            {progress.selectedGrade === 'g3' && !usingTextbook && textbookLessons.length > 0 && (
              <div className="p-6 text-center text-xs text-[#57606A] bg-white border border-[#E6E1D8] rounded-xl">
                请在上方选择一个课程, 进入后即可在 生字 / 词语 / 句子 之间直接切换, 不需要退出再重进.
              </div>
            )}

            {activeTab === 'character' && (
              <>
                <CharacterModule
                  gradeId={progress.selectedGrade}
                  charactersList={displayCharacters}
                  masteredIds={progress.masteredCharacterIds}
                  onToggleMaster={handleToggleCharMaster}
                />
                {/* 工单 14: 生字学习页底部提供拍照复习入口 */}
                {usingTextbook && displayCharacters.length > 0 && (
                  <PhotoReview
                    charactersList={displayCharacters}
                    masteredIds={progress.masteredCharacterIds}
                  />
                )}
              </>
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
