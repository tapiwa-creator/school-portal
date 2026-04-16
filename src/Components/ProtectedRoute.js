import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, userRole, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8f5ee]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0d4a2f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0d4a2f] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (allowedRole && userRole !== allowedRole) {
    // Redirect to appropriate dashboard based on their actual role
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'student') {
      return <Navigate to="/student" replace />;
    } else {
      // Unknown role - logout
      return <Navigate to="/logout" replace />;
    }
  }

  // Authorized - render the protected content
  return children;
}