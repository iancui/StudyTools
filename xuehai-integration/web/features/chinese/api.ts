/**
 * 语文学科唯一 HTTP API 层。
 * 复用学海现有不透明会话 token；页面和组件不得直接 fetch。
 */
export interface ChineseApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface PointsAward {
  awarded: boolean;
  amount: number;
  balance: number;
  todayEarned: number;
  reason?: string;
}

export interface ChineseProgressDTO {
  user_id?: string;
  grade: string;
  semester: 's1' | 's2';
  textbook_version: string;
  current_lesson_id: string | null;
  total_study_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChineseDetailProgressDTO {
  character_id?: string;
  word_id?: string;
  sentence_id?: string;
  is_mastered?: boolean | number;
  is_completed?: boolean | number;
  practice_count?: number;
  correct_count?: number;
  wrong_count?: number;
  first_learned_at?: string | null;
  last_practiced_at?: string | null;
  mastered_at?: string | null;
  completed_at?: string | null;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ChineseWrongQuestionDTO {
  question_id: string;
  question_type: string;
  question_content: string | null;
  wrong_count: number;
  correct_count: number;
  is_resolved: boolean | number;
  last_wrong_at?: string;
}

export interface ChineseExamRecordDTO {
  id: string;
  lesson_id: string | null;
  grade?: string;
  score: number;
  passed: boolean | number;
  total_questions: number;
  correct_questions: number;
  duration_seconds: number;
  created_at: string;
}

export interface ChineseEssayRecordDTO {
  id: string;
  essay_id: string | null;
  title: string | null;
  content: string;
  word_count: number;
  feedback_json: unknown;
  created_at: string;
}

/** 获取学海现有会话 token。 */
function getToken(): string | null {
  return localStorage.getItem('linguastep_token');
}

/** 发起语文 API 请求并统一处理鉴权、错误文案和积分事件。 */
export async function chineseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body !== undefined) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`/api/chinese${path}`, { ...init, headers });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    console.warn('语文服务暂时无法连接', error);
    throw new Error('暂时无法连接，请检查网络后重试');
  }

  let payload: ChineseApiEnvelope<T> | null = null;
  try {
    payload = await response.json() as ChineseApiEnvelope<T>;
  } catch (error) {
    console.warn('语文服务响应解析失败', error);
  }

  if (response.status === 401) {
    localStorage.removeItem('linguastep_token');
    window.dispatchEvent(new CustomEvent('linguastep:auth-required'));
    throw new Error('请先登录后继续学习');
  }

  if (!response.ok || !payload || payload.code >= 400) {
    console.warn('语文服务请求失败', { status: response.status, message: payload?.message });
    throw new Error('操作未能完成，请稍后重试');
  }

  const data = payload.data as T & { pointsAward?: PointsAward };
  if (data && data.pointsAward?.awarded) {
    window.dispatchEvent(new CustomEvent('linguastep:points-award', { detail: data.pointsAward }));
  }
  return payload.data;
}

/** 获取当前用户语文学习配置和累计学习分钟。 */
export const getChineseProgress = () => chineseRequest<ChineseProgressDTO | null>('/progress');

/** 保存当前用户语文学习配置。 */
export const saveChineseProgress = (body: { grade: string; semester: 's1' | 's2'; textbookVersion: string; currentLessonId?: string | null }) =>
  chineseRequest<ChineseProgressDTO>('/progress', { method: 'PUT', body: JSON.stringify(body) });

/** 获取生字学习状态和练习统计。 */
export const getChineseCharacters = () => chineseRequest<ChineseDetailProgressDTO[]>('/characters');

/** 批量保存已掌握生字 ID。 */
export const saveChineseCharacters = (masteredIds: string[]) =>
  chineseRequest<ChineseDetailProgressDTO[]>('/characters', { method: 'PUT', body: JSON.stringify({ masteredIds }) });

/** 获取词语学习状态和练习统计。 */
export const getChineseWords = () => chineseRequest<ChineseDetailProgressDTO[]>('/words');

/** 批量保存已掌握词语 ID。 */
export const saveChineseWords = (masteredIds: string[]) =>
  chineseRequest<ChineseDetailProgressDTO[]>('/words', { method: 'PUT', body: JSON.stringify({ masteredIds }) });

