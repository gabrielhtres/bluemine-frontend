import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Group,
  Modal,
  TextInput,
  Stack,
  Select,
} from "@mantine/core";
import api from "../../services/api";
import { DatePickerInput } from "@mantine/dates";

export default function DefaultCRUDPage({
  apiRoute,
  columns,
  modalFields,
  title = "Gestão",
  renderActions,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({});

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await api.get(apiRoute);
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiRoute]);

  const handleAdd = () => {
    setEditingItem(null);
    const emptyValues = {};
    modalFields.forEach((f) => (emptyValues[f.key] = ""));
    setFormValues(emptyValues);
    setOpened(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const values = {};
    modalFields.forEach((f) => {
      if (f.type === "date" && item[f.key]) {
        values[f.key] = new Date(item[f.key]);
      } else {
        values[f.key] = item[f.key] || "";
      }
    });
    setFormValues(values);
    setOpened(true);
  };

  const handleSave = async () => {
    try {
      const submissionData = { ...formValues };

      modalFields.forEach((field) => {
        if (
          field.type === "date" &&
          submissionData[field.key] instanceof Date
        ) {
          submissionData[field.key] = submissionData[field.key].toISOString();
        }
      });

      if (editingItem) {
        await api.put(`${apiRoute}/${editingItem.id}`, submissionData);
      } else {
        await api.post(apiRoute, submissionData);
      }
      setOpened(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    try {
      await api.delete(`${apiRoute}/${id}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  if (
    !columns ||
    columns.length === 0 ||
    !modalFields ||
    modalFields.length === 0
  )
    return "";

  return (
    <Stack p="md">
      <Group justify="space-between">
        <h2>{title}</h2>
        <Button onClick={handleAdd}>Adicionar</Button>
      </Group>

      <Table striped highlightOnHover withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col.key}>{col.label}</Table.Th>
            ))}
            <Table.Th>Ações</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item) => (
            <Table.Tr key={item.id}>
              {columns.map((col) => (
                <Table.Td key={col.key}>
                  {col.transform
                    ? col.transform(item[col.key], item)
                    : item[col.key]}
                </Table.Td>
              ))}
              <Table.Td>
                {renderActions ? (
                  renderActions(item, { handleEdit, handleDelete })
                ) : (
                  <Group gap="xs">
                    <Button size="xs" onClick={() => handleEdit(item)}>
                      Editar
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => handleDelete(item.id)}
                    >
                      Excluir
                    </Button>
                  </Group>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editingItem ? `Editar ${title}` : `Novo ${title}`}
        centered
      >
        <Stack>
          {modalFields.map((field) => {
            if (field.type === "date") {
              return (
                <DatePickerInput
                  key={field.key}
                  label={field.label}
                  placeholder="Selecione uma data"
                  value={formValues[field.key]}
                  onChange={(date) =>
                    setFormValues({ ...formValues, [field.key]: date })
                  }
                  valueFormat="DD/MM/YYYY"
                />
              );
            }

            if (field.type === "select") {
              return (
                <Select
                  key={field.key}
                  label={field.label}
                  placeholder={`Selecione ${field.label.toLowerCase()}`}
                  data={field.options || []}
                  value={formValues[field.key]}
                  onChange={(val) =>
                    setFormValues({ ...formValues, [field.key]: val })
                  }
                />
              );
            }

            return (
              <TextInput
                key={field.key}
                label={field.label}
                placeholder={`Digite ${field.label.toLowerCase()}`}
                type={field.type || "text"}
                value={formValues[field.key]}
                onChange={(e) =>
                  setFormValues({ ...formValues, [field.key]: e.target.value })
                }
              />
            );
          })}
          <Group justify="flex-end" mt="md">
            <Button onClick={handleSave}>
              {editingItem ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
