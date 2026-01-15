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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import showDefaultNotification, { extractErrorMessages } from "../../utils/showDefaultNotification";
import { normalizeUser } from "../../utils/normalizeUser";
import { logger } from "../../utils/logger";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => {
        if (!value) return "Email é obrigatório";
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "Email inválido";
        return null;
      },
      password: (value) => {
        if (!value) return "Senha é obrigatória";
        // No login, não precisamos validar o comprimento mínimo, apenas verificar se foi informada
        return null;
      },
    },
    validateInputOnBlur: true,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = form.validate();
    if (result.hasErrors) return;

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: form.values.email,
        password: form.values.password,
      });
      const { accessToken, refreshToken, permissions, role, user, avatarUrl } = response.data;

      const normalizedUser = normalizeUser(user, avatarUrl);

      setAuth({ accessToken, refreshToken, permissions, role, user: normalizedUser });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      logger.error(err);

      // tenta refletir no campo quando possível
      const msgs = extractErrorMessages(err).join(" ").toLowerCase();
      if (msgs.includes("email")) form.setFieldError("email", "Verifique o email informado");
      if (msgs.includes("senha") || msgs.includes("password")) form.setFieldError("password", "Verifique a senha informada");

      showDefaultNotification({
        title: "Erro de autenticação",
        error: err,
        message: "Email ou senha inválidos.",
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
            BLUEMINE
          </Title>

          <form onSubmit={handleLogin}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="Ex: maria@empresa.com"
                {...form.getInputProps("email")}
                radius="sm"
              />
              <PasswordInput
                label="Senha"
                placeholder="Ex: ********"
                {...form.getInputProps("password")}
                radius="sm"
              />
              <Button
                type="submit"
                loading={loading}
                fullWidth
                style={{ backgroundColor: "#1c7ed6" }}
              >
                Entrar
              </Button>
            </Stack>
          </form>

          <Text size="sm" align="center" color="dimmed">
            Não possui uma conta? <Link to="/register">Registre-se</Link>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
