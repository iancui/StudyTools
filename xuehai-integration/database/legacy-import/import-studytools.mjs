/**
 * StudyTools → Xuehai data import.
 * Default mode is dry-run. Real import requires both --apply and --confirm.
 * Environment: STUDYTOOLS_DB_HOST/PORT/USER/PASSWORD/NAME and DB_HOST/PORT/USER/PASSWORD/NAME.
 */
import { createPool } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const apply = process.argv.includes('--apply');
const confirmed = process.argv.includes('--confirm');
if (apply && !confirmed) throw new Error('正式导入必须同时提供 --apply --confirm');

const oldPool = createPool({
  host: process.env.STUDYTOOLS_DB_HOST,
  port: Number(process.env.STUDYTOOLS_DB_PORT || 3306),
  user: process.env.STUDYTOOLS_DB_USER,
  password: process.env.STUDYTOOLS_DB_PASSWORD,
  database: process.env.STUDYTOOLS_DB_NAME,
  connectionLimit: 3,
});

const progressJsonArg = process.argv.find((arg) => arg.startsWith('--progress-json='));
const localProgressByUser = new Map();
if (progressJsonArg) {
  const filePath = progressJsonArg.slice('--progress-json='.length);
  const raw = JSON.parse(await readFile(filePath, 'utf8'));
  const decode = (value) => typeof value === 'string' ? JSON.parse(value) : value;
  if (raw && raw.legacyUserId != null && raw.progress) {
    localProgressByUser.set(String(raw.legacyUserId), decode(raw.progress));
  } else {
    const entries = Array.isArray(raw) ? raw.map((entry) => [entry.key, entry.value]) : Object.entries(raw || {});
    for (const [key, value] of entries) {
      const match = String(key || '').match(/^moyun_chinese_learning_v1:user:(\d+)$/);
      if (match) localProgressByUser.set(match[1], decode(value));
    }
  }
}

const newPool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 3,
});

async function select(pool, sql, values = []) {
  const [rows] = await pool.execute(sql, values);
  return rows;
}
function jsonValue(value) {
  if (value == null) return null;
  if (typeof value === 'object') return JSON.stringify(value);
  try { return JSON.stringify(JSON.parse(value)); } catch { return JSON.stringify({ legacyText: String(value) }); }
}
function safeScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
}

