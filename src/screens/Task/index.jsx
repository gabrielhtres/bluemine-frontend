import { useCallback, useMemo, useState, useEffect } from "react";
import { Button, Modal, Title, LoadingOverlay, Group, Paper, TextInput, MultiSelect, Switch, SegmentedControl, Select } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { KanbanBoard } from "./KanbanBoard";
import { TaskForm } from "./TaskForm";
import showDefaultNotification from "../../utils/showDefaultNotification";
import dayjs from "dayjs";

export default function TasksPage() {
  const { role } = useAuthStore();
  const roleLower = (role || "")?.toLowerCase?.() || "";
  const isManager = roleLower === "admin" || roleLower === "manager";
  
  const [viewScope, setViewScope] = useState(isManager ? "all" : "mine");
  
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); 
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = viewScope === 'mine' ? '/task/my-tasks' : '/task';
      const { data } = await api.get(endpoint);
      setTasks(data);

    } catch (error) {
      console.error(error);
      showDefaultNotification({ 
        title: "Erro", 
        message: "Falha ao carregar dados", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  }, [viewScope]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); 

  const fetchFormDataIfNeeded = async () => {
    if (!isManager) return;
    if (projects.length && users.length) return;
    setFormLoading(true);
    try {
      const [projRes, userRes] = await Promise.all([
        api.get("/project"),
        api.get("/user/by-role/developer"),
      ]);
      setProjects(projRes.data);
      setUsers(userRes.data);
    } catch (error) {
      console.error(error);
      showDefaultNotification({
        title: "Erro",
        message: "Falha ao carregar dados do formulário",
        type: "error",
        error,
      });
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // filtros (client-side)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [dueRange, setDueRange] = useState([null, null]);
  const [projectFilter, setProjectFilter] = useState(null);
  const [assigneeFilter, setAssigneeFilter] = useState(null);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    const [start, end] = dueRange || [null, null];

    return (tasks || []).filter((t) => {
      if (q) {
        const hay = `${t.title || ""} ${t.description || ""} ${t.assignee?.name || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (statusFilter.length && !statusFilter.includes(t.status)) return false;
      if (priorityFilter.length && !priorityFilter.includes(t.priority)) return false;

      if (overdueOnly) {
        const isOverdue = t.dueDate && dayjs(t.dueDate).isBefore(dayjs(), "day") && t.status !== "done";
        if (!isOverdue) return false;
      }

      if (start && t.dueDate && dayjs(t.dueDate).isBefore(dayjs(start), "day")) return false;
      if (end && t.dueDate && dayjs(t.dueDate).isAfter(dayjs(end), "day")) return false;

      if (isManager && projectFilter) {
        if (String(t.projectId) !== String(projectFilter)) return false;
      }
      if (isManager && assigneeFilter) {
        if (String(t.assigneeId) !== String(assigneeFilter)) return false;
      }

      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter, overdueOnly, dueRange, projectFilter, assigneeFilter, isManager]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter([]);
    setPriorityFilter([]);
    setOverdueOnly(false);
    setDueRange([null, null]);
    setProjectFilter(null);
    setAssigneeFilter(null);
  };

  const handleCreate = async () => {
    try {
      await fetchFormDataIfNeeded();
      setEditingTask(null);
      open();
    } catch {
      // erro já notificado
    }
  };

  const handleEdit = async (task) => {
    try {
      await fetchFormDataIfNeeded();
      setEditingTask({
          ...task,
          dueDate: new Date(task.dueDate),
          assigneeId: task.assigneeId ? String(task.assigneeId) : null,
          projectId: task.projectId ? String(task.projectId) : null
      });
      open();
    } catch {
      // erro já notificado
    }
  };

  const handleSave = async (values) => {
    const payload = {
        ...values,
        projectId: Number(values.projectId),
        assigneeId: Number(values.assigneeId),
    };

    try {
      if (editingTask?.id) {
        await api.put(`/task/${editingTask.id}`, payload);
      } else {
        await api.post("/task", payload);
      }
      showDefaultNotification({ title: "Sucesso", message: "Tarefa salva.", type: "success" });
      close();
      fetchData();
    } catch (error) {
      console.error(error);
      showDefaultNotification({ 
          title: "Erro", 
          message: "Erro ao salvar.",
          type: "error",
          error,
      });
    }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Excluir tarefa permanentemente?")) return;
      try {
          await api.delete(`/task/${id}`);
          setTasks(tasks.filter(t => t.id !== id));
          showDefaultNotification({ title: "Sucesso", message: "Tarefa excluída.", type: "success" });
      } catch (error) { 
          console.error(error);
          showDefaultNotification({ title: "Erro", message: "Não foi possível excluir.", type: "error", error });
      }
  }

  const handleStatusChange = async (taskId, newStatus) => {
      setTasks(current => current.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      
      try {
          await api.patch(`/task/${taskId}/status`, { status: newStatus });
      } catch (error) {
          console.error(error);
          showDefaultNotification({ title: "Erro", message: "Falha ao atualizar status", type: "error", error });
          fetchData();
      }
  }

  return (
    <div className="w-full p-8 relative min-h-screen bg-gray-50">
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <Title order={2}>Tarefas</Title>
          <p className="text-gray-500 text-sm mt-1">
            {isManager ? "Gestão total do backlog." : "Visualize e atualize suas demandas."}
          </p>
        </div>
        
        <Group>
          {isManager && (
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
              Nova Tarefa
            </Button>
          )}
        </Group>
      </div>

      <Paper withBorder radius="md" p="md" className="mb-6 bg-white">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <TextInput
            label="Buscar"
            placeholder="Ex: validação, #123 ou Gabriel"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 240 }}
          />

          {isManager && (
            <SegmentedControl
              value={viewScope}
              onChange={setViewScope}
              data={[
                { label: "Todas", value: "all" },
                { label: "Minhas", value: "mine" },
              ]}
            />
          )}

          <MultiSelect
            label="Status"
            placeholder="Ex: Em Progresso"
            data={[
              { value: "todo", label: "A Fazer" },
              { value: "in_progress", label: "Em Progresso" },
              { value: "review", label: "Revisão" },
              { value: "done", label: "Concluído" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            style={{ minWidth: 220 }}
          />

          <MultiSelect
            label="Prioridade"
            placeholder="Ex: Média"
            data={[
              { value: "low", label: "Baixa" },
              { value: "medium", label: "Média" },
              { value: "high", label: "Alta" },
              { value: "critical", label: "Crítica" },
            ]}
            value={priorityFilter}
            onChange={setPriorityFilter}
            clearable
            style={{ minWidth: 220 }}
          />

          <DatePickerInput
            type="range"
            label="Entrega (intervalo)"
            placeholder="Ex: 10/01/2026 - 20/01/2026"
            value={dueRange}
            onChange={setDueRange}
            valueFormat="DD/MM/YYYY"
            clearable
            style={{ minWidth: 260 }}
          />

          <Switch
            label="Atrasadas"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.currentTarget.checked)}
          />

          {isManager && (
            <Select
              label="Projeto"
              placeholder="Ex: Projeto Apollo"
              data={projects.map((p) => ({ value: String(p.id), label: p.name }))}
              value={projectFilter ? String(projectFilter) : null}
              onDropdownOpen={fetchFormDataIfNeeded}
              onChange={(v) => setProjectFilter(v || null)}
              clearable
              searchable
              style={{ minWidth: 240 }}
            />
          )}

          {isManager && (
            <Select
              label="Responsável"
              placeholder="Ex: Gabriel"
              data={users.map((u) => ({ value: String(u.id), label: u.name }))}
              value={assigneeFilter ? String(assigneeFilter) : null}
              onDropdownOpen={fetchFormDataIfNeeded}
              onChange={(v) => setAssigneeFilter(v || null)}
              clearable
              searchable
              style={{ minWidth: 240 }}
            />
          )}

          <Button variant="default" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </Group>
      </Paper>

      {/* Kanban Board */}
      <div className="w-full" style={{ overflowX: 'auto' }}>
        <KanbanBoard
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal opened={opened} onClose={close} title={editingTask ? "Detalhes da Tarefa" : "Nova Tarefa"} centered>
        <LoadingOverlay visible={formLoading} overlayProps={{ radius: "sm", blur: 2 }} />
        {!formLoading && (
          <TaskForm 
              initialValues={editingTask} 
              onSubmit={handleSave} 
              onCancel={close} 
              users={users}
              projects={projects}
          />
        )}
      </Modal>
    </div>
  );
}