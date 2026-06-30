import { Request, Response, NextFunction } from 'express';

function toOptionalInt(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  if (Number.isNaN(n) || n < 1) return undefined;
  return Math.floor(n);
}

/** Convertit maxUsers / maxWorkstations envoyés en string par le formulaire */
export function normalizeLicenseNumericFields(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    const maxUsers = toOptionalInt(req.body.maxUsers);
    const maxWorkstations = toOptionalInt(req.body.maxWorkstations);

    if (maxUsers !== undefined) req.body.maxUsers = maxUsers;
    else delete req.body.maxUsers;

    if (maxWorkstations !== undefined) req.body.maxWorkstations = maxWorkstations;
    else delete req.body.maxWorkstations;
  }
  next();
}