async function importUser(oldUser) {
  const matches = await select(
    newPool,
    'SELECT id FROM users WHERE username = ? OR (? IS NOT NULL AND email = ?) LIMIT 2',
    [oldUser.username, oldUser.email || null, oldUser.email || null],
  );
  if (matches.length !== 1) {
    return { status: matches.length ? 'ambiguous-target-user' : 'target-user-not-found', username: oldUser.username };
  }

  const targetUserId = String(matches[0].id);
  const oldId = oldUser.id;
  const local = localProgressByUser.get(String(oldId)) || {};
  const [progress, chars, words, sentences, wrongs, exams, essays] = await Promise.all([
    select(oldPool, 'SELECT * FROM user_progress WHERE user_id = ?', [oldId]),
    select(oldPool, 'SELECT * FROM user_character_progress WHERE user_id = ?', [oldId]),
    select(oldPool, 'SELECT * FROM user_word_progress WHERE user_id = ?', [oldId]),
    select(oldPool, 'SELECT * FROM user_sentence_progress WHERE user_id = ?', [oldId]),
    select(oldPool, 'SELECT * FROM user_wrong_questions WHERE user_id = ?', [oldId]),
    select(oldPool, 'SELECT * FROM exam_records WHERE user_id = ?', [oldId]),
    select(oldPool, 'SELECT * FROM essay_practices WHERE user_id = ?', [oldId]),
  ]);
  const counts = {
    progress: progress.length, characters: chars.length, words: words.length,
    sentences: sentences.length, wrongQuestions: wrongs.length,
    exams: exams.length, essays: essays.length,
    localPreviewed: Array.isArray(local.previewedItemIds) ? local.previewedItemIds.length : 0,
    localMasteredCharacters: Array.isArray(local.masteredCharacterIds) ? local.masteredCharacterIds.length : 0,
    localMasteredWords: Array.isArray(local.masteredWordIds) ? local.masteredWordIds.length : 0,
    localCompletedSentences: Array.isArray(local.completedSentenceIds) ? local.completedSentenceIds.length : 0,
    localExams: exams.length === 0 && Array.isArray(local.examHistory) ? local.examHistory.length : 0,
    localEssays: essays.length === 0 && Array.isArray(local.essayPractices) ? local.essayPractices.length : 0,
  };

  if (!apply) return { status: 'dry-run', username: oldUser.username, targetUserId, counts };

  const connection = await newPool.getConnection();
  try {
    await connection.beginTransaction();
    const grade = /^g([1-9]|1[0-2])$/.test(String(oldUser.selected_grade || local.selectedGrade || '')) ? (oldUser.selected_grade || local.selectedGrade) : 'g3';
    const semester = local.selectedSemester === '下册' ? 's2' : 's1';
    await connection.execute(
      `INSERT INTO chinese_user_progress
        (user_id, grade, semester, textbook_version, current_lesson_id, total_study_minutes)
       VALUES (?, ?, ?, 'default', NULL, 0)
       ON DUPLICATE KEY UPDATE grade = VALUES(grade)`,
      [targetUserId, grade, semester],
    );

    for (const row of chars) await connection.execute(
      `INSERT INTO chinese_character_progress
       (id,user_id,character_id,is_mastered,practice_count,correct_count,wrong_count,first_learned_at,last_practiced_at,mastered_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE is_mastered=VALUES(is_mastered), practice_count=VALUES(practice_count),
       correct_count=VALUES(correct_count), wrong_count=VALUES(wrong_count), last_practiced_at=VALUES(last_practiced_at), mastered_at=VALUES(mastered_at)`,
      [randomUUID(),targetUserId,row.character_id,row.is_mastered,row.practice_count,row.correct_count,row.wrong_count,row.first_learned_at,row.last_practiced_at,row.mastered_at],
    );
    for (const row of words) await connection.execute(
      `INSERT INTO chinese_word_progress
       (id,user_id,word_id,is_mastered,practice_count,correct_count,wrong_count,first_learned_at,last_practiced_at,mastered_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE is_mastered=VALUES(is_mastered), practice_count=VALUES(practice_count),
       correct_count=VALUES(correct_count), wrong_count=VALUES(wrong_count), last_practiced_at=VALUES(last_practiced_at), mastered_at=VALUES(mastered_at)`,
      [randomUUID(),targetUserId,row.word_id,row.is_mastered,row.practice_count,row.correct_count,row.wrong_count,row.first_learned_at,row.last_practiced_at,row.mastered_at],
    );
    for (const row of sentences) await connection.execute(
      `INSERT INTO chinese_sentence_progress
       (id,user_id,sentence_id,is_completed,practice_count,correct_count,wrong_count,first_learned_at,last_practiced_at,completed_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE is_completed=VALUES(is_completed), practice_count=VALUES(practice_count),
       correct_count=VALUES(correct_count), wrong_count=VALUES(wrong_count), last_practiced_at=VALUES(last_practiced_at), completed_at=VALUES(completed_at)`,
      [randomUUID(),targetUserId,row.sentence_id,row.is_completed,row.practice_count,row.correct_count,row.wrong_count,row.first_learned_at,row.last_practiced_at,row.completed_at],
    );
    for (const row of wrongs) await connection.execute(
      `INSERT INTO chinese_wrong_questions
       (id,user_id,question_id,question_type,question_content,wrong_count,correct_count,is_resolved,first_wrong_at,last_wrong_at,resolved_at,request_key)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE wrong_count=VALUES(wrong_count), correct_count=VALUES(correct_count),
       is_resolved=VALUES(is_resolved), last_wrong_at=VALUES(last_wrong_at), resolved_at=VALUES(resolved_at)`,
      [randomUUID(),targetUserId,row.question_id,row.question_type,row.question_content,row.wrong_count,row.correct_count,row.is_resolved,row.first_wrong_at,row.last_wrong_at,row.resolved_at,`legacy-db-wrong:${row.id}`],
    );
    for (const row of exams) await connection.execute(
      `INSERT INTO chinese_exam_records
       (id,user_id,lesson_id,score,passed,total_questions,correct_questions,duration_seconds,answers_json,request_key,created_at)
       VALUES (?,?,NULL,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE request_key=VALUES(request_key)`,
      [randomUUID(),targetUserId,safeScore(row.score),0,row.total_questions,row.correct_questions,row.duration_seconds,jsonValue(row.answers),`legacy-exam:${row.id}`,row.created_at],
    );
    for (const row of essays) await connection.execute(
      `INSERT INTO chinese_essay_records
       (id,user_id,essay_id,title,prompt,content,word_count,score,feedback_json,request_key,status,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE request_key=VALUES(request_key)`,
      [randomUUID(),targetUserId,null,row.title,row.prompt,row.content,row.word_count,row.score,jsonValue({feedback:row.feedback,aiScore:row.ai_score}),`legacy-essay:${row.id}`,row.status,row.created_at,row.updated_at],
    );


    // Browser-only progress arrays are imported only when the user explicitly
    // supplied an export file. They are merged with DB rows, never used for identity.
    const insertLocalIds = async (values, table, column, stateColumn, doneColumn) => {
      if (!Array.isArray(values)) return;
      for (const value of [...new Set(values.filter((item) => typeof item === 'string' && item.length > 0))]) {
        await connection.execute(
          `INSERT INTO ${table} (id,user_id,${column},${stateColumn},${doneColumn})
           VALUES (?,?,?,?,CURRENT_TIMESTAMP)
           ON DUPLICATE KEY UPDATE ${stateColumn}=1, ${doneColumn}=COALESCE(${doneColumn},CURRENT_TIMESTAMP)`,
          [randomUUID(), targetUserId, value, 1],
        );
      }
    };
    await insertLocalIds(local.masteredCharacterIds, 'chinese_character_progress', 'character_id', 'is_mastered', 'mastered_at');
    await insertLocalIds(local.masteredWordIds, 'chinese_word_progress', 'word_id', 'is_mastered', 'mastered_at');
    await insertLocalIds(local.completedSentenceIds, 'chinese_sentence_progress', 'sentence_id', 'is_completed', 'completed_at');
    if (Array.isArray(local.previewedItemIds)) {
      for (const guideId of [...new Set(local.previewedItemIds.filter((id) => typeof id === 'string' && /^prev-g(?:[1-9]|1[0-2])$/.test(id)))]) {
        await connection.execute(
          `INSERT INTO chinese_preview_records (id,user_id,guide_id)
           VALUES (?,?,?) ON DUPLICATE KEY UPDATE guide_id=VALUES(guide_id)`,
          [randomUUID(), targetUserId, guideId],
        );
      }
    }
    if (Array.isArray(local.wrongQuestionIds)) {
      for (const questionId of [...new Set(local.wrongQuestionIds.filter((id) => typeof id === 'string' && id.length > 0))]) {
        await connection.execute(
          `INSERT INTO chinese_wrong_questions (id,user_id,question_id,question_type,question_content,request_key)
           VALUES (?,?,?,'legacy',NULL,?) ON DUPLICATE KEY UPDATE question_id=VALUES(question_id)`,
          [randomUUID(), targetUserId, questionId, `legacy-local-wrong:${questionId}`.slice(0,64)],
        );
      }
    }


    // If legacy relational tables are empty, recover the browser-only records.
    // Do not merge both sources blindly: the old app could have stored the same
    // activity in both places with unrelated IDs.
    if (exams.length === 0 && Array.isArray(local.examHistory)) {
      for (const [index, record] of local.examHistory.entries()) {
        const key = String(record?.id || index).slice(0, 40);
        await connection.execute(
          `INSERT INTO chinese_exam_records
           (id,user_id,lesson_id,score,passed,total_questions,correct_questions,duration_seconds,answers_json,request_key)
           VALUES (?, ?, NULL, ?, 0, 0, 0, ?, ?, ?)
           ON DUPLICATE KEY UPDATE request_key=VALUES(request_key)`,
          [randomUUID(), targetUserId, safeScore(record?.score), Math.max(0,Math.floor(Number(record?.timeSpentSeconds)||0)), jsonValue(record), `legacy-local-exam:${key}`],
        );
      }
    }
    if (essays.length === 0 && Array.isArray(local.essayPractices)) {
      for (const [index, record] of local.essayPractices.entries()) {
        const key = String(record?.id || index).slice(0, 40);
        const content = String(record?.content || '');
        if (!content.trim()) continue;
        await connection.execute(
          `INSERT INTO chinese_essay_records
           (id,user_id,essay_id,title,prompt,content,word_count,score,feedback_json,request_key,status)
           VALUES (?,?,?,?,?,?,?,?,?,?,'submitted')
           ON DUPLICATE KEY UPDATE request_key=VALUES(request_key)`,
          [randomUUID(),targetUserId,record?.essayId || null,record?.title || null,null,content,Math.max(0,Math.floor(Number(record?.wordCount)||[...content].length)),record?.score ?? null,jsonValue(record?.feedback ?? null),`legacy-local-essay:${key}`],
        );
      }
    }

    // Deliberately excluded: old墨滴/签到/连续天数/徽章/refresh tokens.
    // This migration never invokes awardPoints; historical imports do not grant rewards.
    await connection.commit();
    return { status: 'imported', username: oldUser.username, targetUserId, counts };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

try {
  const users = await select(oldPool, 'SELECT id, username, selected_grade FROM users ORDER BY id');
  const report = [];
  for (const user of users) {
    try { report.push(await importUser(user)); }
    catch (error) { report.push({ status: 'error', username: user.username, message: String(error) }); }
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', users: report }, null, 2));
} finally {
  await Promise.all([oldPool.end(), newPool.end()]);
}
