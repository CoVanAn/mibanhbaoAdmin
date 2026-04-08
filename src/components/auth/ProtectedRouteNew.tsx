import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuthQuery";

type Props = {
  children: ReactNode;
  requiredRole?: string | null;
};

const ProtectedRoute = ({ children, requiredRole = null }: Props) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user && user.role !== requiredRole) {
    return <div>Access denied</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;