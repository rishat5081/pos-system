import type { DeploymentFeatureKey, UserAccountRole } from '@/stores/storeOpsStore';

export interface PermissionPresetRecord {
  id: string;
  label: string;
  description: string;
  recommendedRoles: UserAccountRole[];
  allowedFeatures: DeploymentFeatureKey[];
  revokedFeatures: DeploymentFeatureKey[];
}

export interface PermissionPresetResult {
  grantedFeatureKeys: DeploymentFeatureKey[];
  revokedFeatureKeys: DeploymentFeatureKey[];
}

export const permissionPresets: PermissionPresetRecord[] = [
  {
    id: 'storeCashier',
    label: 'Store Cashier',
    description: 'Checkout-focused access with customer and order handling only.',
    recommendedRoles: ['cashier'],
    allowedFeatures: ['dashboard', 'pos', 'orders', 'customers'],
    revokedFeatures: [
      'businessSuite',
      'inventory',
      'hr',
      'counters',
      'reports',
      'settings',
      'restaurantTables',
      'kitchenDisplay',
      'salonServices',
      'salonDeposits',
      'fieldDispatch',
      'fieldEstimates',
      'routeSubscriptions',
      'routeManifests'
    ]
  },
  {
    id: 'customerDesk',
    label: 'Customer Desk',
    description: 'Front-desk access for customer profiles, orders, invoices, and checkout support.',
    recommendedRoles: ['cashier', 'manager'],
    allowedFeatures: ['dashboard', 'pos', 'orders', 'customers'],
    revokedFeatures: ['inventory', 'hr', 'counters', 'reports', 'businessSuite']
  },
  {
    id: 'inventoryLead',
    label: 'Inventory Lead',
    description: 'Stock control, counters, and reporting for replenishment and floor operations.',
    recommendedRoles: ['manager'],
    allowedFeatures: ['dashboard', 'orders', 'inventory', 'counters', 'reports'],
    revokedFeatures: ['hr']
  },
  {
    id: 'hrCoordinator',
    label: 'HR Coordinator',
    description: 'People operations, payroll, attendance, and reporting without store admin ownership.',
    recommendedRoles: ['manager'],
    allowedFeatures: ['dashboard', 'hr', 'reports', 'settings'],
    revokedFeatures: ['inventory', 'counters', 'businessSuite']
  },
  {
    id: 'restaurantLead',
    label: 'Restaurant Lead',
    description: 'Restaurant service flow with tables, kitchen, counters, and service reporting.',
    recommendedRoles: ['manager'],
    allowedFeatures: ['dashboard', 'orders', 'customers', 'counters', 'reports', 'restaurantTables', 'kitchenDisplay'],
    revokedFeatures: ['inventory', 'hr']
  },
  {
    id: 'operationsManager',
    label: 'Operations Manager',
    description: 'Broad operational control across retail, HR, reporting, settings, and vertical workflows.',
    recommendedRoles: ['manager', 'super_admin'],
    allowedFeatures: [
      'dashboard',
      'businessSuite',
      'orders',
      'inventory',
      'customers',
      'hr',
      'counters',
      'reports',
      'settings',
      'restaurantTables',
      'kitchenDisplay',
      'salonServices',
      'salonDeposits',
      'fieldDispatch',
      'fieldEstimates',
      'routeSubscriptions',
      'routeManifests'
    ],
    revokedFeatures: []
  }
];

export function resolvePermissionPreset(
  enabledFeatures: DeploymentFeatureKey[],
  preset: PermissionPresetRecord
): PermissionPresetResult {
  const enabledFeatureSet = new Set(enabledFeatures);
  const grantedFeatureKeys = Array.from(new Set(preset.allowedFeatures.filter((featureKey) => enabledFeatureSet.has(featureKey))));
  const revokedFeatureKeys = Array.from(
    new Set(
      preset.revokedFeatures.filter(
        (featureKey) => enabledFeatureSet.has(featureKey) && !grantedFeatureKeys.includes(featureKey)
      )
    )
  );

  return {
    grantedFeatureKeys,
    revokedFeatureKeys
  };
}
