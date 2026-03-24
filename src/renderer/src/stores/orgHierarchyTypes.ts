export interface CompanyRecord {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface CountryRecord {
  id: string;
  companyId: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface CityRecord {
  id: string;
  countryId: string;
  name: string;
  createdAt: string;
}

export interface AreaRecord {
  id: string;
  cityId: string;
  name: string;
  createdAt: string;
}

export interface BranchRecord {
  id: string;
  areaId: string;
  name: string;
  storeCode: string;
  isCurrentBranch: boolean;
  createdAt: string;
}

export interface BranchSnapshotRecord {
  branchId: string;
  snapshotDate: string;
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  totalProducts: number;
  lowStockCount: number;
  staffCount: number;
  clockedInStaff: number;
  customerCount: number;
  totalInventoryValue: number;
  updatedAt: string;
}

export interface OrgHierarchyData {
  companies: CompanyRecord[];
  countries: CountryRecord[];
  cities: CityRecord[];
  areas: AreaRecord[];
  branches: BranchRecord[];
  branchSnapshots: BranchSnapshotRecord[];
  inventoryTransfers: InventoryTransferRecord[];
}

export type HierarchyLevel = 'company' | 'country' | 'city' | 'area' | 'branch';

export interface HierarchyFilterState {
  level: HierarchyLevel;
  selectedCompanyId: string | null;
  selectedCountryId: string | null;
  selectedCityId: string | null;
  selectedAreaId: string | null;
  selectedBranchId: string | null;
}

export type TransferStatus = 'requested' | 'approved' | 'shipped' | 'received' | 'cancelled';

export interface InventoryTransferRecord {
  id: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  productId: string;
  productName: string;
  quantityRequested: number;
  quantityShipped: number;
  status: TransferStatus;
  requestedAt: string;
  updatedAt: string;
  notes: string;
}

export interface AggregatedKPIs {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  branchCount: number;
  totalProducts: number;
  lowStockCount: number;
  staffCount: number;
  clockedInStaff: number;
  customerCount: number;
  totalInventoryValue: number;
}
