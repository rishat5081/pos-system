import { create } from 'zustand';
import type {
  AreaRecord,
  BranchRecord,
  BranchSnapshotRecord,
  CityRecord,
  CompanyRecord,
  CountryRecord,
  HierarchyFilterState,
  HierarchyLevel,
  InventoryTransferRecord,
  OrgHierarchyData,
  TransferStatus
} from './orgHierarchyTypes';

interface OrgHierarchyState {
  companies: CompanyRecord[];
  countries: CountryRecord[];
  cities: CityRecord[];
  areas: AreaRecord[];
  branches: BranchRecord[];
  branchSnapshots: BranchSnapshotRecord[];
  inventoryTransfers: InventoryTransferRecord[];
  filterState: HierarchyFilterState;

  // Inventory Transfer actions
  createTransfer: (input: { fromBranchId: string; fromBranchName: string; toBranchId: string; toBranchName: string; productId: string; productName: string; quantityRequested: number; notes: string }) => string;
  approveTransfer: (id: string) => void;
  shipTransfer: (id: string, quantityShipped: number) => void;
  receiveTransfer: (id: string) => void;
  cancelTransfer: (id: string) => void;

  // Company CRUD
  addCompany: (name: string, code: string) => string;
  updateCompany: (id: string, name: string, code: string) => void;
  removeCompany: (id: string) => void;

  // Country CRUD
  addCountry: (companyId: string, name: string, code: string) => string;
  updateCountry: (id: string, name: string, code: string) => void;
  removeCountry: (id: string) => void;

  // City CRUD
  addCity: (countryId: string, name: string) => string;
  updateCity: (id: string, name: string) => void;
  removeCity: (id: string) => void;

  // Area CRUD
  addArea: (cityId: string, name: string) => string;
  updateArea: (id: string, name: string) => void;
  removeArea: (id: string) => void;

  // Branch CRUD
  addBranch: (areaId: string, name: string, storeCode: string, isCurrentBranch?: boolean) => string;
  updateBranch: (id: string, name: string, storeCode: string) => void;
  removeBranch: (id: string) => void;

  // Filter actions
  setFilterLevel: (level: HierarchyLevel) => void;
  setFilterCompany: (companyId: string | null) => void;
  setFilterCountry: (countryId: string | null) => void;
  setFilterCity: (cityId: string | null) => void;
  setFilterArea: (areaId: string | null) => void;
  setFilterBranch: (branchId: string | null) => void;
  drillDown: (entityId: string) => void;
  drillUp: () => void;
  resetFilter: () => void;

  // Snapshot actions
  importBranchSnapshot: (snapshot: BranchSnapshotRecord) => void;
  importBranchSnapshots: (snapshots: BranchSnapshotRecord[]) => void;
  removeBranchSnapshots: (branchId: string) => void;

  // Query helpers
  getCountriesForCompany: (companyId: string) => CountryRecord[];
  getCitiesForCountry: (countryId: string) => CityRecord[];
  getAreasForCity: (cityId: string) => AreaRecord[];
  getBranchesForArea: (areaId: string) => BranchRecord[];
  getCurrentBranch: () => BranchRecord | undefined;
  getBranchIdsForEntity: (level: HierarchyLevel, entityId: string) => string[];

  // Persistence
  getHierarchySnapshot: () => OrgHierarchyData;
  hydrateHierarchySnapshot: (data: OrgHierarchyData) => void;

  // Default hierarchy
  ensureDefaultHierarchy: (storeName: string, storeCode: string) => void;
}

