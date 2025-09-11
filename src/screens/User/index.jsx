import DefaultCRUDPage from "../DefaultCRUDPage";

export default function UsersPage() {
  const roleTranslate = {
    admin: "Administrador",
    manager: "Gerente",
    developer: "Desenvolvedor",
  };

  return (
    <DefaultCRUDPage
      disableAdd
      apiRoute="/user"
      title="Usuários"
      columns={[
        { key: "name", label: "Nome" },
        { key: "email", label: "Email" },
        {
          key: "role",
          label: "Cargo",
          transform: (role) => roleTranslate[role] || role,
        },
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
