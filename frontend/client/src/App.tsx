import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicRoutes from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardRoutes from "./routes/DashboardRoutes";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from "react";

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

  useEffect(() => {
    AOS.init({
      duration: 400,
      once: false
    })
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App