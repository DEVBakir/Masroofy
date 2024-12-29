import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log("from protection route", user, loading);
  

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
