import { useEffect, useMemo, useState } from "react";
import { Stack, Group, Select, ActionIcon, Button } from "@mantine/core";
import { IconTrash, IconUserPlus } from "@tabler/icons-react";
import api from "../../services/api";
import showDefaultNotification from "../../utils/showDefaultNotification";

export function ProjectTeamEditor({ project, onSaved }) {
  const [assignments, setAssignments] = useState([]);
  const [allDevelopers, setAllDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);

  useEffect(() => {
    if (!project?.id) return;

    const existing =
      project.developers?.map((dev) => ({
        localId: crypto.randomUUID(),
        developerId: String(dev.id),
        role: dev.ProjectMember?.role || "viewer",
      })) || [];
    setAssignments(existing);
  }, [project]);

  useEffect(() => {
    if (!project?.id) return;
    if (allDevelopers.length) return;

    setLoadingDevelopers(true);
    api
      .get("/user/by-role/developer")
      .then((res) => {
        setAllDevelopers(res.data.map((d) => ({ value: String(d.id), label: d.name })));
      })
      .catch((error) => {
        showDefaultNotification({
          title: "Erro",
          type: "error",
          message: "Falha ao carregar developers",
          error,
        });
      })
      .finally(() => setLoadingDevelopers(false));
  }, [project, allDevelopers.length]);

  const selectedIds = useMemo(() => assignments.map((a) => a.developerId).filter(Boolean), [assignments]);

  const addRow = () => {
    setAssignments((curr) => [...curr, { localId: crypto.randomUUID(), developerId: null, role: "viewer" }]);
  };

  const removeRow = (localId) => {
    setAssignments((curr) => curr.filter((a) => a.localId !== localId));
  };

  const updateRow = (localId, field, value) => {
    setAssignments((curr) => curr.map((a) => (a.localId === localId ? { ...a, [field]: value } : a)));
  };

  const handleSave = async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const payload = {
        projectId: project.id,
        assignments: assignments
          .filter((a) => a.developerId)
          .map((a) => ({ developerId: Number(a.developerId), role: a.role })),
      };

      await api.post("/project-member", payload);
      showDefaultNotification({ title: "Sucesso", type: "success", message: "Equipe atualizada" });
      onSaved?.();
    } catch (error) {
      showDefaultNotification({ title: "Erro", type: "error", message: "Erro ao salvar equipe", error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      {assignments.map((item) => (
        <Group key={item.localId} grow align="flex-end">
          <Select
            label="Developer"
            placeholder={loadingDevelopers ? "Carregando..." : "Ex: Gabriel"}
            data={allDevelopers}
            value={item.developerId}
            onChange={(v) => updateRow(item.localId, "developerId", v)}
            searchable
            disabled={loadingDevelopers}
            filter={({ options }) => options.filter((opt) => !selectedIds.includes(opt.value) || opt.value === item.developerId)}
          />
          <Select
            label="Papel no projeto"
            placeholder="Ex: Colaborador"
            data={[
              { value: "viewer", label: "Visualizador" },
              { value: "contributor", label: "Colaborador" },
              { value: "maintainer", label: "Mantenedor" },
            ]}
            value={item.role}
            onChange={(v) => updateRow(item.localId, "role", v)}
          />
          <ActionIcon color="red" variant="subtle" onClick={() => removeRow(item.localId)} mb={4}>
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ))}

      <Button variant="outline" leftSection={<IconUserPlus size={16} />} onClick={addRow}>
        Adicionar membro
      </Button>

      <Group justify="flex-end">
        <Button onClick={handleSave} loading={loading}>
          Salvar equipe
        </Button>
      </Group>
    </Stack>
  );
}

