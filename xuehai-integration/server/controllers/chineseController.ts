import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { ChineseService } from '../services/chineseService.ts';

type Action = (userId: string, body: Record<string, unknown>) => Promise<unknown>;
async function run(req: AuthenticatedRequest, res: Response, next: NextFunction, action: Action) {
  try {
    const data = await action(req.user!.id, (req.body || {}) as Record<string, unknown>);
    res.json({ code: 200, message: 'success', data });
  } catch (error) { next(error); }
}
export class ChineseProgressController {
  static get(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id)=>ChineseService.getProgress(id)); }
  static update(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,body)=>ChineseService.saveProgress(id,body)); }
}
export class ChineseCharacterController {
  static list(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id)=>ChineseService.listDetail(id,'characters')); }
  static update(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,b)=>ChineseService.replaceDetail(id,'characters',Array.isArray(b.masteredIds)?b.masteredIds.map(String):[])); }
  static practice(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,b)=>ChineseService.recordPractice(id,'characters',b)); }
}
export class ChineseWordController {
  static list(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id)=>ChineseService.listDetail(id,'words')); }
  static update(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,b)=>ChineseService.replaceDetail(id,'words',Array.isArray(b.masteredIds)?b.masteredIds.map(String):[])); }
  static practice(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,b)=>ChineseService.recordPractice(id,'words',b)); }
}
export class ChineseSentenceController {
  static list(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id)=>ChineseService.listDetail(id,'sentences')); }
  static update(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,b)=>ChineseService.replaceDetail(id,'sentences',Array.isArray(b.completedIds)?b.completedIds.map(String):[])); }
  static practice(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,b)=>ChineseService.recordPractice(id,'sentences',b)); }
}
export class ChineseWrongQuestionController {
  static list(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id)=>ChineseService.listWrong(id)); }
  static create(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,b)=>ChineseService.saveWrong(id,b)); }
}
export class ChineseExamController {
  static list(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id)=>ChineseService.listExams(id)); }
  static create(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,b)=>ChineseService.createExam(id,b)); }
}
export class ChineseEssayController {
  static list(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id)=>ChineseService.listEssays(id)); }
  static create(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,b)=>ChineseService.createEssay(id,b)); }
}

export class ChinesePreviewController {
  static list(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id)=>ChineseService.listPreviews(id)); }
  static complete(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,body)=>ChineseService.completePreview(id,body)); }
}

export class ChineseStudySessionController {
  static create(req: AuthenticatedRequest,res: Response,next: NextFunction) { return run(req,res,next,(id,body)=>ChineseService.recordStudySession(id,body)); }
}
