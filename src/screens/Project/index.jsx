import { useState, useEffect } from "react";
import { Button, Group, Modal, Stack, Title, TextInput, Select, Textarea, LoadingOverlay } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import api from "../../services/api";
import showDefaultNotification from "../../utils/showDefaultNotification";
import { ProjectCard } from "./ProjectCard"; // Cria este ficheiro
import { AssignMembersModal } from "./AssignMembersModal"; // Extrai a lógica do modal para fora

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [assignModalOpen, setAssignModalOpened] = useState(false);
  
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProjectForAssign, setSelectedProjectForAssign] = useState(null);

  const [formData, setFormData] = useState({ name: "", description: "", status: "planned", startDate: null, endDate: null });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/project"); // Assume que o backend retorna os developers incluídos
      setProjects(data);
    } catch (error) {
      console.error(error);
      showDefaultNotification({ title: "Erro", message: "Falha ao carregar projetos", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = () => {
    setEditingProject(null);
    setFormData({ name: "", description: "", status: "planned", startDate: null, endDate: null });
    openForm();
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      ...project,
      startDate: project.startDate ? new Date(project.startDate) : null,
      endDate: project.endDate ? new Date(project.endDate) : null,
    });
    openForm();
  };

  const handleSave = async () => {
    try {
      if (editingProject) {
        await api.put(`/project/${editingProject.id}`, formData);
      } else {
        await api.post("/project", formData);
      }
      showDefaultNotification({ title: "Sucesso", message: "Projeto salvo.", type: "success" });
      closeForm();
      fetchProjects();
    } catch (error) {
        showDefaultNotification({ title: "Erro", message: "Erro ao salvar.", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Certeza?")) return;
    try {
        await api.delete(`/project/${id}`);
        setProjects(projects.filter(p => p.id !== id));
        showDefaultNotification({ title: "Sucesso", message: "Projeto removido.", type: "success" });
    } catch (err) {
        console.error(err);
    }
  }

  const handleAssignClick = (project) => {
    setSelectedProjectForAssign(project);
    setAssignModalOpened(true);
  }

  return (
    <div className="w-full p-8 relative min-h-screen bg-gray-50">
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <div className="flex justify-between items-center mb-10">
        <div>
            <Title order={2}>Projetos</Title>
            <p className="text-gray-500 text-sm mt-1">Gerencie o portfólio e equipas.</p>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>Novo Projeto</Button>
      </div>

      <div className="flex flex-col gap-8 w-full">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onAssign={handleAssignClick}
          />
        ))}
      </div>

      <Modal opened={isFormOpen} onClose={closeForm} title={editingProject ? "Editar Projeto" : "Novo Projeto"} centered>
        <Stack>
            <TextInput label="Nome" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <Textarea label="Descrição" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
                <DatePickerInput label="Início" value={formData.startDate} onChange={(d) => setFormData({...formData, startDate: d})} />
                <DatePickerInput label="Fim" value={formData.endDate} onChange={(d) => setFormData({...formData, endDate: d})} />
            </div>
            <Select 
                label="Status" 
                data={[
                    { value: "planned", label: "Planejado" }, 
                    { value: "active", label: "Ativo" },
                    { value: "completed", label: "Concluído" },
                    { value: "cancelled", label: "Cancelado" }
                ]}
                value={formData.status}
                onChange={(v) => setFormData({...formData, status: v})}
            />
            <Button onClick={handleSave} fullWidth mt="md">Salvar</Button>
        </Stack>
      </Modal>

      {selectedProjectForAssign && (
        <AssignMembersModal 
            opened={assignModalOpen} 
            onClose={() => {
                setAssignModalOpened(false);
                fetchProjects();
            }} 
            project={selectedProjectForAssign} 
        />
      )}
    </div>
  );
}