import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicRoutes from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardRoutes from "./routes/DashboardRoutes";

// Create router with loaders support
const router = createBrowserRouter([
  {
    path: "/dashboard/*",
    element: (
      <ProtectedRoute>
        <DashboardRoutes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/*",
    element: <PublicRoutes />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
