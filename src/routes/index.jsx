import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ProjectsPage from "../screens/Project";
import UsersPage from "../screens/User";
import LoginPage from "../screens/Login";
import TasksPage from "../screens/Task";
import RegisterPage from "../screens/Register";
import { ProtectedOutlet } from "../components/ProtectedRoutes";
import DashboardPage from "../screens/Dashboard";
import MyTasksPage from "../screens/MyTask";

function protectedRoute(path, element, permission) {
  return {
    path,
    element: <ProtectedOutlet requiredPermission={permission} />,
    children: [{ index: true, element }],
  };
}

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
      protectedRoute("projects", <ProjectsPage />, "projects"),
      protectedRoute("tasks", <TasksPage />, "tasks"),
      protectedRoute("my-tasks", <MyTasksPage />, "toggle_tasks"),
      protectedRoute("users", <UsersPage />, "users"),
      protectedRoute("dashboard", <DashboardPage />, "dashboard"),
    ],
  },
]);
