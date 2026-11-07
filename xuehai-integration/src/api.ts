import type {
  HostRequest,
  MoyunApi,
  MoyunRouteMap,
  LearningProgressSnapshot,
  DetailedProgressPayload,
} from "./contracts";

/**
 * Routes are supplied by the Xuehai host after its API contract is confirmed.
 * HostRequest owns authentication and response-envelope handling.
 */
export function createMoyunApi(request: HostRequest, routes: MoyunRouteMap): MoyunApi {
  const get = <T>(path: string, signal?: AbortSignal) =>
    request<T>({ method: "GET", path, signal });
  const put = <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>({ method: "PUT", path, body, signal });

  return {
    getLearningProgress: (signal) => get<LearningProgressSnapshot>(routes.learningProgress, signal),
    saveLearningProgress: (snapshot, signal) => put(routes.learningProgress, snapshot, signal),
    getCharacterProgress: (signal) => get<DetailedProgressPayload>(routes.characterProgress, signal),
    saveCharacterProgress: (payload, signal) => put(routes.characterProgress, payload, signal),
    getWordProgress: (signal) => get<DetailedProgressPayload>(routes.wordProgress, signal),
    saveWordProgress: (payload, signal) => put(routes.wordProgress, payload, signal),
    getSentenceProgress: (signal) => get<DetailedProgressPayload>(routes.sentenceProgress, signal),
    saveSentenceProgress: (payload, signal) => put(routes.sentenceProgress, payload, signal),
  };
}
