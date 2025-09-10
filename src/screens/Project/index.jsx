import { useState, useEffect } from "react";
import { Button, Group, Modal, Stack, Select, ActionIcon } from "@mantine/core";
import { IconUserPlus, IconTrash } from "@tabler/icons-react";
import DefaultCRUDPage from "../DefaultCRUDPage";
import api from "../../services/api";

export default function ProjectsPage() {
  const translateStatus = {
    planned: "Planejado",
    active: "Ativo",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  const [assignModalOpened, setAssignModalOpened] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allDevelopers, setAllDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const roleOptions = [
    { value: "viewer", label: "Visualizador" },
    { value: "contributor", label: "Colaborador" },
    { value: "maintainer", label: "Mantenedor" },
  ];

  const fetchDevelopers = async () => {
    try {
      const response = await api.get("/user/by-role/developer");
      const formattedDevs = response.data.map((dev) => ({
        value: String(dev.id),
        label: dev.name,
      }));
      setAllDevelopers(formattedDevs);
    } catch (error) {
      console.error("Erro ao buscar desenvolvedores:", error);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleOpenAssignModal = (project) => {
    console.log("project", project);
    setSelectedProject(project);
    const initialAssignments =
      project.developers?.map((dev) => ({
        key: Math.random(),
        developerId: dev.id,
        role: dev.ProjectMember.role,
      })) || [];
    setAssignments(initialAssignments);
    setAssignModalOpened(true);
  };

  const handleAddAssignment = () => {
    setAssignments([
      ...assignments,
      { key: Math.random(), developerId: "", role: "viewer" },
    ]);
  };

  const handleRemoveAssignment = (key) => {
    setAssignments(assignments.filter((a) => a.key !== key));
  };

  const handleAssignmentChange = (key, field, value) => {
    setAssignments(
      assignments.map((a) => (a.key === key ? { ...a, [field]: value } : a))
    );
  };

  const handleAssignDevelopers = async () => {
    if (!selectedProject) return;
    setLoading(true);

    const payload = {
      projectId: selectedProject.id,
      assignments: assignments
        .filter((a) => a.developerId)
        .map(({ key, ...rest }) => rest),
    };

    try {
      const response = await api.post("/project-member", payload);
      console.log("response", response.data);
      setAssignModalOpened(false);
      setAssignments(response.data);
    } catch (error) {
      console.error("Erro ao atribuir desenvolvedores:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DefaultCRUDPage
        apiRoute="/project"
        title="Projetos"
        columns={[
          { key: "name", label: "Nome" },
          { key: "description", label: "Descrição" },
          {
            key: "status",
            label: "Status",
            transform: (status) => translateStatus[status] || status,
          },
          {
            key: "startDate",
            label: "Data Início",
            transform: (date) => new Date(date).toLocaleDateString(),
          },
          {
            key: "endDate",
            label: "Data Fim",
            transform: (date) => new Date(date).toLocaleDateString(),
          },
        ]}
        modalFields={[
          { key: "name", label: "Nome" },
          { key: "description", label: "Descrição" },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "planned", label: "Planejado" },
              { value: "active", label: "Ativo" },
              { value: "completed", label: "Concluído" },
              { value: "cancelled", label: "Cancelado" },
            ],
          },
          { key: "startDate", label: "Data Início", type: "date" },
          { key: "endDate", label: "Data Fim", type: "date" },
        ]}
        renderActions={(item, { handleEdit, handleDelete }) => (
          <Group gap="xs">
            <Button
              size="xs"
              variant="default"
              onClick={() => handleOpenAssignModal(item)}
            >
              <IconUserPlus size={14} />
            </Button>
            <Button size="xs" onClick={() => handleEdit(item)}>
              Editar
            </Button>
            <Button size="xs" color="red" onClick={() => handleDelete(item.id)}>
              Excluir
            </Button>
          </Group>
        )}
      />

      <Modal
        opened={assignModalOpened}
        onClose={() => setAssignModalOpened(false)}
        title={`Atribuir Desenvolvedores para: ${selectedProject?.name || ""}`}
        size="lg"
        centered
      >
        <Stack>
          {assignments.map((assignment, index) => (
            <Group key={assignment.key} grow align="flex-end">
              <Select
                label={index === 0 ? "Desenvolvedor" : null}
                placeholder="Selecione um dev"
                data={allDevelopers}
                value={String(assignment.developerId)}
                onChange={(value) =>
                  handleAssignmentChange(
                    assignment.key,
                    "developerId",
                    Number(value)
                  )
                }
                searchable
              />
              <Select
                label={index === 0 ? "Papel" : null}
                data={roleOptions}
                value={assignment.role}
                onChange={(value) =>
                  handleAssignmentChange(assignment.key, "role", value)
                }
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => handleRemoveAssignment(assignment.key)}
              >
                <IconTrash size={20} />
              </ActionIcon>
            </Group>
          ))}

          <Button
            leftSection={<IconUserPlus size={16} />}
            variant="outline"
            onClick={handleAddAssignment}
            fullWidth
            mt="md"
          >
            Adicionar Desenvolvedor
          </Button>

          <Group justify="flex-end" mt="xl">
            <Button
              variant="default"
              onClick={() => setAssignModalOpened(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAssignDevelopers} loading={loading}>
              Salvar Atribuições
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
