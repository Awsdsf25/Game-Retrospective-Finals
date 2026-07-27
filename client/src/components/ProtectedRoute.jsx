// client/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // If there is no token, boot them back to the Login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected child components
  return <Outlet />;
};

export default ProtectedRoute;
