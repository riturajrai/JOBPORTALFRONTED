import React, { Suspense, lazy, Component, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Component/Navbar";
import { LoaderProvider, useLoader } from "./pages/LoaderContext.jsx";
import Loader from "./pages/Loader.jsx";
import BottomNav from "./Component/BottomNav.jsx";
const Joblist = lazy(() => import("./JobsPageForComponents/Job.jsx"));
import Login from "./Component/Login";
import Postjob from "./Component/PostJob";
import Profile from "./Dashboard/Profile";
import JobDetails from "./JobsPageForComponents/JobDeatils.jsx";
import ProtectedRoute from "./Component/ProtectedRoute";
import ManageJob from "./EmployerPages/MangeJobs.jsx";
import EmployerRegister from "./Empolyer Process/EmployerSingUp.jsx";
import EmployerLogin from "./Empolyer Process/EmpolyerLogin.jsx";
import Salaries from "./pages/Salaries";
import EmployerDashboard from "./Dashboard/EmployerDashboard";
import JobSeekerDashboard from "./Dashboard/JobSeekerDashboard";
import UserProfile from "./pages/UserProfile.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import { CandidateSignup, VerifyOTP } from "./Component/SingupPages.jsx";
import FilterPage from "./FilterComponentForMobile.jsx/FilterPage.jsx";
import Home from "./pages/Home.jsx";
import PostJob from "./pages/PostJob.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import EmployerNavbar from "./Component/EmployerNavbar.jsx";
import EmployerResumeSearch from "./EmployerPages/ResumeSearchPage.jsx";
import EmployerProfile from "./EmployerPages/EmployerProfile.jsx";
import ApplicationsPage from "./EmployerPages/ApplicationsPage.jsx";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
    <h1 className="text-4xl sm:text-6xl font-bold text-gray-800 mb-4">404</h1>
    <p className="text-lg sm:text-xl text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
    <button
      onClick={() => window.history.back()}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm sm:text-base"
    >
      Go Back
    </button>
    <a href="/" className="mt-4 text-indigo-600 hover:underline text-sm sm:text-base">
      Return to Home
    </a>
  </div>
);

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

const AppContent = () => {
  const location = useLocation();
  const { isLoading, setManualLoading, manualLoading } = useLoader();
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  useEffect(() => {
    setManualLoading(true);
    const timer = setTimeout(() => setManualLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname, setManualLoading]);

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role") || null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  //bottom navbar
  const hideNavbarRoutes = [
    "/signup",
    "/verify-otp",
    "/login",
    "/employer-signup",
    "/employer-login",
    "/filters",

   

  ];

  const employerRoutes = [
    "/employer-dashboard",
    "/manage-jobs",
    "/job-form",
    "/employeDash",
    "/employer/post-job",
    "/employer/active-jobs",
    "/employer/draft-jobs",
    "/employer/closed-jobs",
    "/employer/applications",
    "/employer/shortlisted",
    "/employer/interviews",
    "/employer/resume-search",
    "/employer/analytics",
    "/employer/profile",
    "/employer/settings",
    "/employer/billing",
    "/employer/notifications",
    "/employer/messages",
  ];

  // navbar bottom hide feturs
     // Added /jobs to candidateRoutes
  const candidateRoutes = [
    "/dashboard",
    "/profile2/:id",
    "/notifications",
    "/employer-dashboard",
    "/manage-jobs",
    "/job-form",
    "/employeDash",
    "/employer/post-job",
    "/employer/active-jobs",
    "/employer/draft-jobs",
    "/employer/closed-jobs",
    "/employer/applications",
    "/employer/shortlisted",
    "/employer/interviews",
    "/employer/resume-search",
    "/employer/analytics",
    "/employer/profile",
    "/employer/settings",
    "/employer/billing",
    "/employer/notifications",
    "/employer/messages",
  
  ];

  // Custom navbar overrides for specific routes
  const navbarOverrides = {
    "/dashboard": "employer",
    "/employer-dashboard": "employer",
    "/employeDash": "employer",
    "/employer/resume-search": "employer",
    "/employer/applications": "employer",
    "/employer/active-jobs": "employer",
    "/employer/draft-jobs": "employer",
    "/employer/closed-jobs": "employer",
    "/employer/shortlisted": "employer",
    "/manage-jobs": "employer",
    "/employer/interviews": "employer",
    "/employer/reports": "employer",
    "/employer/profile": "employer",
    "/employer/analytics": "employer",
    
    "/jobs": "candidate",
  };

  const isJobDetailPage = location.pathname.startsWith("/job/");
  const isAuthenticated = !!localStorage.getItem("token");
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) || isJobDetailPage;
  const isEmployerRoute = employerRoutes.some((route) => location.pathname.startsWith(route));
  const isCandidateRoute = candidateRoutes.some((route) => location.pathname.startsWith(route));

  // Determine navbar based on overrides, role, and route
  const overrideNavbar = navbarOverrides[location.pathname];
  const showEmployerNavbar =
    isAuthenticated &&
    (overrideNavbar === "employer" || (role === "employer" && isEmployerRoute));
  const showCandidateNavbar =
    overrideNavbar === "candidate" || // Show for /jobs regardless of auth
    (isAuthenticated && role === "candidate" && isCandidateRoute && overrideNavbar !== "employer");
  const showPublicNavbar =
    !isAuthenticated &&
    !showEmployerNavbar &&
    !showCandidateNavbar &&
    overrideNavbar !== "employer" &&
    overrideNavbar !== "candidate";

  const hideBottomNavRoutes = [
    ...hideNavbarRoutes,
    ...employerRoutes,
    ...candidateRoutes,
  ];
  const shouldHideBottomNav = hideBottomNavRoutes.some((route) =>
    location.pathname.startsWith(route)
  ) || isJobDetailPage;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {(isLoading || manualLoading) && <Loader />}
      {!shouldHideNavbar && (
        <>
          {showEmployerNavbar && <EmployerNavbar />}
          {(showCandidateNavbar || showPublicNavbar) && <Navbar />}
        </>
      )}

      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/filters" element={<FilterPage />} />
            <Route path="/signup" element={<CandidateSignup setRole={setRole} />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/auth/callback" element={<CandidateSignup setRole={setRole} />} />
            <Route path="/login" element={<Login setRole={setRole} />} />
            <Route path="/employer-signup" element={<EmployerRegister setRole={setRole} />} />
            <Route path="/employer-login" element={<EmployerLogin setRole={setRole} />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/jobs" element={<Joblist />} />

            {/* Candidate Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["candidate"]}>
                  <JobSeekerDashboard />
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
              path="/profile2/:id"
              element={
                <ProtectedRoute allowedRoles={["candidate", "employer"]}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/resumebuilder" element={<ResumeBuilder />} />

            {/* Employer Routes */}
            <Route
              path="/employer-dashboard"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <EmployerDashboard />
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
              path="/job-form"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <Postjob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employeDash"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/post-job"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/active-jobs"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/draft-jobs"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/closed-jobs"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/applications"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/shortlisted"
              element={
                <ProtectedRoute allowedRoutes={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/interviews"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/resume-search"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <EmployerResumeSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/analytics"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/profile"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <EmployerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/settings"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/billing"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/notifications"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/messages"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <ManageJob />
                </ProtectedRoute>
              }
            />
            <Route path="/postjob" element={<PostJob />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {!shouldHideBottomNav && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <LoaderProvider>
      <Router>
        <AppContent />
      </Router>
    </LoaderProvider>
  );
}

export default App;