const initialFilterState: HierarchyFilterState = {
  level: 'company',
  selectedCompanyId: null,
  selectedCountryId: null,
  selectedCityId: null,
  selectedAreaId: null,
  selectedBranchId: null
};

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useOrgHierarchyStore = create<OrgHierarchyState>((set, get) => ({
  companies: [],
  countries: [],
  cities: [],
  areas: [],
  branches: [],
  branchSnapshots: [],
  inventoryTransfers: [],
  filterState: { ...initialFilterState },

  // ── Inventory Transfer Actions ──────────────────────────────────

  createTransfer(input) {
    const id = makeId('transfer');
    const now = new Date().toISOString();
    const record: InventoryTransferRecord = {
      id,
      fromBranchId: input.fromBranchId,
      fromBranchName: input.fromBranchName,
      toBranchId: input.toBranchId,
      toBranchName: input.toBranchName,
      productId: input.productId,
      productName: input.productName,
      quantityRequested: input.quantityRequested,
      quantityShipped: 0,
      status: 'requested',
      requestedAt: now,
      updatedAt: now,
      notes: input.notes
    };
    set((state) => ({ inventoryTransfers: [...state.inventoryTransfers, record] }));
    return id;
  },

  approveTransfer(id: string) {
    set((state) => ({
      inventoryTransfers: state.inventoryTransfers.map((t) =>
        t.id === id && t.status === 'requested' ? { ...t, status: 'approved' as TransferStatus, updatedAt: new Date().toISOString() } : t
      )
    }));
  },

  shipTransfer(id: string, quantityShipped: number) {
    set((state) => ({
      inventoryTransfers: state.inventoryTransfers.map((t) =>
        t.id === id && t.status === 'approved' ? { ...t, status: 'shipped' as TransferStatus, quantityShipped, updatedAt: new Date().toISOString() } : t
      )
    }));
  },

  receiveTransfer(id: string) {
    set((state) => ({
      inventoryTransfers: state.inventoryTransfers.map((t) =>
        t.id === id && t.status === 'shipped' ? { ...t, status: 'received' as TransferStatus, updatedAt: new Date().toISOString() } : t
      )
    }));
  },

  cancelTransfer(id: string) {
    set((state) => ({
      inventoryTransfers: state.inventoryTransfers.map((t) =>
        t.id === id && t.status !== 'received' ? { ...t, status: 'cancelled' as TransferStatus, updatedAt: new Date().toISOString() } : t
      )
    }));
  },

  // ── Company CRUD ──────────────────────────────────────────────

  addCompany(name: string, code: string): string {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName || !trimmedCode) {
      return '';
    }

    const id = makeId('company');
    const record: CompanyRecord = { id, name: trimmedName, code: trimmedCode, createdAt: new Date().toISOString() };
    set((state) => ({ companies: [...state.companies, record] }));
    return id;
  },

  updateCompany(id: string, name: string, code: string): void {
    set((state) => ({
      companies: state.companies.map((c) => (c.id === id ? { ...c, name: name.trim(), code: code.trim() } : c))
    }));
  },

  removeCompany(id: string): void {
    const state = get();
    const countryIds = state.countries.filter((c) => c.companyId === id).map((c) => c.id);
    const cityIds = state.cities.filter((c) => countryIds.includes(c.countryId)).map((c) => c.id);
    const areaIds = state.areas.filter((a) => cityIds.includes(a.cityId)).map((a) => a.id);
    const branchIds = state.branches.filter((b) => areaIds.includes(b.areaId)).map((b) => b.id);

    set((s) => ({
      companies: s.companies.filter((c) => c.id !== id),
      countries: s.countries.filter((c) => !countryIds.includes(c.id)),
      cities: s.cities.filter((c) => !cityIds.includes(c.id)),
      areas: s.areas.filter((a) => !areaIds.includes(a.id)),
      branches: s.branches.filter((b) => !branchIds.includes(b.id)),
      branchSnapshots: s.branchSnapshots.filter((bs) => !branchIds.includes(bs.branchId))
    }));
  },

  // ── Country CRUD ──────────────────────────────────────────────

  addCountry(companyId: string, name: string, code: string): string {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName || !trimmedCode) {
      return '';
    }

    const id = makeId('country');
    const record: CountryRecord = { id, companyId, name: trimmedName, code: trimmedCode, createdAt: new Date().toISOString() };
    set((state) => ({ countries: [...state.countries, record] }));
    return id;
  },

  updateCountry(id: string, name: string, code: string): void {
    set((state) => ({
      countries: state.countries.map((c) => (c.id === id ? { ...c, name: name.trim(), code: code.trim() } : c))
    }));
  },

  removeCountry(id: string): void {
    const state = get();
    const cityIds = state.cities.filter((c) => c.countryId === id).map((c) => c.id);
    const areaIds = state.areas.filter((a) => cityIds.includes(a.cityId)).map((a) => a.id);
    const branchIds = state.branches.filter((b) => areaIds.includes(b.areaId)).map((b) => b.id);

    set((s) => ({
      countries: s.countries.filter((c) => c.id !== id),
      cities: s.cities.filter((c) => !cityIds.includes(c.id)),
      areas: s.areas.filter((a) => !areaIds.includes(a.id)),
      branches: s.branches.filter((b) => !branchIds.includes(b.id)),
      branchSnapshots: s.branchSnapshots.filter((bs) => !branchIds.includes(bs.branchId))
    }));
  },

  // ── City CRUD ──────────────────────────────────────────────

  addCity(countryId: string, name: string): string {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return '';
    }

    const id = makeId('city');
    const record: CityRecord = { id, countryId, name: trimmedName, createdAt: new Date().toISOString() };
    set((state) => ({ cities: [...state.cities, record] }));
    return id;
  },

  updateCity(id: string, name: string): void {
    set((state) => ({
      cities: state.cities.map((c) => (c.id === id ? { ...c, name: name.trim() } : c))
    }));
  },

  removeCity(id: string): void {
    const state = get();
    const areaIds = state.areas.filter((a) => a.cityId === id).map((a) => a.id);
    const branchIds = state.branches.filter((b) => areaIds.includes(b.areaId)).map((b) => b.id);

    set((s) => ({
      cities: s.cities.filter((c) => c.id !== id),
      areas: s.areas.filter((a) => !areaIds.includes(a.id)),
      branches: s.branches.filter((b) => !branchIds.includes(b.id)),
      branchSnapshots: s.branchSnapshots.filter((bs) => !branchIds.includes(bs.branchId))
    }));
  },

  // ── Area CRUD ──────────────────────────────────────────────

  addArea(cityId: string, name: string): string {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return '';
    }

    const id = makeId('area');
    const record: AreaRecord = { id, cityId, name: trimmedName, createdAt: new Date().toISOString() };
    set((state) => ({ areas: [...state.areas, record] }));
    return id;
  },

  updateArea(id: string, name: string): void {
    set((state) => ({
      areas: state.areas.map((a) => (a.id === id ? { ...a, name: name.trim() } : a))
    }));
  },

  removeArea(id: string): void {
    const state = get();
    const branchIds = state.branches.filter((b) => b.areaId === id).map((b) => b.id);

    set((s) => ({
      areas: s.areas.filter((a) => a.id !== id),
      branches: s.branches.filter((b) => !branchIds.includes(b.id)),
      branchSnapshots: s.branchSnapshots.filter((bs) => !branchIds.includes(bs.branchId))
    }));
  },

  // ── Branch CRUD ──────────────────────────────────────────────

  addBranch(areaId: string, name: string, storeCode: string, isCurrentBranch = false): string {
    const trimmedName = name.trim();
    const trimmedCode = storeCode.trim();

    if (!trimmedName || !trimmedCode) {
      return '';
    }

    const id = makeId('branch');
    const record: BranchRecord = { id, areaId, name: trimmedName, storeCode: trimmedCode, isCurrentBranch, createdAt: new Date().toISOString() };

    set((state) => {
      const nextBranches = isCurrentBranch
        ? state.branches.map((b) => ({ ...b, isCurrentBranch: false }))
        : [...state.branches];
      return { branches: [...nextBranches, record] };
    });
    return id;
  },

  updateBranch(id: string, name: string, storeCode: string): void {
    set((state) => ({
      branches: state.branches.map((b) => (b.id === id ? { ...b, name: name.trim(), storeCode: storeCode.trim() } : b))
    }));
  },

  removeBranch(id: string): void {
    set((s) => ({
      branches: s.branches.filter((b) => b.id !== id),
      branchSnapshots: s.branchSnapshots.filter((bs) => bs.branchId !== id)
    }));
  },

  // ── Filter Actions ──────────────────────────────────────────

  setFilterLevel(level: HierarchyLevel): void {
    set({ filterState: { ...initialFilterState, level } });
  },

  setFilterCompany(companyId: string | null): void {
    set((state) => ({
      filterState: {
        ...state.filterState,
        selectedCompanyId: companyId,
        selectedCountryId: null,
        selectedCityId: null,
        selectedAreaId: null,
        selectedBranchId: null
      }
    }));
  },

  setFilterCountry(countryId: string | null): void {
    set((state) => ({
      filterState: {
        ...state.filterState,
        selectedCountryId: countryId,
        selectedCityId: null,
        selectedAreaId: null,
        selectedBranchId: null
      }
    }));
  },

  setFilterCity(cityId: string | null): void {
    set((state) => ({
      filterState: {
        ...state.filterState,
        selectedCityId: cityId,
        selectedAreaId: null,
        selectedBranchId: null
      }
    }));
  },

  setFilterArea(areaId: string | null): void {
    set((state) => ({
      filterState: {
        ...state.filterState,
        selectedAreaId: areaId,
        selectedBranchId: null
      }
    }));
  },

  setFilterBranch(branchId: string | null): void {
    set((state) => ({
      filterState: { ...state.filterState, selectedBranchId: branchId }
    }));
  },

  drillDown(entityId: string): void {
    const state = get();
    const { level } = state.filterState;

    if (level === 'company') {
      set({
        filterState: {
          level: 'country',
          selectedCompanyId: entityId,
          selectedCountryId: null,
          selectedCityId: null,
          selectedAreaId: null,
          selectedBranchId: null
        }
      });
    } else if (level === 'country') {
      set({
        filterState: {
          ...state.filterState,
          level: 'city',
          selectedCountryId: entityId,
          selectedCityId: null,
          selectedAreaId: null,
          selectedBranchId: null
        }
      });
    } else if (level === 'city') {
      set({
        filterState: {
          ...state.filterState,
          level: 'area',
          selectedCityId: entityId,
          selectedAreaId: null,
          selectedBranchId: null
        }
      });
    } else if (level === 'area') {
      set({
        filterState: {
          ...state.filterState,
          level: 'branch',
          selectedAreaId: entityId,
          selectedBranchId: null
        }
      });
    }
  },

  drillUp(): void {
    const state = get();
    const { level } = state.filterState;

    if (level === 'country') {
      set({ filterState: { ...initialFilterState } });
    } else if (level === 'city') {
      set({
        filterState: {
          ...state.filterState,
          level: 'country',
          selectedCountryId: null,
          selectedCityId: null,
          selectedAreaId: null,
          selectedBranchId: null
        }
      });
    } else if (level === 'area') {
      set({
        filterState: {
          ...state.filterState,
          level: 'city',
          selectedCityId: null,
          selectedAreaId: null,
          selectedBranchId: null
        }
      });
    } else if (level === 'branch') {
      set({
        filterState: {
          ...state.filterState,
          level: 'area',
          selectedAreaId: null,
          selectedBranchId: null
        }
      });
    }
  },

  resetFilter(): void {
    set({ filterState: { ...initialFilterState } });
  },

  // ── Snapshot Actions ──────────────────────────────────────────

  importBranchSnapshot(snapshot: BranchSnapshotRecord): void {
    set((state) => ({
      branchSnapshots: [
        ...state.branchSnapshots.filter(
          (bs) => !(bs.branchId === snapshot.branchId && bs.snapshotDate === snapshot.snapshotDate)
        ),
        snapshot
      ]
    }));
  },

  importBranchSnapshots(snapshots: BranchSnapshotRecord[]): void {
    set((state) => {
      let next = [...state.branchSnapshots];

      for (const snapshot of snapshots) {
        next = next.filter((bs) => !(bs.branchId === snapshot.branchId && bs.snapshotDate === snapshot.snapshotDate));
        next.push(snapshot);
      }

      return { branchSnapshots: next };
    });
  },

  removeBranchSnapshots(branchId: string): void {
    set((state) => ({
      branchSnapshots: state.branchSnapshots.filter((bs) => bs.branchId !== branchId)
    }));
  },

  // ── Query Helpers ──────────────────────────────────────────

  getCountriesForCompany(companyId: string): CountryRecord[] {
    return get().countries.filter((c) => c.companyId === companyId);
  },

  getCitiesForCountry(countryId: string): CityRecord[] {
    return get().cities.filter((c) => c.countryId === countryId);
  },

  getAreasForCity(cityId: string): AreaRecord[] {
    return get().areas.filter((a) => a.cityId === cityId);
  },

  getBranchesForArea(areaId: string): BranchRecord[] {
    return get().branches.filter((b) => b.areaId === areaId);
  },

  getCurrentBranch(): BranchRecord | undefined {
    return get().branches.find((b) => b.isCurrentBranch);
  },

  getBranchIdsForEntity(level: HierarchyLevel, entityId: string): string[] {
    const state = get();

    if (level === 'branch') {
      return [entityId];
    }

    if (level === 'area') {
      return state.branches.filter((b) => b.areaId === entityId).map((b) => b.id);
    }

    if (level === 'city') {
      const areaIds = state.areas.filter((a) => a.cityId === entityId).map((a) => a.id);
      return state.branches.filter((b) => areaIds.includes(b.areaId)).map((b) => b.id);
    }

    if (level === 'country') {
      const cityIds = state.cities.filter((c) => c.countryId === entityId).map((c) => c.id);
      const areaIds = state.areas.filter((a) => cityIds.includes(a.cityId)).map((a) => a.id);
      return state.branches.filter((b) => areaIds.includes(b.areaId)).map((b) => b.id);
    }

    // company level
    const countryIds = state.countries.filter((c) => c.companyId === entityId).map((c) => c.id);
    const cityIds = state.cities.filter((c) => countryIds.includes(c.countryId)).map((c) => c.id);
    const areaIds = state.areas.filter((a) => cityIds.includes(a.cityId)).map((a) => a.id);
    return state.branches.filter((b) => areaIds.includes(b.areaId)).map((b) => b.id);
  },

  // ── Persistence ──────────────────────────────────────────────

  getHierarchySnapshot(): OrgHierarchyData {
    const state = get();
    return {
      companies: state.companies,
      countries: state.countries,
      cities: state.cities,
      areas: state.areas,
      branches: state.branches,
      branchSnapshots: state.branchSnapshots,
      inventoryTransfers: state.inventoryTransfers
    };
  },

  hydrateHierarchySnapshot(data: OrgHierarchyData): void {
    if (!data || typeof data !== 'object') {
      return;
    }

    set({
      companies: Array.isArray(data.companies) ? data.companies : [],
      countries: Array.isArray(data.countries) ? data.countries : [],
      cities: Array.isArray(data.cities) ? data.cities : [],
      areas: Array.isArray(data.areas) ? data.areas : [],
      branches: Array.isArray(data.branches) ? data.branches : [],
      branchSnapshots: Array.isArray(data.branchSnapshots) ? data.branchSnapshots : [],
      inventoryTransfers: Array.isArray(data.inventoryTransfers) ? data.inventoryTransfers : []
    });
  },

  // ── Default Hierarchy ─────────────────────────────────────────

  ensureDefaultHierarchy(storeName: string, storeCode: string): void {
    const state = get();

    if (state.companies.length > 0) {
      return;
    }

    const now = new Date().toISOString();
    const companyId = makeId('company');
    const countryId = makeId('country');
    const cityId = makeId('city');
    const areaId = makeId('area');
    const branchId = makeId('branch');

    set({
      companies: [{ id: companyId, name: storeName, code: storeCode, createdAt: now }],
      countries: [{ id: countryId, companyId, name: 'Default Country', code: 'DC', createdAt: now }],
      cities: [{ id: cityId, countryId, name: 'Default City', createdAt: now }],
      areas: [{ id: areaId, cityId, name: 'Default Area', createdAt: now }],
      branches: [{ id: branchId, areaId, name: storeName, storeCode, isCurrentBranch: true, createdAt: now }]
    });
  }
}));
