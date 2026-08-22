import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // If there is no user, redirect to the login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If the user exists, render the child component (the Dashboard)
  return children;
}