import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function showDefaultNotification({
  title = "Ocorreu um erro",
  message = "Erro ao processar sua requisição. Tente novamente mais tarde.",
  type,
}) {
  notifications.show({
    title,
    message,
    color: type === "success" ? "green" : "red",
    icon: type === "success" ? <IconCheck /> : <IconX />,
  });
}
