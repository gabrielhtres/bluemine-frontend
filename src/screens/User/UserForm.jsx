import { useForm } from "@mantine/form";
import { TextInput, Select, Stack, Group, Button, FileInput, Avatar, Text, ActionIcon } from "@mantine/core";
import { IconArrowBackUp, IconX } from "@tabler/icons-react";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "developer", label: "Desenvolvedor" },
];

export function UserForm({ initialValues, onSubmit, onCancel, loading = false, currentAvatarUrl = null }) {
  const form = useForm({
    initialValues: initialValues || {
      name: "",
      email: "",
      role: "developer",
      avatarUrl: null,
      avatarAction: "keep",
    },
    validate: {
      name: (value) => (!value || value.trim().length < 3 ? "Nome mínimo de 3 caracteres" : null),
      email: (value) =>
        !value
          ? "Email é obrigatório"
          : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
            ? "Email inválido"
            : null,
      role: (value) => (!value ? "Selecione um cargo" : null),
    },
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="sm">
        <TextInput
          label="Nome"
          required
          placeholder="Ex: Maria Silva"
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Email"
          required
          placeholder="Ex: maria@empresa.com"
          {...form.getInputProps("email")}
        />
        <Select
          label="Cargo"
          required
          placeholder="Ex: Desenvolvedor"
          data={roleOptions}
          {...form.getInputProps("role")}
        />

        {currentAvatarUrl && !form.values.avatarUrl && form.values.avatarAction !== "remove" && (
          <Group align="center" gap="sm" mt={4}>
            <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
              <Avatar radius="xl" size={44} src={resolveAssetUrl(currentAvatarUrl)}>
                {String(form.values.name || "U").trim().charAt(0).toUpperCase()}
              </Avatar>
              <ActionIcon
                variant="filled"
                color="red"
                radius="xl"
                size="sm"
                style={{ position: "absolute", top: -6, right: -6 }}
                onClick={() => {
                  form.setFieldValue("avatarAction", "remove");
                  form.setFieldValue("avatarUrl", null);
                }}
                aria-label="Remover avatar"
              >
                <IconX size={14} />
              </ActionIcon>
            </div>
            <div>
              <Text size="sm" fw={600}>
                Avatar atual
              </Text>
              <Text size="xs" c="dimmed">
                Clique no X para remover ou selecione uma nova imagem abaixo para substituir.
              </Text>
            </div>
          </Group>
        )}

        {form.values.avatarAction === "remove" && (
          <Group justify="space-between" align="center" mt={4}>
            <div>
              <Text size="sm" fw={600}>
                Avatar será removido
              </Text>
              <Text size="xs" c="dimmed">
                Salve para confirmar, ou selecione uma nova imagem para substituir.
              </Text>
            </div>
            <Button
              variant="default"
              leftSection={<IconArrowBackUp size={16} />}
              onClick={() => form.setFieldValue("avatarAction", "keep")}
            >
              Desfazer
            </Button>
          </Group>
        )}

        <FileInput
          label="Avatar"
          placeholder="Ex: selecione uma imagem (PNG/JPG)"
          accept="image/*"
          clearable
          value={form.values.avatarUrl}
          onChange={(file) => {
            form.setFieldValue("avatarUrl", file);
            if (file) form.setFieldValue("avatarAction", "keep");
          }}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Salvar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
