import { Request, Response, NextFunction } from 'express';
import { signApiResponse } from '../utils/crypto';

export function signResponse(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: Record<string, unknown>) {
    if (req.path.startsWith('/api/v1/client') && body.success && body.data) {
      const signature = signApiResponse(body.data as Record<string, unknown>);
      return originalJson({ ...body, signature });
    }
    return originalJson(body);
  };

  next();
}
