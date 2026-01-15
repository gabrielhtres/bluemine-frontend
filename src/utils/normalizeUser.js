/**
 * Normaliza dados de usuário recebidos da API
 * Suporta diferentes formatos de resposta da API
 * @param {string|object} user - Dados do usuário (pode ser string ou objeto)
 * @param {string|null} avatarUrl - URL do avatar (pode vir separado)
 * @returns {object} Objeto normalizado com name e avatarUrl
 */
export function normalizeUser(user, avatarUrl = null) {
  if (user && typeof user === "object") {
    return {
      ...user,
      avatarUrl: user.avatarUrl || avatarUrl || null,
    };
  }
  
  return {
    name: user || null,
    avatarUrl: avatarUrl || null,
  };
}
