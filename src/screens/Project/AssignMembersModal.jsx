import { useState, useEffect } from "react";
import { Modal, Stack, Group, Select, ActionIcon, Button, Loader } from "@mantine/core";
import { IconTrash, IconUserPlus } from "@tabler/icons-react";
import api from "../../services/api";
import showDefaultNotification from "../../utils/showDefaultNotification";

export function AssignMembersModal({ opened, onClose, project }) {
  const [assignments, setAssignments] = useState([]);
  const [allDevelopers, setAllDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carrega devs apenas quando o modal abre (Performance)
  useEffect(() => {
    if (opened) {
      api.get("/user/by-role/developer").then(res => {
          setAllDevelopers(res.data.map(d => ({ value: String(d.id), label: d.name })));
      });
      
      // Mapeia os existentes
      const existing = project.developers?.map(dev => ({
        localId: crypto.randomUUID(), // ID ESTÁVEL para o frontend
        developerId: String(dev.id),
        role: dev.ProjectMember.role
      })) || [];
      setAssignments(existing);
    }
  }, [opened, project]);

  const addRow = () => {
    setAssignments([...assignments, { localId: crypto.randomUUID(), developerId: null, role: "viewer" }]);
  };

  const removeRow = (localId) => {
    setAssignments(assignments.filter(a => a.localId !== localId));
  };

  const updateRow = (localId, field, value) => {
    setAssignments(assignments.map(a => a.localId === localId ? { ...a, [field]: value } : a));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        const payload = {
            projectId: project.id,
            assignments: assignments
                .filter(a => a.developerId) // Remove vazios
                .map(a => ({ developerId: Number(a.developerId), role: a.role }))
        };
        await api.post("/project-member", payload);
        showDefaultNotification({ title: "Sucesso", type: "success", message: "Equipe atualizada" });
        onClose();
    } catch (e) {
        showDefaultNotification({ title: "Erro", type: "error", message: "Erro ao salvar equipe" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Equipe: ${project.name}`} centered size="lg">
        <Stack>
            {assignments.map((item, idx) => (
                <Group key={item.localId} grow>
                    <Select 
                        placeholder="Developer" 
                        data={allDevelopers} 
                        value={item.developerId}
                        onChange={(v) => updateRow(item.localId, 'developerId', v)}
                        searchable
                        // Filtra devs já selecionados nas outras linhas
                        filter={({ options, search }) => {
                             const selectedIds = assignments.map(a => a.developerId);
                             return options.filter(opt => !selectedIds.includes(opt.value) || opt.value === item.developerId);
                        }}
                    />
                    <Select 
                        data={[{ value: 'viewer', label: 'Visualizador'}, { value: 'contributor', label: 'Colaborador'}, { value: 'maintainer', label: 'Mantenedor'}]}
                        value={item.role}
                        onChange={(v) => updateRow(item.localId, 'role', v)}
                    />
                    <ActionIcon color="red" variant="subtle" onClick={() => removeRow(item.localId)}>
                        <IconTrash size={18} />
                    </ActionIcon>
                </Group>
            ))}
            <Button variant="outline" leftSection={<IconUserPlus size={16}/>} onClick={addRow}>Adicionar Membro</Button>
            <Group justify="flex-end">
                <Button onClick={handleSave} loading={loading}>Salvar Alterações</Button>
            </Group>
        </Stack>
    </Modal>
  );
}