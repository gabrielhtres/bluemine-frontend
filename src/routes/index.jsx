import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ProjectsPage from "../screens/Project";
import UsersPage from "../screens/User";
import LoginPage from "../screens/Login";
import TasksPage from "../screens/Task";
import RegisterPage from "../screens/Register";
import { ProtectedOutlet } from "../components/ProtectedRoutes";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/projects",
        element: <ProtectedOutlet requiredPermission="projects" />,
        children: [{ path: "", element: <ProjectsPage /> }],
      },
      {
        path: "/tasks",
        element: <ProtectedOutlet requiredPermission="tasks" />,
        children: [{ path: "", element: <TasksPage /> }],
      },
      {
        path: "/users",
        element: <ProtectedOutlet requiredPermission="users" />,
        children: [{ path: "", element: <UsersPage /> }],
      },
    ],
  },
]);
