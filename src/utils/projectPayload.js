/**
 * Prepara o payload de projeto removendo propriedades read-only e relacionamentos
 * Envia apenas os campos necessários para criar/atualizar um projeto na API
 * @param {object} values - Valores do formulário ou objeto de projeto
 * @returns {object} Payload limpo para envio à API
 */
export function prepareProjectPayload(values) {
  if (!values || typeof values !== 'object') {
    return {};
  }

  // Campos permitidos para criação/atualização
  const allowedFields = ['name', 'description', 'status', 'startDate', 'endDate'];
  
  // Propriedades que nunca devem ser enviadas
  const excludedFields = ['id', 'createdAt', 'updatedAt', 'developers', 'ProjectMember', 'tasks'];

  const payload = {};

  // Itera apenas pelos campos permitidos
  allowedFields.forEach((field) => {
    // Ignora campos excluídos
    if (excludedFields.includes(field)) {
      return;
    }

    const value = values[field];

    // Ignora valores undefined ou null (exceto para datas que podem ser null)
    if (value === undefined) {
      return;
    }

    // Para datas, converte para ISO string ou null
    if (field === 'startDate' || field === 'endDate') {
      if (value === null) {
        payload[field] = null;
      } else {
        let date = value;
        if (!(date instanceof Date)) {
          date = new Date(date);
        }
        if (!isNaN(date.getTime())) {
          payload[field] = date.toISOString();
        }
      }
    } 
    // Campos de string simples
    else {
      payload[field] = value;
    }
  });

  return payload;
}
