import { useForm } from "@mantine/form";
import { Button, Group, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

const statusOptions = [
  { value: "planned", label: "Planejado" },
  { value: "active", label: "Ativo" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

export function ProjectForm({ initialValues, onSubmit, onCancel, loading = false }) {
  const form = useForm({
    initialValues: initialValues || {
      name: "",
      description: "",
      status: "planned",
      startDate: null,
      endDate: null,
    },
    validate: {
      name: (value) =>
        !value || value.trim().length < 3 ? "Nome precisa ter ao menos 3 caracteres" : null,
      status: (value) => (!value ? "Selecione um status" : null),
      endDate: (value, values) => {
        if (value && values.startDate && value < values.startDate) {
          return "Data de fim não pode ser antes do início";
        }
        return null;
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          label="Nome"
          required
          placeholder="Ex: Projeto Apollo"
          {...form.getInputProps("name")}
        />

        <Textarea
          label="Descrição"
          placeholder="Ex: Implementar backlog e acompanhar entregas"
          autosize
          minRows={3}
          {...form.getInputProps("description")}
        />

        <div className="grid grid-cols-2 gap-4">
          <DatePickerInput
            label="Início"
            placeholder="Ex: 10/01/2026"
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps("startDate")}
          />
          <DatePickerInput
            label="Fim"
            placeholder="Ex: 20/01/2026"
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps("endDate")}
          />
        </div>

        <Select
          label="Status"
          placeholder="Ex: Ativo"
          data={statusOptions}
          searchable
          {...form.getInputProps("status")}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Salvar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

