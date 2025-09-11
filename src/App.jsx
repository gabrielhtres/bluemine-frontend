import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  Stack,
  Divider,
  UnstyledButton,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import {
  IconChartPie,
  IconGauge,
  IconUsers,
  IconListCheck,
  IconLogout,
  IconBox,
  IconUserCircle,
} from "@tabler/icons-react";
import api from "./services/api";

function App() {
  const [opened, { toggle }] = useDisclosure();
  const { permissions, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      permission: "dashboard",
      icon: IconChartPie,
    },
    { label: "Usuários", path: "/users", permission: "users", icon: IconUsers },
    {
      label: "Projetos",
      path: "/projects",
      permission: "projects",
      icon: IconGauge,
    },
    {
      label: "Tarefas",
      path: "/tasks",
      permission: "tasks",
      icon: IconListCheck,
    },
    {
      label: "Tarefas",
      path: "/my-tasks",
      permission: "toggle_tasks",
      icon: IconListCheck,
    },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Erro ao fazer logout no servidor:", error);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header className="border-b border-solid border-gray-200">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text fw={700}>Bluemine</Text>
          </Group>

          {user && (
            <Group gap="xs">
              <IconUserCircle size="1.5rem" stroke={1.5} />
              <Text fw={500} size="sm">
                {user}
              </Text>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack justify="space-between" style={{ height: "100%" }}>
          <Box>
            <Group px="xs" pb="md">
              <IconBox size="2rem" />
              <Text fw={500} size="lg">
                Menu Principal
              </Text>
            </Group>
            <Divider />

            {menuItems
              .filter((item) => permissions?.includes(item.permission))
              .map((item) => (
                <NavLink
                  key={item.label}
                  label={item.label}
                  onClick={() => navigate(item.path)}
                  leftSection={<item.icon size="1rem" stroke={1.5} />}
                  active={location.pathname === item.path}
                  variant="filled"
                  style={{ borderRadius: 4, marginTop: 4 }}
                />
              ))}
          </Box>

          <Box>
            <Divider mb="sm" />
            <UnstyledButton onClick={handleLogout} style={{ width: "100%" }}>
              <Group
                style={{
                  padding: "var(--mantine-spacing-xs)",
                  borderRadius: 4,
                }}
              >
                <IconLogout size="1rem" stroke={1.5} />
                <Text size="sm">Sair</Text>
              </Group>
            </UnstyledButton>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className="bg-gray-50">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
