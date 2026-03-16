import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  dataExchangeFormats,
  downloadDataExport,
  findMatchingHeader,
  importFileAccept,
  parseImportFile,
  type DataExchangeFormat
} from '@/lib/dataExchange';
import { featureOptions } from '@/lib/deploymentConfig';
import { getDesktopApi, type DesktopAuthUserRecord } from '@/lib/desktopApi';
import { permissionPresets, resolvePermissionPreset } from '@/lib/permissionPresets';
import { useAuthStore } from '@/stores/authStore';
import { type DeploymentFeatureKey, type UserAccountRole, type UserAccountStatus, useStoreOpsStore } from '@/stores/storeOpsStore';

const userAccountRoles: UserAccountRole[] = ['super_admin', 'manager', 'cashier'];
const userAccountStatuses: UserAccountStatus[] = ['active', 'locked', 'disabled'];
const temporaryPassword = 'ChangeMe123!';

export function UserManagementPage(): JSX.Element {
  const currentUser = useAuthStore((state) => state.user);
  const setCurrentUser = useAuthStore((state) => state.setUser);
  const changedByName = currentUser?.fullName ?? 'superAdmin';
  const storeProfile = useStoreOpsStore((state) => state.storeProfile);
  const userAccounts = useStoreOpsStore((state) => state.userAccounts);
  const userAccountAuditRecords = useStoreOpsStore((state) => state.userAccountAuditRecords);
  const staffRecords = useStoreOpsStore((state) => state.staffRecords);
  const addUserAccount = useStoreOpsStore((state) => state.addUserAccount);
  const setUserAccountsSnapshot = useStoreOpsStore((state) => state.setUserAccountsSnapshot);
  const setUserAccountRole = useStoreOpsStore((state) => state.setUserAccountRole);
  const setUserAccountStatus = useStoreOpsStore((state) => state.setUserAccountStatus);
  const setUserAccountFeatureOverrides = useStoreOpsStore((state) => state.setUserAccountFeatureOverrides);
  const resetUserAccountPassword = useStoreOpsStore((state) => state.resetUserAccountPassword);

  const activeStaffRecords = useMemo(
    () => staffRecords.filter((staffRecord) => staffRecord.isActive),
    [staffRecords]
  );
  const enabledFeatureOptions = useMemo(
    () => featureOptions.filter((featureOption) => storeProfile.enabledFeatures.includes(featureOption.key)),
    [storeProfile.enabledFeatures]
  );

  const [usernameInput, setUsernameInput] = useState<string>('');
  const [fullNameInput, setFullNameInput] = useState<string>('');
  const [roleInput, setRoleInput] = useState<UserAccountRole>('cashier');
  const [linkedStaffIdInput, setLinkedStaffIdInput] = useState<string>('');
  const [presetSelectionByUserId, setPresetSelectionByUserId] = useState<Record<string, string>>({});
  const [selectedExportDataset, setSelectedExportDataset] = useState<'accounts' | 'audit'>('accounts');
  const [actionError, setActionError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [dataExchangeMessage, setDataExchangeMessage] = useState<string>('');

  const hydrateBackendUsers = useCallback(async (): Promise<void> => {
    const backendUsers = await getDesktopApi().auth.listUsers();

    setUserAccountsSnapshot(
      backendUsers.map((backendUser) => {
        const existingAccount = useStoreOpsStore
          .getState()
          .userAccounts.find((userAccountRecord) => userAccountRecord.id === backendUser.id);

        return {
          id: backendUser.id,
          username: backendUser.username,
          fullName: backendUser.fullName,
          role: backendUser.role,
          status: backendUser.status,
          grantedFeatureKeys: backendUser.grantedFeatureKeys as DeploymentFeatureKey[],
          revokedFeatureKeys: backendUser.revokedFeatureKeys as DeploymentFeatureKey[],
          linkedStaffId: existingAccount?.linkedStaffId ?? null,
          linkedStaffName: existingAccount?.linkedStaffName ?? '',
          createdAt: backendUser.createdAt,
          updatedAt: backendUser.updatedAt,
          lastLoginAt: backendUser.lastLoginAt,
          passwordUpdatedAt: backendUser.passwordUpdatedAt
        };
      })
    );
  }, [setUserAccountsSnapshot]);

  useEffect(() => {
    let active = true;

    const loadBackendUsers = async (): Promise<void> => {
      try {
        if (!active) {
          return;
        }

        await hydrateBackendUsers();
      } catch (error) {
        if (active) {
          setActionError(error instanceof Error ? error.message : 'Unable to load user accounts');
        }
      }
    };

    void loadBackendUsers();

    return () => {
      active = false;
    };
  }, [hydrateBackendUsers]);

  const syncCurrentSession = (updatedUser: DesktopAuthUserRecord): void => {
    if (!currentUser || currentUser.id !== updatedUser.id) {
      return;
    }

    if (updatedUser.status !== 'active') {
      setCurrentUser(null);
      return;
    }

    setCurrentUser({
      ...currentUser,
      role: updatedUser.role,
      grantedFeatureKeys: updatedUser.grantedFeatureKeys,
      revokedFeatureKeys: updatedUser.revokedFeatureKeys
    });
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <section className="space-y-6">
        <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Identity & Access</p>
          <h1 className="mt-2 text-3xl font-semibold">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">Access restricted to super admin.</p>
        </header>
      </section>
    );
  }

  const handleCreateUserAccount = async (): Promise<void> => {
    setActionError('');
    setActionLoading(true);

    try {
      const createdUser = await getDesktopApi().auth.createUser({
        username: usernameInput,
        fullName: fullNameInput,
        role: roleInput,
        storeId: currentUser.storeId,
        temporaryPassword
      });

      addUserAccount({
        id: createdUser.id,
        username: createdUser.username,
        fullName: createdUser.fullName,
        role: createdUser.role,
        linkedStaffId: linkedStaffIdInput || undefined,
        changedBy: changedByName,
        status: createdUser.status,
        grantedFeatureKeys: createdUser.grantedFeatureKeys as DeploymentFeatureKey[],
        revokedFeatureKeys: createdUser.revokedFeatureKeys as DeploymentFeatureKey[],
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
        lastLoginAt: createdUser.lastLoginAt,
        passwordUpdatedAt: createdUser.passwordUpdatedAt
      });

      setUsernameInput('');
      setFullNameInput('');
      setRoleInput('cashier');
      setLinkedStaffIdInput('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to create user account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: UserAccountRole): Promise<void> => {
    setActionError('');

    try {
      const updatedUser = await getDesktopApi().auth.updateUserRole({ userId, role });
      setUserAccountRole(userId, role, changedByName);
      syncCurrentSession(updatedUser);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update user role');
    }
  };

  const handleUpdateStatus = async (userId: string, status: UserAccountStatus): Promise<void> => {
    setActionError('');

    try {
      const updatedUser = await getDesktopApi().auth.updateUserStatus({ userId, status });
      setUserAccountStatus(userId, status, changedByName);
      syncCurrentSession(updatedUser);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update user status');
    }
  };

  const handleUpdateFeaturePermission = async (
    userId: string,
    featureKey: DeploymentFeatureKey,
    mode: 'default' | 'allow' | 'revoke'
  ): Promise<void> => {
    setActionError('');
    const currentAccount = userAccounts.find((userAccountRecord) => userAccountRecord.id === userId);

    if (!currentAccount) {
      return;
    }

    const nextGranted = currentAccount.grantedFeatureKeys.filter((item) => item !== featureKey);
    const nextRevoked = currentAccount.revokedFeatureKeys.filter((item) => item !== featureKey);

    if (mode === 'allow') {
      nextGranted.push(featureKey);
    }

    if (mode === 'revoke') {
      nextRevoked.push(featureKey);
    }

    try {
      const updatedUser = await getDesktopApi().auth.updateUserPermissions({
        userId,
        grantedFeatureKeys: nextGranted,
        revokedFeatureKeys: nextRevoked
      });
      setUserAccountFeatureOverrides(
        userId,
        updatedUser.grantedFeatureKeys as DeploymentFeatureKey[],
        updatedUser.revokedFeatureKeys as DeploymentFeatureKey[],
        changedByName
      );
      syncCurrentSession(updatedUser);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update feature overrides');
    }
  };

  const handleApplyPermissionPreset = async (userId: string): Promise<void> => {
    setActionError('');
    const selectedPresetId = presetSelectionByUserId[userId];
    const selectedPreset = permissionPresets.find((preset) => preset.id === selectedPresetId);

    if (!selectedPreset) {
      return;
    }

    const resolvedPreset = resolvePermissionPreset(storeProfile.enabledFeatures, selectedPreset);

    try {
      const updatedUser = await getDesktopApi().auth.updateUserPermissions({
        userId,
        grantedFeatureKeys: resolvedPreset.grantedFeatureKeys,
        revokedFeatureKeys: resolvedPreset.revokedFeatureKeys
      });
      setUserAccountFeatureOverrides(
        userId,
        updatedUser.grantedFeatureKeys as DeploymentFeatureKey[],
        updatedUser.revokedFeatureKeys as DeploymentFeatureKey[],
        changedByName
      );
      syncCurrentSession(updatedUser);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to apply permission preset');
    }
  };

  const handleResetPassword = async (userId: string): Promise<void> => {
    setActionError('');

    try {
      await getDesktopApi().auth.resetUserPassword({ userId, temporaryPassword });
      resetUserAccountPassword(userId, changedByName);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to reset password');
    }
  };

  const exportRows = selectedExportDataset === 'audit'
    ? userAccountAuditRecords.map((auditRecord) => ({
        username: auditRecord.username,
        action: auditRecord.action,
        summary: auditRecord.summary,
        changedBy: auditRecord.changedBy,
        changedAt: auditRecord.changedAt
      }))
    : userAccounts.map((userAccountRecord) => ({
        id: userAccountRecord.id,
        username: userAccountRecord.username,
        fullName: userAccountRecord.fullName,
        role: userAccountRecord.role,
        status: userAccountRecord.status,
        linkedStaffName: userAccountRecord.linkedStaffName,
        grantedFeatureKeys: userAccountRecord.grantedFeatureKeys.join(', '),
        revokedFeatureKeys: userAccountRecord.revokedFeatureKeys.join(', '),
        createdAt: userAccountRecord.createdAt,
        updatedAt: userAccountRecord.updatedAt,
        lastLoginAt: userAccountRecord.lastLoginAt ?? '',
        passwordUpdatedAt: userAccountRecord.passwordUpdatedAt ?? ''
      }));

  const handleExportUsers = async (format: DataExchangeFormat): Promise<void> => {
    await downloadDataExport({
      title: 'User Management Export',
      fileBaseName: selectedExportDataset === 'audit' ? 'userAuditExport' : 'userAccountsExport',
      rows: exportRows,
      format
    });
    setDataExchangeMessage(`Exported ${selectedExportDataset} as ${format}.`);
  };

  const handleImportUsersFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file || !currentUser) {
      return;
    }

    setActionLoading(true);
    setActionError('');

    try {
      const parsed = await parseImportFile(file);
      const usernameHeader = findMatchingHeader(parsed.headers, ['username', 'login']);
      const fullNameHeader = findMatchingHeader(parsed.headers, ['fullname', 'name']);
      const roleHeader = findMatchingHeader(parsed.headers, ['role']);
      const statusHeader = findMatchingHeader(parsed.headers, ['status']);
      const grantedHeader = findMatchingHeader(parsed.headers, ['grantedfeaturekeys', 'granted', 'allowedfeatures']);
      const revokedHeader = findMatchingHeader(parsed.headers, ['revokedfeaturekeys', 'revoked', 'blockedfeatures']);

      for (const row of parsed.rows) {
        const username = (row[usernameHeader] ?? '').trim();
        const fullName = (row[fullNameHeader] ?? '').trim();
        const role = (row[roleHeader] ?? 'cashier').trim() as UserAccountRole;

        if (!username || !fullName) {
          continue;
        }

        const createdUser = await getDesktopApi().auth.createUser({
          username,
          fullName,
          role: userAccountRoles.includes(role) ? role : 'cashier',
          storeId: currentUser.storeId,
          temporaryPassword
        });

        const nextStatus = (row[statusHeader] ?? '').trim() as UserAccountStatus;
        const grantedFeatureKeys = (row[grantedHeader] ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter((item): item is DeploymentFeatureKey => enabledFeatureOptions.some((featureOption) => featureOption.key === item));
        const revokedFeatureKeys = (row[revokedHeader] ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter((item): item is DeploymentFeatureKey => enabledFeatureOptions.some((featureOption) => featureOption.key === item));

        if (nextStatus && userAccountStatuses.includes(nextStatus) && nextStatus !== createdUser.status) {
          await getDesktopApi().auth.updateUserStatus({ userId: createdUser.id, status: nextStatus });
        }

        if (grantedFeatureKeys.length || revokedFeatureKeys.length) {
          await getDesktopApi().auth.updateUserPermissions({
            userId: createdUser.id,
            grantedFeatureKeys,
            revokedFeatureKeys
          });
        }
      }

      await hydrateBackendUsers();
      setDataExchangeMessage(`Imported user accounts from ${file.name}.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to import user accounts');
    } finally {
      setActionLoading(false);
      event.target.value = '';
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Identity & Access</p>
        <h1 className="mt-2 text-3xl font-semibold">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage user accounts, roles, permission overrides, lock status, password resets, and account audit records.
        </p>
      </header>

      {actionError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{userAccounts.length}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">
              {userAccounts.filter((userAccountRecord) => userAccountRecord.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Locked Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600">
              {userAccounts.filter((userAccountRecord) => userAccountRecord.status === 'locked').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Recent Audit Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-700">{userAccountAuditRecords.slice(0, 24).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>User Data Exchange</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
            <select
              aria-label="User Export Dataset"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={selectedExportDataset}
              onChange={(event) => setSelectedExportDataset(event.target.value as 'accounts' | 'audit')}
            >
              <option value="accounts">Accounts</option>
              <option value="audit">Audit Log</option>
            </select>
            <div className="flex flex-wrap gap-2">
              {dataExchangeFormats.map((format) => (
                <Button key={format} type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => void handleExportUsers(format)}>
                  Export {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <Input type="file" accept={importFileAccept} onChange={(event) => void handleImportUsersFile(event)} />
          <p className="text-xs text-slate-500">
            Import accounts from CSV, TSV, JSON, or TXT. New imported accounts use the temporary password `ChangeMe123!`.
          </p>
          {dataExchangeMessage ? <p className="text-sm text-slate-600">{dataExchangeMessage}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Create User Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              aria-label="Account Username"
              placeholder="Username"
              value={usernameInput}
              onChange={(event) => setUsernameInput(event.target.value)}
            />
            <Input
              aria-label="Account Full Name"
              placeholder="Full name"
              value={fullNameInput}
              onChange={(event) => setFullNameInput(event.target.value)}
            />
            <select
              aria-label="Account Role"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={roleInput}
              onChange={(event) => setRoleInput(event.target.value as UserAccountRole)}
            >
              {userAccountRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              aria-label="Linked Staff"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={linkedStaffIdInput}
              onChange={(event) => setLinkedStaffIdInput(event.target.value)}
            >
              <option value="">No linked staff</option>
              {activeStaffRecords.map((staffRecord) => (
                <option key={staffRecord.id} value={staffRecord.id}>
                  {staffRecord.fullName}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">New accounts start with temporary password `ChangeMe123!`.</p>
            <Button
              type="button"
              className="w-full bg-sky-600 hover:bg-sky-700"
              disabled={actionLoading}
              onClick={() => void handleCreateUserAccount()}
            >
              Create Account
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Account Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userAccounts.map((userAccountRecord) => (
              <div key={userAccountRecord.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{userAccountRecord.fullName}</p>
                    <p className="text-xs text-slate-500">@{userAccountRecord.username}</p>
                  </div>
                  <span
                    className={
                      userAccountRecord.status === 'active'
                        ? 'rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700'
                        : userAccountRecord.status === 'locked'
                          ? 'rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700'
                          : 'rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600'
                    }
                  >
                    {userAccountRecord.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Role: {userAccountRecord.role} / Linked staff: {userAccountRecord.linkedStaffName || 'None'}
                </p>
                <p className="text-xs text-slate-500">
                  Overrides: {userAccountRecord.grantedFeatureKeys.length} granted / {userAccountRecord.revokedFeatureKeys.length} revoked
                </p>
                <p className="text-xs text-slate-500">
                  Password updated:{' '}
                  {userAccountRecord.passwordUpdatedAt
                    ? new Date(userAccountRecord.passwordUpdatedAt).toLocaleString()
                    : 'Never'}
                </p>
                <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[minmax(0,1fr)_auto]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Job Function Preset</p>
                    <select
                      aria-label={`Preset ${userAccountRecord.username}`}
                      className="mt-2 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs"
                      value={presetSelectionByUserId[userAccountRecord.id] ?? ''}
                      onChange={(event) =>
                        setPresetSelectionByUserId((previous) => ({
                          ...previous,
                          [userAccountRecord.id]: event.target.value
                        }))
                      }
                    >
                      <option value="">Select preset</option>
                      {permissionPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    {presetSelectionByUserId[userAccountRecord.id] ? (
                      <p className="mt-2 text-xs text-slate-500">
                        {
                          permissionPresets.find((preset) => preset.id === presetSelectionByUserId[userAccountRecord.id])?.description
                        }
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-3 text-xs"
                    disabled={!presetSelectionByUserId[userAccountRecord.id]}
                    onClick={() => void handleApplyPermissionPreset(userAccountRecord.id)}
                  >
                    Apply Preset
                  </Button>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <select
                    aria-label={`Role ${userAccountRecord.username}`}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs"
                    value={userAccountRecord.role}
                    onChange={(event) => void handleUpdateRole(userAccountRecord.id, event.target.value as UserAccountRole)}
                  >
                    {userAccountRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={`Status ${userAccountRecord.username}`}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs"
                    value={userAccountRecord.status}
                    onChange={(event) => void handleUpdateStatus(userAccountRecord.id, event.target.value as UserAccountStatus)}
                  >
                    {userAccountStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-3 text-xs"
                    onClick={() => void handleResetPassword(userAccountRecord.id)}
                  >
                    Reset Password
                  </Button>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {enabledFeatureOptions.map((featureOption) => {
                    const value = userAccountRecord.grantedFeatureKeys.includes(featureOption.key)
                      ? 'allow'
                      : userAccountRecord.revokedFeatureKeys.includes(featureOption.key)
                        ? 'revoke'
                        : 'default';

                    return (
                      <label key={`${userAccountRecord.id}-${featureOption.key}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                        <span className="mb-2 block font-semibold text-slate-800">{featureOption.label}</span>
                        <select
                          aria-label={`Permission ${userAccountRecord.username} ${featureOption.label}`}
                          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                          value={value}
                          onChange={(event) =>
                            void handleUpdateFeaturePermission(
                              userAccountRecord.id,
                              featureOption.key,
                              event.target.value as 'default' | 'allow' | 'revoke'
                            )
                          }
                        >
                          <option value="default">Default</option>
                          <option value="allow">Allow</option>
                          <option value="revoke">Revoke</option>
                        </select>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>User Account Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {userAccountAuditRecords.slice(0, 16).map((auditRecord) => (
            <div key={auditRecord.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">@{auditRecord.username}</p>
              <p className="text-xs text-slate-600">
                {auditRecord.action} / {auditRecord.summary}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(auditRecord.changedAt).toLocaleString()} / by {auditRecord.changedBy}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
