import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

function normalizeToStringArray(value, depth = 0) {
  if (depth > 4 || value == null) return [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((v) => normalizeToStringArray(v, depth + 1));
  }

  if (typeof value === "object") {
    // Prioriza chaves mais comuns em APIs
    const preferredKeys = ["message", "messages", "error", "errors", "detail"];
    for (const key of preferredKeys) {
      if (key in value) {
        const found = normalizeToStringArray(value[key], depth + 1);
        if (found.length) return found;
      }
    }

    // Fallback: varre valores do objeto
    return Object.values(value).flatMap((v) => normalizeToStringArray(v, depth + 1));
  }

  return [];
}

export function extractErrorMessages(error) {
  if (!error) return [];

  const candidates = [
    error?.response?.data?.message, // string | array | object
    error?.response?.data?.error,
    error?.response?.data,
    error?.message,
  ];

  for (const candidate of candidates) {
    const msgs = normalizeToStringArray(candidate);
    if (msgs.length) return msgs;
  }

  return [];
}

export default function showDefaultNotification({
  title = "Ocorreu um erro",
  message,
  type,
  error,
}) {
  const fallback = "Erro ao processar sua requisição. Tente novamente mais tarde.";

  // Se vier erro da API, preferimos mostrar as mensagens retornadas (string ou array)
  const apiMessages = extractErrorMessages(error);
  const apiMessageText = apiMessages.length ? apiMessages.join("\n") : "";

  const baseMessage = message || "";
  const finalMessage =
    type === "success"
      ? baseMessage
      : apiMessageText
        ? baseMessage && baseMessage !== apiMessageText
          ? `${baseMessage}\n${apiMessageText}`
          : apiMessageText
        : baseMessage || fallback;

  notifications.show({
    title,
    message: finalMessage,
    color: type === "success" ? "green" : "red",
    icon: type === "success" ? <IconCheck /> : <IconX />,
  });
}
