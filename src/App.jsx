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
  Center,
  Loader,
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
} from "@tabler/icons-react";

function App() {
  const [opened, { toggle }] = useDisclosure();
  const { permissions, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      permission: "tasks",
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
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
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
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text fw={700}>Bluemine</Text>
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

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
