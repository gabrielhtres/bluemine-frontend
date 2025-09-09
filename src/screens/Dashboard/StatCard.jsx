import { Paper, Text, Group } from "@mantine/core";
import classes from "./StatCard.module.css";

export function StatCard({ title, value, icon: Icon }) {
  return (
    <Paper withBorder p="md" radius="md" className={classes.card}>
      <Group justify="space-between">
        <Text size="xs" c="dimmed" className={classes.title}>
          {title}
        </Text>
        <Icon className={classes.icon} size="1.4rem" stroke={1.5} />
      </Group>

      <Group align="flex-end" gap="xs" mt={25}>
        <Text className={classes.value}>{value}</Text>
      </Group>
    </Paper>
  );
}
