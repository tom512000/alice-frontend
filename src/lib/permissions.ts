import type { UserRole } from '@/types/auth';

export function hasRole(userRoles: string[], role: UserRole): boolean {
  return userRoles.includes(role);
}

export function isAdmin(roles: string[]): boolean {
  return hasRole(roles, 'ROLE_ADMIN');
}

export function isDoctor(roles: string[]): boolean {
  return hasRole(roles, 'ROLE_DOCTOR');
}

export function isNurse(roles: string[]): boolean {
  return hasRole(roles, 'ROLE_NURSE');
}

export function canWrite(roles: string[]): boolean {
  return isAdmin(roles) || isDoctor(roles);
}

export function canWriteNursing(roles: string[]): boolean {
  return isAdmin(roles) || isDoctor(roles) || isNurse(roles);
}

export function canDelete(roles: string[]): boolean {
  return isAdmin(roles);
}

export function canManageUsers(roles: string[]): boolean {
  return isAdmin(roles);
}
