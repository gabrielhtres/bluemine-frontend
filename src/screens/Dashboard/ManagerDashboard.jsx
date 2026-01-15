import { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Paper,
  Title,
  Text,
  Stack,
  Center,
  Loader,
  Group,
  MultiSelect,
  Select,
  Badge,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { BarChart, PieChart, DonutChart } from "@mantine/charts";
import api from "../../services/api";
import { logger } from "../../utils/logger";
import { StatCard } from "./StatCard";
import { IconBriefcase, IconClock, IconCircleCheck } from "@tabler/icons-react";
import showDefaultNotification from "../../utils/showDefaultNotification";

const statusColorMap = {
  planned: "gray.6",
  active: "blue.6",
  completed: "teal.6",
  cancelled: "red.6",
};

const statusLabelMap = {
  planned: "Planejado",
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const taskStatusLabelMap = {
  todo: "A Fazer",
  in_progress: "Em Progresso",
  review: "Revisão",
  done: "Concluído",
};

const taskStatusColorMap = {
  todo: "gray.5",
  in_progress: "blue.5",
  review: "orange.5",
  done: "teal.5",
};

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

const projectStatusLegendColor = {
  planned: "gray",
  active: "blue",
  completed: "teal",
  cancelled: "red",
};

const priorityLegendColor = {
  low: "gray",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

export function ManagerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // filtros locais (aplicados em cima do payload)
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
  const [projectFilter, setProjectFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    let timeoutId;

    async function fetchData() {
      setLoading(true);
      try {
        const params = {
          status: statusFilter?.length ? statusFilter.join(",") : undefined,
          priority: priorityFilter?.length ? priorityFilter.join(",") : undefined,
          project: projectFilter !== "all" ? projectFilter : undefined,
          startDate: dateRange?.[0] ? dateRange[0].toISOString() : undefined,
          endDate: dateRange?.[1] ? dateRange[1].toISOString() : undefined,
        };

        const { data } = await api.get("/dashboard", { params });
        setDashboard(data);
      } catch (error) {
        logger.error("Erro ao carregar dados do dashboard:", error);
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

    // Debounce pequeno para evitar spam quando o usuário mexe nos filtros
    timeoutId = setTimeout(fetchData, 250);
    return () => clearTimeout(timeoutId);
  }, [statusFilter, priorityFilter, projectFilter, dateRange]);

  const projectOptions = useMemo(() => {
    const names = new Set(
      (dashboard?.taskProgressByProject || []).map((t) => t.projectName || "Desconhecido")
    );
    return ["all", ...Array.from(names)].map((name) => ({
      value: name === "all" ? "all" : name,
      label: name === "all" ? "Todos" : name,
    }));
  }, [dashboard]);

  const projectStatusData = useMemo(
    () =>
      (dashboard?.projectStatus || []).map((s) => ({
        name: statusLabelMap[s.status] || s.status,
        value: Number(s.count || 0),
        color: statusColorMap[s.status] || "gray.6",
      })).filter((s) => s.value > 0),
    [dashboard]
  );

  const projectStatusLegend = useMemo(
    () =>
      (dashboard?.projectStatus || [])
        .filter((s) => Number(s.count || 0) > 0)
        .map((s) => ({
          key: s.status,
          label: statusLabelMap[s.status] || s.status,
          color: projectStatusLegendColor[s.status] || "gray",
        })),
    [dashboard]
  );

  const priorityData = useMemo(() => {
    const raw = dashboard?.taskPriority || dashboard?.tasksByPriority || [];

    const filtered = raw.filter((p) => {
      // se o backend mandar status aqui também, respeitamos os filtros
      if (p?.status && statusFilter.length && !statusFilter.includes(p.status)) return false;
      if (p?.status === "done") return false;
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

  const tasksPerProjectData = useMemo(() => {
    const agg = {};
    (dashboard?.taskProgressByProject || []).forEach((item) => {
      const name = item.projectName || "Desconhecido";
      if (projectFilter !== "all" && name !== projectFilter) return;
      if (statusFilter.length && !statusFilter.includes(item.status)) return;
      if (item.status === "done") return;

      const key = name;
      if (!agg[key]) {
        agg[key] = { project: key, todo: 0, in_progress: 0, review: 0 };
      }
      agg[key][item.status] = Number(item.count || 0);
    });
    return Object.values(agg);
  }, [dashboard, projectFilter, statusFilter]);

  const filteredPriorityData = useMemo(() => {
    if (!priorityFilter.length) return [];
    return priorityData.filter((p) => priorityFilter.includes(p.key));
  }, [priorityData, priorityFilter]);

  const donutShownData = useMemo(
    () => (filteredPriorityData.length ? filteredPriorityData : priorityData),
    [filteredPriorityData, priorityData]
  );

  const priorityLegend = useMemo(
    () =>
      donutShownData.map((p) => ({
        key: p.key,
        label: p.name,
        color: priorityLegendColor[p.key] || "gray",
      })),
    [donutShownData]
  );

  const filteredDeadlinesCount = useMemo(
    () => donutShownData.reduce((a, b) => a + (b.value || 0), 0),
    [donutShownData]
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
    <Stack gap="xl" className="p-4 md:p-6">
      <Title order={2} className="text-2xl font-bold text-gray-800">
        Dashboard Gerencial
      </Title>

      <Paper withBorder p="md" radius="md">
        <Group gap="md" align="flex-end" wrap="wrap">
          <MultiSelect
            label="Status das tarefas (não concluídas)"
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
            searchable
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
          <Select
            label="Projeto"
            placeholder="Ex: Projeto Apollo"
            data={projectOptions}
            value={projectFilter}
            onChange={(v) => setProjectFilter(v || "all")}
            searchable
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
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <StatCard
            title="Projetos Ativos"
            value={dashboard.activeProjects || 0}
            icon={IconBriefcase}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <StatCard
            title="Tarefas Atrasadas"
            value={dashboard.overdueTasks || 0}
            icon={IconClock}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <StatCard
            title="Concluídas na Semana"
            value={dashboard.completedThisWeek || 0}
            icon={IconCircleCheck}
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4}>Status dos Projetos</Title>
            {projectStatusData.length ? (
              <>
                <Group gap="md" mt="sm" wrap="wrap">
                  {projectStatusLegend.map((s) => (
                    <Badge key={s.key} variant="dot" color={s.color}>
                      {s.label}
                    </Badge>
                  ))}
                </Group>
                <PieChart withLabelsLine withLabels data={projectStatusData} mt="md" h={260} withTooltip={false} />
                <Stack gap={6} mt="sm">
                  {projectStatusData.map((s) => (
                    <Group key={s.name} justify="space-between">
                      <Text size="sm" c="dimmed">
                        {s.name}
                      </Text>
                      <Badge variant="light">{s.value}</Badge>
                    </Group>
                  ))}
                </Stack>
              </>
            ) : (
              <Text c="dimmed" mt="md">
                Sem dados de status de projetos.
              </Text>
            )}
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4}>Prioridade das Tarefas</Title>
            {donutShownData.length ? (
              <>
                <Group gap="md" mt="sm" wrap="wrap">
                  {priorityLegend.map((p) => (
                    <Badge key={p.key} variant="dot" color={p.color}>
                      {p.label}
                    </Badge>
                  ))}
                </Group>
                <DonutChart
                  data={donutShownData}
                  mt="md"
                  h={260}
                  chartLabel={`${filteredDeadlinesCount} tarefas`}
                  withTooltip={false}
                />
                <Stack gap={6} mt="sm">
                  {donutShownData.map((p) => (
                    <Group key={p.name} justify="space-between">
                      <Text size="sm" c="dimmed">
                        {p.name}
                      </Text>
                      <Badge variant="light">{p.value}</Badge>
                    </Group>
                  ))}
                </Stack>
              </>
            ) : (
              <Text c="dimmed" mt="md">
                Sem dados de prioridade.
              </Text>
            )}
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4}>Progresso das Tarefas por Projeto</Title>

            <Group gap="md" mt="sm" wrap="wrap">
              <Badge variant="dot" color="gray">
                {taskStatusLabelMap.todo}
              </Badge>
              <Badge variant="dot" color="blue">
                {taskStatusLabelMap.in_progress}
              </Badge>
              <Badge variant="dot" color="orange">
                {taskStatusLabelMap.review}
              </Badge>
            </Group>

            {tasksPerProjectData.length ? (
              <BarChart
                h={320}
                data={tasksPerProjectData}
                dataKey="project"
                type="default"
                withLegend={false}
                legendProps={{ wrapperStyle: { display: "none" } }}
                withTooltip={false}
                series={[
                  { name: "todo", color: taskStatusColorMap.todo, label: taskStatusLabelMap.todo },
                  { name: "in_progress", color: taskStatusColorMap.in_progress, label: taskStatusLabelMap.in_progress },
                  { name: "review", color: taskStatusColorMap.review, label: taskStatusLabelMap.review },
                ]}
                mt="md"
              />
            ) : (
              <Text c="dimmed" mt="md">
                Sem dados de tarefas por projeto.
              </Text>
            )}
          </Paper>
        </Grid.Col>
      </Grid>

    </Stack>
  );
}
