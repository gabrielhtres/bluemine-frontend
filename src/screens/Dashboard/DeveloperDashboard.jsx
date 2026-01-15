import { useEffect, useMemo, useState } from "react";
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
  MultiSelect,
} from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { DatePickerInput } from "@mantine/dates";
import api from "../../services/api";
import { logger } from "../../utils/logger";
import { StatCard } from "./StatCard";
import { IconList, IconPlayerPlay, IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";
import showDefaultNotification from "../../utils/showDefaultNotification";

const priorityColorMap = {
  low: "gray.5",
  medium: "yellow.5",
  high: "orange.5",
  critical: "red.5",
};

const priorityLabelMap = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

const priorityLegendColor = {
  low: "gray",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

export function DeveloperDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState([
    "todo",
    "in_progress",
    "review",
  ]);
  const [priorityFilter, setPriorityFilter] = useState([
    "low",
    "medium",
    "high",
    "critical",
  ]);
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    let timeoutId;

    async function fetchDashboard() {
      setLoading(true);
      try {
        const params = {
          status: statusFilter?.length ? statusFilter.join(",") : undefined,
          priority: priorityFilter?.length ? priorityFilter.join(",") : undefined,
          startDate: dateRange?.[0] ? dateRange[0].toISOString() : undefined,
          endDate: dateRange?.[1] ? dateRange[1].toISOString() : undefined,
        };
        const { data } = await api.get("/dashboard", { params });
        setDashboard(data);
      } catch (error) {
        logger.error("Erro ao buscar dashboard:", error);
        showDefaultNotification({
          title: "Erro",
          message: "Não foi possível carregar o dashboard",
          type: "error",
          error,
        });
      } finally {
        setLoading(false);
      }
    }

    timeoutId = setTimeout(fetchDashboard, 250);
    return () => clearTimeout(timeoutId);
  }, [statusFilter, priorityFilter, dateRange]);

  const filteredDeadlines = useMemo(() => {
    if (!dashboard?.upcomingDeadlines) return [];
    return dashboard.upcomingDeadlines.filter((task) => {
      if (!task.dueDate) return false;
      if (statusFilter.length && !statusFilter.includes(task.status)) return false;
      if (priorityFilter.length && !priorityFilter.includes(task.priority)) return false;
      const due = new Date(task.dueDate);
      if (dateRange?.[0] && due < dateRange[0]) return false;
      if (dateRange?.[1] && due > dateRange[1]) return false;
      return true;
    });
  }, [dashboard, statusFilter, priorityFilter, dateRange]);

  const priorityData = useMemo(() => {
    const raw = dashboard?.tasksByPriority || dashboard?.taskPriority || [];
    // Se o backend mandar status por prioridade, filtramos aqui (ex: excluir done)
    const filtered = raw.filter((p) => {
      if (p?.status) {
        if (!statusFilter.includes(p.status)) return false;
        if (p.status === "done") return false;
      }
      if (priorityFilter?.length && p?.priority && !priorityFilter.includes(p.priority)) return false;
      return true;
    });

    const agg = filtered.reduce((acc, item) => {
      const key = item.priority;
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + Number(item.count || 0);
      return acc;
    }, {});

    return Object.entries(agg)
      .map(([priority, count]) => ({
        key: priority,
        name: priorityLabelMap[priority] || priority,
        value: Number(count || 0),
        color: priorityColorMap[priority] || "blue.5",
      }))
      .filter((p) => p.value > 0);
  }, [dashboard, statusFilter, priorityFilter]);

  const totalPriorityTasks = useMemo(
    () => priorityData.reduce((a, b) => a + (b.value || 0), 0),
    [priorityData]
  );



  if (loading) {
    return (
      <Center style={{ height: "100%" }}>
        <Loader />
      </Center>
    );
  }

  if (!dashboard) {
    return (
      <Center style={{ height: "100%" }}>
        <Text c="dimmed">Sem dados para exibir.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <Title order={2}>Meu Dashboard</Title>

      <Paper withBorder p="md" radius="md">
        <Group gap="md" align="flex-end" wrap="wrap">
          <MultiSelect
            label="Status (não concluídas)"
            placeholder="Ex: Em Progresso"
            data={[
              { value: "todo", label: "A Fazer" },
              { value: "in_progress", label: "Em Progresso" },
              { value: "review", label: "Revisão" },
              { value: "done", label: "Concluído", disabled: true },
            ]}
            value={statusFilter}
            onChange={(v) => {
              const cleaned = (v || []).filter((s) => s !== "done");
              setStatusFilter(cleaned.length ? cleaned : ["todo", "in_progress", "review"]);
            }}
            clearable
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
          />
          <DatePickerInput
            type="range"
            label="Prazo (intervalo)"
            placeholder="Ex: 10/01/2026 - 20/01/2026"
            value={dateRange}
            onChange={setDateRange}
            allowSingleDateInRange
            valueFormat="DD/MM/YYYY"
          />
        </Group>
      </Paper>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard
            title="Tarefas a Fazer"
            value={dashboard.todoTasks || 0}
            icon={IconList}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard
            title="Em Progresso"
            value={dashboard.inProgressTasks || 0}
            icon={IconPlayerPlay}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard
            title="Atrasadas"
            value={dashboard.overdueTasks || 0}
            icon={IconClock}
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4}>Minhas Tarefas por Prioridade</Title>
            {priorityData.length ? (
              <>
                <Group gap="md" mt="sm" wrap="wrap">
                  {priorityData.map((p) => (
                    <Badge key={p.key} variant="dot" color={priorityLegendColor[p.key] || "gray"}>
                      {p.name}
                    </Badge>
                  ))}
                </Group>
                <DonutChart
                  data={priorityData}
                  h={240}
                  mt="md"
                  chartLabel={`${totalPriorityTasks} abertas`}
                  withTooltip={false}
                />
              </>
            ) : (
              <Text c="dimmed" mt="md">
                Sem dados de prioridade.
              </Text>
            )}

            {priorityData.length ? (
              <Stack gap={6} mt="sm">
                {priorityData.map((p) => (
                  <Group key={p.name} justify="space-between">
                    <Text size="sm" c="dimmed">
                      {p.name}
                    </Text>
                    <Badge variant="light">{p.value}</Badge>
                  </Group>
                ))}
              </Stack>
            ) : null}
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4}>Próximos Vencimentos</Title>
            <Stack mt="md">
              {filteredDeadlines.length > 0 ? (
                filteredDeadlines.map((task) => (
                  <Card withBorder padding="sm" radius="sm" key={task.id}>
                    <Group justify="space-between">
                      <div>
                        <Group gap={8} align="center">
                          <Badge
                            variant="filled"
                            size="sm"
                            color={priorityLegendColor[task.priority] || "gray"}
                          >
                            #{task.id}
                          </Badge>
                          <Text fw={500}>{task.title}</Text>
                        </Group>
                        {task.project?.name && (
                          <Text size="xs" c="dimmed">
                            {task.project.name}
                          </Text>
                        )}
                      </div>
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
