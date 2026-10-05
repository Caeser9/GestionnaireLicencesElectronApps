import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/statsService';
import { AppError } from '../utils/AppError';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    let stats;
    if (req.user?.role === 'moderator') {
      if (!req.user.productId) throw new AppError('Ce compte modérateur doit être associé à une application', 403);
      stats = await statsService.getProductDashboardStats(req.user.productId);
    } else {
      stats = await statsService.getDashboardStats();
    }
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
