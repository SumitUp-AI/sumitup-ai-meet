import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicRoutes from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardRoutes from "./routes/DashboardRoutes";

function AppContent() {
  return (
    <Routes>
      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardRoutes />
          </ProtectedRoute>
        }
      />

      {/* Public Routes - must be last */}
      <Route path="/*" element={<PublicRoutes />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
