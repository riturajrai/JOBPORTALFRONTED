import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // Debug logging to verify role and allowed roles
  console.log("ProtectedRoute - Role:", role);
  console.log("ProtectedRoute - Allowed Roles:", allowedRoles);
  console.log("ProtectedRoute - Current Path:", location.pathname);

  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Current time in seconds
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Treat invalid tokens as expired
    }
  };

  // No token present or token is expired
  if (!token || isTokenExpired(token)) {
    console.log("ProtectedRoute - No token or token expired, redirecting to /login");
    localStorage.clear();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is missing despite token presence
  if (!role) {
    console.log("ProtectedRoute - No role found, redirecting to /login");
    localStorage.clear();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Validate role against allowed roles, if provided
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.log(`ProtectedRoute - Role ${role} not allowed for this route, redirecting...`);
    if (role === "candidate") {
      console.log("ProtectedRoute - Redirecting to /dashboard (candidate)");
      return <Navigate to="/dashboard" replace />;
    } else if (role === "employer") {
      console.log("ProtectedRoute - Redirecting to /employer-dashboard (employer)");
      return <Navigate to="/employer-dashboard" replace />;
    } else if (role === "admin") {
      console.log("ProtectedRoute - Redirecting to /admin-dashboard (admin)");
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      // Handle invalid roles
      console.log("ProtectedRoute - Invalid role, clearing localStorage and redirecting to /login");
      localStorage.clear();
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // If token is valid and role matches (or no allowedRoles specified), render the children
  console.log("ProtectedRoute - Access granted, rendering children");
  return children;
};

export default ProtectedRoute;