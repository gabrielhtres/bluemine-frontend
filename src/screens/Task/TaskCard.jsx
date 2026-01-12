import { Card, Text, Badge, Group, Avatar, ActionIcon, Menu, Select } from "@mantine/core";
import { IconCalendar, IconDots, IconEdit, IconTrash, IconFlag } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useAuthStore } from "../../store/authStore"; // Importe seu store

const priorityColors = {
  low: "gray",
  medium: "blue",
  high: "orange",
  critical: "red",
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { permissions } = useAuthStore();
  const isManager = permissions.includes("tasks");

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="flex flex-col gap-3 mb-4 hover:shadow-md transition-shadow"
      style={{ marginTop: 20, marginBottom: 20 }}>
      <Group justify="space-between" align="start">
        <div className="flex-1">
            <Group gap="xs" mb="xs">
                <Badge color={priorityColors[task.priority]} variant="dot" size="xs">
                    {task.priority.toUpperCase()}
                </Badge>
                {dayjs(task.dueDate).isBefore(dayjs()) && task.status !== 'done' && (
                    <Badge color="red" variant="filled" size="xs">ATRASADO</Badge>
                )}
            </Group>
            <Text fw={600} size="md" className="leading-tight">{task.title}</Text>
        </div>

        {/* MENU: Só aparece para Gerentes */}
        {isManager && (
            <Menu withinPortal position="bottom-end">
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconDots size={16} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(task)}>
                Editar Detalhes
                </Menu.Item>
                <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(task.id)}>
                Excluir
                </Menu.Item>
            </Menu.Dropdown>
            </Menu>
        )}
      </Group>

      <Text size="sm" c="dimmed" className="line-clamp-2 text-xs">
        {task.description}
      </Text>

      <Group justify="space-between" align="end" mt="auto">
        <Group gap="xs">
            <Avatar size="sm" radius="xl" color="blue" name={task.assignee?.name}>
                {task.assignee?.name?.[0]}
            </Avatar>
            <div className="flex flex-col">
                <Text size="xs" c="dimmed">Responsável</Text>
                <Text size="xs" fw={500}>{task.assignee?.name || "Ninguém"}</Text>
            </div>
        </Group>

        {/* SELETOR DE STATUS:
            - Dev: Pode mudar livremente aqui.
            - Manager: Também pode, mas tem o menu completo acima.
         */}
        <Select 
            size="xs"
            w={130}
            value={task.status}
            data={[
                { value: 'todo', label: 'A Fazer' },
                { value: 'in_progress', label: 'Em Progresso' },
                { value: 'review', label: 'Revisão' },
                { value: 'done', label: 'Concluído' }
            ]}
            onChange={(val) => onStatusChange(task.id, val)}
            styles={{ input: { fontWeight: 500 } }}
            allowDeselect={false}
        />
      </Group>
    </Card>
  );
}