import type { UserProgress } from "./source-progress";
import type { LearningProgressSnapshot } from "./contracts";
export function toLearningProgressSnapshot(p: Partial<UserProgress>): LearningProgressSnapshot {
 const strings=(v:unknown):string[]=>Array.isArray(v)?v.filter((x):x is string=>typeof x==="string"):[];
 const array=(v:unknown):unknown[]=>Array.isArray(v)?v:[];
 const record=(v:unknown):Record<string,unknown>|undefined=>v!==null&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:undefined;
 return {previewedItemIds:strings(p.previewedItemIds),masteredCharacterIds:strings(p.masteredCharacterIds),masteredWordIds:strings(p.masteredWordIds),completedSentenceIds:strings(p.completedSentenceIds),wrongQuestionIds:strings(p.wrongQuestionIds),examHistory:array(p.examHistory),essayPractices:array(p.essayPractices),detailedCharStats:record(p.detailedCharStats),detailedWordStats:record(p.detailedWordStats),detailedSentenceStats:record(p.detailedSentenceStats)};
}
