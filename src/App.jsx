import React, { Suspense, lazy, Component } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./Component/Navbar";

// Direct imports for testing (replace these with your actual paths)
import Joblist from "./pages/Job";
import Signup from "./Component/SingupPages";
import Login from "./Component/Login";
import Postjob from "./Component/PostJob";
import Profile from "./Dashboard/Profile";
import JobDetails from "./pages/JobDeatils"; // Note: Typo "JobDeatils" fixed below
import ProtectedRoute from "./Component/ProtectedRoute";
import ManageJob from "./pages/MangeJobs"; // Note: Typo "MangeJobs" fixed below
import Employer from "./pages/Employers";
import EmployerRegister from "./Empolyer Process/EmployerSingUp"; // Typo "Empolyer" fixed below
import EmployerLogin from "./Empolyer Process/EmpolyerLogin"; // Typo "Empolyer" fixed below
import Salaries from "./pages/Salaries";
import Companies from "./pages/Companies";
import CompanyProfile from "./pages/CompanyProfile";
import EmployerDashboard from "./Dashboard/EmployerDashboard";
import JobSeekerDashboard from "./Dashboard/JobSeekerDashboard";
import AdminDashboard from "./Dashboard/AdminDashboard";
import EditPostJob from "./pages/EditJobForm";
import ManageSubscription from "./pages/ManageSubscription.jsx";
import UserProfile from "./pages/UserProfile.jsx";

class ErrorBoundary extends Component {
  state = { error: null, componentStack: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error caught in boundary:", error, errorInfo);
    this.setState({ componentStack: errorInfo.componentStack });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <h1>Error: {this.state.error.message}</h1>
          <pre>{this.state.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}



function App() {
  return (
    <Router>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-lg font-semibold">Loading...</div>
          </div>
        }
      >
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/employer-signup" element={<EmployerRegister />} />
            <Route path="/employer-login" element={<EmployerLogin />} />
            <Route path="/" element={<Joblist />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/company/:name" element={<CompanyProfile />} />
            <Route path="/employerpage" element={<Employer />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["candidate"]}>
                  <JobSeekerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer-dashboard"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-form"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <Postjob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-jobs"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <EditPostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["candidate"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-subscription"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageSubscription />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile2/:id"
              element={
                <ProtectedRoute allowedRoles={["candidate", "employer"]}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </Router>
  );
}

export default App;