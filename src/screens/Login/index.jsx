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
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import showDefaultNotification from "../../utils/showDefaultNotification";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, permissions, user } = response.data;

      setAuth({ accessToken, refreshToken, permissions, user });

      if (permissions.includes("manager") || permissions.includes("admin")) {
        navigate("/projects");
      } else {
        navigate("/my-tasks");
      }
    } catch (err) {
      console.error(err);
      showDefaultNotification({
        title: "Erro de autenticação",
        message:
          err.response?.data?.message.message || "Email ou senha inválidos.",
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
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                radius="sm"
              />
              <PasswordInput
                label="Senha"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            Não possui uma conta? <a href="/register">Registre-se</a>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
