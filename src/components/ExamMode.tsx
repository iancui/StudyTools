import React, { useState, useEffect } from 'react';
import { Award, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GradeId, ExamQuestion } from '../types/chinese';
import { ExamRecord } from '../types/progress';

interface ExamModeProps {
  gradeId: GradeId;
  examsList?: ExamQuestion[];
  onSaveExamRecord: (record: ExamRecord) => void;
  onAddWrongQuestions: (questionIds: string[]) => void;
}

export const ExamMode: React.FC<ExamModeProps> = ({
  gradeId,
  examsList = [],
  onSaveExamRecord,
  onAddWrongQuestions
}) => {
  const questions: ExamQuestion[] = examsList;

  const [hasStarted, setHasStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [examResult, setExamResult] = useState<{
    score: number;
    accuracy: number;
    wrongIds: string[];
  } | null>(null);

  // Timer countdown
  useEffect(() => {
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
  }, [hasStarted, isSubmitted]);

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

    const record: ExamRecord = {
      id: `exam-${Date.now()}`,
      gradeId,
      score,
      totalScore: 100,
      accuracy,
      date: new Date().toLocaleDateString('zh-CN'),
      timeSpentSeconds: 600 - timeLeft,
      wrongQuestionIds: wrongIds
    };

    onSaveExamRecord(record);
    if (wrongIds.length > 0) {
      onAddWrongQuestions(wrongIds);
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
    setTimeLeft(600);
    setExamResult(null);
    setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <div className="bg-white border border-[#E8E3DA] rounded-xl p-8 sm:p-12 shadow-xs text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF6EE] text-[#B83A2D] flex items-center justify-center border border-[#B83A2D]/20">
          <Award size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif-sc text-[#24292E]">
            学段标准学业水平测验
          </h2>
          <p className="text-xs text-[#57606A] leading-relaxed">
            本试卷涵盖当前年级的生字拼音、精品词汇、句式修辞及阅读鉴赏，限时 10 分钟。提交后即时智能判分并自动归入错题本。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF8F5] rounded-lg border border-[#EDE7DD] text-xs">
          <div>
            <span className="text-[#8C8273] block">题量</span>
            <strong className="text-sm font-serif-sc text-[#24292E]">{questions.length} 道精选</strong>
          </div>
          <div>
            <span className="text-[#8C8273] block">时长</span>
            <strong className="text-sm font-mono text-[#24292E]">10 分钟</strong>
          </div>
          <div>
            <span className="text-[#8C8273] block">满分奖励</span>
            <strong className="text-sm font-serif-sc text-[#B83A2D]">+60 墨滴</strong>
          </div>
        </div>

        <button
          onClick={() => setHasStarted(true)}
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
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#B83A2D] bg-[#FAF6EE] px-2.5 py-1 rounded border border-[#B83A2D]/20">
                <Clock size={14} />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={handleSubmitExam}
                className="px-4 py-1.5 bg-[#B83A2D] text-white text-xs font-medium rounded-md hover:bg-[#9E2F23] transition-colors shadow-xs"
              >
                交卷评分
              </button>
            </>
          ) : (
            <button
              onClick={resetExam}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#24292E] text-white text-xs font-medium rounded-md hover:bg-[#333A42] transition-colors"
            >
              <RotateCcw size={13} />
              <span>重新测验</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Card when submitted */}
      {isSubmitted && examResult && (
        <div className="bg-white border border-[#E8E3DA] rounded-xl p-6 sm:p-8 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE4]">
            <div>
              <span className="text-xs text-[#8C8273]">本次综合考核评定</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-serif-sc font-bold text-[#B83A2D]">
                  {examResult.score}
                </span>
                <span className="text-xs text-[#57606A]">分（正确率：{examResult.accuracy}%）</span>
              </div>
            </div>

            <div className="text-xs text-[#57606A] sm:text-right">
              <p>答对：<strong className="text-[#16A34A]">{questions.length - examResult.wrongIds.length}</strong> 题</p>
              <p>需巩固错题：<strong className="text-[#DC2626]">{examResult.wrongIds.length}</strong> 题（已自动加入错题本）</p>
            </div>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#EDE7DD] text-xs text-[#57606A] flex items-center justify-between">
            <span>学分奖励已结算：已获得 +{Math.round(examResult.score * 0.6)} 墨滴</span>
            <span className="text-[#8C8273]">滑动下方查看每道题的详尽答案解析</span>
          </div>
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
