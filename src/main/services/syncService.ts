import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface SyncStatusRecord {
  serverUrl: string;
  pendingChanges: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  isSyncing: boolean;
}

export interface SyncRunResult {
  status: SyncStatusRecord;
  remoteSnapshot: Record<string, unknown> | null;
}

interface SyncQueueRecord {
  id: string;
  storeId: string;
  createdAt: string;
  snapshot: Record<string, unknown>;
}

interface SyncState {
  serverUrl: string;
  lastSyncedAt: string | null;
  lastError: string | null;
  queueRecords: SyncQueueRecord[];
  latestRemoteSnapshotByStore: Record<string, Record<string, unknown>>;
}

const defaultSyncState: SyncState = {
  serverUrl: process.env.POS_SYNC_SERVER_URL?.trim() ?? '',
  lastSyncedAt: null,
  lastError: null,
  queueRecords: [],
  latestRemoteSnapshotByStore: {}
};

function toSyncError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'syncRequestFailed';
}

class SyncService {
  private syncStatePath: string | null = null;

  private isSyncing = false;

  initialize(): void {
    if (this.syncStatePath) {
      return;
    }

    const dataDirectory = join(process.cwd(), 'data');
    mkdirSync(dataDirectory, { recursive: true });
    this.syncStatePath = join(dataDirectory, 'syncState.json');

    if (!existsSync(this.syncStatePath)) {
      this.writeSyncState(defaultSyncState);
    }
  }

  getSyncStatus(storeId: string): SyncStatusRecord {
    const state = this.readSyncState();
    return this.toSyncStatusRecord(state, storeId);
  }

  setServerUrl(serverUrl: string, storeId: string): SyncStatusRecord {
    const state = this.readSyncState();
    const normalizedUrl = serverUrl.trim().replace(/\/+$/, '');

    const nextState: SyncState = {
      ...state,
      serverUrl: normalizedUrl
    };

    this.writeSyncState(nextState);
    return this.toSyncStatusRecord(nextState, storeId);
  }

  queueStoreSnapshot(storeId: string, snapshot: Record<string, unknown>): SyncStatusRecord {
    const state = this.readSyncState();

    const nextQueueRecords = state.queueRecords.filter((queueRecord) => queueRecord.storeId !== storeId);
    nextQueueRecords.push({
      id: `syncQueue-${Date.now()}-${storeId}`,
      storeId,
      createdAt: new Date().toISOString(),
      snapshot
    });

    const cappedQueueRecords = nextQueueRecords.slice(-200);

    const nextState: SyncState = {
      ...state,
      queueRecords: cappedQueueRecords
    };

    this.writeSyncState(nextState);
    return this.toSyncStatusRecord(nextState, storeId);
  }

  getLatestRemoteSnapshot(storeId: string): Record<string, unknown> | null {
    const state = this.readSyncState();
    return state.latestRemoteSnapshotByStore[storeId] ?? null;
  }

  async forceSync(storeId: string): Promise<SyncRunResult> {
    if (this.isSyncing) {
      return {
        status: this.getSyncStatus(storeId),
        remoteSnapshot: this.getLatestRemoteSnapshot(storeId)
      };
    }

    this.isSyncing = true;

    try {
      const state = this.readSyncState();
      const serverUrl = state.serverUrl.trim().replace(/\/+$/, '');

      if (!serverUrl) {
        const nextState: SyncState = {
          ...state,
          lastError: 'syncServerUrlNotConfigured'
        };

        this.writeSyncState(nextState);

        return {
          status: this.toSyncStatusRecord(nextState, storeId),
          remoteSnapshot: state.latestRemoteSnapshotByStore[storeId] ?? null
        };
      }

      const queueRecords = state.queueRecords.filter((queueRecord) => queueRecord.storeId === storeId);

      if (queueRecords.length > 0) {
        await this.pushQueueRecords(serverUrl, storeId, queueRecords);
      }

      const remoteSnapshot = await this.pullRemoteSnapshot(serverUrl, storeId);

      const nextState: SyncState = {
        ...state,
        queueRecords: state.queueRecords.filter((queueRecord) => queueRecord.storeId !== storeId),
        latestRemoteSnapshotByStore: remoteSnapshot
          ? {
              ...state.latestRemoteSnapshotByStore,
              [storeId]: remoteSnapshot
            }
          : state.latestRemoteSnapshotByStore,
        lastSyncedAt: new Date().toISOString(),
        lastError: null
      };

      this.writeSyncState(nextState);

      return {
        status: this.toSyncStatusRecord(nextState, storeId),
        remoteSnapshot: remoteSnapshot ?? null
      };
    } catch (error) {
      const state = this.readSyncState();
      const nextState: SyncState = {
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

  private toSyncStatusRecord(state: SyncState, storeId: string): SyncStatusRecord {
    const pendingChanges = state.queueRecords.filter((queueRecord) => queueRecord.storeId === storeId).length;

    return {
      serverUrl: state.serverUrl,
      pendingChanges,
      lastSyncedAt: state.lastSyncedAt,
      lastError: state.lastError,
      isSyncing: this.isSyncing
    };
  }

  private getSyncStatePath(): string {
    if (!this.syncStatePath) {
      this.initialize();
    }

    if (!this.syncStatePath) {
      throw new Error('syncStatePathNotInitialized');
    }

    return this.syncStatePath;
  }

  private readSyncState(): SyncState {
    const syncStatePath = this.getSyncStatePath();

    if (!existsSync(syncStatePath)) {
      return { ...defaultSyncState };
    }

    const rawContent = readFileSync(syncStatePath, 'utf8');

    if (!rawContent.trim()) {
      return { ...defaultSyncState };
    }

    const parsed = JSON.parse(rawContent) as SyncState;

    return {
      serverUrl: parsed.serverUrl ?? defaultSyncState.serverUrl,
      lastSyncedAt: parsed.lastSyncedAt ?? null,
      lastError: parsed.lastError ?? null,
      queueRecords: parsed.queueRecords ?? [],
      latestRemoteSnapshotByStore: parsed.latestRemoteSnapshotByStore ?? {}
    };
  }

  private writeSyncState(state: SyncState): void {
    const syncStatePath = this.getSyncStatePath();
    writeFileSync(syncStatePath, JSON.stringify(state, null, 2), 'utf8');
  }

  private async pushQueueRecords(serverUrl: string, storeId: string, queueRecords: SyncQueueRecord[]): Promise<void> {
    const response = await fetch(`${serverUrl}/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

  private async pullRemoteSnapshot(serverUrl: string, storeId: string): Promise<Record<string, unknown> | null> {
    const response = await fetch(`${serverUrl}/sync/pull?storeId=${encodeURIComponent(storeId)}`);

    if (response.status === 404 || response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `syncPullFailed:${response.status}`);
    }

    const payload = (await response.json()) as {
      snapshot?: Record<string, unknown>;
    };

    if (!payload.snapshot || typeof payload.snapshot !== 'object' || Array.isArray(payload.snapshot)) {
      return null;
    }

    return payload.snapshot;
  }
}

export const syncService = new SyncService();
