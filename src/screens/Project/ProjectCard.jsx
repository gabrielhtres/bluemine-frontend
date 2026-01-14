import { Card, Text, Badge, Group, Avatar, Tooltip, ActionIcon, Menu } from "@mantine/core";
import { IconCalendar, IconDots, IconEdit, IconTrash, IconUserPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

export function ProjectCard({ project, onEdit, onDelete, onAssign }) {
  const statusColors = {
    planned: "gray",
    active: "blue",
    completed: "green",
    cancelled: "red",
  };

  const translateStatus = {
    planned: "Planejado",
    active: "Ativo",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder 
      className="flex flex-col h-full hover:shadow-md transition-shadow"
      style={{ marginTop: 20, marginBottom: 20 }}
    >
      <Group justify="space-between" mb="xs">
        <Badge color={statusColors[project.status]} variant="light">
          {translateStatus[project.status]}
        </Badge>
        <Menu withinPortal position="bottom-end" shadow="sm">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconUserPlus size={14} />} onClick={() => onAssign(project)}>
              Equipe
            </Menu.Item>
            <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(project)}>
              Editar
            </Menu.Item>
            <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(project.id)}>
              Excluir
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Text fw={500} size="lg" mt="md" className="line-clamp-1" title={project.name}>
        {project.name}
      </Text>

      <Text size="sm" c="dimmed" mt="xs" className="line-clamp-2 h-10">
        {project.description || "Sem descrição."}
      </Text>

      <Group mt="md" className="grow">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
            <IconCalendar size={14} />
            <span>{dayjs(project.endDate).format("DD/MM/YYYY")}</span>
        </div>
      </Group>

      <Card.Section inheritPadding py="xs" withBorder mt="20">
        <Group justify="space-between">
            <Tooltip.Group openDelay={300} closeDelay={100}>
            <Avatar.Group spacing="sm">
                {project.developers?.slice(0, 3).map((dev) => (
                    <Tooltip key={dev.id} label={dev.name}>
                        <Avatar
                          src={resolveAssetUrl(dev.avatarUrl)}
                          radius="xl"
                          size="sm"
                          alt={dev.name}
                          color="initials"
                        >
                          {dev.name[0]}
                        </Avatar>
                    </Tooltip>
                ))}
                {project.developers?.length > 3 && (
                    <Avatar radius="xl" size="sm">+{project.developers.length - 3}</Avatar>
                )}
            </Avatar.Group>
            </Tooltip.Group>
            {(!project.developers || project.developers.length === 0) && (
                <Text size="xs" c="dimmed">Sem equipe</Text>
            )}
        </Group>
      </Card.Section>
    </Card>
  );
}