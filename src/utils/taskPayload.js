/**
 * Prepara o payload de tarefa removendo propriedades read-only e relacionamentos
 * Envia apenas os campos necessários para criar/atualizar uma tarefa na API
 * @param {object} values - Valores do formulário ou objeto de tarefa
 * @returns {object} Payload limpo para envio à API
 */
export function prepareTaskPayload(values) {
  if (!values || typeof values !== 'object') {
    return {};
  }

  // Campos permitidos para criação/atualização
  const allowedFields = ['title', 'description', 'priority', 'status', 'dueDate', 'projectId', 'assigneeId'];
  
  // Propriedades que nunca devem ser enviadas
  const excludedFields = ['id', 'createdAt', 'updatedAt', 'project', 'assignee', 'localId'];

  const payload = {};

  // Itera apenas pelos campos permitidos
  allowedFields.forEach((field) => {
    // Ignora campos excluídos
    if (excludedFields.includes(field)) {
      return;
    }

    // Só processa campos que existem em values
    if (!(field in values)) {
      return;
    }

    const value = values[field];

    // Ignora valores undefined
    if (value === undefined) {
      return;
    }

    // Converte projectId e assigneeId para número (não permite null para esses campos)
    if (field === 'projectId' || field === 'assigneeId') {
      if (value === null || value === '') {
        return; // Não envia null ou string vazia
      }
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        payload[field] = numValue;
      }
    } 
    // Converte dueDate para ISO string se for Date (não permite null)
    else if (field === 'dueDate') {
      if (value === null || value === '') {
        return; // Não envia null ou string vazia para dueDate
      }
      let date = value;
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      if (!isNaN(date.getTime())) {
        payload[field] = date.toISOString();
      }
    } 
    // Campos de string simples (não permite null ou string vazia para campos obrigatórios)
    else {
      // Para campos opcionais como description, permite string vazia
      if (field === 'description') {
        payload[field] = value || '';
      } else if (value !== null && value !== '') {
        payload[field] = value;
      }
    }
  });

  return payload;
}
