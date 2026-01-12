import { useForm } from "@mantine/form";
import { TextInput, Textarea, Select, Button, Group, Stack } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useAuthStore } from "../../store/authStore";

// Recebe projects nas props agora
export function TaskForm({ initialValues, onSubmit, onCancel, users = [], projects = [] }) {
  const { permissions } = useAuthStore();
  const isManager = permissions.includes("tasks");
  const canEdit = isManager || !initialValues?.id; // Dev pode editar se for criação

  const form = useForm({
    initialValues: initialValues || {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      dueDate: new Date(),
      assigneeId: null,
      projectId: null, // <--- NOVO
    },
    validate: {
      title: (value) => (value.length < 3 ? "Título muito curto" : null),
      projectId: (value) => (!value ? "Selecione um projeto" : null), // Validação
      assigneeId: (value) => (!value ? "Selecione um responsável" : null), // Validação
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          label="Título"
          placeholder="O que precisa ser feito?"
          required
          disabled={!canEdit}
          {...form.getInputProps("title")}
        />
        
        {/* NOVO: Seleção de Projeto */}
        <Select
            label="Projeto"
            placeholder="Selecione o projeto"
            data={projects.map(p => ({ value: String(p.id), label: p.name }))}
            disabled={!canEdit} 
            searchable
            required
            {...form.getInputProps("projectId")}
        />

        <Textarea
          label="Descrição"
          minRows={3}
          disabled={!canEdit}
          {...form.getInputProps("description")}
        />

        <Group grow>
          <Select
            label="Prioridade"
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
            disabled={!canEdit}
            {...form.getInputProps("dueDate")}
          />
        </Group>

        <Select
            label="Responsável"
            placeholder="Selecione um dev"
            data={users.map(u => ({ value: String(u.id), label: u.name }))}
            disabled={!isManager} // Geralmente só gerente reatribui, mas ajuste se quiser
            searchable
            required
            {...form.getInputProps("assigneeId")}
        />

        {/* Status: Única coisa que talvez ambos mudem aqui, mas o card já resolve pro dev */}
        {isManager && (
             <Select
             label="Status Inicial"
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