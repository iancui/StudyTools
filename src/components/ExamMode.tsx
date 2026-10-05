import React, { useState, useEffect } from 'react';
import { Award, Clock, CheckCircle2, XCircle, RotateCcw, BookOpen, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GradeId, ExamQuestion, CharacterItem, WordItem, SentenceItem } from '../types/chinese';
import { ExamRecord } from '../types/progress';
import { generateExamQuestions } from '../utils/examGenerator';
import {
  saveExamRecord,
  SavedExamRecordDTO,
  ExamAnswerPayload,
} from '../api/exam';

interface ExamModeProps {
  gradeId: GradeId;
  // 原 curriculum 模式直接传入题目数组
  examsList?: ExamQuestion[];
  onSaveExamRecord: (record: ExamRecord) => void;
  onAddWrongQuestions: (questionIds: string[]) => void;

  // 工单 11: 教材模式额外参数
  // usingTextbook=true 时使用教材数据生成题目, examsList 被忽略
  usingTextbook?: boolean;
  lessonTitle?: string;
  textbookCharacters?: CharacterItem[];
  textbookWords?: WordItem[];
  textbookSentences?: SentenceItem[];
  // 干扰项来源池 (来自 curriculum 同年级数据, 仅取字符串不带 ID)
  distractorPinyinPool?: string[];
  distractorWordPool?: string[];
  distractorSentencePool?: string[];
  // 保存到 exam_records 表的 access token + 成功回调
  accessToken?: string | null;
  onExamRecordSaved?: (saved: SavedExamRecordDTO) => void;
  // 返回复习页回调
  onReturnToReview?: () => void;
}

