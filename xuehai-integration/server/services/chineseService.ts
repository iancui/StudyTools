import { ChineseStorage } from '../db/chineseStorage.ts';
import { CHINESE_EXAM_BANK } from '../data/chineseExamBank.ts';

export class ChineseService {
  static getProgress(userId: string) { return ChineseStorage.getProgress(userId); }
  static saveProgress(userId: string, body: Record<string, unknown>) { return ChineseStorage.saveProgress(userId, body); }
  static listDetail(userId: string, kind: 'characters'|'words'|'sentences') { return ChineseStorage.listDetail(userId, kind); }
  static replaceDetail(userId: string, kind: 'characters'|'words'|'sentences', ids: string[]) { return ChineseStorage.replaceDetail(userId, kind, ids); }
  static recordPractice(userId: string, kind: 'characters'|'words'|'sentences', body: Record<string, unknown>) {
    const itemId = String(body.itemId || '');
    const eventId = String(body.eventId || '');
    if (!itemId || !eventId || eventId.length > 64 || (body.result !== 'correct' && body.result !== 'wrong')) throw Object.assign(new Error('练习信息不完整'), { status: 400 });
    return ChineseStorage.recordPractice(userId, kind, itemId, body.result, eventId);
  }
  static recordStudySession(userId: string, body: Record<string, unknown>) { return ChineseStorage.recordStudySession(userId, String(body.sessionId || ''), body.durationMinutes); }
  static listPreviews(userId: string) { return ChineseStorage.listPreviews(userId); }
  static completePreview(userId: string, body: Record<string, unknown>) { return ChineseStorage.completePreview(userId, String(body.guideId || '')); }
  static listWrong(userId: string) { return ChineseStorage.listWrongQuestions(userId); }
  static saveWrong(userId: string, body: Record<string, unknown>) { return ChineseStorage.saveWrongQuestion(userId, body); }
  static resolveWrong(userId: string, body: Record<string, unknown>) { return ChineseStorage.resolveWrongQuestion(userId, String(body.questionId || '')); }
  static listExams(userId: string) { return ChineseStorage.listExams(userId); }
  static async createExam(userId: string, body: Record<string, unknown>) {
    const grade = String(body.grade || '');
    const bank = CHINESE_EXAM_BANK[grade as keyof typeof CHINESE_EXAM_BANK];
    const submitted = body.answers && typeof body.answers === 'object' && !Array.isArray(body.answers)
      ? body.answers as Record<string, unknown>
      : null;
    const requestId = String(body.requestId || '');
    if (!bank || !submitted || !requestId || requestId.length > 64) {
      throw Object.assign(new Error('测验信息不完整，请重新开始'), { status: 400 });
    }
    const stableHash = (value: string) => {
      let hash = 2166136261;
      for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    };
    const expected = [...bank].sort((a, b) => stableHash(a.id) - stableHash(b.id)).slice(0, 10);
    const expectedIds = expected.map((question) => question.id).sort();
    const submittedIds = Object.keys(submitted).sort();
    if (expectedIds.length !== submittedIds.length || expectedIds.some((id, index) => id !== submittedIds[index])) {
      throw Object.assign(new Error('测验题目已变化，请刷新后重新作答'), { status: 400 });
    }
    let correct = 0;
    const gradedAnswers: Record<string, { correct: boolean; correctAnswer: string; explanation: string }> = {};
    for (const question of expected) {
      const canonical = question.type === 'choice' && typeof question.correctAnswer === 'number'
        ? question.options?.[question.correctAnswer]
        : String(question.correctAnswer);
      const correctAnswer = String(canonical ?? '').replace(/^[A-D]\.\s*/, '').trim();
      const isCorrect = String(submitted[question.id] ?? '').replace(/^[A-D]\.\s*/, '').trim().toLowerCase() === correctAnswer.toLowerCase();
      if (isCorrect) correct += 1;
      gradedAnswers[question.id] = { correct: isCorrect, correctAnswer, explanation: String(question.explanation || '').replace(/选项\s*[A-D]/g, '对应选项') };
    }
    const total = expected.length;
    const score = total ? Math.round((correct / total) * 100) : 0;
    // 旧课程库只有年级题目，没有可核验的 lessonId；因此本次测验先核验并保存，
    // 但不发积分。待接入真实教材课次映射后，才能按课次 sourceKey 发奖。
    const exam = await ChineseStorage.createExam(userId, {
      ...body, lessonId: null, requestId, totalQuestions: total,
      correctQuestions: correct, score, verified: true,
    });
    // 错题由服务端根据可信题库答案自动落库；同一测验重试使用相同 requestKey，避免重复增加错题次数。
    for (const question of expected) {
      const studentAnswer = String(submitted[question.id] ?? '');
      if (gradedAnswers[question.id].correct) {
        await ChineseStorage.resolveWrongQuestion(userId, question.id);
        continue;
      }
      await ChineseStorage.saveWrongQuestion(userId, {
        questionId: question.id,
        questionType: question.category,
        requestId: `${requestId.replace(/-/g, '').slice(0, 16)}:${question.id.slice(0, 40)}`,
        questionContent: JSON.stringify({
          question: question.question,
          options: question.options,
          correctAnswer: gradedAnswers[question.id].correctAnswer,
          studentAnswer,
        }),
      });
    }
    const pointsAward = { awarded: false, amount: 0, balance: 0, todayEarned: 0, reason: '尚未关联正式课次，暂不发放积分' };
    return { ...exam, grade, gradedAnswers, pointsAward };
  }
  static listEssays(userId: string) { return ChineseStorage.listEssays(userId); }
  static createEssay(userId: string, body: Record<string, unknown>) { return ChineseStorage.createEssay(userId, body); }
}
