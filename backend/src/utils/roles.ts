import { UserRole } from '../types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 3,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPPORT]: 1,
  [UserRole.MODERATOR]: 1,
};

export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.SUPPORT]: 'Support Technique',
  [UserRole.MODERATOR]: 'Modérateur client',
};
