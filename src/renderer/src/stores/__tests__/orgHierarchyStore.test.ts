import { useOrgHierarchyStore } from '@/stores/orgHierarchyStore';

describe('orgHierarchyStore', () => {
  beforeEach(() => {
    useOrgHierarchyStore.setState({
      companies: [],
      countries: [],
      cities: [],
      areas: [],
      branches: [],
      branchSnapshots: [],
      inventoryTransfers: [],
      filterState: {
        level: 'company',
        selectedCompanyId: null,
        selectedCountryId: null,
        selectedCityId: null,
        selectedAreaId: null,
        selectedBranchId: null
      }
    });
  });

  describe('Company CRUD', () => {
    it('adds a company', () => {
      const id = useOrgHierarchyStore.getState().addCompany('Acme Corp', 'ACME');
      expect(id).toBeTruthy();
      expect(useOrgHierarchyStore.getState().companies).toHaveLength(1);
      expect(useOrgHierarchyStore.getState().companies[0].name).toBe('Acme Corp');
    });

    it('rejects empty name', () => {
      const id = useOrgHierarchyStore.getState().addCompany('', 'CODE');
      expect(id).toBe('');
      expect(useOrgHierarchyStore.getState().companies).toHaveLength(0);
    });

    it('updates a company', () => {
      const id = useOrgHierarchyStore.getState().addCompany('Old Name', 'OLD');
      useOrgHierarchyStore.getState().updateCompany(id, 'New Name', 'NEW');
      expect(useOrgHierarchyStore.getState().companies[0].name).toBe('New Name');
      expect(useOrgHierarchyStore.getState().companies[0].code).toBe('NEW');
    });

    it('removes a company with cascade delete', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'NYC');
      const areaId = useOrgHierarchyStore.getState().addArea(cityId, 'Manhattan');
      useOrgHierarchyStore.getState().addBranch(areaId, 'Main St', 'MS-001');

      useOrgHierarchyStore.getState().removeCompany(companyId);
      const state = useOrgHierarchyStore.getState();
      expect(state.companies).toHaveLength(0);
      expect(state.countries).toHaveLength(0);
      expect(state.cities).toHaveLength(0);
      expect(state.areas).toHaveLength(0);
      expect(state.branches).toHaveLength(0);
    });
  });

  describe('Country CRUD', () => {
    it('adds a country under a company', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'Pakistan', 'PK');
      expect(countryId).toBeTruthy();
      expect(useOrgHierarchyStore.getState().countries[0].companyId).toBe(companyId);
    });

    it('cascade deletes on country removal', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'NYC');
      const areaId = useOrgHierarchyStore.getState().addArea(cityId, 'Manhattan');
      useOrgHierarchyStore.getState().addBranch(areaId, 'Branch', 'B-001');

      useOrgHierarchyStore.getState().removeCountry(countryId);
      expect(useOrgHierarchyStore.getState().countries).toHaveLength(0);
      expect(useOrgHierarchyStore.getState().cities).toHaveLength(0);
      expect(useOrgHierarchyStore.getState().areas).toHaveLength(0);
      expect(useOrgHierarchyStore.getState().branches).toHaveLength(0);
    });
  });

  describe('City CRUD', () => {
    it('adds and updates a city', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'Old City');
      useOrgHierarchyStore.getState().updateCity(cityId, 'New City');
      expect(useOrgHierarchyStore.getState().cities[0].name).toBe('New City');
    });
  });

  describe('Area CRUD', () => {
    it('adds and removes an area with cascade', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'NYC');
      const areaId = useOrgHierarchyStore.getState().addArea(cityId, 'SoHo');
      useOrgHierarchyStore.getState().addBranch(areaId, 'Branch A', 'BA-001');

      useOrgHierarchyStore.getState().removeArea(areaId);
      expect(useOrgHierarchyStore.getState().areas).toHaveLength(0);
      expect(useOrgHierarchyStore.getState().branches).toHaveLength(0);
    });
  });

  describe('Branch CRUD', () => {
    it('adds a branch and marks it as current', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'NYC');
      const areaId = useOrgHierarchyStore.getState().addArea(cityId, 'Manhattan');
      const branchId = useOrgHierarchyStore.getState().addBranch(areaId, 'Main', 'M-001', true);

      expect(branchId).toBeTruthy();
      expect(useOrgHierarchyStore.getState().getCurrentBranch()?.id).toBe(branchId);
    });

    it('removes a branch and its snapshots', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'NYC');
      const areaId = useOrgHierarchyStore.getState().addArea(cityId, 'Area');
      const branchId = useOrgHierarchyStore.getState().addBranch(areaId, 'Branch', 'B-001');

      useOrgHierarchyStore.getState().importBranchSnapshot({
        branchId,
        snapshotDate: '2026-03-24',
        totalRevenue: 1000,
        totalOrders: 50,
        averageTicket: 20,
        totalProducts: 100,
        lowStockCount: 5,
        staffCount: 10,
        clockedInStaff: 8,
        customerCount: 200,
        totalInventoryValue: 50000,
        updatedAt: new Date().toISOString()
      });

      useOrgHierarchyStore.getState().removeBranch(branchId);
      expect(useOrgHierarchyStore.getState().branches).toHaveLength(0);
      expect(useOrgHierarchyStore.getState().branchSnapshots).toHaveLength(0);
    });
  });

  describe('Drill down / up navigation', () => {
    it('drills down through all levels', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'NYC');
      const areaId = useOrgHierarchyStore.getState().addArea(cityId, 'Manhattan');

      useOrgHierarchyStore.getState().drillDown(companyId);
      expect(useOrgHierarchyStore.getState().filterState.level).toBe('country');
      expect(useOrgHierarchyStore.getState().filterState.selectedCompanyId).toBe(companyId);

      useOrgHierarchyStore.getState().drillDown(countryId);
      expect(useOrgHierarchyStore.getState().filterState.level).toBe('city');
      expect(useOrgHierarchyStore.getState().filterState.selectedCountryId).toBe(countryId);

      useOrgHierarchyStore.getState().drillDown(cityId);
      expect(useOrgHierarchyStore.getState().filterState.level).toBe('area');
      expect(useOrgHierarchyStore.getState().filterState.selectedCityId).toBe(cityId);

      useOrgHierarchyStore.getState().drillDown(areaId);
      expect(useOrgHierarchyStore.getState().filterState.level).toBe('branch');
      expect(useOrgHierarchyStore.getState().filterState.selectedAreaId).toBe(areaId);
    });

    it('drills up correctly', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'NYC');

      useOrgHierarchyStore.getState().drillDown(companyId);
      useOrgHierarchyStore.getState().drillDown(countryId);
      useOrgHierarchyStore.getState().drillDown(cityId);
      expect(useOrgHierarchyStore.getState().filterState.level).toBe('area');

      useOrgHierarchyStore.getState().drillUp();
      expect(useOrgHierarchyStore.getState().filterState.level).toBe('city');

      useOrgHierarchyStore.getState().drillUp();
      expect(useOrgHierarchyStore.getState().filterState.level).toBe('country');

      useOrgHierarchyStore.getState().drillUp();
      expect(useOrgHierarchyStore.getState().filterState.level).toBe('company');
    });

    it('resetFilter goes back to company level', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      useOrgHierarchyStore.getState().drillDown(companyId);
      useOrgHierarchyStore.getState().resetFilter();
      expect(useOrgHierarchyStore.getState().filterState.level).toBe('company');
      expect(useOrgHierarchyStore.getState().filterState.selectedCompanyId).toBeNull();
    });
  });

  describe('getBranchIdsForEntity', () => {
    it('resolves branch IDs at every hierarchy level', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'NYC');
      const areaId = useOrgHierarchyStore.getState().addArea(cityId, 'Manhattan');
      const branchId = useOrgHierarchyStore.getState().addBranch(areaId, 'Main', 'M-001');

      expect(useOrgHierarchyStore.getState().getBranchIdsForEntity('branch', branchId)).toEqual([branchId]);
      expect(useOrgHierarchyStore.getState().getBranchIdsForEntity('area', areaId)).toEqual([branchId]);
      expect(useOrgHierarchyStore.getState().getBranchIdsForEntity('city', cityId)).toEqual([branchId]);
      expect(useOrgHierarchyStore.getState().getBranchIdsForEntity('country', countryId)).toEqual([branchId]);
      expect(useOrgHierarchyStore.getState().getBranchIdsForEntity('company', companyId)).toEqual([branchId]);
    });
  });

  describe('Snapshot import/export', () => {
    it('imports and deduplicates snapshots', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      const countryId = useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');
      const cityId = useOrgHierarchyStore.getState().addCity(countryId, 'NYC');
      const areaId = useOrgHierarchyStore.getState().addArea(cityId, 'Area');
      const branchId = useOrgHierarchyStore.getState().addBranch(areaId, 'Branch', 'B-001');

      const snap = {
        branchId,
        snapshotDate: '2026-03-24',
        totalRevenue: 1000,
        totalOrders: 50,
        averageTicket: 20,
        totalProducts: 100,
        lowStockCount: 5,
        staffCount: 10,
        clockedInStaff: 8,
        customerCount: 200,
        totalInventoryValue: 50000,
        updatedAt: new Date().toISOString()
      };

      useOrgHierarchyStore.getState().importBranchSnapshot(snap);
      expect(useOrgHierarchyStore.getState().branchSnapshots).toHaveLength(1);

      useOrgHierarchyStore.getState().importBranchSnapshot({ ...snap, totalRevenue: 2000 });
      expect(useOrgHierarchyStore.getState().branchSnapshots).toHaveLength(1);
      expect(useOrgHierarchyStore.getState().branchSnapshots[0].totalRevenue).toBe(2000);
    });

    it('exports and hydrates hierarchy snapshot', () => {
      const companyId = useOrgHierarchyStore.getState().addCompany('Corp', 'C');
      useOrgHierarchyStore.getState().addCountry(companyId, 'USA', 'US');

      const snapshot = useOrgHierarchyStore.getState().getHierarchySnapshot();
      expect(snapshot.companies).toHaveLength(1);
      expect(snapshot.countries).toHaveLength(1);

      useOrgHierarchyStore.setState({ companies: [], countries: [] });
      useOrgHierarchyStore.getState().hydrateHierarchySnapshot(snapshot);
      expect(useOrgHierarchyStore.getState().companies).toHaveLength(1);
      expect(useOrgHierarchyStore.getState().countries).toHaveLength(1);
    });
  });

  describe('Inventory Transfers', () => {
    it('creates a transfer with requested status', () => {
      const id = useOrgHierarchyStore.getState().createTransfer({
        fromBranchId: 'b1', fromBranchName: 'Branch A',
        toBranchId: 'b2', toBranchName: 'Branch B',
        productId: 'p1', productName: 'Widget',
        quantityRequested: 10, notes: 'Urgent'
      });
      expect(id).toBeTruthy();
      const transfers = useOrgHierarchyStore.getState().inventoryTransfers;
      expect(transfers).toHaveLength(1);
      expect(transfers[0].status).toBe('requested');
      expect(transfers[0].quantityShipped).toBe(0);
    });

    it('follows the full lifecycle: requested → approved → shipped → received', () => {
      const id = useOrgHierarchyStore.getState().createTransfer({
        fromBranchId: 'b1', fromBranchName: 'Branch A',
        toBranchId: 'b2', toBranchName: 'Branch B',
        productId: 'p1', productName: 'Widget',
        quantityRequested: 5, notes: ''
      });

      useOrgHierarchyStore.getState().approveTransfer(id);
      expect(useOrgHierarchyStore.getState().inventoryTransfers[0].status).toBe('approved');

      useOrgHierarchyStore.getState().shipTransfer(id, 5);
      expect(useOrgHierarchyStore.getState().inventoryTransfers[0].status).toBe('shipped');
      expect(useOrgHierarchyStore.getState().inventoryTransfers[0].quantityShipped).toBe(5);

      useOrgHierarchyStore.getState().receiveTransfer(id);
      expect(useOrgHierarchyStore.getState().inventoryTransfers[0].status).toBe('received');
    });

    it('cancels a transfer', () => {
      const id = useOrgHierarchyStore.getState().createTransfer({
        fromBranchId: 'b1', fromBranchName: 'Branch A',
        toBranchId: 'b2', toBranchName: 'Branch B',
        productId: 'p1', productName: 'Widget',
        quantityRequested: 3, notes: ''
      });

      useOrgHierarchyStore.getState().cancelTransfer(id);
      expect(useOrgHierarchyStore.getState().inventoryTransfers[0].status).toBe('cancelled');
    });

    it('does not approve a non-requested transfer', () => {
      const id = useOrgHierarchyStore.getState().createTransfer({
        fromBranchId: 'b1', fromBranchName: 'Branch A',
        toBranchId: 'b2', toBranchName: 'Branch B',
        productId: 'p1', productName: 'Widget',
        quantityRequested: 3, notes: ''
      });

      useOrgHierarchyStore.getState().cancelTransfer(id);
      useOrgHierarchyStore.getState().approveTransfer(id);
      expect(useOrgHierarchyStore.getState().inventoryTransfers[0].status).toBe('cancelled');
    });

    it('includes transfers in hierarchy snapshot and hydrate', () => {
      useOrgHierarchyStore.getState().createTransfer({
        fromBranchId: 'b1', fromBranchName: 'Branch A',
        toBranchId: 'b2', toBranchName: 'Branch B',
        productId: 'p1', productName: 'Widget',
        quantityRequested: 2, notes: ''
      });

      const snapshot = useOrgHierarchyStore.getState().getHierarchySnapshot();
      expect(snapshot.inventoryTransfers).toHaveLength(1);

      useOrgHierarchyStore.setState({ inventoryTransfers: [] });
      useOrgHierarchyStore.getState().hydrateHierarchySnapshot(snapshot);
      expect(useOrgHierarchyStore.getState().inventoryTransfers).toHaveLength(1);
    });
  });

  describe('Default hierarchy', () => {
    it('creates default hierarchy for single-store setup', () => {
      useOrgHierarchyStore.getState().ensureDefaultHierarchy('My Store', 'MS-001');
      const state = useOrgHierarchyStore.getState();
      expect(state.companies).toHaveLength(1);
      expect(state.countries).toHaveLength(1);
      expect(state.cities).toHaveLength(1);
      expect(state.areas).toHaveLength(1);
      expect(state.branches).toHaveLength(1);
      expect(state.branches[0].isCurrentBranch).toBe(true);
      expect(state.branches[0].storeCode).toBe('MS-001');
    });

    it('does not overwrite existing hierarchy', () => {
      useOrgHierarchyStore.getState().addCompany('Existing', 'EX');
      useOrgHierarchyStore.getState().ensureDefaultHierarchy('My Store', 'MS-001');
      expect(useOrgHierarchyStore.getState().companies).toHaveLength(1);
      expect(useOrgHierarchyStore.getState().companies[0].name).toBe('Existing');
    });
  });
});
