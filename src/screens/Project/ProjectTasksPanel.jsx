import { useEffect, useMemo, useState } from "react";
import { Button, Group, LoadingOverlay, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import api from "../../services/api";
import showDefaultNotification from "../../utils/showDefaultNotification";
import { prepareTaskPayload } from "../../utils/taskPayload";
import { KanbanBoard as TaskKanbanBoard } from "../Task/KanbanBoard";
import { TaskForm } from "../Task/TaskForm";
import { useUserRole } from "../../hooks/useUserRole";

export function ProjectTasksPanel({ project }) {
  const { isManager } = useUserRole();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const formLoading = false;
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormOpened, { open: openTaskForm, close: closeTaskForm }] = useDisclosure(false);

  const projectAsSelectOption = useMemo(() => {
    if (!project) return [];
    // Passa o projeto completo (inclui developers) para o TaskForm conseguir validar equipe
    return [project];
  }, [project]);

  const fetchTasks = async () => {
    if (!project?.id) return;
    // evita "vazar" tarefas do projeto anterior enquanto carrega
    setTasks([]);
    setLoading(true);
    try {
      const projectIdNum = Number(project.id);
      try {
        const { data } = await api.get("/task", { params: { projectId: project.id } });
        const safe = (data || []).filter((t) => Number(t.projectId ?? t.project?.id) === projectIdNum);
        setTasks(safe);
      } catch {
        const { data } = await api.get("/task");
        setTasks((data || []).filter((t) => Number(t.projectId ?? t.project?.id) === projectIdNum));
      }
    } catch (error) {
      showDefaultNotification({
        title: "Erro",
        message: "Falha ao carregar tarefas do projeto",
        type: "error",
        error,
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersIfNeeded = async () => {
    if (!isManager) return;
    // No contexto do projeto: só pode atribuir para membros do projeto
    const team = project?.developers || [];
    setUsers(Array.isArray(team) ? team : []);
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const handleCreate = async () => {
    try {
      await fetchUsersIfNeeded();
      setEditingTask({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        dueDate: new Date(),
        assigneeId: null,
        projectId: String(project.id),
      });
      openTaskForm();
    } catch {
      // erro já notificado
    }
  };

  const handleEdit = async (task) => {
    try {
      await fetchUsersIfNeeded();
      // Passa apenas os campos necessários para o formulário
      setEditingTask({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        assigneeId: task.assigneeId ? String(task.assigneeId) : null,
        projectId: String(project.id),
      });
      openTaskForm();
    } catch {
      // erro já notificado
    }
  };

  const handleSave = async (values) => {
    // Prepara payload removendo propriedades read-only e garantindo projectId do projeto atual
    const payload = prepareTaskPayload({
      ...values,
      projectId: project.id, // Garante que o projectId sempre seja do projeto atual
    });

    try {
      if (editingTask?.id) {
        await api.put(`/task/${editingTask.id}`, payload);
      } else {
        await api.post("/task", payload);
      }
      showDefaultNotification({ title: "Sucesso", message: "Tarefa salva.", type: "success" });
      closeTaskForm();
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      showDefaultNotification({
        title: "Erro",
        message: error.response?.data?.message?.message?.[0] || "Erro ao salvar tarefa.",
        type: "error",
        error,
      });
    }
  };

  const handleDelete = async (id) => {
    // TODO: Implementar Modal de confirmação do Mantine
    if (!window.confirm("Excluir tarefa permanentemente?")) return;
    try {
      await api.delete(`/task/${id}`);
      setTasks((current) => current.filter((t) => t.id !== id));
      showDefaultNotification({ title: "Sucesso", message: "Tarefa excluída.", type: "success" });
    } catch (error) {
      showDefaultNotification({ title: "Erro", message: "Não foi possível excluir.", type: "error", error });
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Atualização otimista
    setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await api.patch(`/task/${taskId}/status`, { status: newStatus });
    } catch (error) {
      // Reverter atualização otimista
      setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)));
      showDefaultNotification({ title: "Erro", message: "Falha ao atualizar status", type: "error", error });
      // Não fazer re-fetch completo - o estado já foi revertido
    }
  };

  return (
    <>
      <div className="relative">
        <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

        <Group justify="space-between" mb="md">
          <Text size="sm" c="dimmed">
            Arraste as tarefas entre colunas para atualizar o status.
          </Text>
          {isManager && (
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
              Nova Tarefa
            </Button>
          )}
        </Group>

        <div className="w-full" style={{ overflowX: "auto" }}>
          <TaskKanbanBoard tasks={tasks} onStatusChange={handleStatusChange} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>

      <Modal
        opened={taskFormOpened}
        onClose={() => {
          closeTaskForm();
          setEditingTask(null);
        }}
        title={editingTask?.id ? "Editar Tarefa" : "Nova Tarefa"}
        centered
      >
        <LoadingOverlay visible={formLoading} overlayProps={{ radius: "sm", blur: 2 }} />
        {!formLoading && (
          <TaskForm
            initialValues={editingTask}
            onSubmit={handleSave}
            onCancel={() => {
              closeTaskForm();
              setEditingTask(null);
            }}
            users={users}
            projects={projectAsSelectOption}
          />
        )}
      </Modal>
    </>
  );
}

