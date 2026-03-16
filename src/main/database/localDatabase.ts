import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

type AuthRoleName = 'super_admin' | 'manager' | 'cashier';

function toAuthRoleName(role: string): AuthRoleName {
  if (role === 'super_admin' || role === 'manager' || role === 'cashier') {
    return role;
  }

  return 'cashier';
}

export interface AuthUserRecord {
  id: string;
  username: string;
  fullName: string;
  passwordHash: string;
  role: AuthRoleName;
  status: 'active' | 'locked' | 'disabled';
  storeId: string;
  grantedFeatureKeys: string[];
  revokedFeatureKeys: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  passwordUpdatedAt: string | null;
}

export interface AuthAdminUserRecord {
  id: string;
  username: string;
  fullName: string;
  role: AuthRoleName;
  status: 'active' | 'locked' | 'disabled';
  storeId: string;
  grantedFeatureKeys: string[];
  revokedFeatureKeys: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  passwordUpdatedAt: string | null;
}

interface StoreRecord {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  isActive: boolean;
}

interface RoleRecord {
  id: string;
  storeId: string;
  name: string;
  description: string;
}

interface UserRecord {
  id: string;
  storeId: string;
  roleId: string;
  username: string;
  passwordHash: string;
  fullName: string;
  status: 'active' | 'locked' | 'disabled';
  grantedFeatureKeys: string[];
  revokedFeatureKeys: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  passwordUpdatedAt: string | null;
}

interface LocalDatabaseState {
  stores: StoreRecord[];
  roles: RoleRecord[];
  users: UserRecord[];
}

const DEFAULT_DATABASE_STATE: LocalDatabaseState = {
  stores: [],
  roles: [],
  users: []
};

class LocalDatabaseService {
  private databasePath: string | null = null;

  initialize(): void {
    if (this.databasePath) {
      return;
    }

    const dataDirectory = join(process.cwd(), 'data');
    mkdirSync(dataDirectory, { recursive: true });
    this.databasePath = join(dataDirectory, 'localDatabase.json');
    this.seedDefaultData();
  }

