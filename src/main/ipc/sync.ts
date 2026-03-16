import { ipcMain } from 'electron';
import { z } from 'zod';
import { syncService } from '@main/services/syncService';

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

export function registerSyncIpc(): void {
  ipcMain.handle('sync:get-status', (_event, payload: unknown) => {
    const parsed = storeIdSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('invalidSyncGetStatusPayload');
    }

    return syncService.getSyncStatus(parsed.data.storeId);
  });

  ipcMain.handle('sync:set-server-url', (_event, payload: unknown) => {
    const parsed = serverUrlSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('invalidSyncSetServerUrlPayload');
    }

    return syncService.setServerUrl(parsed.data.serverUrl, parsed.data.storeId);
  });

  ipcMain.handle('sync:queue-store-snapshot', (_event, payload: unknown) => {
    const parsed = queueStoreSnapshotSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('invalidSyncQueueStoreSnapshotPayload');
    }

    return syncService.queueStoreSnapshot(parsed.data.storeId, parsed.data.snapshot);
  });

  ipcMain.handle('sync:force', async (_event, payload: unknown) => {
    const parsed = storeIdSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('invalidSyncForcePayload');
    }

    return syncService.forceSync(parsed.data.storeId);
  });

  ipcMain.handle('sync:get-latest-remote-snapshot', (_event, payload: unknown) => {
    const parsed = storeIdSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('invalidSyncGetLatestRemoteSnapshotPayload');
    }

    return syncService.getLatestRemoteSnapshot(parsed.data.storeId);
  });
}
