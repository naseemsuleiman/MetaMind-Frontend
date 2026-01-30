import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) return null; // or a spinner

  if (!admin) return <Navigate to="/login" />;

  return children;
};

export default AdminRoute;
