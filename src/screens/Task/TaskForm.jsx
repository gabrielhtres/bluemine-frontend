import { useMemo } from "react";
import { useForm } from "@mantine/form";
import { TextInput, Textarea, Select, Button, Group, Stack, Alert } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useAuthStore } from "../../store/authStore";

export function TaskForm({ initialValues, onSubmit, onCancel, users = [], projects = [] }) {
  const { role } = useAuthStore();
  const roleLower = (role || "")?.toLowerCase?.() || "";
  const isManager = roleLower === "admin" || roleLower === "manager";
  const canEdit = isManager || !initialValues?.id;

  const form = useForm({
    initialValues: initialValues || {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      dueDate: new Date(),
      assigneeId: null,
      projectId: null,
    },
    validate: {
      title: (value) => (value.length < 3 ? "Título muito curto" : null),
      projectId: (value) => (!value ? "Selecione um projeto" : null),
      assigneeId: (value, values) => {
        if (!value) return "Selecione um responsável";

        const selectedProject = projects.find((p) => String(p.id) === String(values.projectId));
        const teamFromProject = Array.isArray(selectedProject?.developers) ? selectedProject.developers : null;
        const team = teamFromProject ?? (Array.isArray(users) ? users : []);
        if (!selectedProject) return null; // sem projeto não validamos equipe aqui (projectId já valida)

        if (!Array.isArray(team)) return null; // fallback defensivo
        if (team.length === 0) return "Projeto sem equipe. Adicione membros ao projeto para atribuir.";

        const allowed = new Set(team.map((d) => String(d.id)));
        if (!allowed.has(String(value))) return "Responsável deve fazer parte da equipe do projeto";
        return null;
      },
    },
  });

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === String(form.values.projectId)),
    [projects, form.values.projectId]
  );

  const assigneeOptions = useMemo(() => {
    const team = Array.isArray(selectedProject?.developers) ? selectedProject.developers : users;
    return (team || []).map((u) => ({ value: String(u.id), label: u.name }));
  }, [selectedProject, users]);

  const assigneeIsInTeam = useMemo(() => {
    const team = Array.isArray(selectedProject?.developers) ? selectedProject.developers : users;
    if (!Array.isArray(team)) return true;
    if (!form.values.assigneeId) return true;
    return team.some((d) => String(d.id) === String(form.values.assigneeId));
  }, [selectedProject, users, form.values.assigneeId]);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing="md">
        <TextInput
          label="Título"
          placeholder="Ex: Ajustar validação do formulário"
          required
          disabled={!canEdit}
          {...form.getInputProps("title")}
        />
        
        <Select
            label="Projeto"
            placeholder="Ex: Projeto Apollo"
            data={projects.map(p => ({ value: String(p.id), label: p.name }))}
            disabled={!canEdit} 
            searchable
            required
            {...form.getInputProps("projectId")}
        />

        {isManager &&
          form.values.projectId &&
          assigneeOptions.length === 0 && (
          <Alert color="yellow" title="Projeto sem equipe">
            Para atribuir um responsável, adicione membros à equipe do projeto.
          </Alert>
        )}

        {isManager && !assigneeIsInTeam && (
          <Alert color="red" title="Responsável inválido">
            O responsável atual não faz parte da equipe do projeto selecionado. Selecione um membro da equipe.
          </Alert>
        )}

        <Textarea
          label="Descrição"
          minRows={3}
          disabled={!canEdit}
          placeholder="Ex: Validar email e senha e exibir mensagens amigáveis"
          autosize
          minLength={3}
          description="Descreva o necessário para executar a tarefa."
          {...form.getInputProps("description")}
        />

        <Group grow>
          <Select
            label="Prioridade"
            placeholder="Ex: Média"
            data={[
              { value: "low", label: "Baixa" },
              { value: "medium", label: "Média" },
              { value: "high", label: "Alta" },
              { value: "critical", label: "Crítica" },
            ]}
            disabled={!canEdit}
            {...form.getInputProps("priority")}
          />
          <DatePickerInput
            label="Data de Entrega"
            valueFormat="DD/MM/YYYY"
            placeholder="Ex: 20/01/2026"
            disabled={!canEdit}
            {...form.getInputProps("dueDate")}
          />
        </Group>

        <Select
            label="Responsável"
            placeholder={selectedProject ? "Ex: Gabriel (membro do projeto)" : "Selecione um projeto primeiro"}
            data={assigneeOptions}
            disabled={!isManager || !form.values.projectId || assigneeOptions.length === 0}
            searchable
            required
            {...form.getInputProps("assigneeId")}
        />

        {isManager && (
             <Select
             label="Status Inicial"
             placeholder="Ex: Em Progresso"
             data={[
                 { value: 'todo', label: 'A Fazer' },
                 { value: 'in_progress', label: 'Em Progresso' },
                 { value: 'review', label: 'Revisão' },
                 { value: 'done', label: 'Concluído' }
             ]}
             {...form.getInputProps("status")}
         />
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar Tarefa</Button>
        </Group>
      </Stack>
    </form>
  );
}