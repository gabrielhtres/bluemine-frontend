/**
 * Constantes de status de projetos e tarefas
 */

export const PROJECT_STATUS_LABELS = {
  planned: "Planejado",
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const PROJECT_STATUS_COLORS = {
  planned: "gray",
  active: "blue",
  completed: "teal",
  cancelled: "red",
};

export const TASK_STATUS_LABELS = {
  todo: "A Fazer",
  in_progress: "Em Progresso",
  review: "Revisão",
  done: "Concluído",
};

export const TASK_STATUS_COLORS = {
  todo: "gray",
  in_progress: "blue",
  review: "yellow",
  done: "teal",
};

export const PRIORITY_LABELS = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export const PRIORITY_COLORS = {
  low: "gray",
  medium: "blue",
  high: "orange",
  critical: "red",
};

// Opções para Select/MultiSelect
export const PROJECT_STATUS_OPTIONS = [
  { value: "planned", label: PROJECT_STATUS_LABELS.planned },
  { value: "active", label: PROJECT_STATUS_LABELS.active },
  { value: "completed", label: PROJECT_STATUS_LABELS.completed },
  { value: "cancelled", label: PROJECT_STATUS_LABELS.cancelled },
];

export const TASK_STATUS_OPTIONS = [
  { value: "todo", label: TASK_STATUS_LABELS.todo },
  { value: "in_progress", label: TASK_STATUS_LABELS.in_progress },
  { value: "review", label: TASK_STATUS_LABELS.review },
  { value: "done", label: TASK_STATUS_LABELS.done },
];

export const PRIORITY_OPTIONS = [
  { value: "low", label: PRIORITY_LABELS.low },
  { value: "medium", label: PRIORITY_LABELS.medium },
  { value: "high", label: PRIORITY_LABELS.high },
  { value: "critical", label: PRIORITY_LABELS.critical },
];
