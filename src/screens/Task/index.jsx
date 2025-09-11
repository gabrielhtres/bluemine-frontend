import { useEffect, useState } from "react";
import api from "../../services/api";
import DefaultCRUDPage from "../DefaultCRUDPage";

export default function TasksPage() {
  const [usersOptions, setUsersOptions] = useState([]);
  const [projectsOptions, setProjectsOptions] = useState([]);

  const taskStatusTranslate = {
    todo: "A Fazer",
    in_progress: "Em Progresso",
    review: "Revisão",
    done: "Concluído",
  };

  const priorityTranslate = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/by-role/developer");
        const options = response.data.map((user) => ({
          value: user.id.toString(),
          label: user.name,
        }));
        setUsersOptions(options);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/project");
        const options = response.data.map((project) => ({
          value: project.id.toString(),
          label: project.name,
        }));
        setProjectsOptions(options);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <DefaultCRUDPage
      apiRoute="/task"
      title="Tarefas"
      columns={[
        { key: "title", label: "Título" },
        { key: "description", label: "Descrição" },
        {
          key: "status",
          label: "Status",
          transform: (status) => taskStatusTranslate[status] || status,
        },
        {
          key: "priority",
          label: "Prioridade",
          transform: (priority) => priorityTranslate[priority] || priority,
        },
        {
          key: "dueDate",
          label: "Data Limite",
          transform: (date) =>
            date ? new Date(date).toLocaleDateString() : "N/A",
        },
        {
          key: "projectId",
          label: "Projeto",
          transform: (_, item) => item.project?.name || "N/A",
        },
        {
          key: "assigneeId",
          label: "Responsável",
          transform: (_, item) => item.assignee?.name || "N/A",
        },
      ]}
      modalFields={[
        { key: "title", label: "Título" },
        { key: "description", label: "Descrição" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "todo", label: "A Fazer" },
            { value: "in_progress", label: "Em Progresso" },
            { value: "review", label: "Revisão" },
            { value: "done", label: "Concluído" },
          ],
        },
        {
          key: "priority",
          label: "Prioridade",
          type: "select",
          options: [
            { value: "low", label: "Baixa" },
            { value: "medium", label: "Média" },
            { value: "high", label: "Alta" },
            { value: "critical", label: "Crítica" },
          ],
        },
        { key: "dueDate", label: "Data Limite", type: "date" },
        {
          key: "projectId",
          label: "Projeto",
          type: "select",
          options: projectsOptions,
        },
        {
          key: "assigneeId",
          label: "Responsável",
          type: "select",
          options: usersOptions,
        },
      ]}
    />
  );
}
