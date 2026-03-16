import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { z } from "zod";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
function toAuthRoleName(role) {
  if (role === "super_admin" || role === "manager" || role === "cashier") {
    return role;
  }
  return "cashier";
}
const DEFAULT_DATABASE_STATE = {
  stores: [],
  roles: [],
  users: []
};
class LocalDatabaseService {
  databasePath = null;
  initialize() {
    if (this.databasePath) {
      return;
    }
    const dataDirectory = join(process.cwd(), "data");
    mkdirSync(dataDirectory, { recursive: true });
    this.databasePath = join(dataDirectory, "localDatabase.json");
    this.seedDefaultData();
  }
  getAuthUserByUsername(username) {
    const state = this.readState();
    const user = state.users.find((item) => item.username === username && item.status === "active");
    if (!user) {
      return null;
    }
    const role = state.roles.find((item) => item.id === user.roleId);
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      passwordHash: user.passwordHash,
      role: toAuthRoleName(role?.name ?? "cashier"),
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
  listAuthUsers() {
    const state = this.readState();
    return state.users.map((user) => {
      const role = state.roles.find((item) => item.id === user.roleId);
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: toAuthRoleName(role?.name ?? "cashier"),
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
  createAuthUser(input) {
    const state = this.readState();
    const normalizedUsername = input.username.trim().toLowerCase();
    if (state.users.some((user) => user.username.toLowerCase() === normalizedUsername)) {
      throw new Error("Username already exists");
    }
    const roleId = this.getOrCreateRoleId(state, input.storeId, input.role);
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const nextUser = {
      id: `user-${Date.now()}`,
      storeId: input.storeId,
      roleId,
      username: normalizedUsername,
      passwordHash: this.hashPassword(input.temporaryPassword),
      fullName: input.fullName.trim(),
      status: "active",
      grantedFeatureKeys: Array.from(new Set(input.grantedFeatureKeys ?? [])),
      revokedFeatureKeys: Array.from(new Set(input.revokedFeatureKeys ?? [])),
      createdAt: nowIso,
      updatedAt: nowIso,
      lastLoginAt: null,
      passwordUpdatedAt: nowIso
    };
    state.users.unshift(nextUser);
    this.writeState(state);
    return this.listAuthUsers().find((user) => user.id === nextUser.id);
  }
  updateAuthUserRole(userId, role) {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.roleId = this.getOrCreateRoleId(state, user.storeId, role);
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.writeState(state);
    return this.listAuthUsers().find((item) => item.id === userId);
  }
  updateAuthUserStatus(userId, status) {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.status = status;
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.writeState(state);
    return this.listAuthUsers().find((item) => item.id === userId);
  }
  updateAuthUserFeatureOverrides(userId, grantedFeatureKeys, revokedFeatureKeys) {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.grantedFeatureKeys = Array.from(new Set(grantedFeatureKeys));
    user.revokedFeatureKeys = Array.from(new Set(revokedFeatureKeys));
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.writeState(state);
    return this.listAuthUsers().find((item) => item.id === userId);
  }
  resetAuthUserPassword(userId, temporaryPassword) {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    user.passwordHash = this.hashPassword(temporaryPassword);
    user.updatedAt = nowIso;
    user.passwordUpdatedAt = nowIso;
    this.writeState(state);
    return this.listAuthUsers().find((item) => item.id === userId);
  }
  setAuthUserLastLogin(userId) {
    const state = this.readState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      return;
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    user.lastLoginAt = nowIso;
    user.updatedAt = nowIso;
    this.writeState(state);
  }
  verifyPassword(password, storedPasswordHash) {
    const [saltHex, hashHex] = storedPasswordHash.split(":");
    if (!saltHex || !hashHex) {
      return false;
    }
    const salt = Buffer.from(saltHex, "hex");
    const expectedHash = Buffer.from(hashHex, "hex");
    const calculatedHash = scryptSync(password, salt, expectedHash.length);
    if (calculatedHash.length !== expectedHash.length) {
      return false;
    }
    return timingSafeEqual(calculatedHash, expectedHash);
  }
  hashPassword(password) {
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    return `${salt.toString("hex")}:${hash.toString("hex")}`;
  }
  getDatabasePath() {
    if (!this.databasePath) {
      this.initialize();
    }
    if (!this.databasePath) {
      throw new Error("Local database path not initialized");
    }
    return this.databasePath;
  }
  readState() {
    const databasePath = this.getDatabasePath();
    if (!existsSync(databasePath)) {
      return { ...DEFAULT_DATABASE_STATE };
    }
    const rawContent = readFileSync(databasePath, "utf8");
    if (!rawContent.trim()) {
      return { ...DEFAULT_DATABASE_STATE };
    }
    const parsed = JSON.parse(rawContent);
    return {
      stores: parsed.stores ?? [],
      roles: parsed.roles ?? [],
      users: (parsed.users ?? []).map((user) => ({
        ...user,
        status: user.status ?? (user.isActive === false ? "disabled" : "active"),
        grantedFeatureKeys: user.grantedFeatureKeys ?? [],
        revokedFeatureKeys: user.revokedFeatureKeys ?? [],
        createdAt: user.createdAt ?? "2026-01-01T09:00:00.000Z",
        updatedAt: user.updatedAt ?? user.createdAt ?? "2026-01-01T09:00:00.000Z",
        lastLoginAt: user.lastLoginAt ?? null,
        passwordUpdatedAt: user.passwordUpdatedAt ?? user.createdAt ?? null
      }))
    };
  }
  getOrCreateRoleId(state, storeId, roleName) {
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
  writeState(state) {
    const databasePath = this.getDatabasePath();
    writeFileSync(databasePath, JSON.stringify(state, null, 2), "utf8");
  }
  seedDefaultData() {
    const state = this.readState();
    if (state.users.length > 0) {
      return;
    }
    const storeId = "store-default";
    const roleId = "role-super-admin";
    const managerRoleId = "role-manager";
    const cashierRoleId = "role-cashier";
    const passwordHash = this.hashPassword("admin123");
    const nowIso = "2026-01-01T09:00:00.000Z";
    const seededState = {
      stores: [
        {
          id: storeId,
          name: "Default Store",
          currency: "USD",
          timezone: "UTC",
          isActive: true
        }
      ],
      roles: [
        {
          id: roleId,
          storeId,
          name: "super_admin",
          description: "System administrator"
        },
        {
          id: managerRoleId,
          storeId,
          name: "manager",
          description: "Store manager"
        },
        {
          id: cashierRoleId,
          storeId,
          name: "cashier",
          description: "Store cashier"
        }
      ],
      users: [
        {
          id: "user-super-admin",
          storeId,
          roleId,
          username: "admin",
          passwordHash,
          fullName: "Super Admin",
          status: "active",
          grantedFeatureKeys: [],
          revokedFeatureKeys: [],
          createdAt: nowIso,
          updatedAt: nowIso,
          lastLoginAt: null,
          passwordUpdatedAt: nowIso
        },
        {
          id: "user-aiden",
          storeId,
          roleId: managerRoleId,
          username: "aiden.manager",
          passwordHash,
          fullName: "Aiden Brooks",
          status: "active",
          grantedFeatureKeys: [],
          revokedFeatureKeys: [],
          createdAt: "2026-01-08T09:00:00.000Z",
          updatedAt: "2026-01-08T09:00:00.000Z",
          lastLoginAt: null,
          passwordUpdatedAt: "2026-01-08T09:00:00.000Z"
        },
        {
          id: "user-mia",
          storeId,
          roleId: cashierRoleId,
          username: "mia.cashier",
          passwordHash,
          fullName: "Mia Carter",
          status: "active",
          grantedFeatureKeys: [],
          revokedFeatureKeys: [],
          createdAt: "2026-01-08T09:00:00.000Z",
          updatedAt: "2026-01-08T09:00:00.000Z",
          lastLoginAt: null,
          passwordUpdatedAt: "2026-01-08T09:00:00.000Z"
        }
      ]
    };
    this.writeState(seededState);
  }
}
const localDatabase = new LocalDatabaseService();
let currentSession = null;
function toSessionRole(role) {
  if (role === "super_admin" || role === "manager" || role === "cashier") {
    return role;
  }
  return "cashier";
}
const authService = {
  login(input) {
    const userRecord = localDatabase.getAuthUserByUsername(input.username);
    if (!userRecord) {
      throw new Error("Invalid username or password");
    }
    const passwordMatches = localDatabase.verifyPassword(input.password, userRecord.passwordHash);
    if (!passwordMatches) {
      throw new Error("Invalid username or password");
    }
    currentSession = {
      id: userRecord.id,
      username: userRecord.username,
      fullName: userRecord.fullName,
      role: toSessionRole(userRecord.role),
      storeId: userRecord.storeId,
      grantedFeatureKeys: userRecord.grantedFeatureKeys,
      revokedFeatureKeys: userRecord.revokedFeatureKeys
    };
    localDatabase.setAuthUserLastLogin(userRecord.id);
    return currentSession;
  },
  logout() {
    currentSession = null;
  },
  getSession() {
    return currentSession;
  },
  listUsers() {
    return localDatabase.listAuthUsers();
  },
  createUser(input) {
    return localDatabase.createAuthUser(input);
  },
  updateUserRole(userId, role) {
    const updatedUser = localDatabase.updateAuthUserRole(userId, role);
    if (currentSession?.id === userId) {
      currentSession = {
        ...currentSession,
        role: toSessionRole(updatedUser.role)
      };
    }
    return updatedUser;
  },
  updateUserStatus(userId, status) {
    const updatedUser = localDatabase.updateAuthUserStatus(userId, status);
    if (currentSession?.id === userId && status !== "active") {
      currentSession = null;
    }
    return updatedUser;
  },
  updateUserFeatureOverrides(userId, grantedFeatureKeys, revokedFeatureKeys) {
    const updatedUser = localDatabase.updateAuthUserFeatureOverrides(userId, grantedFeatureKeys, revokedFeatureKeys);
    if (currentSession?.id === userId) {
      currentSession = {
        ...currentSession,
        grantedFeatureKeys: updatedUser.grantedFeatureKeys,
        revokedFeatureKeys: updatedUser.revokedFeatureKeys
      };
    }
    return updatedUser;
  },
  resetUserPassword(userId, temporaryPassword) {
    return localDatabase.resetAuthUserPassword(userId, temporaryPassword);
  }
};
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});
const roleSchema = z.enum(["super_admin", "manager", "cashier"]);
const statusSchema = z.enum(["active", "locked", "disabled"]);
const createUserSchema = z.object({
  username: z.string().min(1),
  fullName: z.string().min(1),
  role: roleSchema,
  storeId: z.string().min(1),
  temporaryPassword: z.string().min(8)
});
const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: roleSchema
});
const updateUserStatusSchema = z.object({
  userId: z.string().min(1),
  status: statusSchema
});
const updateUserPermissionsSchema = z.object({
  userId: z.string().min(1),
  grantedFeatureKeys: z.array(z.string()),
  revokedFeatureKeys: z.array(z.string())
});
const resetUserPasswordSchema = z.object({
  userId: z.string().min(1),
  temporaryPassword: z.string().min(8)
});
function registerAuthIpc() {
  ipcMain.handle("auth:login", (_event, payload) => {
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("Invalid login payload");
    }
    return authService.login(parsed.data);
  });
  ipcMain.handle("auth:get-session", () => {
    return authService.getSession();
  });
  ipcMain.handle("auth:logout", () => {
    authService.logout();
    return { ok: true };
  });
  ipcMain.handle("auth:list-users", () => {
    return authService.listUsers();
  });
  ipcMain.handle("auth:create-user", (_event, payload) => {
    const parsed = createUserSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("Invalid create user payload");
    }
    return authService.createUser(parsed.data);
  });
  ipcMain.handle("auth:update-user-role", (_event, payload) => {
    const parsed = updateUserRoleSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("Invalid update role payload");
    }
    return authService.updateUserRole(parsed.data.userId, parsed.data.role);
  });
  ipcMain.handle("auth:update-user-status", (_event, payload) => {
    const parsed = updateUserStatusSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("Invalid update status payload");
    }
    return authService.updateUserStatus(parsed.data.userId, parsed.data.status);
  });
  ipcMain.handle("auth:update-user-permissions", (_event, payload) => {
    const parsed = updateUserPermissionsSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("Invalid update permissions payload");
    }
    return authService.updateUserFeatureOverrides(parsed.data.userId, parsed.data.grantedFeatureKeys, parsed.data.revokedFeatureKeys);
  });
  ipcMain.handle("auth:reset-user-password", (_event, payload) => {
    const parsed = resetUserPasswordSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("Invalid reset password payload");
    }
    return authService.resetUserPassword(parsed.data.userId, parsed.data.temporaryPassword);
  });
}
const defaultSyncState = {
  serverUrl: process.env.POS_SYNC_SERVER_URL?.trim() ?? "",
  lastSyncedAt: null,
  lastError: null,
  queueRecords: [],
  latestRemoteSnapshotByStore: {}
};
function toSyncError(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return "syncRequestFailed";
}
class SyncService {
  syncStatePath = null;
  isSyncing = false;
  initialize() {
    if (this.syncStatePath) {
      return;
    }
    const dataDirectory = join(process.cwd(), "data");
    mkdirSync(dataDirectory, { recursive: true });
    this.syncStatePath = join(dataDirectory, "syncState.json");
    if (!existsSync(this.syncStatePath)) {
      this.writeSyncState(defaultSyncState);
    }
  }
  getSyncStatus(storeId) {
    const state = this.readSyncState();
    return this.toSyncStatusRecord(state, storeId);
  }
  setServerUrl(serverUrl, storeId) {
    const state = this.readSyncState();
    const normalizedUrl = serverUrl.trim().replace(/\/+$/, "");
    const nextState = {
      ...state,
      serverUrl: normalizedUrl
    };
    this.writeSyncState(nextState);
    return this.toSyncStatusRecord(nextState, storeId);
  }
  queueStoreSnapshot(storeId, snapshot) {
    const state = this.readSyncState();
    const nextQueueRecords = state.queueRecords.filter((queueRecord) => queueRecord.storeId !== storeId);
    nextQueueRecords.push({
      id: `syncQueue-${Date.now()}-${storeId}`,
      storeId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      snapshot
    });
    const cappedQueueRecords = nextQueueRecords.slice(-200);
    const nextState = {
      ...state,
      queueRecords: cappedQueueRecords
    };
    this.writeSyncState(nextState);
    return this.toSyncStatusRecord(nextState, storeId);
  }
  getLatestRemoteSnapshot(storeId) {
    const state = this.readSyncState();
    return state.latestRemoteSnapshotByStore[storeId] ?? null;
  }
  async forceSync(storeId) {
    if (this.isSyncing) {
      return {
        status: this.getSyncStatus(storeId),
        remoteSnapshot: this.getLatestRemoteSnapshot(storeId)
      };
    }
    this.isSyncing = true;
    try {
      const state = this.readSyncState();
      const serverUrl = state.serverUrl.trim().replace(/\/+$/, "");
      if (!serverUrl) {
        const nextState2 = {
          ...state,
          lastError: "syncServerUrlNotConfigured"
        };
        this.writeSyncState(nextState2);
        return {
          status: this.toSyncStatusRecord(nextState2, storeId),
          remoteSnapshot: state.latestRemoteSnapshotByStore[storeId] ?? null
        };
      }
      const queueRecords = state.queueRecords.filter((queueRecord) => queueRecord.storeId === storeId);
      if (queueRecords.length > 0) {
        await this.pushQueueRecords(serverUrl, storeId, queueRecords);
      }
      const remoteSnapshot = await this.pullRemoteSnapshot(serverUrl, storeId);
      const nextState = {
        ...state,
        queueRecords: state.queueRecords.filter((queueRecord) => queueRecord.storeId !== storeId),
        latestRemoteSnapshotByStore: remoteSnapshot ? {
          ...state.latestRemoteSnapshotByStore,
          [storeId]: remoteSnapshot
        } : state.latestRemoteSnapshotByStore,
        lastSyncedAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastError: null
      };
      this.writeSyncState(nextState);
      return {
        status: this.toSyncStatusRecord(nextState, storeId),
        remoteSnapshot: remoteSnapshot ?? null
      };
    } catch (error) {
      const state = this.readSyncState();
      const nextState = {
        ...state,
        lastError: toSyncError(error)
      };
      this.writeSyncState(nextState);
      return {
        status: this.toSyncStatusRecord(nextState, storeId),
        remoteSnapshot: state.latestRemoteSnapshotByStore[storeId] ?? null
      };
    } finally {
      this.isSyncing = false;
    }
  }
  toSyncStatusRecord(state, storeId) {
    const pendingChanges = state.queueRecords.filter((queueRecord) => queueRecord.storeId === storeId).length;
    return {
      serverUrl: state.serverUrl,
      pendingChanges,
      lastSyncedAt: state.lastSyncedAt,
      lastError: state.lastError,
      isSyncing: this.isSyncing
    };
  }
  getSyncStatePath() {
    if (!this.syncStatePath) {
      this.initialize();
    }
    if (!this.syncStatePath) {
      throw new Error("syncStatePathNotInitialized");
    }
    return this.syncStatePath;
  }
  readSyncState() {
    const syncStatePath = this.getSyncStatePath();
    if (!existsSync(syncStatePath)) {
      return { ...defaultSyncState };
    }
    const rawContent = readFileSync(syncStatePath, "utf8");
    if (!rawContent.trim()) {
      return { ...defaultSyncState };
    }
    const parsed = JSON.parse(rawContent);
    return {
      serverUrl: parsed.serverUrl ?? defaultSyncState.serverUrl,
      lastSyncedAt: parsed.lastSyncedAt ?? null,
      lastError: parsed.lastError ?? null,
      queueRecords: parsed.queueRecords ?? [],
      latestRemoteSnapshotByStore: parsed.latestRemoteSnapshotByStore ?? {}
    };
  }
  writeSyncState(state) {
    const syncStatePath = this.getSyncStatePath();
    writeFileSync(syncStatePath, JSON.stringify(state, null, 2), "utf8");
  }
  async pushQueueRecords(serverUrl, storeId, queueRecords) {
    const response = await fetch(`${serverUrl}/sync/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        storeId,
        queueRecords
      })
    });
    if (response.ok) {
      return;
    }
    const message = await response.text();
    throw new Error(message || `syncPushFailed:${response.status}`);
  }
  async pullRemoteSnapshot(serverUrl, storeId) {
    const response = await fetch(`${serverUrl}/sync/pull?storeId=${encodeURIComponent(storeId)}`);
    if (response.status === 404 || response.status === 204) {
      return null;
    }
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `syncPullFailed:${response.status}`);
    }
    const payload = await response.json();
    if (!payload.snapshot || typeof payload.snapshot !== "object" || Array.isArray(payload.snapshot)) {
      return null;
    }
    return payload.snapshot;
  }
}
const syncService = new SyncService();
const storeIdSchema = z.object({
  storeId: z.string().min(1)
});
const serverUrlSchema = z.object({
  storeId: z.string().min(1),
  serverUrl: z.string()
});
const queueStoreSnapshotSchema = z.object({
  storeId: z.string().min(1),
  snapshot: z.record(z.string(), z.unknown())
});
function registerSyncIpc() {
  ipcMain.handle("sync:get-status", (_event, payload) => {
    const parsed = storeIdSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("invalidSyncGetStatusPayload");
    }
    return syncService.getSyncStatus(parsed.data.storeId);
  });
  ipcMain.handle("sync:set-server-url", (_event, payload) => {
    const parsed = serverUrlSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("invalidSyncSetServerUrlPayload");
    }
    return syncService.setServerUrl(parsed.data.serverUrl, parsed.data.storeId);
  });
  ipcMain.handle("sync:queue-store-snapshot", (_event, payload) => {
    const parsed = queueStoreSnapshotSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("invalidSyncQueueStoreSnapshotPayload");
    }
    return syncService.queueStoreSnapshot(parsed.data.storeId, parsed.data.snapshot);
  });
  ipcMain.handle("sync:force", async (_event, payload) => {
    const parsed = storeIdSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("invalidSyncForcePayload");
    }
    return syncService.forceSync(parsed.data.storeId);
  });
  ipcMain.handle("sync:get-latest-remote-snapshot", (_event, payload) => {
    const parsed = storeIdSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("invalidSyncGetLatestRemoteSnapshotPayload");
    }
    return syncService.getLatestRemoteSnapshot(parsed.data.storeId);
  });
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: join(__dirname$1, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (rendererUrl) {
    void mainWindow.loadURL(rendererUrl);
  } else {
    void mainWindow.loadFile(join(__dirname$1, "../renderer/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
app.whenReady().then(() => {
  localDatabase.initialize();
  syncService.initialize();
  registerAuthIpc();
  registerSyncIpc();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
