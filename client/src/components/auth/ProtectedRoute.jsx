import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../utils/auth";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const user = getCurrentUser();
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;