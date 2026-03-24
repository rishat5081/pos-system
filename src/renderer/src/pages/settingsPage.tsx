import { type ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRoleLabel, permissionMatrixItems } from '@/lib/accessControl';
import { dataExchangeFormats, downloadDataExport, parseImportFile, type DataExchangeFormat } from '@/lib/dataExchange';
import { deploymentTemplates, featureOptions, industryOptions } from '@/lib/deploymentConfig';
import { formatCurrencyValue, formatDateTimeValue } from '@/lib/globalFormat';
import { getDesktopApi } from '@/lib/desktopApi';
import { useAuthStore } from '@/stores/authStore';
import { useOrgHierarchyStore } from '@/stores/orgHierarchyStore';
import type { BranchSnapshotRecord } from '@/stores/orgHierarchyTypes';
import { useScheduledReportsStore, type ReportFrequency, type ReportType } from '@/stores/scheduledReportsStore';
import {
  computeCurrentBranchSnapshot,
  type DeploymentFeatureKey,
  type DeploymentIndustry,
  isStoreOpsSnapshot,
  useStoreOpsStore
} from '@/stores/storeOpsStore';

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const syncStatus = useStoreOpsStore((state) => state.syncStatus);
  const setSyncStatus = useStoreOpsStore((state) => state.setSyncStatus);
  const getStoreSnapshot = useStoreOpsStore((state) => state.getStoreSnapshot);
  const hydrateStoreSnapshot = useStoreOpsStore((state) => state.hydrateStoreSnapshot);
  const storeProfile = useStoreOpsStore((state) => state.storeProfile);
  const deploymentAuditRecords = useStoreOpsStore((state) => state.deploymentAuditRecords);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const setGlobalPreferences = useStoreOpsStore((state) => state.setGlobalPreferences);
  const setDeploymentProfile = useStoreOpsStore((state) => state.setDeploymentProfile);
  const resetDeploymentSetup = useStoreOpsStore((state) => state.resetDeploymentSetup);

  const [serverUrlInput, setServerUrlInput] = useState<string>(syncStatus.serverUrl);
  const [businessTypeInput, setBusinessTypeInput] = useState<string>(storeProfile.businessType);
  const [primaryIndustryInput, setPrimaryIndustryInput] = useState<DeploymentIndustry>(storeProfile.primaryIndustry);
  const [enabledIndustriesInput, setEnabledIndustriesInput] = useState<DeploymentIndustry[]>(storeProfile.enabledIndustries);
  const [enabledFeaturesInput, setEnabledFeaturesInput] = useState<DeploymentFeatureKey[]>(storeProfile.enabledFeatures);
  const [localeInput, setLocaleInput] = useState<string>(globalPreferences.locale);
  const [currencyInput, setCurrencyInput] = useState<string>(globalPreferences.currency);
  const [timezoneInput, setTimezoneInput] = useState<string>(globalPreferences.timezone);
  const [dateStyleInput, setDateStyleInput] = useState<'short' | 'medium' | 'long'>(globalPreferences.dateStyle);
  const [syncActionLoading, setSyncActionLoading] = useState<boolean>(false);
  const [backupMessage, setBackupMessage] = useState<string>('');
  const [orgTab, setOrgTab] = useState<'companies' | 'countries' | 'cities' | 'areas' | 'branches' | 'snapshots'>('companies');
  const [orgInputA, setOrgInputA] = useState('');
  const [orgInputB, setOrgInputB] = useState('');
  const [orgParentId, setOrgParentId] = useState('');
  const [snapshotImportMsg, setSnapshotImportMsg] = useState('');
  const [schedReportType, setSchedReportType] = useState<ReportType>('dailySales');
  const [schedFrequency, setSchedFrequency] = useState<ReportFrequency>('daily');
  const [schedFormat, setSchedFormat] = useState<DataExchangeFormat>('pdf');

  const reportSchedules = useScheduledReportsStore((s) => s.schedules);
  const addSchedule = useScheduledReportsStore((s) => s.addSchedule);
  const removeSchedule = useScheduledReportsStore((s) => s.removeSchedule);
  const toggleSchedule = useScheduledReportsStore((s) => s.toggleSchedule);

  const orgCompanies = useOrgHierarchyStore((s) => s.companies);
  const orgCountries = useOrgHierarchyStore((s) => s.countries);
  const orgCities = useOrgHierarchyStore((s) => s.cities);
  const orgAreas = useOrgHierarchyStore((s) => s.areas);
  const orgBranches = useOrgHierarchyStore((s) => s.branches);
  const addCompany = useOrgHierarchyStore((s) => s.addCompany);
  const removeCompany = useOrgHierarchyStore((s) => s.removeCompany);
  const addCountry = useOrgHierarchyStore((s) => s.addCountry);
  const removeCountry = useOrgHierarchyStore((s) => s.removeCountry);
  const addCity = useOrgHierarchyStore((s) => s.addCity);
  const removeCity = useOrgHierarchyStore((s) => s.removeCity);
  const addArea = useOrgHierarchyStore((s) => s.addArea);
  const removeArea = useOrgHierarchyStore((s) => s.removeArea);
  const addBranch = useOrgHierarchyStore((s) => s.addBranch);
  const removeBranch = useOrgHierarchyStore((s) => s.removeBranch);
  const importBranchSnapshots = useOrgHierarchyStore((s) => s.importBranchSnapshots);

  const permissionMatrixRows = permissionMatrixItems.filter(
    (item) => item.featureKey === undefined || enabledFeaturesInput.includes(item.featureKey)
  );

  useEffect(() => {
    setServerUrlInput(syncStatus.serverUrl);
  }, [syncStatus.serverUrl]);

  useEffect(() => {
    setBusinessTypeInput(storeProfile.businessType);
    setPrimaryIndustryInput(storeProfile.primaryIndustry);
    setEnabledIndustriesInput(storeProfile.enabledIndustries);
    setEnabledFeaturesInput(storeProfile.enabledFeatures);
  }, [storeProfile]);

  useEffect(() => {
    setLocaleInput(globalPreferences.locale);
    setCurrencyInput(globalPreferences.currency);
    setTimezoneInput(globalPreferences.timezone);
    setDateStyleInput(globalPreferences.dateStyle);
  }, [globalPreferences]);

  const handleToggleIndustry = (industry: DeploymentIndustry): void => {
    setEnabledIndustriesInput((previous) =>
      previous.includes(industry) ? previous.filter((item) => item !== industry) : [...previous, industry]
    );
  };

  const handleToggleFeature = (featureKey: DeploymentFeatureKey): void => {
    setEnabledFeaturesInput((previous) =>
      previous.includes(featureKey) ? previous.filter((item) => item !== featureKey) : [...previous, featureKey]
    );
  };

  const handleApplyTemplate = (
    businessType: string,
    primaryIndustry: DeploymentIndustry,
    enabledIndustries: DeploymentIndustry[],
    enabledFeatures: DeploymentFeatureKey[]
  ): void => {
    setBusinessTypeInput(businessType);
    setPrimaryIndustryInput(primaryIndustry);
    setEnabledIndustriesInput(enabledIndustries);
    setEnabledFeaturesInput(enabledFeatures);
  };

  const handleSaveGlobalPreferences = (): void => {
    setGlobalPreferences({
      locale: localeInput,
      currency: currencyInput,
      timezone: timezoneInput,
      dateStyle: dateStyleInput
    });
  };

  const handleSaveDeploymentProfile = (): void => {
    setDeploymentProfile({
      businessType: businessTypeInput,
      primaryIndustry: primaryIndustryInput,
      enabledIndustries: enabledIndustriesInput,
      enabledFeatures: enabledFeaturesInput
    });
  };

  const handleRerunSetupWizard = (): void => {
    if (user?.role !== 'super_admin') {
      return;
    }

    resetDeploymentSetup(user.fullName);
    navigate('/setup');
  };

  const handleSaveServerUrl = async (): Promise<void> => {
    if (!user) {
      return;
    }

    setSyncActionLoading(true);
    try {
      const status = await getDesktopApi().sync.setServerUrl({
        storeId: user.storeId,
        serverUrl: serverUrlInput
      });
      setSyncStatus(status);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'setServerUrlFailed';
      setSyncStatus({
        ...syncStatus,
        lastError: message
      });
    } finally {
      setSyncActionLoading(false);
    }
  };

  const handleForceSync = async (): Promise<void> => {
    if (!user) {
      return;
    }

    setSyncActionLoading(true);
    try {
      const syncResult = await getDesktopApi().sync.forceSync({
        storeId: user.storeId
      });
      setSyncStatus(syncResult.status);

      if (isStoreOpsSnapshot(syncResult.remoteSnapshot)) {
        hydrateStoreSnapshot(syncResult.remoteSnapshot);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'forceSyncFailed';
      setSyncStatus({
        ...syncStatus,
        lastError: message
      });
    } finally {
      setSyncActionLoading(false);
    }
  };

  const handleExportFullSnapshot = async (): Promise<void> => {
    if (typeof window === 'undefined') {
      return;
    }

    const snapshotBlob = new Blob([JSON.stringify(getStoreSnapshot(), null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const objectUrl = URL.createObjectURL(snapshotBlob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = 'storeSnapshotExport.json';
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setBackupMessage('Exported full store snapshot as JSON.');
  };

  const handleExportSnapshotSummary = async (): Promise<void> => {
    const snapshot = getStoreSnapshot();
    await downloadDataExport({
      title: 'Store Snapshot Summary',
      fileBaseName: 'storeSnapshotSummary',
      rows: [
        {
          categories: snapshot.categories.length,
          products: snapshot.products.length,
          customers: snapshot.customers.length,
          staffRecords: snapshot.staffRecords.length,
          orders: snapshot.orders.length,
          invoices: snapshot.invoices?.length ?? 0,
          userAccounts: snapshot.userAccounts?.length ?? 0,
          appointments: snapshot.appointments?.length ?? 0
        }
      ],
      format: 'pdf'
    });
    setBackupMessage('Exported store snapshot summary as PDF.');
  };

  const handleImportSnapshot = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const parsed = await parseImportFile(file);
      const rawText = await file.text();
      const candidate = JSON.parse(rawText) as unknown;
      const snapshot = Array.isArray(candidate) ? candidate[0] : candidate;

      if (!isStoreOpsSnapshot(snapshot)) {
        throw new Error(parsed.rows.length ? 'Import file is tabular. Use module imports for CSV/TXT/TSV data.' : 'Invalid store snapshot file');
      }

      hydrateStoreSnapshot(snapshot);
      setBackupMessage(`Imported full store snapshot from ${file.name}.`);
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : 'Unable to import store snapshot');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-500">Store configuration, internationalization, and sync controls.</p>
      </header>

      <Card className="border-white/70 bg-white/85 shadow-lg">
        <CardHeader>
          <CardTitle>Deployment Profile</CardTitle>
          <CardDescription>Choose what this installation should expose to the business.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {deploymentTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                onClick={() =>
                  handleApplyTemplate(
                    template.businessType,
                    template.primaryIndustry,
                    template.enabledIndustries,
                    template.enabledFeatures
                  )
                }
              >
                <p className="font-semibold text-slate-900">{template.label}</p>
                <p className="mt-1 text-xs text-slate-500">{template.businessType}</p>
              </button>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="businessTypeInput" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                Business Type
              </label>
              <Input id="businessTypeInput" value={businessTypeInput} onChange={(event) => setBusinessTypeInput(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="primaryIndustryInput" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                Primary Industry
              </label>
              <select
                id="primaryIndustryInput"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                value={primaryIndustryInput}
                onChange={(event) => setPrimaryIndustryInput(event.target.value as DeploymentIndustry)}
              >
                {industryOptions.map((industryOption) => (
                  <option key={industryOption} value={industryOption}>
                    {industryOption}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">Enabled Industries</p>
            <div className="grid gap-2 md:grid-cols-3">
              {industryOptions.map((industryOption) => (
                <label key={industryOption} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enabledIndustriesInput.includes(industryOption)}
                    onChange={() => handleToggleIndustry(industryOption)}
                  />
                  {industryOption}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">Enabled Features</p>
            <div className="grid gap-2 md:grid-cols-3">
              {featureOptions.map((featureOption) => (
                <label key={featureOption.key} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enabledFeaturesInput.includes(featureOption.key)}
                    onChange={() => handleToggleFeature(featureOption.key)}
                  />
                  {featureOption.label}
                </label>
              ))}
            </div>
          </div>
          <Button type="button" className="h-11 rounded-xl" onClick={handleSaveDeploymentProfile}>
            Save Deployment Profile
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/85 shadow-lg">
        <CardHeader>
          <CardTitle>Access Matrix</CardTitle>
          <CardDescription>Review which roles can access each enabled module in this deployment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            {permissionMatrixRows.map((row) => (
              <div
                key={row.key}
                className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                  <p className="text-xs text-slate-500">
                    {row.path ? row.path : row.featureKey ? 'Business Suite operational module' : 'Restricted administration area'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {row.allowedRoles.map((role) => (
                    <span key={`${row.key}-${role}`} className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
                      {getRoleLabel(role)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/85 shadow-lg">
        <CardHeader>
          <CardTitle>Deployment Controls</CardTitle>
          <CardDescription>Use the setup wizard again when ownership intentionally wants to reconfigure the installation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              Setup completed:{' '}
              {storeProfile.deploymentSetupCompletedAt
                ? formatDateTimeValue(storeProfile.deploymentSetupCompletedAt, globalPreferences)
                : 'Not completed'}
            </p>
            <p className="mt-1">
              Re-running setup preserves current operational data and reopens the deployment template selection flow.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            disabled={user?.role !== 'super_admin'}
            onClick={handleRerunSetupWizard}
          >
            Rerun Setup Wizard
          </Button>
          {user?.role !== 'super_admin' ? (
            <p className="text-xs text-slate-500">Only the super admin can restart deployment setup.</p>
          ) : null}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Deployment Audit</p>
            {deploymentAuditRecords.length === 0 ? (
              <p className="text-sm text-slate-500">No deployment audit entries yet.</p>
            ) : (
              deploymentAuditRecords.slice(0, 5).map((auditRecord) => (
                <div key={auditRecord.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <p className="font-medium text-slate-900">{auditRecord.summary}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTimeValue(auditRecord.changedAt, globalPreferences)} / by {auditRecord.changedBy}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/85 shadow-lg">
        <CardHeader>
          <CardTitle>System Backup</CardTitle>
          <CardDescription>Export the full operational snapshot or restore from a JSON snapshot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => void handleExportFullSnapshot()}>
              Export Full Snapshot JSON
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => void handleExportSnapshotSummary()}>
              Export Snapshot Summary PDF
            </Button>
          </div>
          <Input type="file" accept=".json" onChange={(event) => void handleImportSnapshot(event)} />
          <p className="text-xs text-slate-500">Use page-level imports for CSV, TSV, TXT, and JSON tabular data. Full snapshot restore accepts JSON only.</p>
          {backupMessage ? <p className="text-sm text-slate-600">{backupMessage}</p> : null}
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/85 shadow-lg">
        <CardHeader>
          <CardTitle>International Preferences</CardTitle>
          <CardDescription>Configure locale, currency, and timezone across the system.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="localeInput" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
              Locale
            </label>
            <Input id="localeInput" className="h-11 rounded-xl" value={localeInput} onChange={(event) => setLocaleInput(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="currencyInput" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
              Currency
            </label>
            <Input
              id="currencyInput"
              className="h-11 rounded-xl"
              value={currencyInput}
              onChange={(event) => setCurrencyInput(event.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="timezoneInput" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
              Timezone
            </label>
            <Input
              id="timezoneInput"
              className="h-11 rounded-xl"
              value={timezoneInput}
              onChange={(event) => setTimezoneInput(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="dateStyleInput" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
              Date Style
            </label>
            <select
              id="dateStyleInput"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={dateStyleInput}
              onChange={(event) => setDateStyleInput(event.target.value as 'short' | 'medium' | 'long')}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Preview</p>
            <p className="mt-1 text-slate-800">
              {formatCurrencyValue(12840.35, {
                locale: localeInput,
                currency: currencyInput,
                timezone: timezoneInput,
                dateStyle: dateStyleInput
              })}
            </p>
            <p className="text-slate-600">
              {formatDateTimeValue(new Date().toISOString(), {
                locale: localeInput,
                currency: currencyInput,
                timezone: timezoneInput,
                dateStyle: dateStyleInput
              })}
            </p>
          </div>
          <Button type="button" className="h-11 rounded-xl lg:col-span-2" onClick={handleSaveGlobalPreferences}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/85 shadow-lg">
        <CardHeader>
          <CardTitle>Live Sync</CardTitle>
          <CardDescription>Offline queue to cloud database sync.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              className="h-11 rounded-xl"
              placeholder="Sync server URL (https://your-server.com)"
              value={serverUrlInput}
              onChange={(event) => setServerUrlInput(event.target.value)}
            />
            <Button type="button" className="h-11 rounded-xl" disabled={syncActionLoading || !user} onClick={() => void handleSaveServerUrl()}>
              Save URL
            </Button>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <p>Pending Changes: {syncStatus.pendingChanges}</p>
            <p>Last Synced At: {syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : 'Never'}</p>
            <p>Syncing: {syncStatus.isSyncing ? 'Yes' : 'No'}</p>
            <p>Last Error: {syncStatus.lastError || 'None'}</p>
          </div>
          <Button type="button" variant="outline" className="h-11 rounded-xl" disabled={syncActionLoading || !user} onClick={() => void handleForceSync()}>
            Force Sync Now
          </Button>
        </CardContent>
      </Card>

      {user?.role === 'super_admin' && (
        <Card className="border-white/70 bg-white/85 shadow-lg">
          <CardHeader>
            <CardTitle>Organization Hierarchy</CardTitle>
            <CardDescription>Manage Company → Country → City → Area → Branch structure and import branch snapshots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['companies', 'countries', 'cities', 'areas', 'branches', 'snapshots'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${orgTab === tab ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  onClick={() => { setOrgTab(tab); setOrgInputA(''); setOrgInputB(''); setOrgParentId(''); }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {orgTab === 'companies' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input className="h-10 rounded-xl" placeholder="Company name" value={orgInputA} onChange={(e) => setOrgInputA(e.target.value)} />
                  <Input className="h-10 w-32 rounded-xl" placeholder="Code" value={orgInputB} onChange={(e) => setOrgInputB(e.target.value)} />
                  <Button type="button" size="sm" className="h-10 rounded-xl" onClick={() => { addCompany(orgInputA, orgInputB); setOrgInputA(''); setOrgInputB(''); }}>Add</Button>
                </div>
                {orgCompanies.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <div><p className="text-sm font-semibold">{c.name}</p><p className="text-xs text-slate-500">{c.code}</p></div>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl text-red-600" onClick={() => removeCompany(c.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}

            {orgTab === 'countries' && (
              <div className="space-y-3">
                <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={orgParentId} onChange={(e) => setOrgParentId(e.target.value)}>
                  <option value="">Select company...</option>
                  {orgCompanies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <Input className="h-10 rounded-xl" placeholder="Country name" value={orgInputA} onChange={(e) => setOrgInputA(e.target.value)} />
                  <Input className="h-10 w-32 rounded-xl" placeholder="Code" value={orgInputB} onChange={(e) => setOrgInputB(e.target.value)} />
                  <Button type="button" size="sm" className="h-10 rounded-xl" disabled={!orgParentId} onClick={() => { addCountry(orgParentId, orgInputA, orgInputB); setOrgInputA(''); setOrgInputB(''); }}>Add</Button>
                </div>
                {orgCountries.filter((c) => !orgParentId || c.companyId === orgParentId).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <div><p className="text-sm font-semibold">{c.name}</p><p className="text-xs text-slate-500">{c.code} / {orgCompanies.find((co) => co.id === c.companyId)?.name ?? 'Unknown'}</p></div>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl text-red-600" onClick={() => removeCountry(c.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}

            {orgTab === 'cities' && (
              <div className="space-y-3">
                <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={orgParentId} onChange={(e) => setOrgParentId(e.target.value)}>
                  <option value="">Select country...</option>
                  {orgCountries.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
                <div className="flex gap-2">
                  <Input className="h-10 rounded-xl" placeholder="City name" value={orgInputA} onChange={(e) => setOrgInputA(e.target.value)} />
                  <Button type="button" size="sm" className="h-10 rounded-xl" disabled={!orgParentId} onClick={() => { addCity(orgParentId, orgInputA); setOrgInputA(''); }}>Add</Button>
                </div>
                {orgCities.filter((c) => !orgParentId || c.countryId === orgParentId).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <div><p className="text-sm font-semibold">{c.name}</p><p className="text-xs text-slate-500">{orgCountries.find((co) => co.id === c.countryId)?.name ?? 'Unknown'}</p></div>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl text-red-600" onClick={() => removeCity(c.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}

            {orgTab === 'areas' && (
              <div className="space-y-3">
                <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={orgParentId} onChange={(e) => setOrgParentId(e.target.value)}>
                  <option value="">Select city...</option>
                  {orgCities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <Input className="h-10 rounded-xl" placeholder="Area name" value={orgInputA} onChange={(e) => setOrgInputA(e.target.value)} />
                  <Button type="button" size="sm" className="h-10 rounded-xl" disabled={!orgParentId} onClick={() => { addArea(orgParentId, orgInputA); setOrgInputA(''); }}>Add</Button>
                </div>
                {orgAreas.filter((a) => !orgParentId || a.cityId === orgParentId).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <div><p className="text-sm font-semibold">{a.name}</p><p className="text-xs text-slate-500">{orgCities.find((c) => c.id === a.cityId)?.name ?? 'Unknown'}</p></div>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl text-red-600" onClick={() => removeArea(a.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}

            {orgTab === 'branches' && (
              <div className="space-y-3">
                <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={orgParentId} onChange={(e) => setOrgParentId(e.target.value)}>
                  <option value="">Select area...</option>
                  {orgAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <Input className="h-10 rounded-xl" placeholder="Branch name" value={orgInputA} onChange={(e) => setOrgInputA(e.target.value)} />
                  <Input className="h-10 w-32 rounded-xl" placeholder="Store code" value={orgInputB} onChange={(e) => setOrgInputB(e.target.value)} />
                  <Button type="button" size="sm" className="h-10 rounded-xl" disabled={!orgParentId} onClick={() => { addBranch(orgParentId, orgInputA, orgInputB); setOrgInputA(''); setOrgInputB(''); }}>Add</Button>
                </div>
                {orgBranches.filter((b) => !orgParentId || b.areaId === orgParentId).map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <div>
                      <p className="text-sm font-semibold">{b.name} {b.isCurrentBranch && <span className="text-xs text-cyan-600">(current)</span>}</p>
                      <p className="text-xs text-slate-500">{b.storeCode} / {orgAreas.find((a) => a.id === b.areaId)?.name ?? 'Unknown'}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl text-red-600" onClick={() => removeBranch(b.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}

            {orgTab === 'snapshots' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Import JSON files containing branch snapshot data from other branches. Export the current branch snapshot to share with others.</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl"
                    onClick={() => {
                      const snapshot = computeCurrentBranchSnapshot(getStoreSnapshot());
                      const blob = new Blob([JSON.stringify([snapshot], null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `branchSnapshot-${snapshot.branchId}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      setSnapshotImportMsg('Current branch snapshot exported.');
                    }}
                  >
                    Export Current Branch Snapshot
                  </Button>
                </div>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void file.text().then((text) => {
                      try {
                        const parsed = JSON.parse(text) as unknown;
                        const arr = Array.isArray(parsed) ? parsed : [parsed];
                        const validSnapshots = arr.filter(
                          (s): s is BranchSnapshotRecord =>
                            typeof s === 'object' && s !== null && 'branchId' in s && 'totalRevenue' in s
                        );
                        if (validSnapshots.length === 0) {
                          setSnapshotImportMsg('No valid branch snapshots found in file.');
                          return;
                        }
                        importBranchSnapshots(validSnapshots);
                        setSnapshotImportMsg(`Imported ${validSnapshots.length} branch snapshot(s).`);
                      } catch {
                        setSnapshotImportMsg('Invalid JSON file.');
                      }
                    });
                    e.target.value = '';
                  }}
                />
                {snapshotImportMsg && <p className="text-sm text-slate-600">{snapshotImportMsg}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {user?.role === 'super_admin' && (
        <Card className="border-white/70 bg-white/85 shadow-lg">
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Auto-download reports at configured intervals. Reports generate locally (offline-first).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <select
                aria-label="Report Type"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={schedReportType}
                onChange={(e) => setSchedReportType(e.target.value as ReportType)}
              >
                <option value="dailySales">Daily Sales</option>
                <option value="weeklyPerformance">Weekly Performance</option>
                <option value="monthlyAnalytics">Monthly Analytics</option>
                <option value="branchSnapshot">Branch Snapshot</option>
              </select>
              <select
                aria-label="Frequency"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={schedFrequency}
                onChange={(e) => setSchedFrequency(e.target.value as ReportFrequency)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <select
                aria-label="Format"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={schedFormat}
                onChange={(e) => setSchedFormat(e.target.value as DataExchangeFormat)}
              >
                {dataExchangeFormats.map((f) => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              className="h-10 rounded-xl"
              onClick={() => addSchedule({ reportType: schedReportType, frequency: schedFrequency, format: schedFormat })}
            >
              Add Schedule
            </Button>
            {reportSchedules.length === 0 ? (
              <p className="text-sm text-slate-500">No scheduled reports configured.</p>
            ) : (
              <div className="space-y-2">
                {reportSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{schedule.reportType} ({schedule.format.toUpperCase()})</p>
                      <p className="text-xs text-slate-500">
                        {schedule.frequency} / Next: {new Date(schedule.nextRunAt).toLocaleDateString()}
                        {schedule.lastRunAt && ` / Last: ${new Date(schedule.lastRunAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs">
                        <input type="checkbox" checked={schedule.enabled} onChange={() => toggleSchedule(schedule.id)} />
                        {schedule.enabled ? 'On' : 'Off'}
                      </label>
                      <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg text-xs text-red-600" onClick={() => removeSchedule(schedule.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
