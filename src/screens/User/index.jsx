import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Group,
  Loader,
  Paper,
  Table,
  Text,
  TextInput,
  Title,
  Select,
  Stack,
  Center,
  Modal,
  Button,
} from "@mantine/core";
import { IconSearch, IconEdit } from "@tabler/icons-react";
import api from "../../services/api";
import showDefaultNotification from "../../utils/showDefaultNotification";
import { logger } from "../../utils/logger";
import { UserForm } from "./UserForm";

const roleTranslate = {
  admin: "Administrador",
  manager: "Gerente",
  developer: "Desenvolvedor",
};

const roleOptions = [
  { value: "all", label: "Todos" },
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "developer", label: "Desenvolvedor" },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/user");
      setUsers(data);
    } catch (error) {
      logger.error(error);
      showDefaultNotification({
        title: "Erro",
        message: "Falha ao carregar usuários",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = role === "all" || u.role === role;
      const term = search.trim().toLowerCase();
      const matchSearch =
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term);
      return matchRole && matchSearch;
    });
  }, [users, role, search]);

  return (
    <div className="w-full p-6 md:p-8 bg-gray-50 min-h-screen">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Usuários</Title>
            <Text c="dimmed" size="sm">
              Gerencie os usuários e seus perfis de acesso.
            </Text>
          </div>
        </Group>

        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group gap="md" align="flex-end" wrap="wrap">
            <TextInput
              label="Buscar"
              placeholder="Ex: Maria ou maria@empresa.com"
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              w={260}
            />
            <Select
              label="Cargo"
              placeholder="Ex: Desenvolvedor"
              data={roleOptions}
              value={role}
              onChange={(v) => setRole(v || "all")}
              w={200}
            />
          </Group>
        </Paper>

        <Paper withBorder radius="md" shadow="sm" p="md">
          {loading ? (
            <Center py="lg">
              <Loader />
            </Center>
          ) : filteredUsers.length === 0 ? (
            <Center py="lg">
              <Text c="dimmed">Nenhum usuário encontrado.</Text>
            </Center>
          ) : (
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nome</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Cargo</Table.Th>
                  <Table.Th style={{ width: 90 }} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Text fw={600}>{user.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{user.email}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">
                        {roleTranslate[user.role] || user.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="light"
                        size="xs"
                        leftSection={<IconEdit size={14} />}
                        onClick={() => {
                          setEditingUser(user);
                        }}
                      >
                        Editar
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>

      <Modal
        opened={!!editingUser}
        onClose={() => {
          setEditingUser(null);
        }}
        title="Editar Usuário"
        centered
      >
        {editingUser && (
          <UserForm
            initialValues={{
              name: editingUser.name || "",
              email: editingUser.email || "",
              role: editingUser.role || "developer",
              avatarUrl: null,
              avatarAction: "keep",
            }}
            currentAvatarUrl={editingUser.avatarUrl || null}
            loading={saving}
            onCancel={() => setEditingUser(null)}
            onSubmit={async (values) => {
              setSaving(true);
              try {
                const payload = new FormData();
                payload.append("name", values.name);
                payload.append("email", values.email);
                payload.append("role", values.role);

                // Regras:
                // - manter avatar atual: NÃO enviar avatarUrl
                // - remover (se existia): enviar avatarUrl = ""
                // - adicionar/substituir: enviar avatarUrl = File
                if (values.avatarUrl) payload.append("avatarUrl", values.avatarUrl);
                else if (values.avatarAction === "remove" && editingUser.avatarUrl) payload.append("avatarUrl", "");

                await api.put(`/user/${editingUser.id}`, payload);
                showDefaultNotification({ title: "Sucesso", message: "Usuário atualizado.", type: "success" });
                setEditingUser(null);
                fetchUsers();
              } catch (error) {
                logger.error(error);
                showDefaultNotification({ title: "Erro", message: "Falha ao atualizar usuário.", type: "error", error });
              } finally {
                setSaving(false);
              }
            }}
          />
        )}
      </Modal>
    </div>
  );
}
