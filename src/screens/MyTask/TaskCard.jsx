import {
  Card,
  Text,
  Badge,
  Group,
  Select,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCalendar,
  IconUser,
  IconFlag,
} from "@tabler/icons-react";
import dayjs from "dayjs";

const priorityConfig = {
  low: { label: "Baixa", color: "gray", icon: <IconFlag size={14} /> },
  medium: { label: "Média", color: "yellow", icon: <IconFlag size={14} /> },
  high: { label: "Alta", color: "orange", icon: <IconFlag size={14} /> },
  critical: { label: "Crítica", color: "red", icon: <IconFlag size={14} /> },
};

const statusOptions = [
  { value: "todo", label: "A Fazer" },
  { value: "in_progress", label: "Em Progresso" },
  { value: "review", label: "Revisão" },
  { value: "done", label: "Concluído" },
];

export function TaskCard({ task, onStatusChange }) {
  const isOverdue = dayjs(task.dueDate).isBefore(dayjs(), "day");
  const priority = priorityConfig[task.priority] || priorityConfig.low;

  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
    >
      <Group justify="space-between" mb="xs">
        <Text fw={500} size="lg">
          {task.title}
        </Text>
        <Tooltip label={priority.label}>
          <Badge
            color={priority.color}
            variant="light"
            leftSection={priority.icon}
          >
            {priority.label}
          </Badge>
        </Tooltip>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        {task.description}
      </Text>

      <Group justify="space-between" align="center">
        <Group gap="xs">
          <IconCalendar size={16} stroke={1.5} />
          <Text size="sm">{dayjs(task.dueDate).format("DD/MM/YYYY")}</Text>
          {isOverdue && (
            <Tooltip label="Tarefa Atrasada">
              <IconAlertTriangle
                size={16}
                stroke={1.5}
                color="var(--mantine-color-red-6)"
              />
            </Tooltip>
          )}
        </Group>
      </Group>
      <Group justify="space-between" align="center" mt="md">
        <Text size="sm" c="dimmed">
          Projeto: {task.project?.name || "N/A"}
        </Text>
      </Group>

      <Card.Section withBorder inheritPadding py="xs" mt="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconUser size={16} stroke={1.5} />
            <Text size="sm" c="dimmed">
              {task.assignee?.name || "Não atribuído"}
            </Text>
          </Group>
          <Select
            data={statusOptions}
            value={task.status}
            onChange={(newStatus) => onStatusChange(task.id, newStatus)}
            variant="unstyled"
            size="xs"
            allowDeselect={false}
          />
        </Group>
      </Card.Section>
    </Card>
  );
}
