import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

/** Gatekeeper for /login, /register and /forgot-password — an already-authenticated visitor is sent straight to the dashboard. */
export default function RequireGuest() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
