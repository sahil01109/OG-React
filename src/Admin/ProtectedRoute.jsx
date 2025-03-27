import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";

const ProtectedRoute = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;

  return user ? <Outlet /> : <Navigate to="/admin-login" />;
};

export default ProtectedRoute;
