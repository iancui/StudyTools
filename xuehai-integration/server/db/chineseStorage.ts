import { randomUUID } from 'node:crypto';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getDbPool } from './storage.ts';

const pool = getDbPool();
type Kind = 'characters' | 'words' | 'sentences';
const resource = {
  characters: { table: 'chinese_character_progress', item: 'character_id', state: 'is_mastered', doneAt: 'mastered_at' },
  words: { table: 'chinese_word_progress', item: 'word_id', state: 'is_mastered', doneAt: 'mastered_at' },
  sentences: { table: 'chinese_sentence_progress', item: 'sentence_id', state: 'is_completed', doneAt: 'completed_at' },
} as const;

export class ChineseStorage {
  static async getProgress(userId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT user_id, grade, semester, textbook_version, current_lesson_id, total_study_minutes, created_at, updated_at FROM chinese_user_progress WHERE user_id = ? LIMIT 1',
      [userId],
    );
    return rows[0] || null;
  }

  static async saveProgress(userId: string, body: Record<string, unknown>) {
    const grade = typeof body.grade === 'string' ? body.grade : 'g3';
    const semester = body.semester === 's2' ? 's2' : 's1';
    const version = typeof body.textbookVersion === 'string' ? body.textbookVersion : 'default';
    const lessonId = typeof body.currentLessonId === 'string' ? body.currentLessonId : null;
    const minutes = Math.max(0, Math.floor(Number(body.studyMinutesDelta) || 0));
    await pool.execute<ResultSetHeader>(
      `INSERT INTO chinese_user_progress
       (user_id, grade, semester, textbook_version, current_lesson_id, total_study_minutes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE grade=VALUES(grade), semester=VALUES(semester),
       textbook_version=VALUES(textbook_version), current_lesson_id=VALUES(current_lesson_id),
       total_study_minutes=total_study_minutes + VALUES(total_study_minutes)`,
      [userId, grade, semester, version, lessonId, minutes],
    );
    return this.getProgress(userId);
  }

  static async listDetail(userId: string, kind: Kind) {
    const cfg = resource[kind];
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM ${cfg.table} WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId],
    );
    return rows;
  }

  static async replaceDetail(userId: string, kind: Kind, ids: string[]) {
    const cfg = resource[kind];
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        `UPDATE ${cfg.table} SET ${cfg.state}=0, ${cfg.doneAt}=NULL WHERE user_id=?`,
        [userId],
      );
      for (const itemId of [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0))]) {
        await connection.execute(
          `INSERT INTO ${cfg.table} (id,user_id,${cfg.item},${cfg.state},${cfg.doneAt})
           VALUES (?,?,?,?,CURRENT_TIMESTAMP)
           ON DUPLICATE KEY UPDATE ${cfg.state}=1, ${cfg.doneAt}=CURRENT_TIMESTAMP`,
          [randomUUID(), userId, itemId, 1],
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.listDetail(userId, kind);
  }

  static async recordPractice(userId: string, kind: Kind, itemId: string, result: 'correct' | 'wrong') {
    const cfg = resource[kind];
    const correct = result === 'correct' ? 1 : 0;
    const wrong = result === 'wrong' ? 1 : 0;
    await pool.execute<ResultSetHeader>(
      `INSERT INTO ${cfg.table}
       (id,user_id,${cfg.item},practice_count,correct_count,wrong_count,first_learned_at,last_practiced_at)
       VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE practice_count=practice_count+1,
       correct_count=correct_count+VALUES(correct_count), wrong_count=wrong_count+VALUES(wrong_count),
       last_practiced_at=CURRENT_TIMESTAMP`,
      [randomUUID(), userId, itemId, 1, correct, wrong],
    );
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM ${cfg.table} WHERE user_id=? AND ${cfg.item}=? LIMIT 1`,
      [userId, itemId],
    );
    return rows[0] || null;
  }

  static async listWrongQuestions(userId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM chinese_wrong_questions WHERE user_id=? ORDER BY last_wrong_at DESC',
      [userId],
    );
    return rows;
  }

  static async saveWrongQuestion(userId: string, body: Record<string, unknown>) {
    const questionId = String(body.questionId || '');
    if (!questionId) throw Object.assign(new Error('题目资料不完整'), { status: 400 });
    await pool.execute<ResultSetHeader>(
      `INSERT INTO chinese_wrong_questions
       (id,user_id,question_id,question_type,question_content)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE wrong_count=wrong_count+1, question_content=VALUES(question_content),
       last_wrong_at=CURRENT_TIMESTAMP, is_resolved=0, resolved_at=NULL`,
      [randomUUID(), userId, questionId, String(body.questionType || 'unknown'), String(body.questionContent || '')],
    );
    return { saved: true };
  }

  static async listExams(userId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM chinese_exam_records WHERE user_id=? ORDER BY created_at DESC',
      [userId],
    );
    return rows;
  }

  static async createExam(userId: string, body: Record<string, unknown>) {
    const score = Math.max(0, Math.min(100, Number(body.score) || 0));
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId : null;
    const id = randomUUID();
    await pool.execute<ResultSetHeader>(
      `INSERT INTO chinese_exam_records
       (id,user_id,lesson_id,score,passed,total_questions,correct_questions,duration_seconds,answers_json)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id,userId,lessonId,score,score>=70?1:0,Number(body.totalQuestions)||0,Number(body.correctQuestions)||0,Number(body.durationSeconds)||0,JSON.stringify(body.answers ?? null)],
    );
    return { id, lessonId, score, passed: score >= 70 };
  }

  static async listEssays(userId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM chinese_essay_records WHERE user_id=? ORDER BY created_at DESC',
      [userId],
    );
    return rows;
  }

  static async createEssay(userId: string, body: Record<string, unknown>) {
    const content = String(body.content || '').trim();
    if (!content) throw Object.assign(new Error('请先填写作文内容'), { status: 400 });
    const id = randomUUID();
    await pool.execute<ResultSetHeader>(
      `INSERT INTO chinese_essay_records
       (id,user_id,essay_id,title,prompt,content,word_count,feedback_json,status)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id,userId,body.essayId || null,body.title || null,body.prompt || null,content,[...content].length,JSON.stringify(body.feedback ?? null),'submitted'],
    );
    return { id };
  }
}
