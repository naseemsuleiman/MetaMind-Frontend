import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // 👈 wait until auth is initialized

  if (!user) return <Navigate to="/login" />;

  return <Outlet />;
};

export default PrivateRoute;

