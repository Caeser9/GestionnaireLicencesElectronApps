import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/statsService';

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
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
