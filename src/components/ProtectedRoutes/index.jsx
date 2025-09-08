import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export function ProtectedOutlet({ requiredPermission }) {
  const { token, permissions } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!permissions?.includes(requiredPermission)) {
    return <Navigate to="/tasks" replace />;
  }

  return <Outlet />;
}
