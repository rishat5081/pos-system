import type { SessionUser } from '@/stores/authStore';
import type { DeploymentFeatureKey } from '@/stores/storeOpsStore';

export type AppUserRole = SessionUser['role'];
export type PrivilegedAreaKey = 'superAdminConsole' | 'userManagement';

export interface PermissionMatrixItem {
  key: DeploymentFeatureKey | PrivilegedAreaKey;
  label: string;
  allowedRoles: AppUserRole[];
  featureKey?: DeploymentFeatureKey;
  path?: string;
}

const allRoles: AppUserRole[] = ['super_admin', 'manager', 'cashier'];
const managementRoles: AppUserRole[] = ['super_admin', 'manager'];
const ownerRole: AppUserRole[] = ['super_admin'];

export const roleLabels: Record<AppUserRole, string> = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  cashier: 'Cashier'
};

export const featureRoleMatrix: Record<DeploymentFeatureKey, AppUserRole[]> = {
  dashboard: allRoles,
  businessSuite: managementRoles,
  pos: allRoles,
  orders: allRoles,
  inventory: managementRoles,
  customers: allRoles,
  hr: managementRoles,
  counters: managementRoles,
  reports: managementRoles,
  settings: managementRoles,
  restaurantTables: managementRoles,
  kitchenDisplay: managementRoles,
  salonServices: managementRoles,
  salonDeposits: managementRoles,
  fieldDispatch: managementRoles,
  fieldEstimates: managementRoles,
  routeSubscriptions: managementRoles,
  routeManifests: managementRoles
};

export const privilegedAreaMatrix: Record<PrivilegedAreaKey, PermissionMatrixItem> = {
  superAdminConsole: {
    key: 'superAdminConsole',
    label: 'Super Admin Console',
    allowedRoles: ownerRole,
    path: '/app/superAdmin'
  },
  userManagement: {
    key: 'userManagement',
    label: 'User Management',
    allowedRoles: ownerRole,
    path: '/app/userManagement'
  }
};

export const permissionMatrixItems: PermissionMatrixItem[] = [
  { key: 'dashboard', label: 'Dashboard', allowedRoles: featureRoleMatrix.dashboard, featureKey: 'dashboard', path: '/app' },
  {
    key: 'businessSuite',
    label: 'Business Suite',
    allowedRoles: featureRoleMatrix.businessSuite,
    featureKey: 'businessSuite',
    path: '/app/businessSuite'
  },
  { key: 'pos', label: 'POS', allowedRoles: featureRoleMatrix.pos, featureKey: 'pos', path: '/app/pos' },
  { key: 'orders', label: 'Orders', allowedRoles: featureRoleMatrix.orders, featureKey: 'orders', path: '/app/orders' },
  { key: 'counters', label: 'Counters', allowedRoles: featureRoleMatrix.counters, featureKey: 'counters', path: '/app/counters' },
  {
    key: 'inventory',
    label: 'Inventory',
    allowedRoles: featureRoleMatrix.inventory,
    featureKey: 'inventory',
    path: '/app/inventory'
  },
  {
    key: 'customers',
    label: 'Customers',
    allowedRoles: featureRoleMatrix.customers,
    featureKey: 'customers',
    path: '/app/customers'
  },
  { key: 'hr', label: 'HR', allowedRoles: featureRoleMatrix.hr, featureKey: 'hr', path: '/app/hr' },
  privilegedAreaMatrix.superAdminConsole,
  privilegedAreaMatrix.userManagement,
  { key: 'reports', label: 'Reports', allowedRoles: featureRoleMatrix.reports, featureKey: 'reports', path: '/app/reports' },
  { key: 'settings', label: 'Settings', allowedRoles: featureRoleMatrix.settings, featureKey: 'settings', path: '/app/settings' },
  { key: 'restaurantTables', label: 'Restaurant Tables', allowedRoles: featureRoleMatrix.restaurantTables, featureKey: 'restaurantTables' },
  { key: 'kitchenDisplay', label: 'Kitchen Display', allowedRoles: featureRoleMatrix.kitchenDisplay, featureKey: 'kitchenDisplay' },
  { key: 'salonServices', label: 'Salon Services', allowedRoles: featureRoleMatrix.salonServices, featureKey: 'salonServices' },
  { key: 'salonDeposits', label: 'Salon Deposits', allowedRoles: featureRoleMatrix.salonDeposits, featureKey: 'salonDeposits' },
  { key: 'fieldDispatch', label: 'Field Dispatch', allowedRoles: featureRoleMatrix.fieldDispatch, featureKey: 'fieldDispatch' },
  { key: 'fieldEstimates', label: 'Field Estimates', allowedRoles: featureRoleMatrix.fieldEstimates, featureKey: 'fieldEstimates' },
  {
    key: 'routeSubscriptions',
    label: 'Route Subscriptions',
    allowedRoles: featureRoleMatrix.routeSubscriptions,
    featureKey: 'routeSubscriptions'
  },
  { key: 'routeManifests', label: 'Route Manifests', allowedRoles: featureRoleMatrix.routeManifests, featureKey: 'routeManifests' }
];

