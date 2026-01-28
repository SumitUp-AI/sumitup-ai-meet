import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicRoutes from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./features/Dashboard";

function AppContent() {
  return (
    <Routes>
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
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