  getAuthUserByUsername(username: string): AuthUserRecord | null {
    const state = this.readState();
    const user = state.users.find((item) => item.username === username && item.status === 'active');

    if (!user) {
      return null;
    }

    const role = state.roles.find((item) => item.id === user.roleId);

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      passwordHash: user.passwordHash,
      role: toAuthRoleName(role?.name ?? 'cashier'),
      status: user.status,
      storeId: user.storeId,
      grantedFeatureKeys: user.grantedFeatureKeys,
      revokedFeatureKeys: user.revokedFeatureKeys,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      passwordUpdatedAt: user.passwordUpdatedAt
    };
  }

  listAuthUsers(): AuthAdminUserRecord[] {
    const state = this.readState();

    return state.users.map((user) => {
      const role = state.roles.find((item) => item.id === user.roleId);

      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: toAuthRoleName(role?.name ?? 'cashier'),
        status: user.status,
        storeId: user.storeId,
        grantedFeatureKeys: user.grantedFeatureKeys,
        revokedFeatureKeys: user.revokedFeatureKeys,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        passwordUpdatedAt: user.passwordUpdatedAt
      };
    });
  }

  createAuthUser(input: {
    username: string;
    fullName: string;
    role: AuthRoleName;
    storeId: string;
    temporaryPassword: string;
    grantedFeatureKeys?: string[];
    revokedFeatureKeys?: string[];
  }): AuthAdminUserRecord {
    const state = this.readState();
    const normalizedUsername = input.username.trim().toLowerCase();

    if (state.users.some((user) => user.username.toLowerCase() === normalizedUsername)) {
      throw new Error('Username already exists');
    }

    const roleId = this.getOrCreateRoleId(state, input.storeId, input.role);
    const nowIso = new Date().toISOString();
    const nextUser: UserRecord = {
      id: `user-${Date.now()}`,
      storeId: input.storeId,
      roleId,
      username: normalizedUsername,
      passwordHash: this.hashPassword(input.temporaryPassword),
      fullName: input.fullName.trim(),
      status: 'active',
      grantedFeatureKeys: Array.from(new Set(input.grantedFeatureKeys ?? [])),
      revokedFeatureKeys: Array.from(new Set(input.revokedFeatureKeys ?? [])),
      createdAt: nowIso,
      updatedAt: nowIso,
      lastLoginAt: null,
      passwordUpdatedAt: nowIso
    };

    state.users.unshift(nextUser);
    this.writeState(state);

    return this.listAuthUsers().find((user) => user.id === nextUser.id) as AuthAdminUserRecord;
  }

  updateAuthUserRole(userId: string, role: AuthRoleName): AuthAdminUserRecord {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.roleId = this.getOrCreateRoleId(state, user.storeId, role);
    user.updatedAt = new Date().toISOString();
    this.writeState(state);

    return this.listAuthUsers().find((item) => item.id === userId) as AuthAdminUserRecord;
  }

  updateAuthUserStatus(userId: string, status: UserRecord['status']): AuthAdminUserRecord {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.status = status;
    user.updatedAt = new Date().toISOString();
    this.writeState(state);

    return this.listAuthUsers().find((item) => item.id === userId) as AuthAdminUserRecord;
  }

  updateAuthUserFeatureOverrides(
    userId: string,
    grantedFeatureKeys: string[],
    revokedFeatureKeys: string[]
  ): AuthAdminUserRecord {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.grantedFeatureKeys = Array.from(new Set(grantedFeatureKeys));
    user.revokedFeatureKeys = Array.from(new Set(revokedFeatureKeys));
    user.updatedAt = new Date().toISOString();
    this.writeState(state);

    return this.listAuthUsers().find((item) => item.id === userId) as AuthAdminUserRecord;
  }

  resetAuthUserPassword(userId: string, temporaryPassword: string): AuthAdminUserRecord {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    const nowIso = new Date().toISOString();
    user.passwordHash = this.hashPassword(temporaryPassword);
    user.updatedAt = nowIso;
    user.passwordUpdatedAt = nowIso;
    this.writeState(state);

    return this.listAuthUsers().find((item) => item.id === userId) as AuthAdminUserRecord;
  }

  setAuthUserLastLogin(userId: string): void {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);

    if (!user) {
      return;
    }

    const nowIso = new Date().toISOString();
    user.lastLoginAt = nowIso;
    user.updatedAt = nowIso;
    this.writeState(state);
  }

  verifyPassword(password: string, storedPasswordHash: string): boolean {
    const [saltHex, hashHex] = storedPasswordHash.split(':');

    if (!saltHex || !hashHex) {
      return false;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const expectedHash = Buffer.from(hashHex, 'hex');
    const calculatedHash = scryptSync(password, salt, expectedHash.length);

    if (calculatedHash.length !== expectedHash.length) {
      return false;
    }

    return timingSafeEqual(calculatedHash, expectedHash);
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  private getDatabasePath(): string {
    if (!this.databasePath) {
      this.initialize();
    }

    if (!this.databasePath) {
      throw new Error('Local database path not initialized');
    }

    return this.databasePath;
  }

  private readState(): LocalDatabaseState {
    const databasePath = this.getDatabasePath();

    if (!existsSync(databasePath)) {
      return { ...DEFAULT_DATABASE_STATE };
    }

    const rawContent = readFileSync(databasePath, 'utf8');

    if (!rawContent.trim()) {
      return { ...DEFAULT_DATABASE_STATE };
    }

    const parsed = JSON.parse(rawContent) as LocalDatabaseState;

    return {
      stores: parsed.stores ?? [],
      roles: parsed.roles ?? [],
      users: (parsed.users ?? []).map((user) => ({
        ...user,
        status: user.status ?? ((user as UserRecord & { isActive?: boolean }).isActive === false ? 'disabled' : 'active'),
        grantedFeatureKeys: user.grantedFeatureKeys ?? [],
        revokedFeatureKeys: user.revokedFeatureKeys ?? [],
        createdAt: user.createdAt ?? '2026-01-01T09:00:00.000Z',
        updatedAt: user.updatedAt ?? user.createdAt ?? '2026-01-01T09:00:00.000Z',
        lastLoginAt: user.lastLoginAt ?? null,
        passwordUpdatedAt: user.passwordUpdatedAt ?? user.createdAt ?? null
      }))
    };
  }

  private getOrCreateRoleId(state: LocalDatabaseState, storeId: string, roleName: AuthRoleName): string {
    const normalizedRoleName = roleName.trim();
    const existingRole = state.roles.find((role) => role.storeId === storeId && role.name === normalizedRoleName);

    if (existingRole) {
      return existingRole.id;
    }

    const nextRoleId = `role-${normalizedRoleName}-${Date.now()}`;
    state.roles.push({
      id: nextRoleId,
      storeId,
      name: normalizedRoleName,
      description: `${normalizedRoleName} role`
    });
    return nextRoleId;
  }

  private writeState(state: LocalDatabaseState): void {
    const databasePath = this.getDatabasePath();
    writeFileSync(databasePath, JSON.stringify(state, null, 2), 'utf8');
  }

  private seedDefaultData(): void {
    const state = this.readState();

    if (state.users.length > 0) {
      return;
    }

    const storeId = 'store-default';
    const roleId = 'role-super-admin';
    const managerRoleId = 'role-manager';
    const cashierRoleId = 'role-cashier';
    const passwordHash = this.hashPassword('admin123');
    const nowIso = '2026-01-01T09:00:00.000Z';

    const seededState: LocalDatabaseState = {
      stores: [
        {
          id: storeId,
          name: 'Default Store',
          currency: 'USD',
          timezone: 'UTC',
          isActive: true
        }
      ],
      roles: [
        {
          id: roleId,
          storeId,
          name: 'super_admin',
          description: 'System administrator'
        },
        {
          id: managerRoleId,
          storeId,
          name: 'manager',
          description: 'Store manager'
        },
        {
          id: cashierRoleId,
          storeId,
          name: 'cashier',
          description: 'Store cashier'
        }
      ],
      users: [
        {
          id: 'user-super-admin',
          storeId,
          roleId,
          username: 'admin',
          passwordHash,
          fullName: 'Super Admin',
          status: 'active',
          grantedFeatureKeys: [],
          revokedFeatureKeys: [],
          createdAt: nowIso,
          updatedAt: nowIso,
          lastLoginAt: null,
          passwordUpdatedAt: nowIso
        },
        {
          id: 'user-aiden',
          storeId,
          roleId: managerRoleId,
          username: 'aiden.manager',
          passwordHash,
          fullName: 'Aiden Brooks',
          status: 'active',
          grantedFeatureKeys: [],
          revokedFeatureKeys: [],
          createdAt: '2026-01-08T09:00:00.000Z',
          updatedAt: '2026-01-08T09:00:00.000Z',
          lastLoginAt: null,
          passwordUpdatedAt: '2026-01-08T09:00:00.000Z'
        },
        {
          id: 'user-mia',
          storeId,
          roleId: cashierRoleId,
          username: 'mia.cashier',
          passwordHash,
          fullName: 'Mia Carter',
          status: 'active',
          grantedFeatureKeys: [],
          revokedFeatureKeys: [],
          createdAt: '2026-01-08T09:00:00.000Z',
          updatedAt: '2026-01-08T09:00:00.000Z',
          lastLoginAt: null,
          passwordUpdatedAt: '2026-01-08T09:00:00.000Z'
        }
      ]
    };

    this.writeState(seededState);
  }
}

export const localDatabase = new LocalDatabaseService();
