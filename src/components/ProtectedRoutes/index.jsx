import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { canAccess } from "../../utils/permissions";

export function ProtectedOutlet({ requiredPermission }) {
  const { accessToken, refreshToken, role, hasHydrated } = useAuthStore();

  // Aguarda a hidratação do store antes de verificar autenticação
  if (!hasHydrated) {
    return null; // ou um loader
  }

  // Se não tem accessToken nem refreshToken, redireciona para login
  if (!accessToken && !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  // Se não tem accessToken mas tem refreshToken, aguarda o bootstrap fazer o refresh
  // O bootstrap no App.jsx vai redirecionar se falhar
  if (!accessToken) {
    return null; // ou um loader
  }

  if (requiredPermission && !canAccess(role, requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