export const ExamMode: React.FC<ExamModeProps> = ({
  gradeId,
  examsList = [],
  onSaveExamRecord,
  onAddWrongQuestions,
  usingTextbook = false,
  lessonTitle,
  textbookCharacters = [],
  textbookWords = [],
  textbookSentences = [],
  distractorPinyinPool = [],
  distractorWordPool = [],
  distractorSentencePool = [],
  accessToken = null,
  onExamRecordSaved,
  onReturnToReview,
}) => {
  // 教材模式: 用 useMemo 生成首份题目; "再测一次" 时 setTextbookQuestions 重新生成
  const [textbookQuestions, setTextbookQuestions] = useState<ExamQuestion[]>(() => {
    if (!usingTextbook) return [];
    return generateExamQuestions({
      characters: textbookCharacters,
      words: textbookWords,
      sentences: textbookSentences,
      lessonTitle: lessonTitle || '',
      distractorPinyinPool,
      distractorWordPool,
      distractorSentencePool,
    });
  });

  const questions: ExamQuestion[] = usingTextbook ? textbookQuestions : examsList;

  const [hasStarted, setHasStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [examResult, setExamResult] = useState<{
    score: number;
    accuracy: number;
    wrongIds: string[];
  } | null>(null);
  // 工单 11: 教材模式考试起始时间, 用于提交时计算 durationSeconds
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  // 工单 11: 服务器保存状态 (loading/done/error)
  const [savingToServer, setSavingToServer] = useState(false);
  const [saveServerError, setSaveServerError] = useState<string | null>(null);

  // Timer countdown (工单 11: 教材模式不强制倒计时, 跳过)
  useEffect(() => {
    if (usingTextbook) return;
    if (!hasStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isSubmitted, usingTextbook]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (qId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIndex
    }));
  };

  const handleSubmitExam = () => {
    let correctCount = 0;
    const wrongIds: string[] = [];

    questions.forEach(q => {
      const uAns = userAnswers[q.id];
      if (uAns !== undefined && uAns === q.correctAnswer) {
        correctCount += 1;
      } else {
        wrongIds.push(q.id);
      }
    });

    const totalQuestions = questions.length || 1;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const score = accuracy;

    const result = {
      score,
      accuracy,
      wrongIds
    };

    setExamResult(result);
    setIsSubmitted(true);

    // 工单 11: 教材模式 timeSpent 由 startedAt 计算, curriculum 模式保持原逻辑
    const timeSpentSeconds = usingTextbook && startedAt
      ? Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000))
      : 600 - timeLeft;

    const record: ExamRecord = {
      id: `exam-${Date.now()}`,
      gradeId,
      score,
      totalScore: 100,
      accuracy,
      date: new Date().toLocaleDateString('zh-CN'),
      timeSpentSeconds,
      wrongQuestionIds: wrongIds
    };

    onSaveExamRecord(record);
    if (wrongIds.length > 0) {
      onAddWrongQuestions(wrongIds);
    }

    // 工单 11: 教材模式同步保存到 exam_records 表 (best-effort, 不阻塞 UI)
    if (usingTextbook && accessToken) {
      const completedAt = new Date();
      const answers: ExamAnswerPayload[] = questions.map((q) => {
        const uAns = userAnswers[q.id];
        const isCorrect = uAns !== undefined && uAns === q.correctAnswer;
        return {
          questionId: q.id,
          userAnswer: typeof uAns === 'number' || typeof uAns === 'string' ? uAns : null,
          isCorrect,
        };
      });
      setSavingToServer(true);
      setSaveServerError(null);
      saveExamRecord(accessToken, {
        examId: record.id,
        examName: lessonTitle ? `《${lessonTitle}》教材测验` : '教材测验',
        grade: String(gradeId),
        totalQuestions,
        correctQuestions: correctCount,
        wrongQuestions: totalQuestions - correctCount,
        score,
        durationSeconds: timeSpentSeconds,
        answers,
        startedAt: startedAt ? startedAt.toISOString() : completedAt.toISOString(),
        completedAt: completedAt.toISOString(),
      })
        .then((saved) => {
          setSavingToServer(false);
          onExamRecordSaved?.(saved);
        })
        .catch((err) => {
          setSavingToServer(false);
          setSaveServerError(
            err instanceof Error ? err.message : '保存考试记录失败'
          );
        });
    }

    if (score >= 80) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#B83A2D', '#D97706', '#16A34A', '#24292E']
      });
    }
  };

  const resetExam = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setExamResult(null);
    setHasStarted(true);
    setSaveServerError(null);
    setSavingToServer(false);
    if (usingTextbook) {
      // 工单 11: "再测一次" 重新生成题目 + 重新随机顺序
      setTextbookQuestions(
        generateExamQuestions({
          characters: textbookCharacters,
          words: textbookWords,
          sentences: textbookSentences,
          lessonTitle: lessonTitle || '',
          distractorPinyinPool,
          distractorWordPool,
          distractorSentencePool,
        })
      );
      setStartedAt(new Date());
    } else {
      setTimeLeft(600);
    }
  };

  if (!hasStarted) {
    return (
      <div className="bg-white border border-[#E8E3DA] rounded-xl p-8 sm:p-12 shadow-xs text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF6EE] text-[#B83A2D] flex items-center justify-center border border-[#B83A2D]/20">
          <Award size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif-sc text-[#24292E]">
            {usingTextbook && lessonTitle
              ? `《${lessonTitle}》教材测验`
              : '学段标准学业水平测验'}
          </h2>
          <p className="text-xs text-[#57606A] leading-relaxed">
            {usingTextbook
              ? '本试卷基于当前课文的生字、词语和重点句子自动生成，包含生字拼音题、词语识别题和重点句子题，提交后即时判分并归入错题本。'
              : '本试卷涵盖当前年级的生字拼音、精品词汇、句式修辞及阅读鉴赏，限时 10 分钟。提交后即时智能判分并自动归入错题本。'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF8F5] rounded-lg border border-[#EDE7DD] text-xs">
          <div>
            <span className="text-[#8C8273] block">题量</span>
            <strong className="text-sm font-serif-sc text-[#24292E]">{questions.length} 道精选</strong>
          </div>
          <div>
            <span className="text-[#8C8273] block">时长</span>
            <strong className="text-sm font-mono text-[#24292E]">{usingTextbook ? '不限时' : '10 分钟'}</strong>
          </div>
          <div>
            <span className="text-[#8C8273] block">满分奖励</span>
            <strong className="text-sm font-serif-sc text-[#B83A2D]">+60 墨滴</strong>
          </div>
        </div>

        <button
          onClick={() => {
            if (usingTextbook) setStartedAt(new Date());
            setHasStarted(true);
          }}
          className="px-8 py-3 bg-[#B83A2D] text-white text-xs font-medium rounded-lg hover:bg-[#9E2F23] transition-colors shadow-sm"
        >
          开始答卷
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Sticky Exam Status Bar */}
      <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-xs border border-[#E6E1D8] rounded-xl px-5 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold font-serif-sc text-[#24292E]">
            {isSubmitted ? '测验成绩单' : '答题进行中'}
          </span>
          <span className="text-xs text-[#57606A]">
            已答：{Object.keys(userAnswers).length} / {questions.length} 题
          </span>
        </div>

        <div className="flex items-center gap-4">
          {!isSubmitted ? (
            <>
              {!usingTextbook && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#B83A2D] bg-[#FAF6EE] px-2.5 py-1 rounded border border-[#B83A2D]/20">
                  <Clock size={14} />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
              <button
                onClick={handleSubmitExam}
                className="px-4 py-1.5 bg-[#B83A2D] text-white text-xs font-medium rounded-md hover:bg-[#9E2F23] transition-colors shadow-xs"
              >
                交卷评分
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {usingTextbook && onReturnToReview && (
                <button
                  onClick={onReturnToReview}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E8E3DA] text-[#57606A] text-xs font-medium rounded-md hover:bg-[#FAF8F5] hover:text-[#24292E] transition-colors"
                >
                  <ChevronLeft size={13} />
                  <span>返回复习</span>
                </button>
              )}
              <button
                onClick={resetExam}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#24292E] text-white text-xs font-medium rounded-md hover:bg-[#333A42] transition-colors"
              >
                <RotateCcw size={13} />
                <span>再测一次</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Card when submitted */}
      {isSubmitted && examResult && (
        <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 sm:p-8 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE4]">
            <div>
              <span className="text-xs text-[#8C8273]">
                {usingTextbook && lessonTitle
                  ? `《${lessonTitle}》教材测验成绩`
                  : '本次综合考核评定'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-serif-sc font-bold text-[#B83A2D]">
                  {examResult.score}
                </span>
                <span className="text-xs text-[#57606A]">分（正确率：{examResult.accuracy}%）</span>
              </div>
            </div>

            <div className="text-xs text-[#57606A] sm:text-right">
              <p>总题数：<strong className="text-[#24292E]">{questions.length}</strong> 题</p>
              <p>答对：<strong className="text-[#16A34A]">{questions.length - examResult.wrongIds.length}</strong> 题</p>
              <p>答错：<strong className="text-[#DC2626]">{examResult.wrongIds.length}</strong> 题</p>
            </div>
          </div>

          {/* 工单 11: 服务器保存状态提示 (仅教材模式显示) */}
          {usingTextbook && (
            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#EDE7DD] text-xs text-[#57606A] flex items-center justify-between">
              {savingToServer ? (
                <span>正在同步考试记录到云端...</span>
              ) : saveServerError ? (
                <span className="text-[#DC2626]">云端同步失败：{saveServerError}</span>
              ) : (
                <span>考试成绩已自动保存到云端</span>
              )}
              <span className="text-[#8C8273]">滑动下方查看每道题的详尽答案解析</span>
            </div>
          )}

          {!usingTextbook && (
            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#EDE7DD] text-xs text-[#57606A] flex items-center justify-between">
              <span>学分奖励已结算：已获得 +{Math.round(examResult.score * 0.6)} 墨滴</span>
              <span className="text-[#8C8273]">滑动下方查看每道题的详尽答案解析</span>
            </div>
          )}

          {/* 工单 11: 教材模式额外提供 "返回复习" / "再测一次" 按钮区 */}
          {usingTextbook && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {onReturnToReview && (
                <button
                  onClick={onReturnToReview}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-[#E8E3DA] text-[#24292E] text-xs font-medium rounded-md hover:bg-[#FAF8F5] transition-colors"
                >
                  <ChevronLeft size={14} />
                  <span>返回复习</span>
                </button>
              )}
              <button
                onClick={resetExam}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B83A2D] text-white text-xs font-medium rounded-md hover:bg-[#9E2F23] transition-colors shadow-xs"
              >
                <RotateCcw size={13} />
                <span>再测一次</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {questions.map((q, idx) => {
          const selectedOption = userAnswers[q.id];
          const isCorrect = isSubmitted && selectedOption === q.correctAnswer;
          const isWrong = isSubmitted && selectedOption !== q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`bg-white border rounded-xl p-6 shadow-xs space-y-4 transition-all ${
                isSubmitted
                  ? isCorrect
                    ? 'border-[#86EFAC]'
                    : 'border-[#FCA5A5]'
                  : 'border-[#E8E3DA]'
              }`}
            >
              {/* Question Title & Index */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-[#FAF6EE] text-[#B83A2D] text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-[#24292E] leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {isSubmitted && (
                  <div>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs text-[#16A34A] font-medium">
                        <CheckCircle2 size={16} /> 正确
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-[#DC2626] font-medium">
                        <XCircle size={16} /> 错误
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              {q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isRightOption = isSubmitted && optIdx === q.correctAnswer;

                    let btnClass = 'bg-[#FAF8F5] border-[#E8E3DA] text-[#333C48] hover:bg-[#F2EDE2]';
                    if (isSelected && !isSubmitted) {
                      btnClass = 'bg-[#FAF6EE] border-[#B83A2D] text-[#B83A2D] font-medium ring-1 ring-[#B83A2D]/20';
                    }
                    if (isSubmitted) {
                      if (isRightOption) {
                        btnClass = 'bg-[#EBF7EE] border-[#86EFAC] text-[#16A34A] font-medium';
                      } else if (isSelected && !isRightOption) {
                        btnClass = 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted}
                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                        className={`text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {isSubmitted && isRightOption && (
                          <CheckCircle2 size={14} className="text-[#16A34A] shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Detailed Explanation upon submission */}
              {isSubmitted && (
                <div className="mt-3 pt-3 border-t border-[#F0ECE4] text-xs space-y-1 bg-[#FAF8F5] p-3 rounded-lg">
                  <div className="flex items-center gap-1 text-[#24292E] font-semibold">
                    <BookOpen size={13} className="text-[#B83A2D]" />
                    <span>答案深度解析：</span>
                  </div>
                  <p className="text-[#57606A] leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
