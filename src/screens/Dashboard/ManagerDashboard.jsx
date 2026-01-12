import { useEffect, useState } from "react";
import { Grid, Paper, Title, Text, Stack, Center, Loader } from "@mantine/core";
import { BarChart, PieChart } from "@mantine/charts";
import api from "../../services/api";
import { StatCard } from "./StatCard";
import { IconBriefcase, IconClock, IconCircleCheck } from "@tabler/icons-react";

export function ManagerDashboard() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    overdueTasks: 0,
    completedThisWeek: 0,
  });
  const [projectStatusData, setProjectStatusData] = useState([]);
  const [tasksPerProjectData, setTasksPerProjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [projectRes, taskRes] = await Promise.all([
          api.get("/project/my-projects"),
          api.get("/task/tasks"),
        ]);

        const projects = projectRes.data;
        const tasks = taskRes.data;

        const activeProjects = projects.filter(
          (p) => p.status === "active"
        ).length;
        const overdueTasks = tasks.filter(
          (t) => new Date(t.dueDate) < new Date() && t.status !== "done"
        ).length;
        const completedThisWeek = tasks.filter(
          (t) =>
            t.status === "done" &&
            new Date(t.updatedAt) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        setStats({ activeProjects, overdueTasks, completedThisWeek });

        const statusCounts = projects.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {});
        setProjectStatusData([
          {
            name: "Planejado",
            value: statusCounts.planned || 0,
            color: "gray.6",
          },
          { name: "Ativo", value: statusCounts.active || 0, color: "blue.6" },
          {
            name: "Concluído",
            value: statusCounts.completed || 0,
            color: "teal.6",
          },
          {
            name: "Cancelado",
            value: statusCounts.cancelled || 0,
            color: "red.6",
          },
        ]);

        const activeProjectIds = projects
          .filter((p) => p.status === "active")
          .map((p) => p.id);
        const tasksInActiveProjects = tasks.filter((t) =>
          activeProjectIds.includes(t.projectId)
        );
        const tasksPerProject = tasksInActiveProjects.reduce((acc, task) => {
          const projectName =
            projects.find((p) => p.id === task.projectId)?.name ||
            "Desconhecido";
          if (!acc[projectName]) {
            acc[projectName] = { todo: 0, in_progress: 0, review: 0, done: 0 };
          }
          acc[projectName][task.status]++;
          return acc;
        }, {});

        setTasksPerProjectData(
          Object.keys(tasksPerProject).map((projectName) => ({
            project: projectName,
            todo: tasksPerProject[projectName].todo,
            in_progress: tasksPerProject[projectName].in_progress,
            review: tasksPerProject[projectName].review,
            done: tasksPerProject[projectName].done,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Center style={{ height: "100%" }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="xl" className="p-4 md:p-6">
      <Title order={2} className="text-2xl font-bold text-gray-800">
        Dashboard Gerencial
      </Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <StatCard
            title="Projetos Ativos"
            value={stats.activeProjects}
            icon={IconBriefcase}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <StatCard
            title="Tarefas Atrasadas"
            value={stats.overdueTasks}
            icon={IconClock}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <StatCard
            title="Concluídas na Semana"
            value={stats.completedThisWeek}
            icon={IconCircleCheck}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4}>Status dos Projetos</Title>
            <PieChart
              withLabelsLine
              withLabels
              data={projectStatusData}
              mt="md"
            />
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4}>Progresso das Tarefas por Projeto</Title>
            <BarChart
              h={300}
              data={tasksPerProjectData}
              dataKey="project"
              type="stacked"
              series={[
                { name: "todo", color: "gray.5", label: "A Fazer" },
                { name: "in_progress", color: "blue.5", label: "Em Progresso" },
                { name: "review", color: "orange.5", label: "Revisão" },
                { name: "done", color: "teal.5", label: "Concluído" },
              ]}
              mt="md"
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
