import { useAuthStore } from "../store/authStore";
import { getRoleLower, isAdmin, isManager } from "../utils/permissions";

/**
 * Hook para obter informações do role do usuário
 * @returns {object} Objeto com roleLower, hasAdmin, isManager
 */
export function useUserRole() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  
  const userRole = role || user?.role;
  const roleLower = getRoleLower(userRole);
  const hasAdmin = isAdmin(userRole);
  const userIsManager = isManager(userRole);

  return {
    role: userRole,
    roleLower,
    hasAdmin,
    isManager: userIsManager,
  };
}
