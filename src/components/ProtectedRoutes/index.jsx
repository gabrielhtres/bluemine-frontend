import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { routePermissions } from "../../config/permissions";

export function ProtectedOutlet({ requiredPermission }) {
  const { accessToken, permissions: userPermissions } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission) {
    const allowedPermissions = routePermissions[requiredPermission] || [
      requiredPermission,
    ];

    const hasPermission = userPermissions?.some((permission) =>
      allowedPermissions.includes(permission)
    );

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
