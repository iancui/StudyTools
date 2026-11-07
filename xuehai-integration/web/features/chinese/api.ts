/**
 * 语文学科唯一 HTTP API 层。
 * 复用学海现有不透明会话 token；页面和组件不得直接 fetch。
 */
export interface ChineseApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

/** 学海积分服务返回结构，语文页面只透传，不计算余额。 */
export interface PointsAward {
  awarded: boolean;
  amount: number;
  balance: number;
  todayEarned: number;
  reason?: string;
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

  const response = await fetch(`/api/chinese${path}`, { ...init, headers });
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
export const getChineseProgress = () => chineseRequest<unknown>('/progress');

/** 保存当前用户语文学习配置。 */
export const saveChineseProgress = (body: unknown) =>
  chineseRequest<unknown>('/progress', { method: 'PUT', body: JSON.stringify(body) });

/** 获取生字学习状态。 */
export const getChineseCharacters = () => chineseRequest<unknown[]>('/characters');

/** 批量保存已掌握生字 ID。 */
export const saveChineseCharacters = (masteredIds: string[]) =>
  chineseRequest<unknown[]>('/characters', { method: 'PUT', body: JSON.stringify({ masteredIds }) });

/** 获取词语学习状态。 */
export const getChineseWords = () => chineseRequest<unknown[]>('/words');

/** 批量保存已掌握词语 ID。 */
export const saveChineseWords = (masteredIds: string[]) =>
  chineseRequest<unknown[]>('/words', { method: 'PUT', body: JSON.stringify({ masteredIds }) });

/** 获取句子学习状态。 */
export const getChineseSentences = () => chineseRequest<unknown[]>('/sentences');

/** 批量保存已完成句子 ID。 */
export const saveChineseSentences = (completedIds: string[]) =>
  chineseRequest<unknown[]>('/sentences', { method: 'PUT', body: JSON.stringify({ completedIds }) });

/** 提交测验结果；达标奖励由服务端通过学海积分服务发放。 */
export const submitChineseExam = (body: Record<string, unknown>) =>
  chineseRequest<unknown>('/exams', { method: 'POST', body: JSON.stringify({ ...body, requestId: body.requestId || crypto.randomUUID() }) });

/** 保存作文练习与批改结果。 */
export const submitChineseEssay = (body: Record<string, unknown>) =>
  chineseRequest<unknown>('/essays', { method: 'POST', body: JSON.stringify({ ...body, requestId: body.requestId || crypto.randomUUID() }) });

/** 记录一次生字练习；eventId 用于服务端防止重复计数。 */
export const recordChineseCharacterPractice = (itemId: string, result: 'correct' | 'wrong', eventId = crypto.randomUUID()) =>
  chineseRequest<unknown>('/characters/practice', { method: 'POST', body: JSON.stringify({ itemId, result, eventId }) });

/** 记录一次词语练习；eventId 用于服务端防止重复计数。 */
export const recordChineseWordPractice = (itemId: string, result: 'correct' | 'wrong', eventId = crypto.randomUUID()) =>
  chineseRequest<unknown>('/words/practice', { method: 'POST', body: JSON.stringify({ itemId, result, eventId }) });

/** 记录一次句子练习；eventId 用于服务端防止重复计数。 */
export const recordChineseSentencePractice = (itemId: string, result: 'correct' | 'wrong', eventId = crypto.randomUUID()) =>
  chineseRequest<unknown>('/sentences/practice', { method: 'POST', body: JSON.stringify({ itemId, result, eventId }) });

/** 获取当前用户错题记录。 */
export const getChineseWrongQuestions = () => chineseRequest<any[]>('/wrong-questions');

/** 保存一次错题；重复提交同一道题由服务端唯一键处理。 */
export const saveChineseWrongQuestion = (body: unknown) =>
  chineseRequest<unknown>('/wrong-questions', { method: 'POST', body: JSON.stringify(body) });

/** 获取测验历史。 */
export const getChineseExams = () => chineseRequest<any[]>('/exams');

/** 获取作文练习历史。 */
export const getChineseEssays = () => chineseRequest<any[]>('/essays');

/** 获取已完成的预习导读记录。 */
export const getChinesePreviews = () => chineseRequest<Array<{guide_id:string;completed_at:string}>>('/previews');

/** 保存一条预习完成记录，不产生积分。 */
export const completeChinesePreview = (guideId: string) =>
  chineseRequest<unknown>('/previews', { method: 'POST', body: JSON.stringify({ guideId }) });

/** 保存一次学习计时会话；同一 sessionId 重试不会重复累计分钟。 */
export const recordChineseStudySession = (durationMinutes: number, sessionId = crypto.randomUUID()) =>
  chineseRequest<{durationMinutes:number;totalStudyMinutes:number;duplicateSession:boolean}>('/study-sessions', {
    method: 'POST', body: JSON.stringify({ durationMinutes, sessionId }),
  });
