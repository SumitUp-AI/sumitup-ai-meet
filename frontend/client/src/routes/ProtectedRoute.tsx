import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Layers } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const LoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative">
        {/* The "Glow" effect */}
        <div className="absolute inset-0 rounded-full bg-cyan-400 blur-xl opacity-20 animate-ping"></div>
        
        <div className="relative flex flex-col items-center gap-3">
          <Layers className="w-10 h-10 text-cyan-600" />
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"></span>
          </div>
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

