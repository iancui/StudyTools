/**
 * Host contracts only. Authentication, session cookies/tokens, user identity,
 * authorization and response-envelope decoding remain owned by Xuehai.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HostRequestOptions {
  method: HttpMethod;
  path: string;
  query?: Readonly<Record<string, string | number | boolean | undefined>>;
  body?: unknown;
  signal?: AbortSignal;
}

/** Inject the host's already-authenticated request client. */
export type HostRequest = <T>(options: HostRequestOptions) => Promise<T>;

export interface MoyunRouteMap {
  learningProgress: string;
  characterProgress: string;
  wordProgress: string;
  sentenceProgress: string;
}

export interface LearningProgressSnapshot {
  previewedItemIds: string[];
  masteredCharacterIds: string[];
  masteredWordIds: string[];
  completedSentenceIds: string[];
  wrongQuestionIds: string[];
  examHistory: unknown[];
  essayPractices: unknown[];
  detailedCharStats?: Record<string, unknown>;
  detailedWordStats?: Record<string, unknown>;
  detailedSentenceStats?: Record<string, unknown>;
}

export interface DetailedProgressPayload {
  items: unknown[];
}

export interface MoyunApi {
  getLearningProgress(signal?: AbortSignal): Promise<LearningProgressSnapshot>;
  saveLearningProgress(snapshot: LearningProgressSnapshot, signal?: AbortSignal): Promise<unknown>;
  getCharacterProgress(signal?: AbortSignal): Promise<DetailedProgressPayload>;
  saveCharacterProgress(payload: DetailedProgressPayload, signal?: AbortSignal): Promise<unknown>;
  getWordProgress(signal?: AbortSignal): Promise<DetailedProgressPayload>;
  saveWordProgress(payload: DetailedProgressPayload, signal?: AbortSignal): Promise<unknown>;
  getSentenceProgress(signal?: AbortSignal): Promise<DetailedProgressPayload>;
  saveSentenceProgress(payload: DetailedProgressPayload, signal?: AbortSignal): Promise<unknown>;
}
