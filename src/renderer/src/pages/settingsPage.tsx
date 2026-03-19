import { type ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRoleLabel, permissionMatrixItems } from '@/lib/accessControl';
import { downloadDataExport, parseImportFile } from '@/lib/dataExchange';
import { deploymentTemplates, featureOptions, industryOptions } from '@/lib/deploymentConfig';
import { formatCurrencyValue, formatDateTimeValue } from '@/lib/globalFormat';
import { getDesktopApi } from '@/lib/desktopApi';
import { useAuthStore } from '@/stores/authStore';
import {
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
    </section>
  );
}
