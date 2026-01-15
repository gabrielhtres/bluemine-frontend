import { routePermissions } from "../config/permissions";

/**
 * Obtém o role em lowercase com fallback seguro
 * @param {string|null|undefined} role - Role do usuário
 * @returns {string} Role em lowercase ou string vazia
 */
export function getRoleLower(role) {
  return (role || "")?.toLowerCase?.() || "";
}

/**
 * Verifica se o usuário é admin
 * @param {string|null|undefined} role - Role do usuário
 * @returns {boolean} True se for admin
 */
export function isAdmin(role) {
  return getRoleLower(role) === "admin";
}

/**
 * Verifica se o usuário é manager ou admin
 * @param {string|null|undefined} role - Role do usuário
 * @returns {boolean} True se for manager ou admin
 */
export function isManager(role) {
  const roleLower = getRoleLower(role);
  return roleLower === "admin" || roleLower === "manager";
}

/**
 * Verifica se o usuário tem permissão para acessar uma rota
 * @param {string|null|undefined} role - Role do usuário
 * @param {string} permission - Permissão requerida (chave de routePermissions)
 * @returns {boolean} True se tiver permissão
 */
export function canAccess(role, permission) {
  if (!permission) return true;
  
  const roleLower = getRoleLower(role);
  
  // Admin tem acesso a tudo
  if (isAdmin(role)) return true;
  
  // Verifica se o role está na lista de roles permitidos
  const allowedRoles = (routePermissions[permission] || []).map((r) => r.toLowerCase());
  return allowedRoles.includes(roleLower);
}
