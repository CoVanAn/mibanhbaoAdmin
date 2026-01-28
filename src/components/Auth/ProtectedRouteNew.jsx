import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="access-denied">
        <h2>Từ chối truy cập</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
        <p>Quyền yêu cầu: {requiredRole}</p>
        <p>Quyền của bạn: {user.role}</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
