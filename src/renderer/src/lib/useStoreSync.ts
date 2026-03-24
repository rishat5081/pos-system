import { useEffect, useRef } from 'react';
import { getDesktopApi } from '@/lib/desktopApi';
import { useAuthStore } from '@/stores/authStore';
import { useOrgHierarchyStore } from '@/stores/orgHierarchyStore';
import { isStoreOpsSnapshot, type StoreOpsSnapshot, useStoreOpsStore } from '@/stores/storeOpsStore';

const queueDebounceMs = 800;
const autoSyncIntervalMs = 30_000;

function getSnapshotHash(snapshot: StoreOpsSnapshot): string {
  return JSON.stringify(snapshot);
}

export function useStoreSync(): void {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.storeId ?? '';
  const userId = user?.id ?? '';
  const applyingRemoteSnapshotRef = useRef(false);

  useEffect(() => {
    if (!storeId) {
      return;
    }

    const desktopApi = getDesktopApi();
    let disposed = false;
    let queueTimer: ReturnType<typeof setTimeout> | null = null;
    let lastSnapshotHash = getSnapshotHash(useStoreOpsStore.getState().getStoreSnapshot());

    const setSyncStatus = (status: ReturnType<typeof useStoreOpsStore.getState>['syncStatus']): void => {
      if (disposed) {
        return;
      }

      useStoreOpsStore.getState().setSyncStatus(status);
    };

    const queueSnapshot = async (snapshot: StoreOpsSnapshot): Promise<void> => {
      if (applyingRemoteSnapshotRef.current) {
        return;
      }

      try {
        const status = await desktopApi.sync.queueStoreSnapshot({
          storeId,
          snapshot: snapshot as unknown as Record<string, unknown>
        });
        setSyncStatus(status);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'queueStoreSnapshotFailed';
        const currentSyncStatus = useStoreOpsStore.getState().syncStatus;
        setSyncStatus({
          ...currentSyncStatus,
          lastError: message
        });
      }
    };

    const forceSync = async (): Promise<void> => {
      const localSnapshotHashAtSyncStart = getSnapshotHash(useStoreOpsStore.getState().getStoreSnapshot());

      try {
        const syncResult = await desktopApi.sync.forceSync({
          storeId
        });

        setSyncStatus(syncResult.status);

        if (isStoreOpsSnapshot(syncResult.remoteSnapshot)) {
          const currentLocalSnapshotHash = getSnapshotHash(useStoreOpsStore.getState().getStoreSnapshot());

          if (currentLocalSnapshotHash !== localSnapshotHashAtSyncStart) {
            return;
          }

          applyingRemoteSnapshotRef.current = true;
          useStoreOpsStore.getState().hydrateStoreSnapshot(syncResult.remoteSnapshot);
          lastSnapshotHash = getSnapshotHash(syncResult.remoteSnapshot);

          setTimeout(() => {
            applyingRemoteSnapshotRef.current = false;
          }, 0);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'forceSyncFailed';
        const currentSyncStatus = useStoreOpsStore.getState().syncStatus;
        setSyncStatus({
          ...currentSyncStatus,
          lastError: message
        });
      }
    };

    const loadSyncStatus = async (): Promise<void> => {
      try {
        const status = await desktopApi.sync.getSyncStatus({
          storeId
        });

        setSyncStatus(status);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'getSyncStatusFailed';
        const currentSyncStatus = useStoreOpsStore.getState().syncStatus;
        setSyncStatus({
          ...currentSyncStatus,
          lastError: message
        });
      }
    };

    const unsubscribeOrg = useOrgHierarchyStore.subscribe(() => {
      const snapshot = useStoreOpsStore.getState().getStoreSnapshot();
      const snapshotHash = getSnapshotHash(snapshot);

      if (snapshotHash === lastSnapshotHash) {
        return;
      }

      lastSnapshotHash = snapshotHash;

      if (queueTimer) {
        clearTimeout(queueTimer);
      }

      queueTimer = setTimeout(() => {
        void queueSnapshot(snapshot);
      }, queueDebounceMs);
    });

    const unsubscribe = useStoreOpsStore.subscribe(() => {
      const snapshot = useStoreOpsStore.getState().getStoreSnapshot();
      const snapshotHash = getSnapshotHash(snapshot);

      if (snapshotHash === lastSnapshotHash) {
        return;
      }

      lastSnapshotHash = snapshotHash;

      if (queueTimer) {
        clearTimeout(queueTimer);
      }

      queueTimer = setTimeout(() => {
        void queueSnapshot(snapshot);
      }, queueDebounceMs);
    });

    void loadSyncStatus();
    void queueSnapshot(useStoreOpsStore.getState().getStoreSnapshot());
    void forceSync();

    const autoSyncInterval = setInterval(() => {
      void forceSync();
    }, autoSyncIntervalMs);

    return () => {
      disposed = true;
      applyingRemoteSnapshotRef.current = false;

      if (queueTimer) {
        clearTimeout(queueTimer);
      }

      clearInterval(autoSyncInterval);
      unsubscribe();
      unsubscribeOrg();
    };
  }, [storeId, userId]);
}