const routeFeatureMap: Record<string, DeploymentFeatureKey> = {
  '/app': 'dashboard',
  '/app/businessSuite': 'businessSuite',
  '/app/pos': 'pos',
  '/app/orders': 'orders',
  '/app/counters': 'counters',
  '/app/inventory': 'inventory',
  '/app/customers': 'customers',
  '/app/hr': 'hr',
  '/app/staff': 'hr',
  '/app/reports': 'reports',
  '/app/settings': 'settings'
};

const routePrivilegeMap: Record<string, PrivilegedAreaKey> = {
  '/app/superAdmin': 'superAdminConsole',
  '/app/userManagement': 'userManagement'
};

const appRouteOrder = permissionMatrixItems.flatMap((item) => (item.path ? [item.path] : []));

export function getRoleLabel(role: AppUserRole): string {
  return roleLabels[role];
}

export function getAllowedRolesForFeature(featureKey: DeploymentFeatureKey): AppUserRole[] {
  return featureRoleMatrix[featureKey];
}

export function canAccessFeature(
  user: Pick<SessionUser, 'role' | 'grantedFeatureKeys' | 'revokedFeatureKeys'>,
  enabledFeatures: DeploymentFeatureKey[],
  featureKey: DeploymentFeatureKey
): boolean {
  if (!enabledFeatures.includes(featureKey)) {
    return false;
  }

  if (user.revokedFeatureKeys?.includes(featureKey)) {
    return false;
  }

  if (user.grantedFeatureKeys?.includes(featureKey)) {
    return true;
  }

  return featureRoleMatrix[featureKey].includes(user.role);
}

export function canAccessPrivilegedArea(
  user: Pick<SessionUser, 'role'>,
  areaKey: PrivilegedAreaKey
): boolean {
  return privilegedAreaMatrix[areaKey].allowedRoles.includes(user.role);
}

export function canAccessRoute(
  pathname: string,
  user: Pick<SessionUser, 'role' | 'grantedFeatureKeys' | 'revokedFeatureKeys'>,
  enabledFeatures: DeploymentFeatureKey[]
): boolean {
  const featureKey = routeFeatureMap[pathname];

  if (featureKey) {
    return canAccessFeature(user, enabledFeatures, featureKey);
  }

  const privilegedAreaKey = routePrivilegeMap[pathname];

  if (privilegedAreaKey) {
    return canAccessPrivilegedArea(user, privilegedAreaKey);
  }

  return true;
}

export function getFirstAccessibleRoute(
  user: Pick<SessionUser, 'role' | 'grantedFeatureKeys' | 'revokedFeatureKeys'>,
  enabledFeatures: DeploymentFeatureKey[]
): string {
  return appRouteOrder.find((path) => canAccessRoute(path, user, enabledFeatures)) ?? '/app';
}
