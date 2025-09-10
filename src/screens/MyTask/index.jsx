import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Title,
  Loader,
  Center,
  ScrollArea,
} from "@mantine/core";
import api from "../../services/api";
import { TaskCard } from "./TaskCard";
import classes from "./MyTasks.module.css";

const statusColumns = [
  { id: "todo", title: "A Fazer" },
  { id: "in_progress", title: "Em Progresso" },
  { id: "review", title: "Revisão" },
  { id: "done", title: "Concluído" },
];

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/task/my-tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    try {
      await api.patch(`/task/toggle-status/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setTasks(originalTasks);
    }
  };

  if (loading) {
    return (
      <Center h="100%">
        <Loader />
      </Center>
    );
  }

  return (
    <Container fluid>
      <Title order={2} mb="xl">
        Minhas Tarefas
      </Title>
      <div className={classes.board}>
        <Grid gutter="md">
          {statusColumns.map((column) => (
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }} key={column.id}>
              <div className={classes.column}>
                <Title order={4} className={classes.columnTitle}>
                  {column.title}
                </Title>
                <ScrollArea className={classes.columnContent}>
                  <div className={classes.tasksContainer}>
                    {tasks
                      .filter((task) => task.status === column.id)
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </Grid.Col>
          ))}
        </Grid>
      </div>
    </Container>
  );
}
