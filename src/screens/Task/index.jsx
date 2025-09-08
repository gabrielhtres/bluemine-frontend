import { useEffect, useState } from "react";
import api from "../../services/api";
import DefaultCRUDPage from "../DefaultCRUDPage";

export default function TasksPage() {
  const [usersOptions, setUsersOptions] = useState([]);
  const [projectsOptions, setProjectsOptions] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user");
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
      title="Tasks"
      columns={[
        { key: "title", label: "Título" },
        { key: "description", label: "Descrição" },
        { key: "status", label: "Status" },
        { key: "priority", label: "Prioridade" },
        { key: "dueDate", label: "Data Limite" },
        { key: "projectId", label: "Projeto" },
        { key: "assigneeId", label: "Responsável" },
      ]}
      modalFields={[
        { key: "title", label: "Título" },
        { key: "description", label: "Descrição" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "todo", label: "Todo" },
            { value: "in_progress", label: "In Progress" },
            { value: "review", label: "Review" },
            { value: "done", label: "Done" },
          ],
        },
        {
          key: "priority",
          label: "Prioridade",
          type: "select",
          options: [
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical" },
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
