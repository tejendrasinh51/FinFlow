export type Role = 'admin' | 'analyst' | 'viewer';

export type Permission =
  | 'metrics:read'
  | 'metrics:write'
  | 'reports:read'
  | 'reports:write'
  | 'reports:delete'
  | 'users:read'
  | 'users:invite'
  | 'users:modify'
  | 'users:deactivate'
  | 'export:pdf'
  | 'export:raw'
  | 'settings:read'
  | 'settings:write';

const PERMISSIONS_MATRIX: Record<Role, Set<Permission>> = {
  admin: new Set([
    'metrics:read',
    'metrics:write',
    'reports:read',
    'reports:write',
    'reports:delete',
    'users:read',
    'users:invite',
    'users:modify',
    'users:deactivate',
    'export:pdf',
    'export:raw',
    'settings:read',
    'settings:write',
  ]),
  analyst: new Set([
    'metrics:read',
    'reports:read',
    'reports:write',
    'export:pdf',
    'export:raw',
  ]),
  viewer: new Set([
    'metrics:read',
    'reports:read',
    'export:pdf',
  ]),
};

/**
 * Checks whether a role has authorization for a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = PERMISSIONS_MATRIX[role];
  if (!permissions) return false;
  return permissions.has(permission);
}

/**
 * Checks whether a role has permission to access a specific navigation path
 */
export function canAccessPath(role: Role, path: string): boolean {
  if (path.startsWith('/dashboard/users')) {
    return hasPermission(role, 'users:read');
  }
  if (path.startsWith('/dashboard/settings')) {
    return hasPermission(role, 'settings:read');
  }
  if (path.startsWith('/dashboard/finance')) {
    return hasPermission(role, 'metrics:read');
  }
  return true; // General overview and standard dashboard is accessible to all authenticated users
}
