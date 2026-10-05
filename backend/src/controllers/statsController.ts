import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/statsService';
import { AppError } from '../utils/AppError';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user?.role === 'moderator') throw new AppError('Statistiques globales non accessibles', 403);
    const stats = await statsService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await statsService.getAuditLogs(
      Number(req.query.page) || 1,
      Number(req.query.limit) || 30
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
