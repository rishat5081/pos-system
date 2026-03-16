import type { SessionUser } from '@/stores/authStore';

interface LoginInput {
  username: string;
  password: string;
}

export interface DesktopSyncStatus {
  serverUrl: string;
  pendingChanges: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  isSyncing: boolean;
}

export interface DesktopSyncRunResult {
  status: DesktopSyncStatus;
  remoteSnapshot: Record<string, unknown> | null;
}

interface QueueStoreSnapshotInput {
  storeId: string;
  snapshot: Record<string, unknown>;
}

export interface DesktopAuthUserRecord {
  id: string;
  username: string;
  fullName: string;
  role: 'super_admin' | 'manager' | 'cashier';
  status: 'active' | 'locked' | 'disabled';
  storeId: string;
  grantedFeatureKeys: string[];
  revokedFeatureKeys: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  passwordUpdatedAt: string | null;
}

interface DesktopApi {
  auth: {
    login: (input: LoginInput) => Promise<SessionUser>;
    getSession: () => Promise<SessionUser | null>;
    logout: () => Promise<{ ok: true }>;
    listUsers: () => Promise<DesktopAuthUserRecord[]>;
    createUser: (input: {
      username: string;
      fullName: string;
      role: 'super_admin' | 'manager' | 'cashier';
      storeId: string;
      temporaryPassword: string;
    }) => Promise<DesktopAuthUserRecord>;
    updateUserRole: (input: { userId: string; role: 'super_admin' | 'manager' | 'cashier' }) => Promise<DesktopAuthUserRecord>;
    updateUserStatus: (input: { userId: string; status: 'active' | 'locked' | 'disabled' }) => Promise<DesktopAuthUserRecord>;
    updateUserPermissions: (input: {
      userId: string;
      grantedFeatureKeys: string[];
      revokedFeatureKeys: string[];
    }) => Promise<DesktopAuthUserRecord>;
    resetUserPassword: (input: { userId: string; temporaryPassword: string }) => Promise<DesktopAuthUserRecord>;
  };
  sync: {
    getSyncStatus: (input: { storeId: string }) => Promise<DesktopSyncStatus>;
    setServerUrl: (input: { storeId: string; serverUrl: string }) => Promise<DesktopSyncStatus>;
    queueStoreSnapshot: (input: QueueStoreSnapshotInput) => Promise<DesktopSyncStatus>;
    forceSync: (input: { storeId: string }) => Promise<DesktopSyncRunResult>;
    getLatestRemoteSnapshot: (input: { storeId: string }) => Promise<Record<string, unknown> | null>;
  };
}

let browserSession: SessionUser | null = null;
let browserSyncSnapshotByStore: Record<string, Record<string, unknown>> = {};
let browserSyncStatus: DesktopSyncStatus = {
  serverUrl: '',
  pendingChanges: 0,
  lastSyncedAt: null,
  lastError: null,
  isSyncing: false
};
let browserAuthUsers: Array<DesktopAuthUserRecord & { password: string }> = [
  {
    id: 'user-super-admin',
    username: 'admin',
    fullName: 'Super Admin',
    role: 'super_admin',
    status: 'active',
    storeId: 'store-default',
    grantedFeatureKeys: [],
    revokedFeatureKeys: [],
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
    lastLoginAt: null,
    passwordUpdatedAt: '2026-01-01T09:00:00.000Z',
    password: 'admin123'
  },
  {
    id: 'user-aiden',
    username: 'aiden.manager',
    fullName: 'Aiden Brooks',
    role: 'manager',
    status: 'active',
    storeId: 'store-default',
    grantedFeatureKeys: [],
    revokedFeatureKeys: [],
    createdAt: '2026-01-08T09:00:00.000Z',
    updatedAt: '2026-01-08T09:00:00.000Z',
    lastLoginAt: null,
    passwordUpdatedAt: '2026-01-08T09:00:00.000Z',
    password: 'admin123'
  },
  {
    id: 'user-mia',
    username: 'mia.cashier',
    fullName: 'Mia Carter',
    role: 'cashier',
    status: 'active',
    storeId: 'store-default',
    grantedFeatureKeys: [],
    revokedFeatureKeys: [],
    createdAt: '2026-01-08T09:00:00.000Z',
    updatedAt: '2026-01-08T09:00:00.000Z',
    lastLoginAt: null,
    passwordUpdatedAt: '2026-01-08T09:00:00.000Z',
    password: 'admin123'
  }
];

function toBrowserSessionUser(user: DesktopAuthUserRecord): SessionUser {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    storeId: user.storeId,
    grantedFeatureKeys: user.grantedFeatureKeys,
    revokedFeatureKeys: user.revokedFeatureKeys
  };
}

function stripBrowserPassword(user: DesktopAuthUserRecord & { password: string }): DesktopAuthUserRecord {
  const { password, ...record } = user;
  void password;
  return record;
}

