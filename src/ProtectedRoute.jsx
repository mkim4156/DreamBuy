import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ token }) => {
  return token ? <Outlet /> : <Navigate to="sign-in" replace/>
}

export default ProtectedRoute
