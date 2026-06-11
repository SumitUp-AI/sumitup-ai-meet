import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoaderCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const LoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative">
        {/* The "Glow" effect */}
        <div className="relative flex flex-row items-center gap-3">
          <LoaderCircle className="w-10 h-10 text-cyan-600 animate-spin" />
          <h1 className="text-2xl font-semibold text-cyan-700">Opening your workspace</h1>
        </div>
      </div>
    </div>
  );
};
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingState />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