const browserFallbackApi: DesktopApi = {
  auth: {
    async login({ username, password }: LoginInput): Promise<SessionUser> {
      const matchedUser = browserAuthUsers.find(
        (user) => user.username === username && user.password === password && user.status === 'active'
      );

      if (!matchedUser) {
        throw new Error('Invalid username or password');
      }

      matchedUser.lastLoginAt = new Date().toISOString();
      matchedUser.updatedAt = matchedUser.lastLoginAt;
      browserSession = toBrowserSessionUser(matchedUser);
      return browserSession;
    },
    async getSession(): Promise<SessionUser | null> {
      return browserSession;
    },
    async logout(): Promise<{ ok: true }> {
      browserSession = null;
      return { ok: true };
    },
    async listUsers(): Promise<DesktopAuthUserRecord[]> {
      return browserAuthUsers.map(stripBrowserPassword);
    },
    async createUser(input): Promise<DesktopAuthUserRecord> {
      if (browserAuthUsers.some((user) => user.username.toLowerCase() === input.username.trim().toLowerCase())) {
        throw new Error('Username already exists');
      }

      const nowIso = new Date().toISOString();
      const nextUser: DesktopAuthUserRecord & { password: string } = {
        id: `user-${Date.now()}`,
        username: input.username.trim().toLowerCase(),
        fullName: input.fullName.trim(),
        role: input.role,
        status: 'active',
        storeId: input.storeId,
        grantedFeatureKeys: [],
        revokedFeatureKeys: [],
        createdAt: nowIso,
        updatedAt: nowIso,
        lastLoginAt: null,
        passwordUpdatedAt: nowIso,
        password: input.temporaryPassword
      };

      browserAuthUsers = [nextUser, ...browserAuthUsers];
      return stripBrowserPassword(nextUser);
    },
    async updateUserRole({ userId, role }): Promise<DesktopAuthUserRecord> {
      let updatedUser: DesktopAuthUserRecord | null = null;

      browserAuthUsers = browserAuthUsers.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        const nextUser = { ...user, role, updatedAt: new Date().toISOString() };
        updatedUser = stripBrowserPassword(nextUser);

        if (browserSession?.id === userId) {
          browserSession = toBrowserSessionUser(nextUser);
        }

        return nextUser;
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    },
    async updateUserStatus({ userId, status }): Promise<DesktopAuthUserRecord> {
      let updatedUser: DesktopAuthUserRecord | null = null;

      browserAuthUsers = browserAuthUsers.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        const nextUser = { ...user, status, updatedAt: new Date().toISOString() };
        updatedUser = stripBrowserPassword(nextUser);

        if (browserSession?.id === userId && status !== 'active') {
          browserSession = null;
        }

        return nextUser;
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    },
    async updateUserPermissions({ userId, grantedFeatureKeys, revokedFeatureKeys }): Promise<DesktopAuthUserRecord> {
      let updatedUser: DesktopAuthUserRecord | null = null;

      browserAuthUsers = browserAuthUsers.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        const nextUser = {
          ...user,
          grantedFeatureKeys: Array.from(new Set(grantedFeatureKeys)),
          revokedFeatureKeys: Array.from(new Set(revokedFeatureKeys.filter((featureKey) => !grantedFeatureKeys.includes(featureKey)))),
          updatedAt: new Date().toISOString()
        };
        updatedUser = stripBrowserPassword(nextUser);

        if (browserSession?.id === userId) {
          browserSession = toBrowserSessionUser(nextUser);
        }

        return nextUser;
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    },
    async resetUserPassword({ userId, temporaryPassword }): Promise<DesktopAuthUserRecord> {
      let updatedUser: DesktopAuthUserRecord | null = null;

      browserAuthUsers = browserAuthUsers.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        const nowIso = new Date().toISOString();
        const nextUser = { ...user, password: temporaryPassword, updatedAt: nowIso, passwordUpdatedAt: nowIso };
        updatedUser = stripBrowserPassword(nextUser);
        return nextUser;
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    }
  },
  sync: {
    async getSyncStatus(): Promise<DesktopSyncStatus> {
      return browserSyncStatus;
    },
    async setServerUrl({ serverUrl }: { storeId: string; serverUrl: string }): Promise<DesktopSyncStatus> {
      browserSyncStatus = {
        ...browserSyncStatus,
        serverUrl: serverUrl.trim().replace(/\/+$/, '')
      };
      return browserSyncStatus;
    },
    async queueStoreSnapshot(input: QueueStoreSnapshotInput): Promise<DesktopSyncStatus> {
      browserSyncSnapshotByStore = {
        ...browserSyncSnapshotByStore,
        [input.storeId]: input.snapshot
      };
      browserSyncStatus = {
        ...browserSyncStatus,
        pendingChanges: 1
      };
      return browserSyncStatus;
    },
    async forceSync({ storeId }: { storeId: string }): Promise<DesktopSyncRunResult> {
      browserSyncStatus = {
        ...browserSyncStatus,
        pendingChanges: 0,
        lastSyncedAt: new Date().toISOString(),
        lastError: null
      };

      return {
        status: browserSyncStatus,
        remoteSnapshot: browserSyncSnapshotByStore[storeId] ?? null
      };
    },
    async getLatestRemoteSnapshot({ storeId }: { storeId: string }): Promise<Record<string, unknown> | null> {
      return browserSyncSnapshotByStore[storeId] ?? null;
    }
  }
};

export function getDesktopApi(): DesktopApi {
  if (typeof window !== 'undefined' && window.api) {
    return {
      auth: window.api.auth ?? browserFallbackApi.auth,
      sync: window.api.sync ?? browserFallbackApi.sync
    };
  }

  return browserFallbackApi;
}
