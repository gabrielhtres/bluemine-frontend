import { Badge, Drawer, Group, Stack, Tabs, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { ProjectTasksPanel } from "./ProjectTasksPanel";
import { ProjectTeamEditor } from "./ProjectTeamEditor";

const statusLabels = {
  planned: "Planejado",
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusColors = {
  planned: "gray",
  active: "blue",
  completed: "teal",
  cancelled: "red",
};

export function ProjectDetailsDrawer({ opened, onClose, project, defaultTab = "tasks", onTeamSaved }) {
  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="xl" title="Projeto" padding="lg">
      {!project ? (
        <Text c="dimmed">Selecione um projeto.</Text>
      ) : (
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div style={{ minWidth: 0 }}>
              <Title order={3} style={{ lineHeight: 1.2 }}>
                {project.name}
              </Title>
              {project.description && (
                <Text size="sm" c="dimmed" lineClamp={2} mt={4}>
                  {project.description}
                </Text>
              )}
            </div>
            <Badge color={statusColors[project.status] || "gray"} variant="light" size="lg">
              {statusLabels[project.status] || project.status}
            </Badge>
          </Group>

          <Group gap="xl">
            {project.endDate && (
              <Text size="sm" c="dimmed">
                Prazo: {dayjs(project.endDate).format("DD/MM/YYYY")}
              </Text>
            )}
          </Group>

          <Tabs defaultValue={defaultTab} keepMounted={false}>
            <Tabs.List>
              <Tabs.Tab value="tasks">Tarefas</Tabs.Tab>
              <Tabs.Tab value="team">Equipe</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="tasks" pt="md">
              <ProjectTasksPanel project={project} />
            </Tabs.Panel>

            <Tabs.Panel value="team" pt="md">
              <ProjectTeamEditor project={project} onSaved={onTeamSaved} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      )}
    </Drawer>
  );
}

