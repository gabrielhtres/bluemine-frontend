import DefaultCRUDPage from "../DefaultCRUDPage";

export default function UsersPage() {
  return (
    <DefaultCRUDPage
      disableAdd
      apiRoute="/user"
      title="Usuários"
      columns={[
        { key: "name", label: "Nome" },
        { key: "email", label: "Email" },
        { key: "role", label: "Cargo" },
      ]}
      modalFields={[
        { key: "name", label: "Nome" },
        { key: "email", label: "Email" },
        {
          key: "role",
          label: "Cargo",
          type: "select",
          options: [
            { value: "admin", label: "Administrador" },
            { value: "manager", label: "Gerente" },
            { value: "developer", label: "Desenvolvedor" },
          ],
        },
      ]}
    />
  );
}
