import type {HostRequest,MoyunApi,MoyunRouteMap,LearningProgressSnapshot} from "./contracts.ts";
export function createMoyunApi(request:HostRequest,routes:MoyunRouteMap):MoyunApi {
 const get=<T>(path:string,signal?:AbortSignal)=>request<T>({method:"GET",path,signal});
 const put=<T>(path:string,body:unknown,signal?:AbortSignal)=>request<T>({method:"PUT",path,body,signal});
 return {
  getLearningProgress:s=>get<LearningProgressSnapshot>(routes.learningProgress,s),
  saveLearningProgress:(snapshot,s)=>put(routes.learningProgress,snapshot,s),
  getCharacterProgress:s=>get<unknown[]>(routes.characterProgress,s),
  saveCharacterProgress:(ids,s)=>put(routes.characterProgress,{masteredIds:ids},s),
  getWordProgress:s=>get<unknown[]>(routes.wordProgress,s),
  saveWordProgress:(ids,s)=>put(routes.wordProgress,{masteredIds:ids},s),
  getSentenceProgress:s=>get<unknown[]>(routes.sentenceProgress,s),
  saveSentenceProgress:(ids,s)=>put(routes.sentenceProgress,{completedIds:ids},s),
 };
}
