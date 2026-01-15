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
  Avatar,
  Badge,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import {
  IconChartPie,
  IconGauge,
  IconUsers,
  IconListCheck,
  IconLogout,
  IconBox,
} from "@tabler/icons-react";
import api from "./services/api";
import { resolveAssetUrl } from "./utils/resolveAssetUrl";
import { normalizeUser } from "./utils/normalizeUser";
import { canAccess, getRoleLower } from "./utils/permissions";
import { logger } from "./utils/logger";

function App() {
  const [opened, { toggle }] = useDisclosure();
  const { logout, user, accessToken, refreshToken, setAuth, role, hasHydrated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  const roleLower = getRoleLower(role || user?.role);
  const userName =
    typeof user === "string" ? user : user?.name || user?.email || "Usuário";
  const userAvatarSrc =
    typeof user === "object" && user
      ? resolveAssetUrl(user.avatarUrl)
      : null;

  const roleLabelMap = {
    admin: "Administrador",
    manager: "Gerente",
    developer: "Desenvolvedor",
  };

  const roleColorMap = {
    admin: "violet",
    manager: "blue",
    developer: "teal",
  };

  useEffect(() => {
    async function bootstrapAuth() {
      if (!hasHydrated) return;
      
      // Se já tem accessToken válido, não precisa fazer refresh
      if (accessToken) {
        setAuthChecked(true);
        return;
      }
      
      // Se não tem refreshToken, limpa tudo e redireciona
      if (!refreshToken) {
        logout();
        setAuthChecked(true);
        // Aguarda um pouco para garantir que o logout foi processado
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 100);
        return;
      }
      
      // Tenta fazer refresh do token
      try {
        const { data } = await api.post("/auth/refresh", {}, { headers: { Authorization: `Bearer ${refreshToken}` } });
        const normalizedUser = normalizeUser(data.user, data.avatarUrl);

        setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          permissions: data.permissions,
          role: data.role,
          user: normalizedUser,
        });
        setAuthChecked(true);
      } catch (err) {
        logger.error("Falha ao renovar sessão inicial", err);
        // Limpa a sessão completamente
        logout();
        setAuthChecked(true);
        // Redireciona para login após limpar a sessão
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 100);
      }
    }
    bootstrapAuth();
  }, [hasHydrated, accessToken, refreshToken, logout, setAuth, navigate]);

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
  ];

  const canAccessMenuItem = (itemPermission) => {
    return canAccess(role || user?.role, itemPermission);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      logger.error("Erro ao fazer logout no servidor:", error);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  if (!hasHydrated || !authChecked) {
    return (
      <AppShell padding="md">
        <Center h="100%">
          <Loader />
        </Center>
      </AppShell>
    );
  }

  return (
    <AppShell
      padding="md"
      header={{ height: 52 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header className="border-b border-solid border-gray-200 bg-white">
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={800} size="sm" style={{ letterSpacing: 0.2 }}>
              Bluemine
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className="bg-white">
        <Stack justify="space-between" style={{ height: "100%" }}>
          <Box style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Box
              className="rounded-xl border border-gray-200"
              style={{
                padding: 12,
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.10) 100%)",
              }}
            >
              <Group gap="sm" wrap="nowrap">
                <Avatar radius="xl" color="blue" variant="filled" src={userAvatarSrc}>
                  {String(userName || "U").trim().charAt(0).toUpperCase()}
                </Avatar>
                <Box style={{ minWidth: 0 }}>
                  <Text fw={700} size="sm" truncate>
                    {userName || "Usuário"}
                  </Text>
                  <Badge
                    mt={6}
                    size="sm"
                    variant="light"
                    color={roleColorMap[roleLower] || "gray"}
                  >
                    {roleLabelMap[roleLower] || "Sem perfil"}
                  </Badge>
                </Box>
              </Group>
            </Box>

            <Group px="xs" pt="md" pb="sm" gap="sm">
              <IconBox size="1.4rem" />
              <Text fw={600} size="sm" c="dimmed">
                Navegação
              </Text>
            </Group>
            <Divider mb="sm" />

            <ScrollArea style={{ flex: 1 }} type="hover" offsetScrollbars>
              <Box pr="xs">
                {menuItems
                  .filter((item) => canAccessMenuItem(item.permission))
                  .map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.label}
                        label={item.label}
                        onClick={() => navigate(item.path)}
                        leftSection={<item.icon size="1.05rem" stroke={1.6} />}
                        active={isActive}
                        variant="subtle"
                        className={
                          "rounded-lg transition-colors " +
                          (isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "hover:bg-gray-50")
                        }
                        style={{
                          marginTop: 6,
                          position: "relative",
                          overflow: "hidden",
                        }}
                        styles={{
                          root: {
                            paddingTop: 10,
                            paddingBottom: 10,
                          },
                          label: {
                            fontWeight: 600,
                            fontSize: 14,
                          },
                        }}
                      />
                    );
                  })}
              </Box>
            </ScrollArea>
          </Box>

          <Box>
            <Divider mb="sm" />
            <UnstyledButton
              onClick={handleLogout}
              style={{ width: "100%", borderRadius: 10 }}
              className="hover:bg-red-50 transition-colors"
            >
              <Group
                style={{
                  padding: "var(--mantine-spacing-sm)",
                }}
              >
                <IconLogout size="1.05rem" stroke={1.8} />
                <Text size="sm" fw={600}>
                  Sair
                </Text>
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
