import type { DeploymentFeatureKey, DeploymentIndustry } from '@/stores/storeOpsStore';

export interface DeploymentTemplateRecord {
  label: string;
  businessType: string;
  primaryIndustry: DeploymentIndustry;
  enabledIndustries: DeploymentIndustry[];
  enabledFeatures: DeploymentFeatureKey[];
}

export const deploymentTemplates: DeploymentTemplateRecord[] = [
  {
    label: 'Retail',
    businessType: 'Retail Store',
    primaryIndustry: 'retail',
    enabledIndustries: ['retail'],
    enabledFeatures: ['dashboard', 'businessSuite', 'pos', 'orders', 'inventory', 'customers', 'hr', 'counters', 'reports', 'settings']
  },
  {
    label: 'Restaurant',
    businessType: 'Restaurant',
    primaryIndustry: 'restaurant',
    enabledIndustries: ['restaurant'],
    enabledFeatures: [
      'dashboard',
      'businessSuite',
      'pos',
      'orders',
      'customers',
      'hr',
      'counters',
      'reports',
      'settings',
      'restaurantTables',
      'kitchenDisplay'
    ]
  },
  {
    label: 'Salon',
    businessType: 'Salon And Beauty',
    primaryIndustry: 'salon',
    enabledIndustries: ['salon'],
    enabledFeatures: ['dashboard', 'businessSuite', 'pos', 'orders', 'customers', 'hr', 'reports', 'settings', 'salonServices', 'salonDeposits']
  },
  {
    label: 'Field Service',
    businessType: 'Field Service',
    primaryIndustry: 'fieldService',
    enabledIndustries: ['fieldService'],
    enabledFeatures: ['dashboard', 'businessSuite', 'orders', 'customers', 'hr', 'reports', 'settings', 'fieldDispatch', 'fieldEstimates']
  },
  {
    label: 'Grocery + Dairy',
    businessType: 'Grocery And Dairy',
    primaryIndustry: 'grocery',
    enabledIndustries: ['grocery'],
    enabledFeatures: [
      'dashboard',
      'businessSuite',
      'pos',
      'orders',
      'inventory',
      'customers',
      'hr',
      'reports',
      'settings',
      'routeSubscriptions',
      'routeManifests'
    ]
  },
  {
    label: 'All In One',
    businessType: 'Unified Multi-Industry',
    primaryIndustry: 'retail',
    enabledIndustries: ['retail', 'restaurant', 'salon', 'fieldService', 'grocery'],
    enabledFeatures: [
      'dashboard',
      'businessSuite',
      'pos',
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
    ]
  }
];

export const industryOptions: DeploymentIndustry[] = ['retail', 'restaurant', 'salon', 'fieldService', 'grocery'];

export const featureOptions: Array<{ key: DeploymentFeatureKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'businessSuite', label: 'Business Suite' },
  { key: 'pos', label: 'POS' },
  { key: 'orders', label: 'Orders' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'customers', label: 'Customers' },
  { key: 'hr', label: 'HR' },
  { key: 'counters', label: 'Counters' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
  { key: 'restaurantTables', label: 'Restaurant Tables' },
  { key: 'kitchenDisplay', label: 'Kitchen Display' },
  { key: 'salonServices', label: 'Salon Services' },
  { key: 'salonDeposits', label: 'Salon Deposits' },
  { key: 'fieldDispatch', label: 'Field Dispatch' },
  { key: 'fieldEstimates', label: 'Field Estimates' },
  { key: 'routeSubscriptions', label: 'Route Subscriptions' },
  { key: 'routeManifests', label: 'Route Manifests' }
];
