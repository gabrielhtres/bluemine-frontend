import { useMemo, useState, useEffect } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Menu,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
  LoadingOverlay,
  MultiSelect,
  Switch,
  Select,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { IconDots, IconEdit, IconListCheck, IconPlus, IconTrash, IconUserPlus } from "@tabler/icons-react";
import api from "../../services/api";
import showDefaultNotification from "../../utils/showDefaultNotification";
import { logger } from "../../utils/logger";
import { prepareProjectPayload } from "../../utils/projectPayload";
import { KanbanBoard } from "./KanbanBoard";
import { ProjectDetailsDrawer } from "./ProjectDetailsDrawer";
import dayjs from "dayjs";
import { ProjectForm } from "./ProjectForm";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros (client-side)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [endRange, setEndRange] = useState([null, null]);
  const [withTeamOnly, setWithTeamOnly] = useState(false);
  
  const [isFormOpen, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [detailsTab, setDetailsTab] = useState("tasks");
  const [deleteConfirmOpen, { open: openDeleteConfirm, close: closeDeleteConfirm }] = useDisclosure(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [viewMode, setViewMode] = useState("list"); // list | kanban

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/project"); // Assume que o backend retorna os developers incluídos
      setProjects(data);
      return data;
    } catch (error) {
      logger.error(error);
      showDefaultNotification({ title: "Erro", message: "Falha ao carregar projetos", type: "error", error });
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = () => {
    setEditingProject(null);
    openForm();
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    openForm();
  };

  const handleSave = async (values) => {
    // Prepara payload removendo propriedades read-only
    const payload = prepareProjectPayload(values);

    try {
      if (editingProject) {
        await api.put(`/project/${editingProject.id}`, payload);
      } else {
        await api.post("/project", payload);
      }
      showDefaultNotification({ title: "Sucesso", message: "Projeto salvo.", type: "success" });
      closeForm();
      fetchProjects();
    } catch (error) {
        showDefaultNotification({ title: "Erro", message: "Erro ao salvar.", type: "error", error });
    }
  };

  const handleDeleteClick = (id) => {
    setProjectToDelete(id);
    openDeleteConfirm();
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    const id = projectToDelete;
    try {
        await api.delete(`/project/${id}`);
        setProjects(projects.filter(p => p.id !== id));
        showDefaultNotification({ title: "Sucesso", message: "Projeto removido.", type: "success" });
        closeDeleteConfirm();
        setProjectToDelete(null);
    } catch (err) {
        logger.error(err);
        showDefaultNotification({ title: "Erro", message: "Não foi possível excluir o projeto.", type: "error", error: err });
        // Reverter otimista em caso de erro
        fetchProjects();
        closeDeleteConfirm();
        setProjectToDelete(null);
    }
  }

  const handleAssignClick = (project) => {
    setSelectedProject(project);
    setDetailsTab("team");
    openDetails();
  }

  const handleTasksClick = (project) => {
    setSelectedProject(project);
    setDetailsTab("tasks");
    openDetails();
  }

  const handleOpenProject = (project) => {
    setSelectedProject(project);
    setDetailsTab("tasks");
    openDetails();
  };

  const handleStatusChange = async (projectId, newStatus) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Atualização otimista
    setProjects(current => current.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    
    try {
      // Tenta primeiro o endpoint específico de status, se não existir, usa PUT completo
      try {
        await api.patch(`/project/${projectId}/status`, { status: newStatus });
      } catch {
        // Se o endpoint de status não existir, atualiza o projeto completo
        // Prepara payload limpo apenas com os campos necessários
        const payload = prepareProjectPayload({
          ...project,
          status: newStatus,
        });
        await api.put(`/project/${projectId}`, payload);
      }
    } catch (error) {
      logger.error(error);
      // Reverter atualização otimista apenas se a requisição falhar
      setProjects(current => current.map(p => p.id === projectId ? { ...p, status: project.status } : p));
      showDefaultNotification({ title: "Erro", message: "Falha ao atualizar status", type: "error", error });
      // Não fazer re-fetch completo - o estado já foi revertido
    }
  }

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    const [start, end] = endRange || [null, null];

    return (projects || []).filter((p) => {
      if (q) {
        const hay = `${p.name || ""} ${p.description || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (statusFilter.length && !statusFilter.includes(p.status)) return false;

      if (withTeamOnly) {
        if (!p.developers || p.developers.length === 0) return false;
      }

      if ((start || end) && p.endDate) {
        if (start && dayjs(p.endDate).isBefore(dayjs(start), "day")) return false;
        if (end && dayjs(p.endDate).isAfter(dayjs(end), "day")) return false;
      }

      // Se o usuário filtrar por intervalo e o projeto não tem data fim, escondemos (mais previsível)
      if ((start || end) && !p.endDate) return false;

      return true;
    });
  }, [projects, search, statusFilter, endRange, withTeamOnly]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter([]);
    setEndRange([null, null]);
    setWithTeamOnly(false);
  };

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

  return (
    <div className="w-full p-8 relative min-h-screen bg-gray-50">
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <div className="flex justify-between items-center mb-10">
        <div>
            <Title order={2}>Projetos</Title>
            <p className="text-gray-500 text-sm mt-1">Gerencie o portfólio e equipas.</p>
        </div>
        <Group>
          <SegmentedControl
            value={viewMode}
            onChange={setViewMode}
            data={[
              { label: "Lista", value: "list" },
              { label: "Status", value: "kanban" },
            ]}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>Novo Projeto</Button>
        </Group>
      </div>

      <Paper withBorder radius="md" p="md" className="mb-6 bg-white">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <TextInput
            label="Buscar"
            placeholder="Ex: Projeto Apollo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 240 }}
          />

          <MultiSelect
            label="Status"
            placeholder="Ex: Ativo"
            data={[
              { value: "planned", label: "Planejado" },
              { value: "active", label: "Ativo" },
              { value: "completed", label: "Concluído" },
              { value: "cancelled", label: "Cancelado" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            style={{ minWidth: 240 }}
          />

          <DatePickerInput
            type="range"
            label="Data fim (intervalo)"
            placeholder="Ex: 10/01/2026 - 20/01/2026"
            value={endRange}
            onChange={setEndRange}
            valueFormat="DD/MM/YYYY"
            clearable
            style={{ minWidth: 260 }}
          />

          <Switch
            label="Somente com equipe"
            checked={withTeamOnly}
            onChange={(e) => setWithTeamOnly(e.currentTarget.checked)}
          />

          <Button variant="default" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </Group>
      </Paper>

      {viewMode === "list" ? (
        <Paper withBorder radius="md" p="sm" className="bg-white">
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Projeto</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Prazo</Table.Th>
                <Table.Th>Equipe</Table.Th>
                <Table.Th style={{ width: 60 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredProjects.map((project) => (
                <Table.Tr key={project.id} onClick={() => handleOpenProject(project)} style={{ cursor: "pointer" }}>
                  <Table.Td>
                    <div style={{ minWidth: 0 }}>
                      <Text fw={600} lineClamp={1}>
                        {project.name}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {project.description || "Sem descrição"}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[project.status] || "gray"} variant="light">
                      {statusLabels[project.status] || project.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {project.endDate ? dayjs(project.endDate).format("DD/MM/YYYY") : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {project.developers && project.developers.length > 0 ? (
                      <Tooltip.Group openDelay={300} closeDelay={100}>
                        <Avatar.Group spacing="sm">
                          {project.developers.slice(0, 3).map((dev) => (
                            <Tooltip key={dev.id} label={dev.name}>
                              <Avatar
                                radius="xl"
                                size="sm"
                                src={resolveAssetUrl(dev.avatarUrl)}
                              >
                                {dev.name?.[0]}
                              </Avatar>
                            </Tooltip>
                          ))}
                          {project.developers.length > 3 && (
                            <Avatar radius="xl" size="sm">
                              +{project.developers.length - 3}
                            </Avatar>
                          )}
                        </Avatar.Group>
                      </Tooltip.Group>
                    ) : (
                      <Text size="sm" c="dimmed">
                        Sem equipe
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Menu withinPortal position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconListCheck size={14} />} onClick={() => handleTasksClick(project)}>
                          Tarefas
                        </Menu.Item>
                        <Menu.Item leftSection={<IconUserPlus size={14} />} onClick={() => handleAssignClick(project)}>
                          Equipe
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleEdit(project)}>
                          Editar
                        </Menu.Item>
                        <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDeleteClick(project.id)}>
                          Excluir
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      ) : (
        <div className="w-full" style={{ overflowX: "auto" }}>
          <KanbanBoard
            projects={filteredProjects}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onAssign={handleAssignClick}
            onTasks={handleTasksClick}
          />
        </div>
      )}

      <Modal opened={isFormOpen} onClose={closeForm} title={editingProject ? "Editar Projeto" : "Novo Projeto"} centered>
        <ProjectForm
          initialValues={
            editingProject
              ? {
                  name: editingProject.name || '',
                  description: editingProject.description || '',
                  status: editingProject.status || 'planned',
                  startDate: editingProject.startDate ? new Date(editingProject.startDate) : null,
                  endDate: editingProject.endDate ? new Date(editingProject.endDate) : null,
                }
              : null
          }
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      </Modal>

      <ProjectDetailsDrawer
        opened={detailsOpened}
        onClose={() => {
          closeDetails();
          setSelectedProject(null);
        }}
        project={selectedProject}
        defaultTab={detailsTab}
        onTeamSaved={async () => {
          const updated = await fetchProjects();
          if (updated && selectedProject?.id) {
            const fresh = updated.find((p) => p.id === selectedProject.id);
            if (fresh) setSelectedProject(fresh);
          }
        }}
      />

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => {
          closeDeleteConfirm();
          setProjectToDelete(null);
        }}
        title="Confirmar exclusão"
        centered
      >
        <Stack gap="md">
          <Text>Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={() => {
              closeDeleteConfirm();
              setProjectToDelete(null);
            }}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleDelete}>
              Excluir
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}