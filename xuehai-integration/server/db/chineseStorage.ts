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
      'SELECT grade, semester, textbook_version, current_lesson_id, total_study_minutes, created_at, updated_at FROM chinese_user_progress WHERE user_id = ? LIMIT 1',
      [userId],
    );
    return rows[0] || null;
  }

  static async saveProgress(userId: string, body: Record<string, unknown>) {
    const gradeValue = typeof body.grade === 'string' ? body.grade : 'g3';
    const grade = /^g([1-9]|1[0-2])$/.test(gradeValue) ? gradeValue : 'g3';
    const semester = body.semester === 's2' ? 's2' : 's1';
    const version = typeof body.textbookVersion === 'string' ? body.textbookVersion.slice(0, 64) : 'default';
    const lessonId = typeof body.currentLessonId === 'string' ? body.currentLessonId.slice(0, 64) : null;
    // 学习分钟只能通过带 sessionId 的 recordStudySession 写入，不能由配置请求伪造。
    await pool.execute<ResultSetHeader>(
      `INSERT INTO chinese_user_progress
       (user_id, grade, semester, textbook_version, current_lesson_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE grade=VALUES(grade), semester=VALUES(semester),
       textbook_version=VALUES(textbook_version), current_lesson_id=VALUES(current_lesson_id)`,
      [userId, grade, semester, version, lessonId],
    );
    return this.getProgress(userId);
  }

  static async listDetail(userId: string, kind: Kind) {
    const cfg = resource[kind];
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${cfg.item}, ${cfg.state}, practice_count, correct_count, wrong_count, first_learned_at, last_practiced_at, ${cfg.doneAt}, updated_at FROM ${cfg.table} WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId],
    );
    return rows;
  }

  static async replaceDetail(userId: string, kind: Kind, ids: string[]) {
    const cfg = resource[kind];
    const safeIds = [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0 && id.length <= 100))].slice(0, 5000);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        `UPDATE ${cfg.table} SET ${cfg.state}=0, ${cfg.doneAt}=NULL WHERE user_id=?`,
        [userId],
      );
      for (const itemId of safeIds) {
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

  static async recordPractice(userId: string, kind: Kind, itemId: string, result: 'correct' | 'wrong', eventId: string) {
    const cfg = resource[kind];
    if (!itemId || itemId.length > 100 || !eventId || eventId.length > 64) throw Object.assign(new Error('练习信息无效'), { status: 400 });
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [event] = await connection.execute<ResultSetHeader>(
        'INSERT IGNORE INTO chinese_practice_events (id,user_id,event_id,item_kind,item_id,result) VALUES (?,?,?,?,?,?)',
        [randomUUID(), userId, eventId, kind, itemId, result],
      );
      if (event.affectedRows > 0) {
        const correct = result === 'correct' ? 1 : 0;
        const wrong = result === 'wrong' ? 1 : 0;
        await connection.execute<ResultSetHeader>(
          `INSERT INTO ${cfg.table}
           (id,user_id,${cfg.item},practice_count,correct_count,wrong_count,first_learned_at,last_practiced_at)
           VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
           ON DUPLICATE KEY UPDATE practice_count=practice_count+1,
           correct_count=correct_count+VALUES(correct_count), wrong_count=wrong_count+VALUES(wrong_count),
           last_practiced_at=CURRENT_TIMESTAMP`,
          [randomUUID(), userId, itemId, 1, correct, wrong],
        );
      }
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT ${cfg.item}, ${cfg.state}, practice_count, correct_count, wrong_count, first_learned_at, last_practiced_at, ${cfg.doneAt}, updated_at FROM ${cfg.table} WHERE user_id=? AND ${cfg.item}=? LIMIT 1`,
        [userId, itemId],
      );
      await connection.commit();
      return { ...(rows[0] || {}), duplicateEvent: event.affectedRows === 0 };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }



  static async recordStudySession(userId: string, sessionId: string, rawMinutes: unknown) {
    const duration = Math.max(0, Math.min(240, Math.floor(Number(rawMinutes) || 0)));
    const safeSessionId = String(sessionId || '').trim();
    if (!safeSessionId || safeSessionId.length > 64 || duration < 1) {
      throw Object.assign(new Error('学习计时记录无效'), { status: 400 });
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [inserted] = await connection.execute<ResultSetHeader>(
        'INSERT IGNORE INTO chinese_study_sessions (id,user_id,session_id,duration_minutes) VALUES (?,?,?,?)',
        [randomUUID(), userId, safeSessionId, duration],
      );
      if (inserted.affectedRows > 0) {
        await connection.execute<ResultSetHeader>(
          `INSERT INTO chinese_user_progress (user_id,total_study_minutes)
           VALUES (?,?) ON DUPLICATE KEY UPDATE total_study_minutes=total_study_minutes+VALUES(total_study_minutes)`,
          [userId, duration],
        );
      }
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT total_study_minutes FROM chinese_user_progress WHERE user_id=? LIMIT 1',
        [userId],
      );
      await connection.commit();
      return { durationMinutes: duration, totalStudyMinutes: Number(rows[0]?.total_study_minutes || 0), duplicateSession: inserted.affectedRows === 0 };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async listPreviews(userId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT guide_id, completed_at FROM chinese_preview_records WHERE user_id=? ORDER BY completed_at DESC',
      [userId],
    );
    return rows;
  }

  static async completePreview(userId: string, guideId: string) {
    const safeGuideId = String(guideId || '').trim();
    if (!safeGuideId || safeGuideId.length > 100) throw Object.assign(new Error('预习内容无效'), { status: 400 });
    await pool.execute<ResultSetHeader>(
      `INSERT INTO chinese_preview_records (id,user_id,guide_id)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE completed_at=completed_at`,
      [randomUUID(), userId, safeGuideId],
    );
    return { guideId: safeGuideId, completed: true };
  }

  static async listWrongQuestions(userId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT question_id, question_type, question_content, wrong_count, correct_count, is_resolved, first_wrong_at, last_wrong_at, resolved_at, created_at, updated_at FROM chinese_wrong_questions WHERE user_id=? ORDER BY last_wrong_at DESC',
      [userId],
    );
    return rows;
  }

  static async saveWrongQuestion(userId: string, body: Record<string, unknown>) {
    const questionId = String(body.questionId || '');
    const requestKey = String(body.requestId || '');
    const questionType = String(body.questionType || 'unknown').slice(0, 32);
    const questionContent = String(body.questionContent || '').slice(0, 4000);
    if (!questionId || questionId.length > 100 || !requestKey || requestKey.length > 64) throw Object.assign(new Error('题目资料不完整'), { status: 400 });
    await pool.execute<ResultSetHeader>(
      `INSERT INTO chinese_wrong_questions
       (id,user_id,question_id,question_type,question_content,request_key)
       VALUES (?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
       wrong_count=wrong_count + IF(request_key=VALUES(request_key),0,1),
       question_content=VALUES(question_content), request_key=VALUES(request_key),
       last_wrong_at=CURRENT_TIMESTAMP, is_resolved=0, resolved_at=NULL`,
      [randomUUID(), userId, questionId, questionType, questionContent, requestKey],
    );
    return { saved: true, requestId: requestKey };
  }


  static async resolveWrongQuestion(userId: string, questionId: string) {
    const id = String(questionId || '').trim();
    if (!id || id.length > 100) throw Object.assign(new Error('错题记录无效'), { status: 400 });
    await pool.execute<ResultSetHeader>(
      'UPDATE chinese_wrong_questions SET is_resolved=1, resolved_at=CURRENT_TIMESTAMP WHERE user_id=? AND question_id=?',
      [userId, id],
    );
    return { questionId: id, resolved: true };
  }

  static async listExams(userId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, lesson_id, score, passed, total_questions, correct_questions, duration_seconds, answers_json, created_at FROM chinese_exam_records WHERE user_id=? ORDER BY created_at DESC',
      [userId],
    );
    return rows;
  }

  static async createExam(userId: string, body: Record<string, unknown>) {
    const total = Math.max(0, Math.min(100, Math.floor(Number(body.totalQuestions) || 0)));
    const correct = Math.max(0, Math.min(total, Math.floor(Number(body.correctQuestions) || 0)));
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const durationSeconds = Math.max(0, Math.min(86400, Math.floor(Number(body.durationSeconds) || 0)));
    const verified = body.verified === true;
    const passed = verified && score >= 70;
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.slice(0, 64) : null;
    const requestKey = typeof body.requestId === 'string' && body.requestId.length <= 64 ? body.requestId : randomUUID();
    await pool.execute<ResultSetHeader>(
      `INSERT INTO chinese_exam_records
       (id,user_id,lesson_id,score,passed,total_questions,correct_questions,duration_seconds,answers_json,request_key)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE request_key=VALUES(request_key)`,
      [randomUUID(),userId,lessonId,score,passed?1:0,total,correct,durationSeconds,JSON.stringify(body.answers ?? null),requestKey],
    );
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, lesson_id, score, passed, total_questions, correct_questions, duration_seconds, created_at FROM chinese_exam_records WHERE user_id=? AND request_key=? LIMIT 1',
      [userId, requestKey],
    );
    // The service has already verified every answer against the server-owned question bank.
    return { ...(rows[0] || {}), lessonId, requestKey, verified, provisionalPassed: score >= 70, passed };
  }

  static async listEssays(userId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, essay_id, title, prompt, content, word_count, score, feedback_json, status, created_at, updated_at FROM chinese_essay_records WHERE user_id=? ORDER BY created_at DESC',
      [userId],
    );
    return rows;
  }

  static async createEssay(userId: string, body: Record<string, unknown>) {
    const content = String(body.content || '').trim();
    if (!content) throw Object.assign(new Error('请先填写作文内容'), { status: 400 });
    if ([...content].length > 30000) throw Object.assign(new Error('作文内容过长，请分段保存'), { status: 400 });
    const requestKey = typeof body.requestId === 'string' && body.requestId.length <= 64 ? body.requestId : randomUUID();
    const essayId = typeof body.essayId === 'string' ? body.essayId.slice(0, 100) : null;
    const title = typeof body.title === 'string' ? body.title.slice(0, 200) : null;
    const prompt = typeof body.prompt === 'string' ? body.prompt.slice(0, 10000) : null;
    const feedbackJson = JSON.stringify(body.feedback ?? null);
    if (feedbackJson.length > 20000) throw Object.assign(new Error('作文反馈内容过长'), { status: 400 });
    await pool.execute<ResultSetHeader>(
      `INSERT INTO chinese_essay_records
       (id,user_id,essay_id,title,prompt,content,word_count,feedback_json,request_key,status)
       VALUES (?,?,?,?,?,?,?,?,?,'submitted')
       ON DUPLICATE KEY UPDATE request_key=VALUES(request_key)`,
      [randomUUID(),userId,essayId,title,prompt,content,[...content].length,feedbackJson,requestKey],
    );
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, created_at FROM chinese_essay_records WHERE user_id=? AND request_key=? LIMIT 1',
      [userId, requestKey],
    );
    return { ...(rows[0] || {}), requestKey };
  }
}