/** 获取句子学习状态和练习统计。 */
export const getChineseSentences = () => chineseRequest<ChineseDetailProgressDTO[]>('/sentences');

/** 批量保存已完成句子 ID。 */
export const saveChineseSentences = (completedIds: string[]) =>
  chineseRequest<ChineseDetailProgressDTO[]>('/sentences', { method: 'PUT', body: JSON.stringify({ completedIds }) });

/** 提交测验结果；答案由服务端题库重新核验，积分由服务端决定。 */
export const submitChineseExam = (body: Record<string, unknown>) =>
  chineseRequest<ChineseExamRecordDTO & { pointsAward?: PointsAward; gradedAnswers: Record<string, { correct: boolean; correctAnswer: string; explanation: string }> }>('/exams', {
    method: 'POST', body: JSON.stringify({ ...body, requestId: body.requestId || crypto.randomUUID() }),
  });

/** 保存作文练习与自检反馈；当前不宣称提供 AI 评分。 */
export const submitChineseEssay = (body: Record<string, unknown>) =>
  chineseRequest<unknown>('/essays', { method: 'POST', body: JSON.stringify({ ...body, requestId: body.requestId || crypto.randomUUID() }) });

/** 记录一次生字练习；eventId 用于服务端防止重复计数。 */
export const recordChineseCharacterPractice = (itemId: string, result: 'correct' | 'wrong', eventId = crypto.randomUUID()) =>
  chineseRequest<ChineseDetailProgressDTO>('/characters/practice', { method: 'POST', body: JSON.stringify({ itemId, result, eventId }) });

/** 记录一次词语练习；eventId 用于服务端防止重复计数。 */
export const recordChineseWordPractice = (itemId: string, result: 'correct' | 'wrong', eventId = crypto.randomUUID()) =>
  chineseRequest<ChineseDetailProgressDTO>('/words/practice', { method: 'POST', body: JSON.stringify({ itemId, result, eventId }) });

/** 记录一次句子练习；eventId 用于服务端防止重复计数。 */
export const recordChineseSentencePractice = (itemId: string, result: 'correct' | 'wrong', eventId = crypto.randomUUID()) =>
  chineseRequest<ChineseDetailProgressDTO>('/sentences/practice', { method: 'POST', body: JSON.stringify({ itemId, result, eventId }) });

/** 获取当前用户错题记录。 */
export const getChineseWrongQuestions = () => chineseRequest<ChineseWrongQuestionDTO[]>('/wrong-questions');

/** 保存一次错题；重复提交同一道题由服务端唯一键处理。 */
export const saveChineseWrongQuestion = (body: Record<string, unknown>) =>
  chineseRequest<unknown>('/wrong-questions', { method: 'POST', body: JSON.stringify({ ...body, requestId: body.requestId || crypto.randomUUID() }) });

/** 将已复习的错题标记为已解决。 */
export const resolveChineseWrongQuestion = (questionId: string) =>
  chineseRequest<unknown>('/wrong-questions/resolve', { method: 'POST', body: JSON.stringify({ questionId }) });

/** 获取测验历史。 */
export const getChineseExams = () => chineseRequest<ChineseExamRecordDTO[]>('/exams');

/** 获取作文练习历史。 */
export const getChineseEssays = () => chineseRequest<ChineseEssayRecordDTO[]>('/essays');

/** 获取已完成的预习导读记录。 */
export const getChinesePreviews = () => chineseRequest<Array<{ guide_id: string; completed_at: string }>>('/previews');

/** 保存一条预习完成记录，不产生积分。 */
export const completeChinesePreview = (guideId: string) =>
  chineseRequest<unknown>('/previews', { method: 'POST', body: JSON.stringify({ guideId }) });

/** 保存一次学习计时会话；同一 sessionId 重试不会重复累计分钟。 */
export const recordChineseStudySession = (durationMinutes: number, sessionId = crypto.randomUUID()) =>
  chineseRequest<{ durationMinutes: number; totalStudyMinutes: number; duplicateSession: boolean }>('/study-sessions', {
    method: 'POST', body: JSON.stringify({ durationMinutes, sessionId }),
  });
