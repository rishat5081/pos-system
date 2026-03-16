import { ipcMain } from 'electron';
import { z } from 'zod';
import { authService } from '@main/services/authService';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const roleSchema = z.enum(['super_admin', 'manager', 'cashier']);
const statusSchema = z.enum(['active', 'locked', 'disabled']);
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

export function registerAuthIpc(): void {
  ipcMain.handle('auth:login', (_event, payload: unknown) => {
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('Invalid login payload');
    }

    return authService.login(parsed.data);
  });

  ipcMain.handle('auth:get-session', () => {
    return authService.getSession();
  });

  ipcMain.handle('auth:logout', () => {
    authService.logout();
    return { ok: true };
  });

  ipcMain.handle('auth:list-users', () => {
    return authService.listUsers();
  });

  ipcMain.handle('auth:create-user', (_event, payload: unknown) => {
    const parsed = createUserSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('Invalid create user payload');
    }

    return authService.createUser(parsed.data);
  });

  ipcMain.handle('auth:update-user-role', (_event, payload: unknown) => {
    const parsed = updateUserRoleSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('Invalid update role payload');
    }

    return authService.updateUserRole(parsed.data.userId, parsed.data.role);
  });

  ipcMain.handle('auth:update-user-status', (_event, payload: unknown) => {
    const parsed = updateUserStatusSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('Invalid update status payload');
    }

    return authService.updateUserStatus(parsed.data.userId, parsed.data.status);
  });

  ipcMain.handle('auth:update-user-permissions', (_event, payload: unknown) => {
    const parsed = updateUserPermissionsSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('Invalid update permissions payload');
    }

    return authService.updateUserFeatureOverrides(parsed.data.userId, parsed.data.grantedFeatureKeys, parsed.data.revokedFeatureKeys);
  });

  ipcMain.handle('auth:reset-user-password', (_event, payload: unknown) => {
    const parsed = resetUserPasswordSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('Invalid reset password payload');
    }

    return authService.resetUserPassword(parsed.data.userId, parsed.data.temporaryPassword);
  });
}
