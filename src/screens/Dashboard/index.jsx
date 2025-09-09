import { useAuthStore } from "../../store/authStore";
import { ManagerDashboard } from "./ManagerDashboard";
import { DeveloperDashboard } from "./DeveloperDashboard";
import { Center, Loader, Text } from "@mantine/core";

export default function DashboardPage() {
  const permissions = useAuthStore((state) => state.permissions);

  if (!permissions || permissions.length === 0) {
    return (
      <Center h="100%">
        <Loader />
      </Center>
    );
  }

  if (permissions.includes("projects")) {
    return <ManagerDashboard />;
  }

  if (permissions.includes("toggle_tasks")) {
    return <DeveloperDashboard />;
  }

  return (
    <Center h="100%">
      <Text>Você não tem permissão para visualizar este dashboard.</Text>
    </Center>
  );
}
