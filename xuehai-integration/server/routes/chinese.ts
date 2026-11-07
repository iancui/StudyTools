import type { Router } from 'express';
import {
  ChineseProgressController, ChineseCharacterController, ChineseWordController,
  ChineseSentenceController, ChineseWrongQuestionController, ChineseExamController,
  ChineseEssayController, ChinesePreviewController,
} from '../controllers/chineseController.ts';

/** 注册语文学科路由；鉴权由 routes/index.ts 的全局 authMiddleware 统一处理。 */
export function registerChineseRoutes(router: Router): void {
  router.get('/chinese/progress', ChineseProgressController.get);
  router.put('/chinese/progress', ChineseProgressController.update);
  router.get('/chinese/characters', ChineseCharacterController.list);
  router.put('/chinese/characters', ChineseCharacterController.update);
  router.post('/chinese/characters/practice', ChineseCharacterController.practice);
  router.get('/chinese/words', ChineseWordController.list);
  router.put('/chinese/words', ChineseWordController.update);
  router.post('/chinese/words/practice', ChineseWordController.practice);
  router.get('/chinese/sentences', ChineseSentenceController.list);
  router.put('/chinese/sentences', ChineseSentenceController.update);
  router.post('/chinese/sentences/practice', ChineseSentenceController.practice);
  router.get('/chinese/previews', ChinesePreviewController.list);
  router.post('/chinese/previews', ChinesePreviewController.complete);
  router.get('/chinese/wrong-questions', ChineseWrongQuestionController.list);
  router.post('/chinese/wrong-questions', ChineseWrongQuestionController.create);
  router.get('/chinese/exams', ChineseExamController.list);
  router.post('/chinese/exams', ChineseExamController.create);
  router.get('/chinese/essays', ChineseEssayController.list);
  router.post('/chinese/essays', ChineseEssayController.create);
}
