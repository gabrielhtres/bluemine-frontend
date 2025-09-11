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
import showDefaultNotification from "../../utils/showDefaultNotification";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });
      showDefaultNotification({
        title: "Cadastro realizado!",
        message: "Você já pode fazer login com suas credenciais.",
        type: "success",
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
      showDefaultNotification({
        title: "Erro no cadastro",
        message:
          err.response?.data?.message.message ||
          "Não foi possível criar o usuário.",
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

          {error && (
            <Text color="red" align="center">
              {error}
            </Text>
          )}

          <form onSubmit={handleRegister}>
            <Stack>
              <TextInput
                label="Nome"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                radius="sm"
              />
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
                Registrar
              </Button>
            </Stack>
          </form>

          <Text size="sm" align="center" color="dimmed">
            Já possui uma conta? <a href="/login">Faça login</a>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
