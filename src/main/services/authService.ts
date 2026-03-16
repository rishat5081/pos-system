import { type AuthAdminUserRecord, localDatabase } from '@main/database/localDatabase';

export interface SessionUser {
  id: string;
  username: string;
  fullName: string;
  role: 'super_admin' | 'manager' | 'cashier';
  storeId: string;
  grantedFeatureKeys: string[];
  revokedFeatureKeys: string[];
}

interface LoginInput {
  username: string;
  password: string;
}

let currentSession: SessionUser | null = null;

function toSessionRole(role: string): SessionUser['role'] {
  if (role === 'super_admin' || role === 'manager' || role === 'cashier') {
    return role;
  }

  return 'cashier';
}

export const authService = {
  login(input: LoginInput): SessionUser {
    const userRecord = localDatabase.getAuthUserByUsername(input.username);

    if (!userRecord) {
      throw new Error('Invalid username or password');
    }

    const passwordMatches = localDatabase.verifyPassword(input.password, userRecord.passwordHash);

    if (!passwordMatches) {
      throw new Error('Invalid username or password');
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

  logout(): void {
    currentSession = null;
  },

  getSession(): SessionUser | null {
    return currentSession;
  },

  listUsers(): AuthAdminUserRecord[] {
    return localDatabase.listAuthUsers();
  },

  createUser(input: {
    username: string;
    fullName: string;
    role: SessionUser['role'];
    storeId: string;
    temporaryPassword: string;
  }): AuthAdminUserRecord {
    return localDatabase.createAuthUser(input);
  },

  updateUserRole(userId: string, role: SessionUser['role']): AuthAdminUserRecord {
    const updatedUser = localDatabase.updateAuthUserRole(userId, role);

    if (currentSession?.id === userId) {
      currentSession = {
        ...currentSession,
        role: toSessionRole(updatedUser.role)
      };
    }

    return updatedUser;
  },

  updateUserStatus(userId: string, status: 'active' | 'locked' | 'disabled'): AuthAdminUserRecord {
    const updatedUser = localDatabase.updateAuthUserStatus(userId, status);

    if (currentSession?.id === userId && status !== 'active') {
      currentSession = null;
    }

    return updatedUser;
  },

  updateUserFeatureOverrides(userId: string, grantedFeatureKeys: string[], revokedFeatureKeys: string[]): AuthAdminUserRecord {
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

  resetUserPassword(userId: string, temporaryPassword: string): AuthAdminUserRecord {
    return localDatabase.resetAuthUserPassword(userId, temporaryPassword);
  }
};
