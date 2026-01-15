import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Stack,
  Center,
  Text,
  FileInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import showDefaultNotification, { extractErrorMessages } from "../../utils/showDefaultNotification";
import { logger } from "../../utils/logger";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: { name: "", email: "", password: "", avatarUrl: null },
    validate: {
      name: (value) => (!value || value.trim().length < 3 ? "Nome precisa ter ao menos 3 caracteres" : null),
      email: (value) => {
        if (!value) return "Email é obrigatório";
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "Email inválido";
        return null;
      },
      password: (value) => {
        if (!value) return "Senha é obrigatória";
        if (value.length < 6) return "Senha deve ter pelo menos 6 caracteres";
        return null;
      },
    },
    validateInputOnBlur: true,
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = form.validate();
    if (result.hasErrors) return;
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", form.values.name);
      payload.append("email", form.values.email);
      payload.append("password", form.values.password);
      if (form.values.avatarUrl) payload.append("avatarUrl", form.values.avatarUrl);

      await api.post("/auth/register", payload);
      showDefaultNotification({
        title: "Cadastro realizado!",
        message: "Você já pode fazer login com suas credenciais.",
        type: "success",
      });
      navigate("/login");
    } catch (err) {
      logger.error(err);

      const msgs = extractErrorMessages(err);
      const joined = msgs.join(" ").toLowerCase();
      if (joined.includes("email")) form.setFieldError("email", msgs[0] || "Email inválido");
      if (joined.includes("nome")) form.setFieldError("name", msgs[0] || "Nome inválido");
      if (joined.includes("senha") || joined.includes("password")) form.setFieldError("password", msgs[0] || "Senha inválida");
      if (joined.includes("avatarurl") || joined.includes("avatar") || joined.includes("imagem") || joined.includes("image")) {
        form.setFieldError("avatarUrl", msgs[0] || "Avatar inválido");
      }

      showDefaultNotification({
        title: "Erro no cadastro",
        error: err,
        message: "Não foi possível criar o usuário.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ height: "100vh", background: "#f5f5f5" }}>
      <Paper
        padding="xl"
        radius="md"
        withBorder
        style={{
          width: 400,
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          background: "#ffffff",
          padding: 30,
        }}
      >
        <Stack spacing="md">
          <Title order={2} align="center" style={{ color: "#1c7ed6" }}>
            Registre-se
          </Title>

          <form onSubmit={handleRegister}>
            <Stack>
              <TextInput
                label="Nome"
                placeholder="Ex: Maria Silva"
                {...form.getInputProps("name")}
                radius="sm"
              />
              <TextInput
                label="Email"
                placeholder="Ex: maria@empresa.com"
                {...form.getInputProps("email")}
                radius="sm"
              />
              <PasswordInput
                label="Senha"
                placeholder="Ex: ********"
                description="Mínimo de 6 caracteres"
                {...form.getInputProps("password")}
                radius="sm"
              />
              <FileInput
                label="Avatar"
                placeholder="Ex: selecione uma imagem (PNG/JPG)"
                accept="image/*"
                clearable
                {...form.getInputProps("avatarUrl")}
              />
              <Button
                type="submit"
                loading={loading}
                fullWidth
                style={{ backgroundColor: "#1c7ed6" }}
              >
                Registrar
              </Button>
            </Stack>
          </form>

          <Text size="sm" align="center" color="dimmed">
            Já possui uma conta? <Link to="/login">Faça login</Link>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
