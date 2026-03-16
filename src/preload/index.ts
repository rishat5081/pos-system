import { contextBridge, ipcRenderer } from 'electron';
import type { SessionUser } from '@main/services/authService';
import type { AuthAdminUserRecord } from '@main/database/localDatabase';
import type { SyncRunResult, SyncStatusRecord } from '@main/services/syncService';

interface LoginInput {
  username: string;
  password: string;
}

interface QueueStoreSnapshotInput {
  storeId: string;
  snapshot: Record<string, unknown>;
}

interface SyncStoreInput {
  storeId: string;
}

interface SyncServerUrlInput {
  storeId: string;
  serverUrl: string;
}

interface CreateUserInput {
  username: string;
  fullName: string;
  role: 'super_admin' | 'manager' | 'cashier';
  storeId: string;
  temporaryPassword: string;
}

const api = {
  auth: {
    login: (input: LoginInput): Promise<SessionUser> => ipcRenderer.invoke('auth:login', input),
    getSession: (): Promise<SessionUser | null> => ipcRenderer.invoke('auth:get-session'),
    logout: (): Promise<{ ok: true }> => ipcRenderer.invoke('auth:logout'),
    listUsers: (): Promise<AuthAdminUserRecord[]> => ipcRenderer.invoke('auth:list-users'),
    createUser: (input: CreateUserInput): Promise<AuthAdminUserRecord> => ipcRenderer.invoke('auth:create-user', input),
    updateUserRole: (input: { userId: string; role: 'super_admin' | 'manager' | 'cashier' }): Promise<AuthAdminUserRecord> =>
      ipcRenderer.invoke('auth:update-user-role', input),
    updateUserStatus: (input: { userId: string; status: 'active' | 'locked' | 'disabled' }): Promise<AuthAdminUserRecord> =>
      ipcRenderer.invoke('auth:update-user-status', input),
    updateUserPermissions: (input: {
      userId: string;
      grantedFeatureKeys: string[];
      revokedFeatureKeys: string[];
    }): Promise<AuthAdminUserRecord> => ipcRenderer.invoke('auth:update-user-permissions', input),
    resetUserPassword: (input: { userId: string; temporaryPassword: string }): Promise<AuthAdminUserRecord> =>
      ipcRenderer.invoke('auth:reset-user-password', input)
  },
  sync: {
    getSyncStatus: (input: SyncStoreInput): Promise<SyncStatusRecord> => ipcRenderer.invoke('sync:get-status', input),
    setServerUrl: (input: SyncServerUrlInput): Promise<SyncStatusRecord> => ipcRenderer.invoke('sync:set-server-url', input),
    queueStoreSnapshot: (input: QueueStoreSnapshotInput): Promise<SyncStatusRecord> =>
      ipcRenderer.invoke('sync:queue-store-snapshot', input),
    forceSync: (input: SyncStoreInput): Promise<SyncRunResult> => ipcRenderer.invoke('sync:force', input),
    getLatestRemoteSnapshot: (input: SyncStoreInput): Promise<Record<string, unknown> | null> =>
      ipcRenderer.invoke('sync:get-latest-remote-snapshot', input)
  }
};

contextBridge.exposeInMainWorld('api', api);

export type DesktopApi = typeof api;
