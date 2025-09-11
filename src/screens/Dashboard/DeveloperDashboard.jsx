import { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Title,
  Text,
  Stack,
  Card,
  Badge,
  Group,
  Center,
  Loader,
} from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import api from "../../services/api";
import { StatCard } from "./StatCard";
import { IconList, IconPlayerPlay, IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";

export function DeveloperDashboard() {
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyTasks() {
      setLoading(true);
      try {
        const response = await api.get("/task/my-tasks");
        setMyTasks(response.data);
      } catch (error) {
        console.error("Erro ao buscar minhas tarefas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTasks();
  }, []);

  const openTasks = myTasks.filter((t) => t.status !== "done");

  const stats = {
    todo: openTasks.filter((t) => t.status === "todo").length,
    inProgress: openTasks.filter((t) => t.status === "in_progress").length,
    overdue: openTasks.filter((t) => new Date(t.dueDate) < new Date()).length,
  };

  const priorityData = openTasks.reduce((acc, task) => {
    const existing = acc.find((item) => item.name === task.priority);
    if (existing) {
      existing.value++;
    } else {
      const colorMap = {
        low: "gray.5",
        medium: "yellow.5",
        high: "orange.5",
        critical: "red.5",
      };
      acc.push({
        name: task.priority,
        value: 1,
        color: colorMap[task.priority],
      });
    }
    return acc;
  }, []);

  const upcomingTasks = openTasks
    .filter((t) => t.dueDate && dayjs(t.dueDate).isAfter(dayjs()))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  if (loading) {
    return (
      <Center style={{ height: "100%" }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <Title order={2}>Meu Dashboard</Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard
            title="Tarefas a Fazer"
            value={stats.todo}
            icon={IconList}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard
            title="Em Progresso"
            value={stats.inProgress}
            icon={IconPlayerPlay}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard title="Atrasadas" value={stats.overdue} icon={IconClock} />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4}>Minhas Tarefas por Prioridade</Title>
            <DonutChart
              data={priorityData}
              mt="md"
              chartLabel={`${openTasks.length} Abertas`}
            />
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4}>Próximos Vencimentos</Title>
            <Stack mt="md">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <Card withBorder padding="sm" radius="sm" key={task.id}>
                    <Group justify="space-between">
                      <Text fw={500}>{task.title}</Text>
                      <Badge color="blue">
                        {dayjs(task.dueDate).format("DD/MM/YYYY")}
                      </Badge>
                    </Group>
                  </Card>
                ))
              ) : (
                <Text c="dimmed">Nenhuma tarefa com vencimento próximo.</Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
