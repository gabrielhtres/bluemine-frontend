import { useAuthStore } from "../../store/authStore";
import { ManagerDashboard } from "./ManagerDashboard";
import { DeveloperDashboard } from "./DeveloperDashboard";
import { Center, Loader, Text } from "@mantine/core";

export default function DashboardPage() {
  const role = useAuthStore((state) => state.role);
  const roleLower = (role || "")?.toLowerCase?.() || "";

  if (!roleLower) {
    return (
      <Center h="100%">
        <Loader />
      </Center>
    );
  }

  if (roleLower === "admin" || roleLower === "manager") {
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
