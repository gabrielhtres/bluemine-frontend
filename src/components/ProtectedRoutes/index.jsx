import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { routePermissions } from "../../config/permissions";

export function ProtectedOutlet({ requiredPermission }) {
  const { accessToken, role } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const roleLower = (role || "")?.toLowerCase?.() || "";
  const hasAdmin = roleLower === "admin";

  if (requiredPermission) {
    if (hasAdmin) return <Outlet />;

    const allowedRoles = (routePermissions[requiredPermission] || [
      requiredPermission,
    ]).map((r) => r.toLowerCase());

    if (!allowedRoles.includes(roleLower)) return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
