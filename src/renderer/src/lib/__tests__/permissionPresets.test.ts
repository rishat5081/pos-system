import { permissionPresets, resolvePermissionPreset } from '@/lib/permissionPresets';

describe('permissionPresets', () => {
  it('filters preset features to the current deployment and removes overlaps', () => {
    const operationsManagerPreset = permissionPresets.find((preset) => preset.id === 'operationsManager');

    expect(operationsManagerPreset).toBeDefined();

    if (!operationsManagerPreset) {
      return;
    }

    const resolvedPreset = resolvePermissionPreset(
      ['dashboard', 'orders', 'inventory', 'reports', 'settings'],
      operationsManagerPreset
    );

    expect(resolvedPreset.grantedFeatureKeys).toEqual(['dashboard', 'orders', 'inventory', 'reports', 'settings']);
    expect(resolvedPreset.revokedFeatureKeys).toEqual([]);
  });

  it('resolves cashier preset as a restrictive override bundle', () => {
    const cashierPreset = permissionPresets.find((preset) => preset.id === 'storeCashier');

    expect(cashierPreset).toBeDefined();

    if (!cashierPreset) {
      return;
    }

    const resolvedPreset = resolvePermissionPreset(
      ['dashboard', 'pos', 'orders', 'customers', 'inventory', 'settings'],
      cashierPreset
    );

    expect(resolvedPreset.grantedFeatureKeys).toEqual(['dashboard', 'pos', 'orders', 'customers']);
    expect(resolvedPreset.revokedFeatureKeys).toEqual(['inventory', 'settings']);
  });
});
