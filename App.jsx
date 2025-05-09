import { Suspense, lazy, Component, useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import PublicNavbar from "./Component/PublicNavbar";
import Navbar from "./Component/Navbar";
import EmployerNavbar from "./Component/EmployerNavbar";
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
import DefaultHome from "./pages/Home";
import CandidateHome from "./pages/CandidateHome.jsx";
import EmployerHome from "./pages/EmployerHome.jsx";
import PostJob from "./pages/PostJob.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import EmployerResumeSearch from "./EmployerPages/ResumeSearchPage.jsx";
import EmployerProfile from "./EmployerPages/EmployerProfile.jsx";
import ApplicationsPage from "./EmployerPages/ApplicationsPage.jsx";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const login = (token, userRole) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
    setRole(userRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.clear();
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ role, setRole, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Debug wrapper for signup routes
const DebugRoute = ({ component: Component, name, ...props }) => {
  useEffect(() => {
    console.log(`Rendering ${name} component`);
  }, [name]);
  try {
    return <Component {...props} />;
  } catch (err) {
    console.error(`Error rendering ${name}:`, err);
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <h1>Error rendering {name}</h1>
        <p>{err.message}</p>
      </div>
    );
  }
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, setManualLoading, manualLoading } = useLoader();
  const { role, isAuthenticated, setRole } = useAuth();

  // Debug navigation
  useEffect(() => {
    console.log(`Current route changed to: ${location.pathname}`);
  }, [location.pathname]);

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/signup",
    "/verify-otp",
    "/login",
    "/employer-signup",
    "/employer-login",
    "/jobs",
    "/job/:id",
    "/salaries",
    "/filters",
    "/auth/callback",
  ];

  // Redirect to home only for non-public routes when unauthenticated
  useEffect(() => {
    const isPublicRoute = publicRoutes.some((route) =>
      route.includes(":") ? location.pathname.startsWith(route.split(":")[0]) : location.pathname === route
    );
    if (!isAuthenticated && !isPublicRoute) {
      console.log(`Redirecting to / from ${location.pathname} (non-public route, unauthenticated)`);
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Simulate manual loading on route change, but skip for logout
  useEffect(() => {
    if (!isAuthenticated) {
      setManualLoading(false);
      return;
    }
    setManualLoading(true);
    const timer = setTimeout(() => setManualLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname, setManualLoading, isAuthenticated]);

  // Routes where navbar should be hidden
  const hideNavbarRoutes = [
    "/signup",
    "/verify-otp",
    "/login",
    "/employer-signup",
    "/employer-login",
    "/filters",
  ];

  // Determine if the current route is a job detail page
  const isJobDetailPage = location.pathname.startsWith("/job/");

  // Determine navbar visibility
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) || isJobDetailPage;

  // Determine which navbar to show
  const showEmployerNavbar = isAuthenticated && role === "employer" && !shouldHideNavbar;
  const showCandidateNavbar = isAuthenticated && role === "candidate" && !shouldHideNavbar;
  const showPublicNavbar = !isAuthenticated && !shouldHideNavbar;

  // Debug logs to diagnose navbar issues
  useEffect(() => {
    console.log({
      currentRoute: location.pathname,
      isAuthenticated,
      role,
      shouldHideNavbar,
      showPublicNavbar,
      showCandidateNavbar,
      showEmployerNavbar,
    });
  }, [location.pathname, isAuthenticated, role, shouldHideNavbar, showPublicNavbar, showCandidateNavbar, showEmployerNavbar]);

  // Routes where BottomNav should be hidden
  const hideBottomNavRoutes = [
    ...hideNavbarRoutes,
    "/employer-dashboard",
    "/manage-jobs",
    "/job-form",
    "/employerDash",
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

  // Hide BottomNav for "/" when role is employer
  const shouldHideBottomNav =
    hideBottomNavRoutes.some((route) => location.pathname.startsWith(route)) ||
    isJobDetailPage ||
    (location.pathname === "/" && role === "employer");

  // Determine which Home component to render
  const HomeComponent = () => {
    if (!isAuthenticated || !role) {
      return <DefaultHome />;
    }
    if (role === "candidate") {
      return <CandidateHome />;
    }
    if (role === "employer") {
      return <EmployerHome />;
    }
    return <DefaultHome />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {(isLoading || manualLoading) && <Loader />}
      {!shouldHideNavbar && (
        <>
          {showEmployerNavbar && <EmployerNavbar />}
          {showCandidateNavbar && <Navbar />}
          {showPublicNavbar && <PublicNavbar />}
        </>
      )}
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeComponent />} />
            <Route path="/filters" element={<FilterPage />} />
            <Route
              path="/signup"
              element={<DebugRoute component={CandidateSignup} name="CandidateSignup" setRole={setRole} />}
            />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route
              path="/auth/callback"
              element={<DebugRoute component={CandidateSignup} name="CandidateSignup" setRole={setRole} />}
            />
            <Route path="/login" element={<Login setRole={setRole} />} />
            <Route
              path="/employer-signup"
              element={<DebugRoute component={EmployerRegister} name="EmployerRegister" setRole={setRole} />}
            />
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
              path="/employerDash"
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
                <ProtectedRoute allowedRoles={["employer"]}>
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
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </LoaderProvider>
  );
}

export default App;