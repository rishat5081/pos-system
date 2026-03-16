import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const api = {
  auth: {
    login: vi.fn(async ({ username, password }: { username: string; password: string }) => {
      if (username === 'admin' && password === 'admin123') {
        return {
          id: 'user-super-admin',
          username: 'admin',
          fullName: 'Super Admin',
          role: 'super_admin' as const,
          storeId: 'store-default',
          grantedFeatureKeys: [],
          revokedFeatureKeys: []
        };
      }
      throw new Error('Invalid username or password');
    }),
    getSession: vi.fn(async () => null),
    logout: vi.fn(async () => ({ ok: true as const })),
    listUsers: vi.fn(async () => []),
    createUser: vi.fn(async () => ({
      id: 'user-created',
      username: 'created.user',
      fullName: 'Created User',
      role: 'cashier' as const,
      status: 'active' as const,
      storeId: 'store-default',
      grantedFeatureKeys: [],
      revokedFeatureKeys: [],
      createdAt: '2026-03-15T09:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
      lastLoginAt: null,
      passwordUpdatedAt: '2026-03-15T09:00:00.000Z'
    })),
    updateUserRole: vi.fn(async () => ({
      id: 'user-super-admin',
      username: 'admin',
      fullName: 'Super Admin',
      role: 'super_admin' as const,
      status: 'active' as const,
      storeId: 'store-default',
      grantedFeatureKeys: [],
      revokedFeatureKeys: [],
      createdAt: '2026-01-01T09:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
      lastLoginAt: null,
      passwordUpdatedAt: '2026-01-01T09:00:00.000Z'
    })),
    updateUserStatus: vi.fn(async () => ({
      id: 'user-super-admin',
      username: 'admin',
      fullName: 'Super Admin',
      role: 'super_admin' as const,
      status: 'active' as const,
      storeId: 'store-default',
      grantedFeatureKeys: [],
      revokedFeatureKeys: [],
      createdAt: '2026-01-01T09:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
      lastLoginAt: null,
      passwordUpdatedAt: '2026-01-01T09:00:00.000Z'
    })),
    updateUserPermissions: vi.fn(async () => ({
      id: 'user-super-admin',
      username: 'admin',
      fullName: 'Super Admin',
      role: 'super_admin' as const,
      status: 'active' as const,
      storeId: 'store-default',
      grantedFeatureKeys: [],
      revokedFeatureKeys: [],
      createdAt: '2026-01-01T09:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
      lastLoginAt: null,
      passwordUpdatedAt: '2026-01-01T09:00:00.000Z'
    })),
    resetUserPassword: vi.fn(async () => ({
      id: 'user-super-admin',
      username: 'admin',
      fullName: 'Super Admin',
      role: 'super_admin' as const,
      status: 'active' as const,
      storeId: 'store-default',
      grantedFeatureKeys: [],
      revokedFeatureKeys: [],
      createdAt: '2026-01-01T09:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
      lastLoginAt: null,
      passwordUpdatedAt: '2026-03-15T09:00:00.000Z'
    }))
  },
  sync: {
    getSyncStatus: vi.fn(async () => ({
      serverUrl: '',
      pendingChanges: 0,
      lastSyncedAt: null,
      lastError: null,
      isSyncing: false
    })),
    setServerUrl: vi.fn(async () => ({
      serverUrl: '',
      pendingChanges: 0,
      lastSyncedAt: null,
      lastError: null,
      isSyncing: false
    })),
    queueStoreSnapshot: vi.fn(async () => ({
      serverUrl: '',
      pendingChanges: 1,
      lastSyncedAt: null,
      lastError: null,
      isSyncing: false
    })),
    forceSync: vi.fn(async () => ({
      status: {
        serverUrl: '',
        pendingChanges: 0,
        lastSyncedAt: new Date().toISOString(),
        lastError: null,
        isSyncing: false
      },
      remoteSnapshot: null
    })),
    getLatestRemoteSnapshot: vi.fn(async () => null)
  }
};

Object.defineProperty(window, 'api', {
  value: api,
  writable: true
});

if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
}

if (!global.URL.revokeObjectURL) {
  global.URL.revokeObjectURL = vi.fn();
}

if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = async function arrayBuffer(): Promise<ArrayBuffer> {
    return new Response(this).arrayBuffer();
  };
}

if (typeof File !== 'undefined' && !File.prototype.text) {
  File.prototype.text = async function text(): Promise<string> {
    return new Response(this).text();
  };
}
