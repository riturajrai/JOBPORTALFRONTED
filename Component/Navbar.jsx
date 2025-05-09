import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, MessageSquare } from "lucide-react";
import axios from "axios";
import { useAuth } from "../App";
import {logo} from '../assets/Icons'
const API_BASE_URL = "http://localhost:5000/api";

const DownArrowIcon = ({ isOpen }) => (
  <svg
    className={`inline ml-1 w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 ${isOpen ? "rotate-180" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Navbar = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isCandidateSubmenuOpen, setIsCandidateSubmenuOpen] = useState(false);
  const [isProfileSubmenuOpen, setIsProfileSubmenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || role !== "candidate") {
      setUnreadCount(0);
      setUnreadMessages(0);
      return;
    }

    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    const fetchUnreadCount = async () => {
      if (!token || !userId) {
        setUnreadCount(0);
        setUnreadMessages(0);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
        const [notificationResponse, messagesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/notifications/${userId}/unread`, { headers }),
          axios.get(`${API_BASE_URL}/messages/${userId}/unread`, { headers }),
        ]);
        setUnreadCount(notificationResponse.data.unreadCount || 0);
        setUnreadMessages(messagesResponse.data.unreadMessages || 0);
      } catch (error) {
        console.error("Fetch Unread Count Error:", error.response?.data || error.message);
        setUnreadCount(0);
        setUnreadMessages(0);
      }
    };

    fetchUnreadCount();
  }, [isAuthenticated, role, location]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setUnreadCount(0);
    setUnreadMessages(0);
    navigate("/jobs");
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
    setIsOpen(false);
  };

  const handleMessagesClick = () => {
    navigate("/messages");
    setIsOpen(false);
  };

  const handleOpenAppClick = () => {
    window.location.href = "https://your-app-link.com";
    setIsOpen(false);
  };

  const toggleCandidateSubmenu = () => setIsCandidateSubmenuOpen(!isCandidateSubmenuOpen);
  const toggleProfileSubmenu = () => setIsProfileSubmenuOpen(!isProfileSubmenuOpen);

  const closeAllSubmenus = () => {
    setIsCandidateSubmenuOpen(false);
    setIsProfileSubmenuOpen(false);
  };

  if (!isAuthenticated || role !== "candidate") return null;

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-4 lg:gap-6 xl:gap-8">
            <Link
              to="/"
              className={`text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-xs md:text-[10px] lg:text-sm font-medium transition-colors ${
                location.pathname === "/" ? "text-teal-600" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className={`text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-xs md:text-[10px] lg:text-sm font-medium transition-colors ${
                location.pathname === "/jobs" ? "text-teal-600" : ""
              }`}
            >
              Find Jobs
            </Link>
            <Link
              to="/salaries"
              className={`text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-xs md:text-[10px] lg:text-sm font-medium transition-colors ${
                location.pathname === "/salaries" ? "text-teal-600" : ""
              }`}
            >
              Salaries
            </Link>
            <div className="relative">
              <button
                onClick={toggleCandidateSubmenu}
                className={`text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-xs md:text-[10px] lg:text-sm font-medium flex items-center ${
                  ["/dashboard", "/saved-jobs", "/applications", "/resumebuilder"].includes(location.pathname)
                    ? "text-teal-600"
                    : ""
                }`}
                aria-label="Toggle candidate options"
                aria-expanded={isCandidateSubmenuOpen}
                aria-controls="candidate-menu"
              >
                Candidate Options <DownArrowIcon isOpen={isCandidateSubmenuOpen} />
              </button>
              {isCandidateSubmenuOpen && (
                <div
                  id="candidate-menu"
                  className="absolute left-0 mt-2 w-40 md:w-44 lg:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={closeAllSubmenus}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        location.pathname === "/dashboard" ? "text-teal-600" : ""
                      }`}
                    >
                      Your Jobs
                    </Link>
                    <Link
                      to="/saved-jobs"
                      onClick={closeAllSubmenus}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        location.pathname === "/saved-jobs" ? "text-teal-600" : ""
                      }`}
                    >
                      Saved Jobs
                    </Link>
                    <Link
                      to="/applications"
                      onClick={closeAllSubmenus}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        location.pathname === "/applications" ? "text-teal-600" : ""
                      }`}
                    >
                      Applications
                    </Link>
                    <Link
                      to="/resumebuilder"
                      onClick={closeAllSubmenus}
                      className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                        location.pathname === "/resumebuilder" ? "text-teal-600" : ""
                      }`}
                    >
                      Resume Builder
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Icons and Profile */}
          <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
            <button
              onClick={handleOpenAppClick}
              className="px-2 md:px-3 py-1 md:py-1.5 border border-gray-300 text-xs md:text-[10px] lg:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              aria-label="Open app"
            >
              Open App
            </button>
            <button
              onClick={handleMessagesClick}
              className="relative p-1 text-gray-700 hover:text-teal-600"
              aria-label="View messages"
            >
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5 lg:h-5 lg:w-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4 text-[8px] md:text-[10px] lg:text-xs font-bold text-white bg-teal-600 rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </button>
            <button
              onClick={handleNotificationsClick}
              className="relative p-1 text-gray-700 hover:text-teal-600"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4 md:h-5 md:w-5 lg:h-5 lg:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4 text-[8px] md:text-[10px] lg:text-xs font-bold text-white bg-teal-600 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={toggleProfileSubmenu}
                className="h-7 w-7 md:h-8 md:w-8 lg:h-8 lg:w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-xs md:text-sm lg:text-sm"
                aria-label="Toggle profile menu"
                aria-expanded={isProfileSubmenuOpen}
                aria-controls="profile-menu"
              >
                {localStorage.getItem("user_name")?.charAt(0).toUpperCase() || "U"}
              </button>
              {isProfileSubmenuOpen && (
                <div
                  id="profile-menu"
                  className="absolute right-0 mt-2 w-40 md:w-44 lg:w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                >
                  <Link
                    to="/profile"
                    onClick={closeAllSubmenus}
                    className={`block px-3 py-2 text-xs md:text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 ${
                      location.pathname === "/profile" ? "text-teal-600" : ""
                    }`}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-xs md:text-[10px] lg:text-sm text-red-600 hover:bg-gray-50"
                    aria-label="Sign out"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle mobile menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                location.pathname === "/" ? "text-teal-600" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                location.pathname === "/jobs" ? "text-teal-600" : ""
              }`}
            >
              Find Jobs
            </Link>
            <Link
              to="/salaries"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                location.pathname === "/salaries" ? "text-teal-600" : ""
              }`}
            >
              Salaries
            </Link>
            <div>
              <button
                onClick={toggleCandidateSubmenu}
                className={`w-full flex justify-between items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                  ["/dashboard", "/saved-jobs", "/applications", "/resumebuilder"].includes(location.pathname)
                    ? "text-teal-600"
                    : ""
                }`}
                aria-label="Toggle candidate options"
                aria-expanded={isCandidateSubmenuOpen}
                aria-controls="mobile-candidate-menu"
              >
                Candidate Options <DownArrowIcon isOpen={isCandidateSubmenuOpen} />
              </button>
              {isCandidateSubmenuOpen && (
                <div className="pl-4 space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      location.pathname === "/dashboard" ? "text-teal-600" : ""
                    }`}
                  >
                    Your Jobs
                  </Link>
                  <Link
                    to="/saved-jobs"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      location.pathname === "/saved-jobs" ? "text-teal-600" : ""
                    }`}
                  >
                    Saved Jobs
                  </Link>
                  <Link
                    to="/applications"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      location.pathname === "/applications" ? "text-teal-600" : ""
                    }`}
                  >
                    Applications
                  </Link>
                  <Link
                    to="/resumebuilder"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      location.pathname === "/resumebuilder" ? "text-teal-600" : ""
                    }`}
                  >
                    Resume Builder
                  </Link>
                </div>
              )}
            </div>
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                location.pathname === "/profile" ? "text-teal-600" : ""
              }`}
            >
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-gray-50 transition-colors"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;