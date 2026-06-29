import { AppError } from './AppError';

export function getParam(
  params: Record<string, string | string[] | undefined>,
  key = 'id'
): string {
  const value = params[key];
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value[0]) return value[0];
  throw new AppError(`Paramètre ${key} manquant`, 400);
}

export function getParamId(params: Record<string, string | string[] | undefined>): string {
  return getParam(params, 'id');
}
