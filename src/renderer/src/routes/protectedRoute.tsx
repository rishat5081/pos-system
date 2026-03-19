import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { canAccessRoute, getFirstAccessibleRoute } from '@/lib/accessControl';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const enabledFeatures = useStoreOpsStore((state) => state.storeProfile.enabledFeatures);
  const deploymentSetupCompletedAt = useStoreOpsStore((state) => state.storeProfile.deploymentSetupCompletedAt);
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!deploymentSetupCompletedAt && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  if (deploymentSetupCompletedAt && location.pathname === '/setup') {
    return <Navigate to="/app" replace />;
  }

  if (location.pathname.startsWith('/app') && !canAccessRoute(location.pathname, user, enabledFeatures)) {
    return <Navigate to={getFirstAccessibleRoute(user, enabledFeatures)} replace />;
  }

  return <Outlet />;
}
