import { useAuthStore } from "../../store/authStore";
import { ManagerDashboard } from "./ManagerDashboard";
import { DeveloperDashboard } from "./DeveloperDashboard";
import { Center, Loader, Text } from "@mantine/core";
import { getRoleLower, isManager } from "../../utils/permissions";

export default function DashboardPage() {
  const role = useAuthStore((state) => state.role);
  const roleLower = getRoleLower(role);

  if (!roleLower) {
    return (
      <Center h="100%">
        <Loader />
      </Center>
    );
  }

  if (isManager(role) || roleLower === "admin") {
    return <ManagerDashboard />;
  }

  if (roleLower === "developer") {
    return <DeveloperDashboard />;
  }

  return (
    <Center h="100%">
      <Text>Você não tem permissão para visualizar este dashboard.</Text>
    </Center>
  );
}
