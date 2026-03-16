import { contextBridge, ipcRenderer } from "electron";
const api = {
  auth: {
    login: (input) => ipcRenderer.invoke("auth:login", input),
    getSession: () => ipcRenderer.invoke("auth:get-session"),
    logout: () => ipcRenderer.invoke("auth:logout"),
    listUsers: () => ipcRenderer.invoke("auth:list-users"),
    createUser: (input) => ipcRenderer.invoke("auth:create-user", input),
    updateUserRole: (input) => ipcRenderer.invoke("auth:update-user-role", input),
    updateUserStatus: (input) => ipcRenderer.invoke("auth:update-user-status", input),
    updateUserPermissions: (input) => ipcRenderer.invoke("auth:update-user-permissions", input),
    resetUserPassword: (input) => ipcRenderer.invoke("auth:reset-user-password", input)
  },
  sync: {
    getSyncStatus: (input) => ipcRenderer.invoke("sync:get-status", input),
    setServerUrl: (input) => ipcRenderer.invoke("sync:set-server-url", input),
    queueStoreSnapshot: (input) => ipcRenderer.invoke("sync:queue-store-snapshot", input),
    forceSync: (input) => ipcRenderer.invoke("sync:force", input),
    getLatestRemoteSnapshot: (input) => ipcRenderer.invoke("sync:get-latest-remote-snapshot", input)
  }
};
contextBridge.exposeInMainWorld("api", api);
