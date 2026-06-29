import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { getParamId } from '../utils/params';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body.email, req.body.password, req);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await authService.listUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.createUser(req.body, req.user!, req);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.updateUser(getParamId(req.params), req.body, req.user!, req);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
