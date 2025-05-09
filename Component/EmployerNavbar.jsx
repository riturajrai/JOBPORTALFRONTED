import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  BellIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useAuth } from "../App";
import {logo} from '../assets/Icons'
const API_BASE_URL = "https://jobporatl.onrender.com/api";

const EmployerNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobMenuOpen, setIsJobMenuOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [error, setError] = useState(null);

  const jobMenuRef = useRef(null);
  const appMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const employerRoutes = {
    home: "/",
    dashboard: "/employerDash",
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

  const fetchNotificationsAndMessages = useCallback(async (signal) => {
    const storedToken = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    if (!storedToken || !userId) {
      setUnreadCount(0);
      setUnreadMessages(0);
      setError(null);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${storedToken}`,
        "Content-Type": "application/json",
      };
      const [notificationResponse, messagesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/notifications/${userId}/unread`, { headers, signal }),
        axios.get(`${API_BASE_URL}/messages/${userId}/unread`, { headers, signal }),
      ]);
      setUnreadCount(notificationResponse.data.unreadCount || 0);
      setUnreadMessages(messagesResponse.data.unreadMessages || 0);
      setError(null);
    } catch (error) {
      if (error.name !== "AbortError") {
        setError("Failed to load notifications/messages");
        setUnreadCount(0);
        setUnreadMessages(0);
      }
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    const authenticated = !!storedToken && storedRole === "employer";
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      navigate("/", { replace: true });
      return;
    }

    const controller = new AbortController();
    fetchNotificationsAndMessages(controller.signal);

    return () => {
      controller.abort();
    };
  }, [navigate, fetchNotificationsAndMessages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobMenuRef.current && !jobMenuRef.current.contains(event.target)) {
        setIsJobMenuOpen(false);
      }
      if (appMenuRef.current && !appMenuRef.current.contains(event.target)) {
        setIsAppMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
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
    logout();
    setIsMobileMenuOpen(false);
    setIsJobMenuOpen(false);
    setIsAppMenuOpen(false);
    setIsProfileMenuOpen(false);
    setError(null);
    navigate("/", { replace: true });
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsJobMenuOpen(false);
    setIsAppMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const isActiveRoute = (route) => location.pathname === route;
  const isAnyRouteActive = (routes) => Object.values(routes).some((route) => isActiveRoute(route));

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-[80rem] 2xl:max-w-[96rem]">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
  <img 
    src={logo} 
    alt="Logo" 
    className="w-10 h-10 brightness-110 contrast-110 hover:scale-105 transition-all duration-300"
  />
  {/* <span className="text-xl font-bold text-teal-600 hidden sm:block">YourBrand</span> */}
</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:gap-4 lg:gap-6 xl:gap-8">
            <Link
              to={employerRoutes.home}
              className={`text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-xs md:text-[10px] lg:text-sm font-medium transition-colors ${
                isActiveRoute(employerRoutes.home) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.home)}
            >
              Home
            </Link>
            <Link
              to={employerRoutes.dashboard}
              className={`text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-xs md:text-[10px] lg:text-sm font-medium transition-colors ${
                isActiveRoute(employerRoutes.dashboard) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.dashboard)}
            >
              Dashboard
            </Link>
            <div className="relative" ref={jobMenuRef}>
              <button
                onClick={toggleJobMenu}
                className={`text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-xs md:text-[10px] lg:text-sm font-medium flex items-center ${
                  isAnyRouteActive({
                    postJob: employerRoutes.postJob,
                    activeJobs: employerRoutes.activeJobs,
                    draftJobs: employerRoutes.draftJobs,
                    closedJobs: employerRoutes.closedJobs,
                    manageJobs: employerRoutes.manageJobs,
                  })
                    ? "text-teal-600"
                    : ""
                }`}
                aria-label="Toggle job management menu"
                aria-expanded={isJobMenuOpen}
                aria-controls="job-menu"
              >
                Job Management
                <ChevronDownIcon
                  className={`ml-1 w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 ${isJobMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isJobMenuOpen && (
                <div
                  id="job-menu"
                  className="absolute left-0 mt-2 w-40 md:w-44 lg:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  role="menu"
                >
                  <div className="py-1" role="none">
                    <Link
                      to={employerRoutes.postJob}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        isActiveRoute(employerRoutes.postJob) ? "text-teal-600" : ""
                      }`}
                      onClick={() => handleNavigation(employerRoutes.postJob)}
                      role="menuitem"
                    >
                      Post a Job
                    </Link>
                    <Link
                      to={employerRoutes.activeJobs}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        isActiveRoute(employerRoutes.activeJobs) ? "text-teal-600" : ""
                      }`}
                      onClick={() => handleNavigation(employerRoutes.activeJobs)}
                      role="menuitem"
                    >
                      Active Jobs
                    </Link>
                    <Link
                      to={employerRoutes.draftJobs}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        isActiveRoute(employerRoutes.draftJobs) ? "text-teal-600" : ""
                      }`}
                      onClick={() => handleNavigation(employerRoutes.draftJobs)}
                      role="menuitem"
                    >
                      Draft Jobs
                    </Link>
                    <Link
                      to={employerRoutes.closedJobs}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        isActiveRoute(employerRoutes.closedJobs) ? "text-teal-600" : ""
                      }`}
                      onClick={() => handleNavigation(employerRoutes.closedJobs)}
                      role="menuitem"
                    >
                      Closed Jobs
                    </Link>
                    <Link
                      to={employerRoutes.manageJobs}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        isActiveRoute(employerRoutes.manageJobs) ? "text-teal-600" : ""
                      }`}
                      onClick={() => handleNavigation(employerRoutes.manageJobs)}
                      role="menuitem"
                    >
                      Manage Jobs
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={appMenuRef}>
              <button
                onClick={toggleAppMenu}
                className={`text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-xs md:text-[10px] lg:text-sm font-medium flex items-center ${
                  isAnyRouteActive({
                    applications: employerRoutes.applications,
                    shortlisted: employerRoutes.shortlisted,
                    interviews: employerRoutes.interviews,
                  })
                    ? "text-teal-600"
                    : ""
                }`}
                aria-label="Toggle applications menu"
                aria-expanded={isAppMenuOpen}
                aria-controls="app-menu"
              >
                Applications
                <ChevronDownIcon
                  className={`ml-1 w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 ${isAppMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isAppMenuOpen && (
                <div
                  id="app-menu"
                  className="absolute left-0 mt-2 w-40 md:w-44 lg:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  role="menu"
                >
                  <div className="py-1" role="none">
                    <Link
                      to={employerRoutes.applications}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        isActiveRoute(employerRoutes.applications) ? "text-teal-600" : ""
                      }`}
                      onClick={() => handleNavigation(employerRoutes.applications)}
                      role="menuitem"
                    >
                      View Applications
                    </Link>
                    <Link
                      to={employerRoutes.shortlisted}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        isActiveRoute(employerRoutes.shortlisted) ? "text-teal-600" : ""
                      }`}
                      onClick={() => handleNavigation(employerRoutes.shortlisted)}
                      role="menuitem"
                    >
                      Shortlisted Candidates
                    </Link>
                    <Link
                      to={employerRoutes.interviews}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        isActiveRoute(employerRoutes.interviews) ? "text-teal-600" : ""
                      }`}
                      onClick={() => handleNavigation(employerRoutes.interviews)}
                      role="menuitem"
                    >
                      Interview Scheduler
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link
              to={employerRoutes.resumeSearch}
              className={`text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-xs md:text-[10px] lg:text-sm font-medium transition-colors ${
                isActiveRoute(employerRoutes.resumeSearch) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.resumeSearch)}
            >
              Resume Search
            </Link>
          </div>

          {/* Right Side Icons and Profile */}
          <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
            <button
              onClick={() => handleNavigation(employerRoutes.notifications)}
              className={`relative p-1 text-gray-700 hover:text-teal-600 ${
                isActiveRoute(employerRoutes.notifications) ? "text-teal-600" : ""
              }`}
              aria-label="View notifications"
            >
              <BellIcon className="h-4 w-4 md:h-5 md:w-5 lg:h-5 lg:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4 text-[8px] md:text-[10px] lg:text-xs font-bold text-white bg-teal-600 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavigation(employerRoutes.messages)}
              className={`relative p-1 text-gray-700 hover:text-teal-600 ${
                isActiveRoute(employerRoutes.messages) ? "text-teal-600" : ""
              }`}
              aria-label="View messages"
            >
              <EnvelopeIcon className="h-4 w-4 md:h-5 md:w-5 lg:h-5 lg:w-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4 text-[8px] md:text-[10px] lg:text-xs font-bold text-white bg-teal-600 rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={toggleProfileMenu}
                className="h-7 w-7 md:h-8 md:w-8 lg:h-8 lg:w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-xs md:text-sm lg:text-sm"
                aria-label="Toggle profile menu"
                aria-expanded={isProfileMenuOpen}
                aria-controls="profile-menu"
              >
                {localStorage.getItem("user_name")?.charAt(0).toUpperCase() || "E"}
              </button>
              {isProfileMenuOpen && (
  <div
    id="profile-menu"
    className="absolute right-0 mt-2 w-40 md:w-44 lg:w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
    role="menu"
  >
    <div className="py-1" role="none">
      <Link
        to={employerRoutes.profile}
        className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
          isActiveRoute(employerRoutes.profile) ? "text-teal-600" : ""
        }`}
        onClick={() => handleNavigation(employerRoutes.profile)}
        role="menuitem"
      >
        Company Profile
      </Link>
      <Link
        to={employerRoutes.settings}
        className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
          isActiveRoute(employerRoutes.settings) ? "text-teal-600" : ""
        }`}
        onClick={() => handleNavigation(employerRoutes.settings)}
        role="menuitem"
      >
        Settings
      </Link>
      <Link
        to={employerRoutes.billing}
        className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
          isActiveRoute(employerRoutes.billing) ? "text-teal-600" : ""
        }`}
        onClick={() => handleNavigation(employerRoutes.billing)}
        role="menuitem"
      >
        Billing
      </Link>
      <button
        onClick={handleLogout}
        className="block w-full text-left px-3 py-2 text-xs md:text-[10px] lg:text-sm text-red-600 hover:bg-gray-50"
        aria-label="Logout"
        role="menuitem"
      >
        Logout
      </button>
    </div>
  </div>
)}

            </div>
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 mobile-menu-toggle"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              ) : (
                <Bars3Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-white border-t border-gray-100"
          role="menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to={employerRoutes.home}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                isActiveRoute(employerRoutes.home) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.home)}
              role="menuitem"
            >
              Home
            </Link>
            <Link
              to={employerRoutes.dashboard}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                isActiveRoute(employerRoutes.dashboard) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.dashboard)}
              role="menuitem"
            >
              Dashboard
            </Link>
            <div>
              <button
                onClick={toggleJobMenu}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                  isAnyRouteActive({
                    postJob: employerRoutes.postJob,
                    activeJobs: employerRoutes.activeJobs,
                    draftJobs: employerRoutes.draftJobs,
                    closedJobs: employerRoutes.closedJobs,
                    manageJobs: employerRoutes.manageJobs,
                  })
                    ? "text-teal-600"
                    : ""
                }`}
                aria-label="Toggle job management menu"
                aria-expanded={isJobMenuOpen}
                aria-controls="mobile-job-menu"
                role="menuitem"
              >
                Job Management
                <ChevronDownIcon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isJobMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isJobMenuOpen && (
                <div id="mobile-job-menu" className="pl-4 space-y-1" role="menu">
                  <Link
                    to={employerRoutes.postJob}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      isActiveRoute(employerRoutes.postJob) ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.postJob)}
                    role="menuitem"
                  >
                    Post a Job
                  </Link>
                  <Link
                    to={employerRoutes.activeJobs}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      isActiveRoute(employerRoutes.activeJobs) ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.activeJobs)}
                    role="menuitem"
                  >
                    Active Jobs
                  </Link>
                  <Link
                    to={employerRoutes.draftJobs}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      isActiveRoute(employerRoutes.draftJobs) ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.draftJobs)}
                    role="menuitem"
                  >
                    Draft Jobs
                  </Link>
                  <Link
                    to={employerRoutes.closedJobs}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      isActiveRoute(employerRoutes.closedJobs) ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.closedJobs)}
                    role="menuitem"
                  >
                    Closed Jobs
                  </Link>
                  <Link
                    to={employerRoutes.manageJobs}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      isActiveRoute(employerRoutes.manageJobs) ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.manageJobs)}
                    role="menuitem"
                  >
                    Manage Jobs
                  </Link>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={toggleAppMenu}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                  isAnyRouteActive({
                    applications: employerRoutes.applications,
                    shortlisted: employerRoutes.shortlisted,
                    interviews: employerRoutes.interviews,
                  })
                    ? "text-teal-600"
                    : ""
                }`}
                aria-label="Toggle applications menu"
                aria-expanded={isAppMenuOpen}
                aria-controls="mobile-app-menu"
                role="menuitem"
              >
                Applications
                <ChevronDownIcon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isAppMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isAppMenuOpen && (
                <div id="mobile-app-menu" className="pl-4 space-y-1" role="menu">
                  <Link
                    to={employerRoutes.applications}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      isActiveRoute(employerRoutes.applications) ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.applications)}
                    role="menuitem"
                  >
                    View Applications
                  </Link>
                  <Link
                    to={employerRoutes.shortlisted}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      isActiveRoute(employerRoutes.shortlisted) ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.shortlisted)}
                    role="menuitem"
                  >
                    Shortlisted Candidates
                  </Link>
                  <Link
                    to={employerRoutes.interviews}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      isActiveRoute(employerRoutes.interviews) ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleNavigation(employerRoutes.interviews)}
                    role="menuitem"
                  >
                    Interview Scheduler
                  </Link>
                </div>
              )}
            </div>
            <Link
              to={employerRoutes.resumeSearch}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                isActiveRoute(employerRoutes.resumeSearch) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.resumeSearch)}
              role="menuitem"
            >
              Resume Search
            </Link>
            <Link
              to={employerRoutes.analytics}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                isActiveRoute(employerRoutes.analytics) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.analytics)}
              role="menuitem"
            >
              Analytics
            </Link>
            <Link
              to={employerRoutes.reports}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                isActiveRoute(employerRoutes.reports) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.reports)}
              role="menuitem"
            >
              Reports
            </Link>
            <Link
              to={employerRoutes.profile}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                isActiveRoute(employerRoutes.profile) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.profile)}
              role="menuitem"
            >
              Company Profile
            </Link>
            <Link
              to={employerRoutes.settings}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                isActiveRoute(employerRoutes.settings) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.settings)}
              role="menuitem"
            >
              Settings
            </Link>
            <Link
              to={employerRoutes.billing}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                isActiveRoute(employerRoutes.billing) ? "text-teal-600" : ""
              }`}
              onClick={() => handleNavigation(employerRoutes.billing)}
              role="menuitem"
            >
              Billing
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-gray-50 transition-colors"
              aria-label="Logout"
              role="menuitem"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 sm:p-3 text-[10px] sm:text-sm md:text-[10px] lg:text-sm flex items-center gap-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-[10rem] sm:max-w-xs md:max-w-sm">
          <svg className="w-3 h-3 sm:w-5 sm:h-5 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
          <button
            onClick={() => {
              setError(null);
              fetchNotificationsAndMessages(new AbortController().signal);
            }}
            className="ml-auto text-red-600 hover:text-red-800 text-[10px] sm:text-xs md:text-[10px] lg:text-sm"
            aria-label="Retry"
          >
            Retry
          </button>
        </div>
      )}
    </nav>
  );
};

export default EmployerNavbar;