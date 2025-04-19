import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  BellIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const EmployerNavbar = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isJobMenuOpen, setIsJobMenuOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const jobMenuRef = useRef(null);
  const appMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const employerRoutes = {
    dashboard: "/employeDash",
    postJob: "/job-form",
    activeJobs: "/employer/active-jobs",
    draftJobs: "/employer/draft-jobs",
    closedJobs: "/employer/closed-jobs",
    applications: "/employer/applications",
    shortlisted: "/employer/shortlisted",
    interviews: "/employer/interviews",
    resumeSearch: "/employer/resume-search",
    analytics: "/employer/analytics",
    reports: "/employer/reports",
    profile: "/employer/profile",
    settings: "/employer/settings",
    billing: "/employer/billing",
    notifications: "/employer/notifications",
    messages: "/employer/messages",
    manageJobs: "/manage-jobs",
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    const storedRole = localStorage.getItem("role");

    setIsAuthenticated(!!storedToken && storedRole === "employer");

    if (storedRole !== "employer") return;

    const fetchNotificationsAndMessages = async () => {
      if (!storedToken || !userId) {
        setUnreadCount(0);
        setUnreadMessages(0);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        };
        const notificationResponse = await axios.get(
          `${API_BASE_URL}/notifications/${userId}/unread`,
          { headers }
        );
        setUnreadCount(notificationResponse.data.unreadCount || 0);

        const messagesResponse = await axios.get(
          `${API_BASE_URL}/messages/${userId}/unread`,
          { headers }
        );
        setUnreadMessages(messagesResponse.data.unreadMessages || 0);
      } catch (error) {
        console.error("Error fetching employer notifications/messages:", error);
        setUnreadCount(0);
        setUnreadMessages(0);
      }
    };

    fetchNotificationsAndMessages();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobMenuRef.current && !jobMenuRef.current.contains(event.target)) setIsJobMenuOpen(false);
      if (appMenuRef.current && !appMenuRef.current.contains(event.target)) setIsAppMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
      if (isSideNavOpen && !event.target.closest(".side-nav") && !event.target.closest(".menu-toggle")) {
        setIsSideNavOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSideNavOpen]);

  const toggleSideNav = () => setIsSideNavOpen(!isSideNavOpen);
  const toggleJobMenu = (e) => {
    e.stopPropagation();
    setIsJobMenuOpen(!isJobMenuOpen);
    setIsAppMenuOpen(false);
    setIsProfileMenuOpen(false);
  };
  const toggleAppMenu = (e) => {
    e.stopPropagation();
    setIsAppMenuOpen(!isAppMenuOpen);
    setIsJobMenuOpen(false);
    setIsProfileMenuOpen(false);
  };
  const toggleProfileMenu = (e) => {
    e.stopPropagation();
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsJobMenuOpen(false);
    setIsAppMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("employer_id");
    setIsAuthenticated(false);
    setUnreadCount(0);
    setUnreadMessages(0);
    setIsSideNavOpen(false);
    setIsProfileMenuOpen(false);
    navigate("/employer-login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsSideNavOpen(false);
    setIsJobMenuOpen(false);
    setIsAppMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const isActiveRoute = (route) => location.pathname === route;
  const isAnyRouteActive = (routes) => Object.values(routes).some((route) => isActiveRoute(route));

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-[#008080] text-white">
        <button
          onClick={toggleSideNav}
          className="menu-toggle p-1.5 sm:p-2 rounded-md focus:outline-none"
          aria-label="Toggle Side Navbar"
        >
          <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex-shrink-0 flex space-x-2 sm:space-x-4">
          <button
            onClick={() => handleNavigation(employerRoutes.notifications)}
            className={`relative p-1.5 sm:p-2 hover:bg-gray-700 rounded-full transition-colors ${
              isActiveRoute(employerRoutes.notifications) ? "bg-gray-300 text-black" : ""
            }`}
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavigation(employerRoutes.messages)}
            className={`relative p-1.5 sm:p-2 hover:bg-gray-700 rounded-full transition-colors ${
              isActiveRoute(employerRoutes.messages) ? "bg-gray-300 text-black" : ""
            }`}
            aria-label="Messages"
          >
            <EnvelopeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Side Navigation */}
      <div
        className={`fixed top-0 left-0 h-full bg-white text-black shadow-md z-50 transform transition-transform duration-300 ease-in-out ${
          isSideNavOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 sm:w-72 side-nav`}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 bg-[#008080] text-white">
          <div className="flex-shrink-0">
            <Link to="/" className="text-lg sm:text-xl font-semibold">
              JobLeAaye
            </Link>
          </div>
          <button onClick={toggleSideNav} className="p-1.5 sm:p-2 rounded-md focus:outline-none">
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        <nav className="mt-4">
          <div className="space-y-1 sm:space-y-2">
            <Link
              to={employerRoutes.dashboard}
              className={`block hover:bg-gray-200 px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
                isActiveRoute(employerRoutes.dashboard) ? "bg-gray-300 text-black" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.dashboard)}
            >
              Dashboard
            </Link>

            {/* Job Management Menu */}
            <div className="relative" ref={jobMenuRef}>
              <button
                onClick={toggleJobMenu}
                className={`w-full text-left hover:bg-gray-200 px-4 py-2 text-sm sm:text-base font-medium flex items-center justify-between transition-colors ${
                  isAnyRouteActive({
                    postJob: employerRoutes.postJob,
                    activeJobs: employerRoutes.activeJobs,
                    draftJobs: employerRoutes.draftJobs,
                    closedJobs: employerRoutes.closedJobs,
                    manageJobs: employerRoutes.manageJobs,
                  })
                    ? "bg-gray-300 text-black"
                    : ""
                }`}
              >
                Job Management
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${isJobMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isJobMenuOpen && (
                <div className="pl-4 space-y-1">
                  <Link
                    to={employerRoutes.postJob}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.postJob) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.postJob)}
                  >
                    Post a Job
                  </Link>
                  <Link
                    to={employerRoutes.activeJobs}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.activeJobs) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.activeJobs)}
                  >
                    Active Jobs
                  </Link>
                  <Link
                    to={employerRoutes.draftJobs}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.draftJobs) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.draftJobs)}
                  >
                    Draft Jobs
                  </Link>
                  <Link
                    to={employerRoutes.closedJobs}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.closedJobs) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.closedJobs)}
                  >
                    Closed Jobs
                  </Link>
                  <Link
                    to={employerRoutes.manageJobs}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.manageJobs) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.manageJobs)}
                  >
                    Manage Jobs
                  </Link>
                </div>
              )}
            </div>

            {/* Applications Menu */}
            <div className="relative" ref={appMenuRef}>
              <button
                onClick={toggleAppMenu}
                className={`w-full text-left hover:bg-gray-200 px-4 py-2 text-sm sm:text-base font-medium flex items-center justify-between transition-colors ${
                  isAnyRouteActive({
                    applications: employerRoutes.applications,
                    shortlisted: employerRoutes.shortlisted,
                    interviews: employerRoutes.interviews,
                  })
                    ? "bg-gray-300 text-black"
                    : ""
                }`}
              >
                Applications
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${isAppMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isAppMenuOpen && (
                <div className="pl-4 space-y-1">
                  <Link
                    to={employerRoutes.applications}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.applications) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.applications)}
                  >
                    View Applications
                  </Link>
                  <Link
                    to={employerRoutes.shortlisted}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.shortlisted) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.shortlisted)}
                  >
                    Shortlisted Candidates
                  </Link>
                  <Link
                    to={employerRoutes.interviews}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.interviews) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.interviews)}
                  >
                    Interview Scheduler
                  </Link>
                </div>
              )}
            </div>

            <Link
              to={employerRoutes.resumeSearch}
              className={`block hover:bg-gray-200 px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
                isActiveRoute(employerRoutes.resumeSearch) ? "bg-gray-300 text-black" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.resumeSearch)}
            >
              Resume Search
            </Link>

            <Link
              to={employerRoutes.analytics}
              className={`block hover:bg-gray-200 px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
                isActiveRoute(employerRoutes.analytics) ? "bg-gray-300 text-black" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.analytics)}
            >
              Analytics
            </Link>

            <Link
              to={employerRoutes.reports}
              className={`block hover:bg-gray-200 px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
                isActiveRoute(employerRoutes.reports) ? "bg-gray-300 text-black" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.reports)}
            >
              Reports
            </Link>

            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={toggleProfileMenu}
                className={`w-full text-left hover:bg-gray-200 px-4 py-2 text-sm sm:text-base font-medium flex items-center justify-between transition-colors ${
                  isAnyRouteActive({
                    profile: employerRoutes.profile,
                    settings: employerRoutes.settings,
                    billing: employerRoutes.billing,
                  })
                    ? "bg-gray-300 text-black"
                    : ""
                }`}
              >
                Profile
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isProfileMenuOpen && (
                <div className="pl-4 space-y-1">
                  <Link
                    to={employerRoutes.profile}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.profile) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.profile)}
                  >
                    Company Profile
                  </Link>
                  <Link
                    to={employerRoutes.settings}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.settings) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.settings)}
                  >
                    Settings
                  </Link>
                  <Link
                    to={employerRoutes.billing}
                    className={`block px-4 py-2 text-xs sm:text-sm hover:bg-gray-200 ${
                      isActiveRoute(employerRoutes.billing) ? "bg-gray-300 text-black" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.billing)}
                  >
                    Billing
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default EmployerNavbar;