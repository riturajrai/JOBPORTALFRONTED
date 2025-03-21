import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Define allowed roles as a prop
const ProtectedRoute = ({ children, allowedRoles }) => {
   // Candidate token
  const usertoken = localStorage.getItem("token");
  // Employer token
  const employertoken = localStorage.getItem("employertoken"); 
   // "candidate" or "employer"
  const role = localStorage.getItem("role");
  const location = useLocation();

  // No token present (neither candidate nor employer logged in)
  if (!usertoken && !employertoken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is missing despite token presence (edge case, e.g., manual storage tampering)
  if (!role) {
    // Reset invalid state
    localStorage.clear(); 
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the current role is allowed for this route
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on role if access is denied
    if (role === "candidate") {
      return <Navigate to="/dashboard" replace />;
    } else if (role === "employer") {
      return <Navigate to="/employer-dashboard" replace />;
    }
  }

  // If token and role match the route's requirements, render the children
  return children;
};

export default ProtectedRoute;