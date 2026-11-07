import { db } from '../db/storage.ts';
import { ChineseStorage } from '../db/chineseStorage.ts';

export class ChineseService {
  static getProgress(userId: string) { return ChineseStorage.getProgress(userId); }
  static saveProgress(userId: string, body: Record<string, unknown>) { return ChineseStorage.saveProgress(userId, body); }
  static listDetail(userId: string, kind: 'characters'|'words'|'sentences') { return ChineseStorage.listDetail(userId, kind); }
  static replaceDetail(userId: string, kind: 'characters'|'words'|'sentences', ids: string[]) { return ChineseStorage.replaceDetail(userId, kind, ids); }
  static recordPractice(userId: string, kind: 'characters'|'words'|'sentences', body: Record<string, unknown>) {
    const itemId = String(body.itemId || '');
    if (!itemId || (body.result !== 'correct' && body.result !== 'wrong')) throw Object.assign(new Error('练习信息不完整'), { status: 400 });
    return ChineseStorage.recordPractice(userId, kind, itemId, body.result);
  }
  static listWrong(userId: string) { return ChineseStorage.listWrongQuestions(userId); }
  static saveWrong(userId: string, body: Record<string, unknown>) { return ChineseStorage.saveWrongQuestion(userId, body); }
  static listExams(userId: string) { return ChineseStorage.listExams(userId); }
  static async createExam(userId: string, body: Record<string, unknown>) {
    const exam = await ChineseStorage.createExam(userId, body);
    let pointsAward = { awarded: false, amount: 0, balance: 0, todayEarned: 0 };
    if (exam.passed && exam.lessonId) {
      pointsAward = await db.awardPoints(userId, `CHINESE_QUIZ:${exam.lessonId}`, `chinese:quiz:${exam.lessonId}:first`, 1, '语文单课测验达标');
    }
    return { ...exam, pointsAward };
  }
  static listEssays(userId: string) { return ChineseStorage.listEssays(userId); }
  static createEssay(userId: string, body: Record<string, unknown>) { return ChineseStorage.createEssay(userId, body); }
}
